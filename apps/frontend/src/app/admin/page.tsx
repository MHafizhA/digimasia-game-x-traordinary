'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import QRCode from 'react-qr-code';
import RegistrationLobby from '@/components/RegistrationLobby';
import LeaderboardWidget from '@/components/LeaderboardWidget';
import TriviaMonitor from '@/components/TriviaMonitor';
import WinnerAnnouncer from '@/components/WinnerAnnouncer';
import NomineeMonitor from '@/components/NomineeMonitor';
import TreeMonitor from '@/components/TreeMonitor';
import { useSocket } from '@/hooks/useSocket';
import { getBackendUrl } from '@/lib/config';

// ── Phase config ──────────────────────────────
const PHASES = [
    { targetPhase: 'LOGIN', icon: '🔑', label: 'Registration', sub: 'QR scan & team assign' },
    { targetPhase: 'VOTING_TEAM', icon: '👥', label: 'Team Voting', sub: 'Team of the Year' },
    { targetPhase: 'VOTING_DIGIMER', icon: '🌟', label: 'Digimer Voting', sub: 'Digimer of the Year' },
    { targetPhase: 'TRIVIA', icon: '🧠', label: 'Trivia Quiz', sub: 'Earn water points!' },
    { targetPhase: 'WATERING', icon: '🌳', label: 'Grow The Tree', sub: 'Water the tree' },
];

export default function AdminPage() {
    const { phase, setSessionState, totalWater, treeStage } = useGameStore();
    const [showWinnerReveal, setShowWinnerReveal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [origin, setOrigin] = useState('');

    useEffect(() => { setOrigin(window.location.origin); }, []);
    useSocket();

    // ── Handlers ──
    const handlePhaseChange = async (newPhase: string) => {
        setShowWinnerReveal(false);
        const previousPhase = phase;

        // Optimistic UI update to eliminate delay
        setSessionState({ phase: newPhase as any });

        try {
            await fetch(`${getBackendUrl()}/admin/phase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phase: newPhase }),
            });
        } catch {
            alert('Gagal update fase, memulihkan state...');
            setSessionState({ phase: previousPhase as any });
        }
    };

    const handleStartTrivia = async () => {
        try {
            await fetch(`${getBackendUrl()}/admin/start-trivia`, { method: 'POST' });
            // Backend will broadcast session_state which updates currentQuestion to 1
        } catch { alert('Gagal start trivia'); }
    };

    const handleReset = async () => {
        setShowResetConfirm(true);
    };

    const executeReset = async () => {
        setShowResetConfirm(false);
        try {
            await fetch(`${getBackendUrl()}/admin/reset`, { method: 'POST' });
            useGameStore.getState().setToastMessage("SYSTEM RESET SUCCESSFULLY!");
        } catch { useGameStore.getState().setToastMessage("GAGAL RESET SYSTEM!"); }
    };

    // ── Phase label for status bar ────────────
    const phaseLabel: Record<string, string> = {
        LOGIN: 'REGISTRASI DIBUKA',
        VOTING_TEAM: 'VOTING TEAM',
        VOTING_DIGIMER: 'VOTING DIGIMER',
        TRIVIA: 'TRIVIA QUIZ',
        WATERING: 'GROW THE TREE',
        TRANSITION: 'TRANSISI',
        FINAL: 'SELESAI',
    };

    return (
        <div style={{
            minHeight: 'calc(100vh - 90px)',
            padding: '20px',
            maxWidth: '1400px',
            margin: '0 auto',
        }}>

            {/* ── COMMAND BAR (HEADER) ── */}
            <div className="card animate-pop-in" style={{
                background: 'var(--blue-bright)',
                border: '4px solid var(--black)',
                boxShadow: '6px 6px 0 var(--black)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                padding: '16px 24px',
                position: 'sticky',
                top: 0,
                zIndex: 100,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Retro Pop Icon Container */}
                    <div style={{
                        width: '56px', height: '56px',
                        background: 'var(--pink-hot)',
                        color: 'var(--white)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '28px',
                        borderRadius: '14px',
                        border: '3px solid var(--black)',
                        boxShadow: '4px 4px 0 var(--black)',
                        transform: 'rotate(-4deg)'
                    }}>
                        {PHASES.find(p => p.targetPhase === phase)?.icon || '🎮'}
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px', lineHeight: 1.1, color: 'var(--white)', textShadow: '2px 2px 0 var(--black)' }}>
                            {phaseLabel[phase] ?? phase}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--white)', opacity: 0.9, letterSpacing: '1px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="live-dot" style={{ background: 'var(--lime)' }} /> SYSTEM STATUS: OPERATIONAL
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button className="btn" style={{
                        background: 'var(--lime)',
                        color: 'var(--navy-dark)',
                        padding: '10px 20px',
                        fontSize: '13px',
                        boxShadow: '4px 4px 0 var(--black)'
                    }} onClick={() => setShowQRModal(true)}>
                        📱 MOBILE QR
                    </button>
                    <div style={{ width: '2px', height: '32px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
                    <button className="btn" style={{
                        background: 'var(--blue-bright)',
                        color: 'var(--white)',
                        padding: '10px 20px',
                        fontSize: '13px',
                        boxShadow: '4px 4px 0 var(--black)'
                    }} onClick={async () => {
                        try {
                            await fetch(`${getBackendUrl()}/admin/phase`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ phase: phase }),
                            });
                            useGameStore.getState().setToastMessage("SYNC BROADCAST SENT!");
                        } catch { alert('Gagal broadcast sync'); }
                    }}>
                        📡 SYNC ALL
                    </button>
                    <div style={{ width: '2px', height: '32px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />
                    <button className="btn" style={{
                        background: 'var(--yellow)',
                        color: 'var(--navy-dark)',
                        padding: '10px 20px',
                        fontSize: '13px',
                        boxShadow: '4px 4px 0 var(--black)'
                    }} onClick={handleReset}>
                        ↺ RESET SYSTEM
                    </button>
                    <button className="btn" style={{
                        background: 'var(--pink-hot)',
                        color: 'var(--white)',
                        padding: '10px 20px',
                        fontSize: '13px',
                        boxShadow: '4px 4px 0 var(--black)',
                        fontWeight: '900',
                    }} onClick={() => { useGameStore.getState().reset(); window.location.href = '/'; }}>
                        🚪 KELUAR
                    </button>
                </div>
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className="g-sidebar" style={{ alignItems: 'start' }}>

                {/* ─── LEFT SIDEBAR ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '110px' }}>

                    {/* Control Panel */}
                    <div className="card card-navy animate-pop-in" style={{ padding: '16px' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '2px', color: 'var(--yellow)', marginBottom: '2px' }}>
                            CONTROL CENTER
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', marginBottom: '14px' }}>
                            PHASE SELECTION
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px' }} />
                        <div className="step-list">
                            {PHASES.map((p, idx) => {
                                const phaseOrder = PHASES.map(x => x.targetPhase);
                                let currentIdx = phaseOrder.indexOf(phase);
                                // Robust handling for phases not in PHASES list
                                if (phase === 'TRANSITION') currentIdx = phaseOrder.indexOf('TRIVIA') + 0.5;
                                if (phase === 'FINAL' || phase === 'WATERING') currentIdx = 99; // All steps done
                                if (currentIdx < 0) currentIdx = 0; // Fallback for unknown phases

                                const thisIdx = phaseOrder.indexOf(p.targetPhase);
                                const isDone = thisIdx < currentIdx;
                                const isActive = phase === p.targetPhase;

                                return (
                                    <button
                                        key={p.targetPhase}
                                        className={`step-item${isDone ? ' done' : isActive ? ' active animate-pulse' : ' todo'}`}
                                        style={{ border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                                        onClick={() => handlePhaseChange(p.targetPhase)}
                                    >
                                        <div className={`step-num${isDone ? ' done-n' : isActive ? ' active-n' : ' todo-n'}`}>
                                            {isDone ? '✓' : idx + 1}
                                        </div>
                                        <div>
                                            <div className="step-text">{p.label}</div>
                                            <div className="step-sub">{p.sub}</div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* External Monitors */}
                    <div className="card" style={{ padding: '16px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
                            EXTERNAL MONITORS
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => window.open('/monitoring/voting', '_blank')}>
                                📊 Voting Monitor ↗
                            </button>
                            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => window.open('/monitoring/trivia', '_blank')}>
                                ❓ Trivia Monitor ↗
                            </button>
                            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => window.open('/monitoring/tree', '_blank')}>
                                🌳 Tree Monitor ↗
                            </button>
                            <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => window.open('/monitoring/results', '_blank')}>
                                🏆 Result Reveal ↗
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── MAIN CONTENT ─── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Monitor content */}
                    <div className="card animate-pop-in" style={{ padding: '20px', minHeight: '400px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            paddingBottom: '16px',
                            borderBottom: '2px solid rgba(0,0,0,0.1)',
                            marginBottom: '16px',
                        }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '1px' }}>
                                    {showWinnerReveal ? 'FINAL RESULTS' : (phaseLabel[phase] ?? phase)}
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    DATA UPDATING
                                </div>
                            </div>
                        </div>

                        {showWinnerReveal ? (
                            <WinnerAnnouncer onClose={() => setShowWinnerReveal(false)} />
                        ) : (
                            <>
                                {(phase === 'VOTING_TEAM' || phase === 'VOTING_DIGIMER') && (
                                    <NomineeMonitor category={phase === 'VOTING_TEAM' ? 'team' : 'digimer'} />
                                )}
                                {(phase === 'TRIVIA' || phase === 'TRANSITION') && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                        <TriviaMonitor />
                                    </div>
                                )}
                                {phase === 'WATERING' && (
                                    <TreeMonitor />
                                )}
                                {phase === 'LOGIN' && (
                                    <div className="card" style={{ padding: '24px', border: '3px solid var(--black)', background: 'var(--blue-light)' }}>
                                        <div className="screen-header" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '3px dashed var(--black)' }}>
                                            <div style={{
                                                width: '64px', height: '64px',
                                                background: 'var(--lime)',
                                                border: '3px solid var(--black)',
                                                boxShadow: '4px 4px 0 var(--black)',
                                                borderRadius: '16px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '32px',
                                                transform: 'rotate(5deg)'
                                            }}>🔐</div>
                                            <div>
                                                <div className="screen-title" style={{ fontSize: '32px', color: 'var(--black)', textShadow: '1px 1px 0 var(--white)' }}>LOGIN STAGE</div>
                                                <div className="screen-sub" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                                    WAITING FOR PARTICIPANTS · REGISTRASI DIBUKA
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <RegistrationLobby />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── QR MODAL ── */}
            {
                showQRModal && (
                    <div
                        style={{
                            position: 'fixed', inset: 0,
                            backgroundColor: 'var(--navy-dark)',
                            backgroundImage: 'radial-gradient(var(--blue-bright) 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000, padding: '24px',
                            animation: 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                        onClick={() => setShowQRModal(false)}
                    >
                        <div
                            className="card"
                            style={{ maxWidth: '380px', width: '100%', textAlign: 'center', padding: '32px', boxShadow: '20px 20px 0 var(--black)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px', marginBottom: '4px' }}>
                                USER PORTAL QR
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#666', letterSpacing: '1px', marginBottom: '20px' }}>
                                SCAN UNTUK AKSES GAME
                            </div>
                            <div style={{ background: 'white', padding: '16px', borderRadius: '8px', border: 'var(--border)', display: 'inline-block', marginBottom: '16px' }}>
                                <QRCode value={origin || 'https://digimasia.id'} size={180} />
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--blue-bright)', wordBreak: 'break-all', marginBottom: '20px' }}>
                                {origin || 'https://digimasia.id'}
                            </div>
                            <button className="btn btn-danger btn-full" style={{ boxShadow: '5px 5px 0 var(--black)' }} onClick={() => setShowQRModal(false)}>
                                TUTUP JENDELA
                            </button>
                        </div>
                    </div>
                )
            }

            {/* ── RESET CONFIRM MODAL ── */}
            {
                showResetConfirm && (
                    <div
                        style={{
                            position: 'fixed', inset: 0,
                            backgroundColor: 'transparent',
                            pointerEvents: 'auto',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1000, padding: '24px',
                            animation: 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        <div
                            className="card"
                            style={{ maxWidth: '400px', width: '100%', textAlign: 'center', padding: '40px', background: 'var(--blue-light)', border: '5px solid var(--black)', boxShadow: '15px 15px 0 var(--black)' }}
                        >
                            <div style={{
                                width: '80px', height: '80px',
                                background: '#FFD600',
                                border: '4px solid var(--black)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '42px',
                                margin: '0 auto 24px',
                                boxShadow: '6px 6px 0 var(--black)',
                                transform: 'rotate(-5deg)'
                            }}>⚠️</div>

                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', letterSpacing: '2px', marginBottom: '12px', color: 'var(--black)', lineHeight: 1 }}>
                                RESET SYSTEM?
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#333', letterSpacing: '1px', marginBottom: '32px', lineHeight: 1.6 }}>
                                Seluruh data voting, jawaban, dan poin akan di-reset ke nol.<br />
                                <span style={{ background: 'var(--yellow)', padding: '2px 6px', fontWeight: 900 }}>DATA USER TETAP AMAN.</span>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button className="btn" style={{ flex: 1, background: 'var(--navy-dark)', color: 'var(--white)', padding: '16px', fontSize: '14px' }} onClick={() => setShowResetConfirm(false)}>
                                    TIDAK, BATAL
                                </button>
                                <button className="btn" style={{ flex: 1, background: '#FF0099', color: 'white', padding: '16px', fontSize: '14px', boxShadow: '6px 6px 0 var(--black)' }} onClick={executeReset}>
                                    YA, RESET!
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
