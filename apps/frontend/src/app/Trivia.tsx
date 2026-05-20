'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getBackendUrl } from '@/lib/config';
import { useTreeAudio } from '@/hooks/useTreeAudio';

interface Question {
    index: number;
    text: string;
    options: string[];
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

export default function Trivia() {
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [pointsEarned, setPointsEarned] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const { user, currentQuestion, timer, phase } = useGameStore();

    // ── Audio Setup ──
    // bgmEnabled = true means audio is ON by default (browser autoplay policy enforced by user first click)
    const [bgmEnabled, setBgmEnabled] = useState(true);
    const { playTriviaBGM, stopBGM, playMenuSelect, playStageUp, playComplete, setMuted } = useTreeAudio(true);
    const hasStartedBGM = useRef(false);

    const toggleGlobalMute = () => {
        const nextEnabled = !bgmEnabled;
        setBgmEnabled(nextEnabled);
        setMuted(!nextEnabled); // setMuted(true) = silent, setMuted(false) = sound ON
        if (nextEnabled && !hasStartedBGM.current) {
            playTriviaBGM();
            hasStartedBGM.current = true;
        }
    };

    const startBGMOnce = () => {
        if (!hasStartedBGM.current && bgmEnabled) {
            playTriviaBGM();
            hasStartedBGM.current = true;
        }
    };

    // Stop BGM and play fanfare when Trivia ends (phase → TRANSITION)
    useEffect(() => {
        if (phase === 'TRANSITION') {
            stopBGM();
            playComplete();
        }
    }, [phase, stopBGM, playComplete]);

    // Fetch question whenever currentQuestion changes
    useEffect(() => {
        // Reset sub-states immediately to prevent stale feedback during transition
        setSelectedOption(null);
        setIsSubmitted(false);
        setIsCorrect(null);
        setPointsEarned(0);

        const fetchQuestion = async () => {
            setIsLoading(true);
            // Reset all answer state for the new question
            setSelectedOption(null);
            setIsSubmitted(false);
            setIsCorrect(null);
            setPointsEarned(0);
            try {
                const resQ = await fetch(`${getBackendUrl()}/trivia-question/${currentQuestion}?userId=${user?.id}`);
                const data = await resQ.json();
                setQuestion({
                    ...data,
                    options: JSON.parse(data.options)
                });

                // Restore state if user already answered (useful for page refresh)
                if (data.userSelection !== undefined && data.userSelection !== null) {
                    setSelectedOption(data.userSelection);
                    setIsSubmitted(true);
                    setIsCorrect(data.isCorrect);
                }
            } catch (err) {
                console.error('Failed to fetch question');
            } finally {
                setIsLoading(false);
            }
        };

        if (currentQuestion > 0) fetchQuestion();
    }, [currentQuestion]);

    const handleSelect = async (optIdx: number) => {
        // Block if timer has run out
        if (!user || !question || timer === 0) return;

        startBGMOnce(); // Attempt to start BGM on first interaction
        playMenuSelect(); // Play retro select blip

        // Prevent redundant clicks if already selected this exact option
        if (selectedOption === optIdx) return;

        setSelectedOption(optIdx);
        setIsSubmitted(true);
        // Clear previous results to ensure new state is fresh
        setIsCorrect(null);
        setPointsEarned(0);

        try {
            const res = await fetch(`${getBackendUrl()}/trivia-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    questionIndex: currentQuestion,
                    optionIndex: optIdx,
                }),
            });

            const data = await res.json();
            if (res.ok && data.correct !== undefined) {
                setIsCorrect(data.correct);
                if (data.points) setPointsEarned(data.points);
            }

            if (!res.ok && data.error) {
                const errorMsg = data.error || data.message || '';
                if (errorMsg.includes('User tidak ditemukan')) {
                    localStorage.removeItem('game-storage');
                    window.location.reload();
                }
            }
        } catch (err) {
            console.error('Failed to submit answer');
        }
    };

    const isTimedOut = timer === 0;
    const showFeedback = isSubmitted && isCorrect !== null;

    // Play stage-up sound when correct feedback is shown
    useEffect(() => {
        if (showFeedback && isCorrect) {
            playStageUp();
        }
    }, [showFeedback, isCorrect, playStageUp]);

    // GET READY: show if quiz hasn't started OR phase is back to TRIVIA but quiz already finished
    if (currentQuestion === 0) return (
        <div style={{ minHeight: 'calc(100dvh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="card card-lime animate-pop-in" style={{ padding: '40px', textAlign: 'center', border: '5px solid var(--black)', boxShadow: '8px 8px 0 var(--black)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧠</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--black)', letterSpacing: '2px', lineHeight: 1.1 }}>
                    TRIVIA DIMULAI SEBENTAR LAGI
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#333', marginTop: '16px', letterSpacing: '1px', fontWeight: 800 }}>
                    Tunggu instruksi Admin!
                </div>
            </div>
        </div>
    );

    // REMOVED: Full-page isLoading return to permit Header/Timer to render immediately


    // Show "no answer" message when time ran out and user didn't answer
    const showNoAnswer = isTimedOut && !isSubmitted;

    return (
        <div style={{
            minHeight: 'calc(100dvh - 200px)', // Adjusted to account for ticker, header, and footer
            padding: '16px',
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            justifyContent: 'center'
        }}>
            {/* Audio Toggle - Lowered to avoid header overlap */}
            <button
                onClick={toggleGlobalMute}
                style={{
                    position: 'absolute', top: '10px', right: '16px',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: bgmEnabled ? 'var(--blue-bright)' : 'var(--gray-light)',
                    border: '3px solid var(--black)',
                    boxShadow: '4px 4px 0 var(--black)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', cursor: 'pointer', zIndex: 10
                }}
            >
                {bgmEnabled ? '🔊' : '🔇'}
            </button>

            {/* Header: Timer + Question counter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '12px' }}>
                <div
                    className={`timer-circle${timer <= 3 ? ' urgent' : ''}`}
                    style={{ width: 'clamp(40px, 10vw, 50px)', height: 'clamp(40px, 10vw, 50px)' }}
                >
                    <div className="timer-num" style={{ fontSize: 'clamp(18px, 5vw, 22px)' }}>{timer}</div>
                    <div className="timer-label" style={{ fontSize: '8px' }}>SECS</div>
                </div>
                <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: 800, letterSpacing: '1px' }}>
                        PERTANYAAN {currentQuestion} / 10
                    </div>
                    {isTimedOut && (
                        <div style={{
                            background: '#e53935',
                            color: 'white',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 8px',
                            borderRadius: '4px',
                            display: 'inline-block',
                            marginTop: '2px',
                            letterSpacing: '1px',
                        }}>
                            WAKTU HABIS!
                        </div>
                    )}
                </div>
            </div>

            {/* Question Card - Compact padding */}
            <div className="card card-navy" style={{ padding: '16px', minHeight: '100px', display: 'flex', alignItems: 'center' }}>
                {isLoading || !question ? (
                    <div style={{
                        width: '100%',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)',
                        textAlign: 'center',
                        fontStyle: 'italic',
                        animation: 'pulse 1.5s infinite'
                    }}>
                        Menyiapkan pertanyaan...
                    </div>
                ) : (
                    <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'clamp(15px, 4.5vw, 17px)',
                        fontWeight: 700,
                        lineHeight: 1.4,
                        color: 'var(--white)',
                    }}>
                        {question.text}
                    </p>
                )}
            </div>

            {/* Bug Fix 3: Show waiting screen when time is up */}
            {isTimedOut ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Options (locked, show selection if any) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.6 }}>
                        {(question?.options || [0, 1, 2, 3]).map((opt, idx) => {
                            const isThisSelected = selectedOption === idx;
                            let optClass = 'trivia-opt';
                            if (isThisSelected) {
                                optClass += showFeedback
                                    ? (isCorrect === true ? ' correct' : ' wrong')
                                    : ' selected';
                            }
                            return (
                                <button
                                    key={idx}
                                    className={optClass}
                                    disabled={true}
                                    style={{ cursor: 'not-allowed' }}
                                >
                                    <span className="opt-letter">{OPTION_LETTERS[idx]}</span>
                                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                                        {typeof opt === 'string' ? opt : `Pilihan ${OPTION_LETTERS[idx]}`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Feedback card */}
                    {showFeedback && (
                        <div className="card" style={{
                            background: isCorrect ? 'var(--lime)' : '#e53935',
                            textAlign: 'center',
                            padding: '16px',
                            animation: 'fadeIn 0.5s ease-out',
                        }}>
                            <div style={{
                                fontFamily: 'var(--font-display)',
                                fontSize: '24px',
                                letterSpacing: '2px',
                                color: isCorrect ? 'var(--black)' : 'var(--white)',
                            }}>
                                {isCorrect ? `✔ BENAR! +${pointsEarned} AIR 💧` : '✘ JAWABAN SALAH!'}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '11px',
                                color: isCorrect ? '#444' : 'rgba(255,255,255,0.8)',
                                marginTop: '4px',
                            }}>
                                {isCorrect ? 'Poin air kamu bertambah. Keren!' : 'Jangan menyerah, coba soal berikutnya!'}
                            </div>
                        </div>
                    )}

                    {/* No answer */}
                    {showNoAnswer && (
                        <div className="card" style={{ textAlign: 'center', padding: '16px', background: '#f0f0f0' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px', color: '#333' }}>
                                ⏰ WAKTU HABIS!
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#666', letterSpacing: '1px', marginTop: '6px' }}>
                                KAMU TIDAK MEMILIH JAWABAN
                            </div>
                        </div>
                    )}

                    {/* Waiting for next question screen */}
                    <div className="card" style={{
                        textAlign: 'center',
                        padding: '20px 16px',
                        background: 'var(--navy-dark)',
                        animation: 'fadeIn 0.6s ease-out',
                        border: '3px solid var(--black)',
                        boxShadow: '4px 4px 0 var(--black)',
                    }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '18px',
                            letterSpacing: '2px',
                            color: 'var(--yellow)',
                            marginBottom: '8px',
                        }}>
                            ⏳ MENUNGGU SOAL BERIKUTNYA
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'rgba(255,255,255,0.5)',
                            letterSpacing: '1px',
                        }}>
                            ADMIN SEDANG MENYIAPKAN PERTANYAAN SELANJUTNYA...
                        </div>
                        {/* Pulsing dots indicator */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--yellow)',
                                    animation: `pulse-glow 1.2s ease-in-out ${i * 0.3}s infinite`,
                                }} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Active question — options are selectable while timer > 0 */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(isLoading || !question ? [0, 1, 2, 3] : question.options).map((opt, idx) => {
                        const isThisSelected = selectedOption === idx;
                        let optClass = 'trivia-opt';
                        if (isThisSelected) {
                            // If they answered, show their selection; feedback comes when timer hits 0
                            optClass += ' selected';
                        }
                        return (
                            <button
                                key={idx}
                                className={optClass}
                                // Allow user to change answer as long as timer hasn't run out
                                onClick={() => !isLoading && handleSelect(idx)}
                                disabled={isLoading}
                                style={{ opacity: isLoading ? 0.6 : 1 }}
                            >
                                <span className="opt-letter">{OPTION_LETTERS[idx]}</span>
                                <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>
                                    {isLoading ? '...' : opt}
                                </span>
                            </button>
                        );
                    })}

                    {/* "Answer submitted, waiting for timer" message */}
                    {isSubmitted && !isTimedOut && (
                        <div className="card" style={{
                            textAlign: 'center',
                            padding: '14px 16px',
                            background: 'var(--yellow)',
                            border: '3px solid var(--black)',
                            boxShadow: '3px 3px 0 var(--black)',
                            animation: 'pop-in 0.3s ease-out',
                        }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', letterSpacing: '1px', color: 'var(--black)' }}>
                                ✔ JAWABAN TERSIMPAN!
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', marginTop: '4px', letterSpacing: '1px' }}>
                                BISA UBAH HINGGA WAKTU HABIS
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
