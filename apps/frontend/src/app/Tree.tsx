'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSocket } from '@/hooks/useSocket';
import TreeVisual, { TREE_STAGE_LABELS } from '@/components/TreeVisual';
import { getBackendUrl } from '@/lib/config';
import { useTreeAudio } from '@/hooks/useTreeAudio';

interface Droplet {
    id: number;
    x: number;
    y: number;
}

const TOTAL_WATER_GOAL = 2000;
const WATER_PER_STAGE = 200; // 10 stages × 200L

export default function Tree() {
    const {
        user,
        phase,
        treeStage,
        totalWater,
        collectedWater,
        contributedWater,
        _hasHydrated,
        setUserState,
        setSessionState
    } = useGameStore();

    const { emitWaterTap } = useSocket();
    const [isSyncing, setIsSyncing] = useState(true);
    const [isPumping, setIsPumping] = useState(false);
    const [droplets, setDroplets] = useState<Droplet[]>([]);
    const [stageToast, setStageToast] = useState<string | null>(null);
    const [ripples, setRipples] = useState<number[]>([]);
    const [isMuted, setIsMutedState] = useState(false);
    const prevStageRef = useRef(treeStage);
    const dropletIdRef = useRef(0);
    const audio = useTreeAudio();

    // Sync user water balance from backend on mount (Guarded by _hasHydrated)
    useEffect(() => {
        // Wait for store to hydrate from local storage first to prevent 0L flicker/reset
        if (!_hasHydrated || !user?.id) return;

        const syncAll = async () => {
            // Small delay to ensure everything is settled on mobile (especially socket connection status)
            await new Promise(r => setTimeout(r, 150));

            try {
                // 1. Sync User Stats
                const statsRes = await fetch(`${getBackendUrl()}/users/${user.id}/stats?t=${Date.now()}`, {
                    cache: 'no-store',
                    headers: { 'Cache-Control': 'no-cache, no-store', 'Pragma': 'no-cache' }
                });
                const statsData = await statsRes.json();

                if (statsData && statsData.collectedWater !== undefined) {
                    const localStore = useGameStore.getState();
                    const localWater = localStore.collectedWater;
                    const localContrib = localStore.contributedWater;

                    // SYNC LOGIC:
                    // Always trust the HIGHER value to prevent refresh-0 reset.
                    // This handles cases where backend is lagging OR local hydration was delayed.
                    setUserState({
                        collectedWater: Math.max(localWater, statsData.collectedWater),
                        contributedWater: Math.max(localContrib, statsData.contributedWater ?? 0),
                    } as any);

                    // 2. Sync Session State
                    const sessionRes = await fetch(`${getBackendUrl()}/session-state`);
                    const sessionData = await sessionRes.json();
                    if (sessionData) {
                        setSessionState({
                            treeStage: sessionData.treeStage ?? 0,
                            totalWater: sessionData.totalWater ?? 0,
                            phase: sessionData.phase
                        });
                    }
                }
            } catch (err) {
                console.error('Tree: Failed to sync data', err);
            } finally {
                setIsSyncing(false);
            }
        };

        syncAll();
    }, [_hasHydrated, user?.id, setUserState, setSessionState]);

    // Start BGM — wrapped in a one-shot callback triggered by user gesture
    const bgmStarted = useRef(false);
    const startBGMOnce = useCallback(() => {
        if (!bgmStarted.current) {
            bgmStarted.current = true;
            audio.playBGM();
        }
    }, [audio]);



    // Stage-up toast + SFX
    useEffect(() => {
        if (treeStage > prevStageRef.current) {
            const label = TREE_STAGE_LABELS[Math.min(treeStage, 9)];
            setStageToast(`STAGE ${treeStage + 1}|${label}`);
            setTimeout(() => setStageToast(null), 3000);
            audio.playStageUp();
        }
        prevStageRef.current = treeStage;
    }, [treeStage, audio]);

    const handleTap = useCallback(() => {
        if (!user || collectedWater <= 0 || isPumping) return;

        // Start BGM on first tap (browser policy: user gesture required)
        startBGMOnce();

        // Play water drop SFX
        audio.playWaterDrop();

        // Pump animation
        setIsPumping(true);
        setTimeout(() => setIsPumping(false), 100);

        // Spawn a water droplet
        const id = dropletIdRef.current++;
        const x = 44 + Math.random() * 12; // near pump nozzle
        setDroplets(prev => [...prev, { id, x, y: 0 }]);
        setTimeout(() => setDroplets(prev => prev.filter(d => d.id !== id)), 900);

        // Spawn a ripple on tree base
        const rippleId = Date.now();
        setRipples(prev => [...prev, rippleId]);
        setTimeout(() => setRipples(prev => prev.filter(r => r !== rippleId)), 800);

        // Update state
        setUserState({
            collectedWater: Math.max(0, collectedWater - 1),
            contributedWater: contributedWater + 1
        });
        emitWaterTap();
    }, [user, collectedWater, contributedWater, isPumping, setUserState, emitWaterTap]);

    const progress = Math.min(100, (totalWater / TOTAL_WATER_GOAL) * 100);
    const stageProgress = ((totalWater % WATER_PER_STAGE) / WATER_PER_STAGE) * 100;
    const waterLevelPct = Math.min(100, (collectedWater / 50) * 100);
    const isMaxStage = treeStage >= 9;
    const isOutOfWater = collectedWater <= 0;

    if (isSyncing) return (
        <div style={{ minHeight: 'calc(100dvh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ background: 'var(--yellow)', padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '2px' }}>MENYIAPKAN PERALATAN...</div>
            </div>
        </div>
    );

    // ── PRE-GAME LOBBY SCREEN ───────────────────────────────────────────
    if (phase === 'PRE_WATERING') return (
        <div style={{
            height: 'calc(100dvh - 140px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
            backgroundColor: 'var(--blue-bright)',
            backgroundImage: "url('/assets/branding/BG2.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <div className="card" style={{
                    width: '100%',
                    padding: '24px 20px',
                    border: '5px solid var(--black)',
                    boxShadow: '10px 10px 0 var(--black)',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1,
                    overflow: 'visible',
                    backgroundImage: "url('/assets/branding/BG1.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    <div style={{ position: 'absolute', top: '-18px', background: 'var(--lime)', padding: '6px 16px', border: '3px solid var(--black)', borderRadius: '100px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '2px', color: 'var(--black)', boxShadow: '4px 4px 0 var(--black)', fontWeight: 900, transform: 'rotate(-3deg)' }}>
                        WAITING SYSTEM ⏳
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', height: '180px', marginBottom: '10px', marginTop: '10px' }}>
                        <TreeVisual stage={9} size="100%" noEffects={true} />
                    </div>

                    <div style={{
                        marginTop: '0px',
                        fontFamily: 'var(--font-display)',
                        fontSize: '36px',
                        color: 'var(--yellow)',
                        letterSpacing: '2px',
                        lineHeight: 1.1,
                        textShadow: '2px 2px 0 var(--black)'
                    }}>
                        GROW THE TREE SEGERA DIMULAI
                    </div>

                    <div style={{ width: '80%', height: '3px', background: 'var(--black)', opacity: 0.1, margin: '24px 0 20px 0' }} />

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--lime)',
                        padding: '12px 20px',
                        border: '4px solid var(--black)',
                        borderRadius: '16px',
                        boxShadow: '4px 4px 0 var(--black)'
                    }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 900, color: 'var(--black)' }}>
                            TOTAL AIR TERKUMPUL
                        </div>
                        <strong style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--black)', lineHeight: 1 }}>
                            {(collectedWater || 0)}L 💧
                        </strong>
                    </div>
                </div>
            </div>

            {/* ── HOW TO PLAY ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', width: '100%' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '3px', color: 'var(--white)', fontWeight: 700, textAlign: 'center', opacity: 0.8 }}>
                    — CARA BERMAIN —
                </div>

                {/* Step 1 */}
                <div className="card animate-pop-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)', animationDelay: '0.1s' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--yellow)', border: '3px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🧠</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', letterSpacing: '1px', color: 'var(--black)' }}>KUMPULKAN AIR</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#444', marginTop: '2px' }}>Jawab trivia dengan benar untuk mendapat droplet air 💧</div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="card animate-pop-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)', animationDelay: '0.2s' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--blue-bright)', border: '3px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🚿</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', letterSpacing: '1px', color: 'var(--black)' }}>SIRAM POHON</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#444', marginTop: '2px' }}>Tap tombol pompa untuk menyiramkan air ke pohon bersama 🌳</div>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="card animate-pop-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)', background: 'var(--lime)', animationDelay: '0.3s' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--black)', border: '3px solid var(--black)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🌱</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', letterSpacing: '1px', color: 'var(--black)' }}>TUMBUH BERSAMA!</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#333', marginTop: '2px' }}>Semakin banyak kontribusi tim, semakin cepat pohon tumbuh!</div>
                    </div>
                </div>
            </div>
        </div>
    );
    // ── END PRE-GAME ────────────────────────────────────────────────────

    return (
        <div style={{
            height: 'calc(100dvh - 140px)',
            padding: '8px 14px 12px',
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '6px',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
        }}>

            {/* Stage-up Toast */}
            {stageToast && (() => {
                const [stageLabel, treeName] = stageToast.split('|');
                return (
                    <div style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                    }}>
                        <div style={{
                            background: 'var(--yellow)',
                            border: '5px solid var(--black)',
                            boxShadow: '8px 8px 0 var(--black)',
                            borderRadius: '24px',
                            padding: '18px 32px',
                            textAlign: 'center',
                            animation: 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                        }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '3px', color: '#555', marginBottom: '6px', fontWeight: 800 }}>🌱 LEVEL UP!</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 7vw, 32px)', letterSpacing: '2px', color: 'var(--black)', lineHeight: 1.1, textShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
                                {stageLabel}
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#444', marginTop: '6px', fontWeight: 700, letterSpacing: '2px' }}>
                                {treeName}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ── TITLE ─────────────────────── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(26px, 7vw, 38px)',
                        letterSpacing: '3px',
                        color: 'var(--yellow)',
                        textShadow: '3px 3px 0px var(--black)',
                        lineHeight: 1,
                    }}>
                        GROW THE TREE
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'var(--yellow)',
                        textShadow: '1px 1px 0 var(--black)',
                        letterSpacing: '2px',
                        marginTop: '4px',
                        fontWeight: 700,
                    }}>
                        POMPA AIR · SIRAMI POHON · TUMBUH BERSAMA!
                    </div>
                </div>
                {/* 🔇 Mute Toggle Button */}
                <button
                    onClick={() => {
                        const next = !isMuted;
                        setIsMutedState(next);
                        audio.setMuted(next);
                        if (!next) startBGMOnce();
                    }}
                    style={{
                        background: isMuted ? '#444' : 'var(--lime)',
                        border: '3px solid var(--black)',
                        boxShadow: '3px 3px 0 var(--black)',
                        borderRadius: '10px',
                        padding: '6px 12px',
                        fontFamily: 'var(--font-display)',
                        fontSize: '18px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        flexShrink: 0,
                    }}
                    title={isMuted ? 'Aktifkan suara' : 'Matikan suara'}
                >
                    {isMuted ? '🔇' : '🔊'}
                </button>
            </div>

            {/* ── TREE HERO CARD ─────────────── */}
            <div className="card" style={{ padding: '0', position: 'relative', overflow: 'visible' }}>
                {/* Background shimmer on max stage */}
                {isMaxStage && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(0,200,0,0.12))',
                        animation: 'pulse-glow 2s ease-in-out infinite',
                        zIndex: 0,
                    }} />
                )}

                {/* Tree image — hero zone */}
                <div style={{
                    position: 'relative',
                    height: 'clamp(100px, 24vh, 160px)',
                    width: '100%',
                    backgroundColor: 'var(--blue-bright)',
                    backgroundImage: "url('/assets/branding/BG1.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                        overflow: 'visible', paddingBottom: '10px'
                    }}>
                        <TreeVisual stage={treeStage} size="70%" isLevelingUp={!!stageToast} />
                    </div>

                    {/* Stage badge top-left */}
                    <div style={{
                        position: 'absolute', top: '12px', left: '12px',
                        background: 'var(--black)', color: 'var(--yellow)',
                        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
                        letterSpacing: '1px', padding: '4px 10px', borderRadius: '20px',
                    }}>
                        STAGE {treeStage + 1} / 10
                    </div>

                    {/* Total water badge top-right */}
                    <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'var(--blue-bright)', color: 'white',
                        fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '1px',
                        padding: '4px 12px', borderRadius: '20px',
                        border: '2px solid var(--black)',
                    }}>
                        {totalWater}L
                    </div>

                    {/* Ripple effects at tree base */}
                    {ripples.map(rippleId => (
                        <div key={rippleId} style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '40px',
                            height: '14px',
                            borderRadius: '50%',
                            background: 'rgba(59,130,246,0.4)',
                            animation: 'ripple-expand 0.7s ease-out forwards',
                        }} />
                    ))}
                </div>

                {/* Stage name strip */}
                <div style={{
                    padding: '12px 16px',
                    borderTop: '3px solid var(--black)',
                    background: isMaxStage ? 'var(--lime)' : 'var(--blue-light)',
                    position: 'relative', zIndex: 1,
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(18px, 5vw, 24px)',
                            letterSpacing: '1px',
                            color: 'var(--black)',
                        }}>
                            {isMaxStage ? '🌳 GRAND TREE TERCAPAI!' : TREE_STAGE_LABELS[Math.min(treeStage, 9)]}
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '10px',
                            color: 'var(--black)', letterSpacing: '1px', textAlign: 'right', fontWeight: 900
                        }}>
                            {Math.round(progress)}% SELESAI
                        </div>
                    </div>

                    {/* Global progress bar */}
                    <div style={{ marginTop: '8px' }}>
                        <div className="progress-track" style={{ height: '10px', borderRadius: '5px' }}>
                            <div className="progress-fill" style={{
                                width: `${progress}%`,
                                borderRadius: '5px',
                                background: isMaxStage ? 'linear-gradient(90deg, #ffd700, #b8860b)' : undefined,
                            }} />
                        </div>
                    </div>

                    {/* Stage-level progress */}
                    {!isMaxStage && (
                        <div style={{ marginTop: '6px' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--black)',
                                letterSpacing: '1px', marginBottom: '4px', fontWeight: 900
                            }}>
                                <span>KE STAGE BERIKUTNYA</span>
                                <span>{totalWater % WATER_PER_STAGE} / {WATER_PER_STAGE} L</span>
                            </div>
                            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', width: `${stageProgress}%`,
                                    background: 'var(--lime)', borderRadius: '3px',
                                    transition: 'width 0.3s ease',
                                }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── PUMP + RESERVOIR SECTION ──── */}
            {!isMaxStage && (
                <div className="card" style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>

                        {/* LEFT: Animated Pump SVG */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            flexShrink: 0,
                            width: '80px',
                            position: 'relative',
                        }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--black)', letterSpacing: '1px', textAlign: 'center', fontWeight: 900 }}>
                                POMPA AIR
                            </div>
                            {/* Droplet spray area */}
                            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                {/* Flying droplets */}
                                {droplets.map(d => (
                                    <div key={d.id} style={{
                                        position: 'absolute',
                                        left: `${d.x}%`,
                                        top: '10px',
                                        fontSize: '14px',
                                        animation: 'dropletFly 0.9s ease-out forwards',
                                        pointerEvents: 'none',
                                    }}>💧</div>
                                ))}

                                {/* Pump SVG */}
                                <svg viewBox="0 0 80 110" width="80" height="80">
                                    {/* Pump body */}
                                    <rect x="28" y="60" width="24" height="40" rx="4" fill="#3B82F6" stroke="#000" strokeWidth="2" />
                                    <rect x="32" y="64" width="16" height="12" rx="2" fill="#60A5FA" />
                                    {/* Pipe going up */}
                                    <rect x="35" y="25" width="10" height="38" rx="3" fill="#1D4ED8" stroke="#000" strokeWidth="1.5" />
                                    {/* Nozzle */}
                                    <rect x="27" y="22" width="26" height="8" rx="4" fill="#2563EB" stroke="#000" strokeWidth="1.5" />
                                    {/* Pump handle */}
                                    <g style={{
                                        transformOrigin: '60px 48px',
                                        animation: isPumping ? 'pumpCrank 0.35s ease-in-out' : 'none',
                                    }}>
                                        <line x1="40" y1="50" x2="68" y2="38" stroke="#1E3A8A" strokeWidth="4" strokeLinecap="round" />
                                        <circle cx="68" cy="38" r="6" fill="#FBBF24" stroke="#000" strokeWidth="2" />
                                    </g>
                                    {/* Base */}
                                    <rect x="22" y="98" width="36" height="8" rx="3" fill="#1E40AF" stroke="#000" strokeWidth="1.5" />
                                </svg>
                            </div>
                            {/* Water flowing down pipe indicator */}
                            {isPumping && (
                                <div style={{
                                    position: 'absolute',
                                    top: '38px',
                                    left: '37px',
                                    width: '6px',
                                    height: '20px',
                                    background: 'linear-gradient(to bottom, rgba(59,130,246,0), rgba(59,130,246,0.8))',
                                    borderRadius: '3px',
                                    animation: 'waterFlow 0.35s ease-in-out',
                                }} />
                            )}
                        </div>

                        {/* RIGHT: Reservoir tank */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--black)', letterSpacing: '1px', fontWeight: 900
                            }}>
                                <span>TANGKI AIR KAMU</span>
                                <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--blue-bright)', lineHeight: 1 }}>
                                    {collectedWater}<span style={{ fontSize: '12px' }}>L</span>
                                </span>
                            </div>

                            <div style={{
                                flex: 1,
                                height: '48px',
                                background: '#f0f4f8',
                                borderRadius: '12px',
                                border: '3px solid var(--black)',
                                boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Water fill */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: `${waterLevelPct}%`,
                                    background: 'linear-gradient(to bottom, rgba(147,197,253,0.9), rgba(59,130,246,0.95))',
                                    transition: 'height 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                }}>
                                    {/* Wave top */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        left: '-50%',
                                        width: '200%',
                                        height: '16px',
                                        background: 'rgba(147,197,253,0.7)',
                                        borderRadius: '50%',
                                        animation: 'waterWave 2s linear infinite',
                                    }} />
                                </div>
                                {/* Empty label */}
                                {isOutOfWater && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#aaa',
                                        letterSpacing: '1px',
                                    }}>
                                        TANGKI KOSONG
                                    </div>
                                )}
                            </div>

                            {/* Contribution */}
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--black)',
                                letterSpacing: '1px', textAlign: 'right', fontWeight: 800
                            }}>
                                TOTAL KONTRIBUSIMU: <strong style={{ color: 'var(--blue-bright)', fontWeight: 900 }}>{contributedWater}L</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── TAP BUTTON ──────────────────── */}
            {isMaxStage ? (
                <div className="card card-yellow" style={{ textAlign: 'center', padding: '24px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px', color: 'var(--black)' }}>
                        🌳 GRAND TREE TERCAPAI!
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#555', letterSpacing: '1px', marginTop: '6px' }}>
                        POHON TUMBUH SUBUR BERKAT KONTRIBUSI KALIAN
                    </div>
                </div>
            ) : isOutOfWater ? (
                <div className="card" style={{
                    textAlign: 'center', padding: '20px',
                    background: '#f0f0f0', border: '3px solid #ccc',
                }}>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>💧</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px', color: '#555' }}>
                        AIR KAMU SUDAH TERSALURKAN!
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px', marginTop: '6px' }}>
                        SEMUA {contributedWater}L SUDAH KAMU SUMBANGKAN 🎉
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleTap}
                    disabled={isOutOfWater}
                    style={{
                        background: isPumping
                            ? 'linear-gradient(135deg, #0ea5e9, #2563eb)'
                            : 'linear-gradient(135deg, #22c55e, #16a34a)',
                        border: '4px solid var(--black)',
                        boxShadow: isPumping ? '2px 2px 0 var(--black)' : '6px 6px 0 var(--black)',
                        transform: isPumping ? 'translate(4px, 4px)' : 'translate(0, 0)',
                        borderRadius: '18px',
                        padding: '20px',
                        width: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'box-shadow 0.08s ease, transform 0.08s ease, background 0.1s ease',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        touchAction: 'manipulation',
                    }}
                >
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(22px, 6vw, 28px)',
                        letterSpacing: '2px',
                        color: 'var(--white)',
                        textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                    }}>
                        {isPumping ? '💧 MENGALIR...' : '💧 TAP UNTUK MEMOMPA!'}
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.8)',
                        letterSpacing: '2px',
                    }}>
                        {collectedWater}L TERSISA · TAP SEBANYAK MUNGKIN!
                    </div>
                </button>
            )}

            {/* Global CSS for animations */}
            <style>{`
                @keyframes dropletFly {
                    0% { transform: translateY(0) scale(1); opacity: 1; }
                    60% { transform: translateY(-90px) translateX(30px) scale(1.2); opacity: 0.9; }
                    100% { transform: translateY(-60px) translateX(60px) scale(0.5); opacity: 0; }
                }
                @keyframes pumpCrank {
                    0% { transform: rotate(0deg); }
                    40% { transform: rotate(-35deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes waterFlow {
                    0% { opacity: 0; transform: scaleY(0); }
                    50% { opacity: 1; transform: scaleY(1); }
                    100% { opacity: 0; }
                }
                @keyframes waterWave {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(50%); }
                }
                @keyframes ripple-expand {
                    0% { transform: translateX(-50%) scale(0.5); opacity: 0.8; }
                    100% { transform: translateX(-50%) scale(3); opacity: 0; }
                }
            `}</style>
        </div>
    );
}
