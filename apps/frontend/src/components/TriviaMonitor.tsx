'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getBackendUrl } from '@/lib/config';
import LeaderboardWidget from './LeaderboardWidget';

interface TriviaStats {
    totalUsers: number;
    totalAnswers: number;
    questionText: string;
    correctAnswer: number;
    options?: string[];
    stats: { option: number; count: number }[];
}

const OPT_LETTERS = ['A', 'B', 'C', 'D'];
const OPT_COLORS = ['var(--pink-hot)', 'var(--orange)', 'var(--blue-bright)', 'var(--lime)'];

export default function TriviaMonitor() {
    const { currentQuestion, phase, timer } = useGameStore();
    const [stats, setStats] = useState<TriviaStats | null>(null);

    useEffect(() => {
        // Clear stale stats immediately when question changes to prevent flicker
        setStats(null);

        if (phase !== 'TRIVIA' && phase !== 'TRANSITION') return;
        if (currentQuestion === 0) return;

        const controller = new AbortController();

        const fetchStats = async () => {
            try {
                const res = await fetch(`${getBackendUrl()}/admin/trivia-stats?index=${currentQuestion}`, { signal: controller.signal });
                const data = await res.json();
                setStats(data);
            } catch (err: any) {
                if (err.name !== 'AbortError') console.error('Failed to fetch trivia stats');
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 3000);
        return () => {
            clearInterval(interval);
            controller.abort(); // Cancel in-flight request for old question
        };
    }, [currentQuestion, phase]);

    const handleNext = async () => {
        try {
            await fetch(`${getBackendUrl()}/admin/next-question`, { method: 'POST' });
        } catch (err) {
            console.error('Failed to trigger next question');
        }
    };

    if (phase !== 'TRIVIA' && phase !== 'TRANSITION') {
        if (phase === 'WATERING' || phase === 'FINAL') {
            return (
                <div className="card card-yellow" style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px' }}>
                        🎉 TRIVIA SELESAI!
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#444', marginTop: '8px' }}>
                        SELURUH PERTANYAAN TELAH DIJAWAB
                    </div>
                </div>
            );
        }
        return (
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#888', letterSpacing: '1px' }}>
                    MONITOR AKTIF SAAT FASE TRIVIA DIMULAI
                </div>
            </div>
        );
    }

    if (currentQuestion === 0) {
        const handleStartTriviaFromMonitor = async () => {
            try {
                await fetch(`${getBackendUrl()}/admin/start-trivia`, { method: 'POST' });
            } catch { alert('Gagal start trivia'); }
        };
        return (
            <div className="card card-lime" style={{ textAlign: 'center', padding: '60px', border: '5px solid var(--black)', boxShadow: '10px 10px 0 var(--black)', borderRadius: '20px', margin: '40px auto', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '56px', color: 'var(--black)', textShadow: '3px 3px 0 rgba(0,0,0,0.15)' }}>
                    GET READY!
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: '#333', letterSpacing: '4px', fontWeight: 800 }}>
                    KUIS TRIVIA SEGERA DIMULAI
                </div>
                <button
                    onClick={handleStartTriviaFromMonitor}
                    style={{
                        background: 'var(--black)', color: 'var(--lime)',
                        border: '4px solid var(--black)', boxShadow: '6px 6px 0 rgba(0,0,0,0.4)',
                        borderRadius: '12px', padding: '16px 40px',
                        fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px',
                        cursor: 'pointer', transition: 'transform 0.1s',
                        display: 'flex', alignItems: 'center', gap: '12px',
                    }}
                    onMouseDown={e => (e.currentTarget.style.transform = 'translate(3px,3px)')}
                    onMouseUp={e => (e.currentTarget.style.transform = 'translate(0,0)')}
                >
                    ▶ MULAI TRIVIA SEKARANG
                </button>
            </div>
        );
    }

    if (!stats) return null;

    const isFinished = timer === 0 && currentQuestion >= 10 || phase === 'TRANSITION';

    if (isFinished) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                animation: 'fadeIn 0.8s ease-out',
                maxWidth: '900px',
                margin: '0 auto',
                width: '100%'
            }}>
                {/* Hero Banner */}
                <div className="card card-lime" style={{
                    padding: '40px 24px',
                    textAlign: 'center',
                    background: 'var(--lime)',
                    border: '5px solid var(--black)',
                    boxShadow: '10px 10px 0 var(--black)',
                    borderRadius: '20px',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '64px',
                        letterSpacing: '4px',
                        color: 'var(--black)',
                        lineHeight: 1,
                        marginBottom: '12px',
                        textShadow: '2px 2px 0 rgba(0,0,0,0.1)'
                    }}>
                        🎉 TRIVIA SELESAI!
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        color: 'rgba(0,0,0,0.6)',
                        letterSpacing: '4px',
                        fontWeight: 700
                    }}>
                        GAME HAS ENDED · FINAL RANKINGS REVEALED
                    </div>
                </div>

                {/* Main Content: Leaderboard focused */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '24px'
                }}>
                    <div className="card" style={{
                        padding: '32px',
                        border: '5px solid var(--black)',
                        boxShadow: '10px 10px 0 var(--black)',
                        background: '#FFF',
                        borderRadius: '20px'
                    }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '28px',
                            letterSpacing: '2px',
                            marginBottom: '24px',
                            color: '#000',
                            textAlign: 'center',
                            background: 'var(--orange)',
                            padding: '12px',
                            border: '3px solid var(--black)',
                            borderRadius: '10px',
                            display: 'inline-block',
                            position: 'relative',
                            left: '50%',
                            transform: 'translateX(-50%)'
                        }}>
                            🏆 THE LEADERBOARD
                        </div>
                        <LeaderboardWidget />
                    </div>
                </div>

                {/* Footer Action */}
                <div className="card card-navy" style={{ padding: '20px', textAlign: 'center', opacity: 0.8 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
                        ADMIN: PROCEED TO THE NEXT PHASE ONCE RANKINGS ARE ANNOUNCED
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '20px', alignItems: 'start' }}>
            {/* LEFT COLUMN: Trivia Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Header Card */}
                <div className="card" style={{ padding: '24px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '16px', right: '24px' }}>
                        <span className="badge badge-pink" style={{ fontSize: '10px' }}>ADMIN VIEW</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
                        {/* Timer Circle */}
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            background: 'var(--orange)',
                            border: '4px solid #000',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            animation: timer <= 3 ? 'pulse 0.5s infinite' : 'none',
                        }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: '#FFF', lineHeight: 1 }}>{timer}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#FFF', letterSpacing: '1px' }}>SECS</div>
                        </div>

                        {/* Question Info */}
                        <div style={{ paddingTop: '4px' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '8px' }}>
                                PERTANYAAN #{currentQuestion} · {stats?.totalAnswers || 0} JAWABAN
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '20px', fontWeight: 800, color: '#000', lineHeight: 1.4 }}>
                                {stats?.questionText || 'Memuat pertanyaan...'}
                            </div>
                        </div>
                    </div>

                    {/* Option Bars Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {[0, 1, 2, 3].map((optIdx) => {
                            const count = stats?.stats?.find(s => s.option === optIdx)?.count || 0;
                            const totalAnswers = stats?.totalAnswers || 0;
                            const percent = totalAnswers ? Math.round((count / totalAnswers) * 100) : 0;
                            const optionText = stats?.options?.[optIdx] || `Option ${OPT_LETTERS[optIdx]}`;
                            const isCorrect = timer === 0 && stats?.correctAnswer === optIdx;

                            return (
                                <div key={optIdx} className="card" style={{
                                    padding: '16px 20px',
                                    background: isCorrect ? 'var(--lime)' : '#FFF',
                                    border: isCorrect ? '4px solid var(--black)' : '3px solid #000',
                                    boxShadow: isCorrect ? '5px 5px 0 var(--black)' : '4px 4px 0 #000',
                                    borderRadius: '12px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.4s ease',
                                }}>
                                    {/* Background Progress Fill */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, left: 0, bottom: 0,
                                        width: `${percent}%`,
                                        background: isCorrect ? 'rgba(0,0,0,0.08)' : OPT_COLORS[optIdx],
                                        opacity: isCorrect ? 1 : 0.2,
                                        transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        zIndex: 0,
                                    }} />

                                    {/* Content */}
                                    <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: isCorrect ? 'var(--black)' : OPT_COLORS[optIdx], WebkitTextStroke: '1px #000' }}>
                                                {OPT_LETTERS[optIdx]}
                                            </div>
                                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, color: '#000' }}>
                                                {optionText}
                                            </div>
                                        </div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#000', background: '#FFF', padding: '4px 8px', border: '2px solid #000', borderRadius: '4px' }}>
                                            {count} ({percent}%)
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Correct Answer Reveal — shown when timer = 0 */}
                {timer === 0 && stats.correctAnswer !== undefined && (
                    <div style={{
                        background: 'var(--lime)',
                        border: '4px solid var(--black)',
                        boxShadow: '6px 6px 0 var(--black)',
                        borderRadius: '14px',
                        padding: '18px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        animation: 'pop-in 0.4s ease-out',
                    }}>
                        <div style={{
                            width: '52px', height: '52px',
                            background: 'var(--black)',
                            color: 'var(--lime)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontSize: '28px',
                            flexShrink: 0,
                        }}>
                            {OPT_LETTERS[stats.correctAnswer]}
                        </div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: '#333', marginBottom: '4px' }}>JAWABAN BENAR</div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '18px', fontWeight: 800, color: 'var(--black)' }}>
                                {stats.options?.[stats.correctAnswer] || `Option ${OPT_LETTERS[stats.correctAnswer]}`}
                            </div>
                        </div>
                    </div>
                )}

                {/* Next question */}
                {timer === 0 && currentQuestion < 10 && (
                    <button className="btn btn-primary btn-full" style={{ padding: '14px', fontSize: '14px' }} onClick={handleNext}>
                        ➤ LANJUT SOAL BERIKUTNYA (#{currentQuestion + 1})
                    </button>
                )}
            </div>

            {/* RIGHT COLUMN: Live Leaderboard / Top Contributor */}
            <div className="card" style={{ padding: '20px', border: '4px solid var(--black)', boxShadow: '6px 6px 0 var(--black)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', marginBottom: '16px', color: 'var(--black)' }}>
                    🏆 TOP CONTRIBUTORS
                </div>
                <div style={{ maxHeight: 'calc(100vh - 250px)', minHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                    <LeaderboardWidget />
                </div>
            </div>
        </div>
    );
}
