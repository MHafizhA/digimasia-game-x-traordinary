'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import styles from './page.module.css';
import { getBackendUrl } from '@/lib/config';

interface Question {
    index: number;
    text: string;
    options: string[];
}

export default function Trivia() {
    const [question, setQuestion] = useState<Question | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { user, currentQuestion, timer } = useGameStore();

    useEffect(() => {
        const fetchQuestion = async () => {
            setIsLoading(true);
            try {
                const resQ = await fetch(`${getBackendUrl()}/trivia-question/${currentQuestion}`);
                const data = await resQ.json();
                setQuestion({
                    ...data,
                    options: JSON.parse(data.options)
                });
                setSelectedOption(null);
                setIsSubmitted(false);
                setIsCorrect(null);
            } catch (err) {
                console.error('Failed to fetch question');
            } finally {
                setIsLoading(false);
            }
        };

        if (currentQuestion > 0) fetchQuestion();
    }, [currentQuestion]);

    const handleSelect = async (optIdx: number) => {
        if (!user || !question || isSubmitted) return;

        setSelectedOption(optIdx);
        setIsSubmitted(true);

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

    if (isLoading || !question) return <div className={styles.main}><h3>Menghitung Hasil...</h3></div>;

    const showResults = timer === 0 && (selectedOption !== null || isSubmitted);

    return (
        <div className={styles.triviaWrapper}>
            <header className={styles.triviaHeader}>
                <div className={styles.timerCircle} style={{ background: timer <= 3 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}>
                    <span className={styles.timerText} style={{ color: timer <= 3 ? '#ef4444' : 'white' }}>{timer}</span>
                </div>
                <p className={styles.questionCounter}>Pertanyaan {currentQuestion} / 10</p>
            </header>

            <div className="glass" style={{ padding: '2rem', marginTop: '2rem', position: 'relative' }}>
                {timer === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '-15px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#ef4444',
                        color: 'white',
                        padding: '0.2rem 1rem',
                        borderRadius: '1rem',
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        zIndex: 10
                    }}>WAKTU HABIS</div>
                )}

                <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', textAlign: 'center', lineHeight: '1.4' }}>
                    {question.text}
                </h2>

                <div className={styles.optionsGrid}>
                    {question.options.map((opt, idx) => {
                        const isThisSelected = selectedOption === idx;
                        let extraStyle = {};

                        if (isThisSelected) {
                            if (showResults) {
                                // Show Green/Red only when timer hits 0
                                if (isCorrect === true) extraStyle = { border: '2px solid #22c55e', background: 'rgba(34, 197, 94, 0.2)' };
                                if (isCorrect === false) extraStyle = { border: '2px solid #ef4444', background: 'rgba(239, 68, 68, 0.2)' };
                            } else {
                                // Just show blue selection while timer is running
                                extraStyle = { border: '2px solid #3b82f6', background: 'rgba(59, 130, 246, 0.2)' };
                            }
                        }

                        return (
                            <button
                                key={idx}
                                className={`glass ${styles.optionBtn} ${isThisSelected ? styles.selected : ''}`}
                                onClick={() => handleSelect(idx)}
                                disabled={isSubmitted}
                                style={extraStyle}
                            >
                                <span className={styles.optionLabel}>{String.fromCharCode(65 + idx)}</span>
                                <span className={styles.optionContent}>{opt}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {showResults && isCorrect !== null && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: '1.5rem',
                    background: isCorrect ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    <p style={{ fontWeight: 900, fontSize: '1.1rem', color: isCorrect ? '#22c55e' : '#ef4444', margin: 0 }}>
                        {isCorrect ? 'BENAR! +10 Air 💧' : 'YAH, JAWABAN SALAH! ❌'}
                    </p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.3rem' }}>
                        {isCorrect ? 'Poin Anda bertambah. Keren!' : 'Jangan menyerah, coba lagi di soal berikutnya!'}
                    </p>
                </div>
            )}

            {timer === 0 && !isSubmitted && (
                <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>
                    <p>Anda tidak memilih jawaban tepat waktu.</p>
                </div>
            )}
        </div>
    );
}
