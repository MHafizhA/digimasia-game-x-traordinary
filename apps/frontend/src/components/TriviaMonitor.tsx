'use client';

import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getBackendUrl } from '@/lib/config';
import LeaderboardWidget from './LeaderboardWidget';
import { useTreeAudio } from '@/hooks/useTreeAudio';

interface TriviaStats {
    totalUsers: number;
    totalAnswers: number;
    questionText: string;
    questionIndex: number; // Add this
    correctAnswer: number;
    options?: string[];
    stats: { option: number; count: number }[];
}

const OPT_LETTERS = ['A', 'B', 'C', 'D'];
const OPT_COLORS = ['var(--pink-hot)', 'var(--orange)', 'var(--blue-bright)', 'var(--lime)'];

export default function TriviaMonitor({ muteSFX = false }: { muteSFX?: boolean }) {
    const { currentQuestion, phase, timer } = useGameStore();
    const [stats, setStats] = useState<TriviaStats | null>(null);
    const [isStatsLoaded, setIsStatsLoaded] = useState(false);

    // Reset loading state when question changes
    useEffect(() => {
        setIsStatsLoaded(false);
    }, [currentQuestion]);

    const { playComplete } = useTreeAudio(true); // default enabled for admin SFX
    // Audio trigger handled at Monitoring Page level for smoother transition


    // Effect 2: Polling Trivia Stats
    useEffect(() => {
        if (phase !== 'TRIVIA' && phase !== 'TRANSITION') return;
        if (currentQuestion === 0) return;

        const controller = new AbortController();

        const fetchStats = async () => {
            try {
                const res = await fetch(`${getBackendUrl()}/admin/trivia-stats?index=${currentQuestion}`, { signal: controller.signal });
                const data = await res.json();
                setStats(data);
                setIsStatsLoaded(true);
            } catch (err: any) {
                if (err.name !== 'AbortError') console.error('Failed to fetch trivia stats');
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 1500); // Snappier polling
        return () => {
            clearInterval(interval);
            controller.abort();
        };
    }, [currentQuestion, phase]);

    // Parent component (TriviaMonitoringPage) handles the SFX to avoid duplicated strict-mode bugs.

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
            <div className="card card-navy" style={{ textAlign: 'center', padding: '40px 30px', border: '5px solid var(--black)', boxShadow: '10px 10px 0 var(--black)', borderRadius: '20px', margin: '20px auto', maxWidth: '850px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '56px', color: 'var(--yellow)', textShadow: '3px 3px 0 var(--black)' }}>
                    GET READY!
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--white)', letterSpacing: '4px', fontWeight: 800 }}>
                    KUIS TRIVIA SEGERA DIMULAI
                </div>

                {/* Tutorial Section untuk Monitor Admin */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', letterSpacing: '3px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, margin: '10px 0' }}>
                        — CARA BERMAIN —
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'left' }}>
                        {/* Step 1 */}
                        <div className="card" style={{ padding: '20px', border: '3px solid var(--black)', boxShadow: '5px 5px 0 var(--black)', background: 'var(--white)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--pink-hot)', border: '2px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📖</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--black)' }}>BACA PERTANYAAN</div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#444' }}>Bacalah pertanyaan yang muncul di layar dengan teliti.</div>
                        </div>

                        {/* Step 2 */}
                        <div className="card" style={{ padding: '20px', border: '3px solid var(--black)', boxShadow: '5px 5px 0 var(--black)', background: 'var(--white)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--yellow)', border: '2px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>☝️</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--black)' }}>PILIH JAWABAN</div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#444' }}>Pilih jawaban di hapemu. Bisa diubah selama timer berjalan!</div>
                        </div>

                        {/* Step 3 */}
                        <div className="card" style={{ padding: '20px', border: '3px solid var(--black)', boxShadow: '5px 5px 0 var(--black)', background: 'var(--lime)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--black)', color: 'var(--lime)', border: '2px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💧</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--black)' }}>CEPAT = MAKIN BESAR!</div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: '#222' }}>Jawaban benar & makin cepat = air lebih banyak untuk timmu! 🌳</div>
                        </div>
                    </div>
                </div>

                <div style={{ width: '80%', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '16px 0' }}></div>

                <button
                    onClick={handleStartTriviaFromMonitor}
                    style={{
                        background: 'var(--lime)', color: 'var(--black)',
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

    // Check if we have the CORRECT stats for the CURRENT question
    const isStatsStale = !stats || stats.questionIndex !== currentQuestion || !isStatsLoaded;
    const displayTimer = isStatsLoaded ? timer : 10;

    const isFinished = (timer === 0 && currentQuestion >= 10) || phase === 'TRANSITION';

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
                <div className="card" style={{
                    padding: '40px 24px',
                    textAlign: 'center',
                    background: 'var(--navy-dark)',
                    border: '5px solid var(--black)',
                    boxShadow: '10px 10px 0 var(--black)',
                    borderRadius: '24px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '64px',
                        color: 'var(--yellow)',
                        textShadow: '3px 3px 0 var(--black)',
                        letterSpacing: '4px',
                        lineHeight: 1
                    }}>
                        TRIVIA SELESAI!
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        color: 'var(--yellow)',
                        marginTop: '16px',
                        letterSpacing: '4px',
                        fontWeight: 700
                    }}>
                        TRIVIA SELESAI · FINAL RANKINGS REVEALED
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
                        background: 'var(--blue-light)',
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
                        <LeaderboardWidget isPaused={timer > 0} />
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


                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
                        {/* Timer Circle */}
                        <div style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            background: displayTimer <= 3 ? '#e53935' : 'var(--orange)',
                            border: '4px solid #000',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            animation: displayTimer <= 3 && displayTimer > 0 ? 'pulse 0.5s infinite' : 'none',
                        }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: '#FFF', lineHeight: 1 }}>{displayTimer}</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#FFF', letterSpacing: '1px' }}>SECS</div>
                        </div>

                        {/* Question Info */}
                        <div className="card card-navy" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--yellow)', letterSpacing: '2px', marginBottom: '8px', fontWeight: 800 }}>
                                PERTANYAAN #{currentQuestion}
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-body)',
                                fontSize: '20px',
                                fontWeight: 800,
                                color: 'var(--white)',
                                lineHeight: 1.4,
                                position: 'relative'
                            }}>
                                {isStatsStale ? 'Memuat data soal...' : (stats?.questionText || 'Memuat pertanyaan...')}
                                {isStatsStale && (
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        animation: 'pulse 1.5s infinite'
                                    }} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Option Bars Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {[0, 1, 2, 3].map((optIdx) => {
                            const count = isStatsStale ? 0 : (stats?.stats?.find(s => s.option === optIdx)?.count || 0);
                            const totalAnswers = isStatsStale ? 0 : (stats?.totalAnswers || 0);
                            const totalUsers = isStatsStale ? 0 : (stats?.totalUsers || 0);
                            const percent = totalUsers ? Math.round((count / totalUsers) * 100) : 0;
                            const optionText = isStatsStale ? '...' : (stats?.options?.[optIdx] || `Pilihan ${OPT_LETTERS[optIdx]}`);
                            const isCorrect = !isStatsStale && timer === 0 && stats?.correctAnswer === optIdx;
                            const isWrong = !isStatsStale && timer === 0 && stats?.correctAnswer !== undefined && stats?.correctAnswer !== optIdx;

                            return (
                                <div key={optIdx} className="card" style={{
                                    padding: '16px 20px',
                                    background: isCorrect ? 'var(--lime)' : 'var(--white)',
                                    border: isCorrect ? '4px solid var(--black)' : '3px solid #000',
                                    boxShadow: isCorrect ? '5px 5px 0 var(--black)' : '4px 4px 0 #000',
                                    borderRadius: '12px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    transition: 'all 0.4s ease',
                                    opacity: isStatsStale ? 0.7 : 1,
                                }}>
                                    {/* Background Progress Fill - matching the user app base color */}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0, left: 0, bottom: 0,
                                        width: `${percent}%`,
                                        background: isCorrect ? 'rgba(255,255,255,0.2)' : isWrong ? '#ef4444' : '#93c5fd', // red explicitly for wrong, blue default
                                        transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        zIndex: 0,
                                    }} />

                                    {/* Content */}
                                    <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--black)' }}>
                                                {OPT_LETTERS[optIdx]}
                                            </div>
                                            <div style={{
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '15px',
                                                fontWeight: 600,
                                                color: isStatsStale ? '#555' : '#000',
                                                fontStyle: isStatsStale ? 'italic' : 'normal'
                                            }}>
                                                {optionText}
                                            </div>
                                        </div>
                                        {!isStatsStale && (
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, color: '#000', background: 'var(--yellow)', padding: '4px 8px', border: '2px solid #000', borderRadius: '4px' }}>
                                                {count} ({percent}%)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Correct Answer Reveal + Golput — shown when timer = 0 */}
                {timer === 0 && stats?.correctAnswer !== undefined && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                        {/* Jawaban Benar */}
                        <div style={{
                            flex: 1,
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

                        {/* Golput Counter */}
                        {(() => {
                            const golput = Math.max(0, (stats.totalUsers || 0) - (stats.totalAnswers || 0));
                            const golputPct = stats.totalUsers ? Math.round((golput / stats.totalUsers) * 100) : 0;
                            return (
                                <div style={{
                                    minWidth: '120px',
                                    background: 'var(--white)',
                                    border: '4px solid var(--black)',
                                    boxShadow: '6px 6px 0 var(--black)',
                                    borderRadius: '14px',
                                    padding: '14px 18px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    animation: 'pop-in 0.4s ease-out 0.1s both',
                                    textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '22px' }}>🙈</div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--black)', lineHeight: 1 }}>
                                        {golput}
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '1px', color: 'var(--black)', fontWeight: 700 }}>
                                        GOLPUT ({golputPct}%)
                                    </div>
                                </div>
                            );
                        })()}
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
                    <LeaderboardWidget isPaused={timer > 0} />
                </div>
            </div>
        </div>
    );
}
