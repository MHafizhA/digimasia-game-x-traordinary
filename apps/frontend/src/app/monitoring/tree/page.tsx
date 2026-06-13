'use client';

import { useGameStore } from '@/store/useGameStore';
import TreeVisual, { TREE_STAGE_LABELS } from '@/components/TreeVisual';
import TVFrame from '@/components/TVFrame';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTreeAudio } from '@/hooks/useTreeAudio';
import { useSocket } from '@/hooks/useSocket';
import { getBackendUrl } from '@/lib/config';

const TOTAL_WATER_GOAL = 100;
const WATER_PER_STAGE = 10;

interface WaterDrop {
    id: number;
    x: number;
    delay: number;
    size: number;
}
let dropIdCounter = 0;

export default function TreeMonitorExternal() {
    const { totalWater, treeStage, phase, _hasHydrated } = useGameStore();
    const [mounted, setMounted] = useState(false);
    const [isMuted, setIsMutedState] = useState(false);
    const [isLevelingUp, setIsLevelingUp] = useState(false);
    const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
    const [isWatering, setIsWatering] = useState(false);
    const [topContributors, setTopContributors] = useState<{ id: string, name: string, division: string, contributedWater: number }[]>([]);
    const audio = useTreeAudio();
    const prevWaterRef = useRef(totalWater);
    const prevStageRef = useRef(treeStage);
    const bgmStarted = useRef(false);
    const wateringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useSocket();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Start BGM automatically when game starts (phase moves to WATERING)
    useEffect(() => {
        if (phase === 'WATERING' && !bgmStarted.current && treeStage < 9) {
            bgmStarted.current = true;
            audio.playBGM();
        }
    }, [phase, audio, treeStage]);

    // Manual BGM start via button (legacy fallback)
    const startBGMOnce = useCallback(() => {
        if (!bgmStarted.current) {
            bgmStarted.current = true;
            if (treeStage < 9) {
                audio.playBGM();
            }
        }
    }, [audio, treeStage]);

    // Stage-up SFX
    useEffect(() => {
        if (treeStage > prevStageRef.current) {
            setIsLevelingUp(true);
            audio.playStageUp();
            if (treeStage >= 9) {
                audio.playComplete();
                audio.stopBGM();
            }
            setTimeout(() => setIsLevelingUp(false), 1000);
            prevStageRef.current = treeStage;
        }
        prevStageRef.current = treeStage;
    }, [treeStage]);

    // Fetch top contributors
    useEffect(() => {
        const fetchTop = async () => {
            try {
                const res = await fetch(`${getBackendUrl()}/users/tree/top-contributors`);
                const data = await res.json();
                if (Array.isArray(data)) setTopContributors(data);
            } catch (err) {
                console.error('Failed to fetch top contributors', err);
            }
        };
        fetchTop();
    }, [totalWater]);

    const spawnDrops = useCallback(() => {
        const count = 5 + Math.floor(Math.random() * 5);
        const drops: WaterDrop[] = Array.from({ length: count }, (_, i) => ({
            id: dropIdCounter++,
            x: 10 + Math.random() * 80,
            delay: i * 0.05,
            size: 0.8 + Math.random() * 0.7,
        }));
        setWaterDrops(prev => [...prev, ...drops]);
        setTimeout(() => {
            const ids = drops.map(d => d.id);
            setWaterDrops(prev => prev.filter(d => !ids.includes(d.id)));
        }, 1600);
    }, []);
    useEffect(() => {
        if (totalWater > prevWaterRef.current && totalWater > 0) {
            spawnDrops();
            setIsWatering(true);
            if (wateringTimerRef.current) clearTimeout(wateringTimerRef.current);
            wateringTimerRef.current = setTimeout(() => setIsWatering(false), 2000);
        }
        prevWaterRef.current = totalWater;
    }, [totalWater, spawnDrops]);

    if (!mounted || !_hasHydrated) return null;

    const progress = Math.min(100, (totalWater / TOTAL_WATER_GOAL) * 100);
    const stageProgress = ((totalWater % WATER_PER_STAGE) / WATER_PER_STAGE) * 100;
    const isMaxStage = treeStage >= 9;

    const handleStartWatering = async () => {
        try {
            await fetch(`${getBackendUrl()}/admin/phase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phase: 'WATERING' }),
            });
        } catch { alert('Gagal start game pohon'); }
    };

    if (phase === 'PRE_WATERING') {
        return (
            <TVFrame>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                    <div style={{
                        textAlign: 'center', padding: '60px', borderRadius: '20px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        minHeight: '300px', border: '5px solid var(--black)', boxShadow: '8px 8px 0 var(--black)',
                        backgroundImage: "url('/assets/branding/BG1.png')",
                        backgroundSize: 'cover', backgroundPosition: 'center',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <TreeVisual stage={9} size="150px" noEffects={true} />
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '56px', color: 'var(--yellow)', textShadow: '2px 2px 0 var(--black)', marginTop: '20px', position: 'relative', zIndex: 1 }}>
                            TREE: GET READY
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--white)', letterSpacing: '4px', marginTop: '12px', position: 'relative', zIndex: 1 }}>
                            MONITOR STANDBY · PENGGUNA BISA MELIHAT LAYAR INI
                        </div>
                        <button
                            onClick={handleStartWatering}
                            className="btn btn-primary"
                            style={{ fontSize: '24px', padding: '16px 40px', marginTop: '32px', position: 'relative', zIndex: 1 }}
                        >
                            ▶ MULAI GAME SEKARANG
                        </button>
                    </div>
                </div>
            </TVFrame>
        );
    }

    return (
        <TVFrame>
            <style>{`
                @keyframes tm-dropFall {
                    0%   { transform: translateY(-20px) scale(0.6); opacity: 0; }
                    20%  { opacity: 1; }
                    80%  { opacity: 0.8; }
                    100% { transform: translateY(40vh) scale(0.9); opacity: 0; }
                }
                @keyframes tm-waterPulse {
                    0%, 100% { box-shadow: 4px 4px 0 var(--black); }
                    50%      { box-shadow: 0 0 0 6px rgba(59,130,246,0.5), 4px 4px 0 var(--black); }
                }
            `}</style>

            {/* Monitor Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0, position: 'relative', zIndex: 11 }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(24px, 3vw, 42px)',
                        letterSpacing: '2px',
                        color: 'var(--yellow)',
                        textShadow: '3px 3px 0px var(--black)',
                        lineHeight: 1
                    }}>
                        LIVE TREE GROWTH
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(12px, 1.5vw, 16px)',
                        letterSpacing: '2px',
                        fontWeight: 800,
                        color: 'var(--white)',
                        textShadow: '2px 2px 0px var(--black)',
                        marginTop: '4px'
                    }}>
                        {isWatering ? '💧 DIGIMERS SEDANG MENYIRAM...' : 'DIGIMA ASIA 10TH ANNIVERSARY'}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={() => {
                            startBGMOnce();
                            const next = !isMuted;
                            setIsMutedState(next);
                            audio.setMuted(next);
                            if (!next) startBGMOnce();
                        }}
                        style={{
                            background: isMuted ? '#444' : 'var(--lime)',
                            border: '3px solid var(--black)',
                            boxShadow: '4px 4px 0 var(--black)',
                            padding: '6px 14px',
                            borderRadius: '12px',
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(16px, 2vw, 22px)',
                            cursor: 'pointer',
                        }}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>


                    <div style={{
                        background: 'var(--lime)',
                        border: '3px solid var(--black)',
                        boxShadow: '4px 4px 0 var(--black)',
                        padding: '6px 16px',
                        borderRadius: '12px',
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        color: 'var(--black)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{ width: '12px', height: '12px', background: 'red', borderRadius: '50%', animation: 'blink 1.5s infinite' }} />
                        ON AIR
                    </div>
                </div>
            </div>

            {/* Main Content Area: Tree + Side Leaderboard */}
            <div style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                gap: '24px',
                marginTop: '12px',
                marginBottom: '12px',
                position: 'relative',
                zIndex: 11
            }}>
                {/* Left Side: Tree & Stats */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2vw',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    padding: '24px',
                    position: 'relative'
                }}>
                    {!isMaxStage && (
                        <div style={{
                            background: 'var(--blue-light)',
                            border: '3px solid var(--black)',
                            boxShadow: '6px 6px 0 var(--black)',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            flexShrink: 0,
                            maxWidth: '180px'
                        }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 0.8vw, 12px)', color: 'var(--black)', marginBottom: '8px' }}>STAGE CURRENT</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--black)', lineHeight: 1 }}>
                                {treeStage + 1} <span style={{ fontSize: '0.6em', color: '#555' }}>/ 10</span>
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'clamp(11px, 1.2vw, 15px)',
                                color: 'var(--black)',
                                fontWeight: 800,
                                marginTop: '12px',
                                textWrap: 'balance',
                                lineHeight: '1.2'
                            }}>
                                {TREE_STAGE_LABELS[Math.min(treeStage, 9)]}
                            </div>
                        </div>
                    )}

                    {/* Center Tree Area (Always centered & responsive) */}
                    <div style={{
                        flex: 1,
                        height: '100%',
                        maxHeight: '45vh',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        padding: '16px'
                    }}>
                        <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '10px' }}>
                            <TreeVisual stage={treeStage} size={isMaxStage ? '110%' : '90%'} isLevelingUp={isLevelingUp} />

                            {/* DROPS */}
                            {waterDrops.map(drop => (
                                <div
                                    key={drop.id}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: `${drop.x}%`,
                                        fontSize: `clamp(24px, ${4 * drop.size}vh, 48px)`,
                                        animationName: 'tm-dropFall',
                                        animationDuration: '1.2s',
                                        animationDelay: `${drop.delay}s`,
                                        animationFillMode: 'both',
                                        animationTimingFunction: 'cubic-bezier(0.4, 0, 1, 1)',
                                        pointerEvents: 'none',
                                        zIndex: 20
                                    }}
                                >
                                    💧
                                </div>
                            ))}


                        </div>
                    </div>

                    {!isMaxStage && (
                        <div style={{
                            background: 'var(--blue-light)',
                            border: '3px solid var(--black)',
                            boxShadow: '6px 6px 0 var(--black)',
                            padding: '16px 20px',
                            borderRadius: '16px',
                            textAlign: 'right',
                            flexShrink: 0,
                            maxWidth: '180px'
                        }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 0.8vw, 12px)', color: 'var(--black)', marginBottom: '8px' }}>TOTAL AIR</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--black)', lineHeight: 1 }}>
                                {totalWater} L
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(11px, 1.2vw, 15px)', color: 'var(--black)', fontWeight: 800, marginTop: '12px' }}>
                                TARGET: {TOTAL_WATER_GOAL}L
                            </div>
                        </div>
                    )}


                </div>

                {/* Right Side Sidebar Leaderboard */}
                <div style={{
                    width: 'clamp(300px, 22vw, 420px)',
                    background: 'rgba(255, 255, 255, 0.95)', // Clean white panel
                    border: '4px solid var(--black)',
                    boxShadow: '8px 8px 0 var(--black)',
                    borderRadius: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        background: 'var(--blue-bright)', // Matches TV monitor header/logo
                        color: 'white', padding: '16px',
                        borderBottom: '4px solid var(--black)', fontFamily: 'var(--font-display)',
                        fontSize: '24px', textAlign: 'center', letterSpacing: '1px'
                    }}>
                        🏆 TOP CONTRIBUTORS
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {topContributors.map((c, i) => {
                            const seedStr = encodeURIComponent(c.name + c.division);
                            const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seedStr}`;

                            return (
                                <div key={c.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: i === 0 ? 'var(--lime)' : 'white',
                                    border: '3px solid var(--black)', borderRadius: '16px', padding: '12px 16px',
                                    boxShadow: '4px 4px 0 rgba(0,0,0,0.1)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', width: '28px', color: 'var(--black)' }}>#{i + 1}</div>
                                        {/* Pixel Art Avatar */}
                                        <div style={{
                                            width: '56px', height: '56px',
                                            borderRadius: '50%',
                                            background: i === 0 ? 'var(--lime)' : 'var(--blue-light)',
                                            border: '3px solid var(--black)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden', flexShrink: 0
                                        }}>
                                            <img src={avatarUrl} alt="Avatar" style={{ width: '110%', height: '110%', imageRendering: 'pixelated', marginTop: '6px' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 900, color: 'var(--black)', lineHeight: 1.2 }}>{c.name.toUpperCase()}</div>
                                            <div style={{
                                                fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'white',
                                                background: 'var(--black)', padding: '2px 6px', borderRadius: '4px',
                                                marginTop: '4px', alignSelf: 'flex-start'
                                            }}>{c.division.toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--blue-bright)' }}>
                                        {c.contributedWater}L
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Monitor Progress Bar */}
            <div style={{ flexShrink: 0, background: 'var(--blue-light)', padding: '12px 16px', borderRadius: '16px', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)', position: 'relative', zIndex: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800, marginBottom: '8px' }}>
                    <span>{isMaxStage ? '🏆 POHON TELAH TUMBUH SEMPURNA!' : 'PROGRESS MENUJU GRAND TREE'}</span>
                    <span>{Math.round(progress)}% · {totalWater} / {TOTAL_WATER_GOAL} L</span>
                </div>
                <div style={{ height: '24px', background: '#e5e7eb', borderRadius: '12px', overflow: 'hidden', border: '2px solid #333' }}>
                    <div style={{
                        height: '100%', width: `${progress}%`,
                        background: 'linear-gradient(90deg, var(--lime), #34d399)',
                        transition: 'width 0.8s ease-out'
                    }} />
                </div>

                {/* Stage-level progress */}
                {!isMaxStage && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px dashed rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#666', letterSpacing: '1px', marginBottom: '6px', fontWeight: 700 }}>
                            <span>KE STAGE BERIKUTNYA</span>
                            <span>{totalWater % WATER_PER_STAGE} / {WATER_PER_STAGE} L</span>
                        </div>
                        <div style={{ height: '12px', background: 'rgba(255,255,255,0.7)', borderRadius: '6px', overflow: 'hidden', border: '2px solid rgba(0,0,0,0.2)' }}>
                            <div style={{
                                height: '100%',
                                width: `${stageProgress}%`,
                                background: 'var(--lime)',
                                borderRadius: '6px',
                                transition: 'width 0.4s ease',
                            }} />
                        </div>
                    </div>
                )}
            </div>
        </TVFrame>
    );
}
