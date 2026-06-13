'use client';

import { useGameStore } from '@/store/useGameStore';
import TreeVisual, { TREE_STAGE_LABELS } from '@/components/TreeVisual';
import TVFrame from '@/components/TVFrame';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useTreeAudio } from '@/hooks/useTreeAudio';
import { useSocket } from '@/hooks/useSocket';

const TOTAL_WATER_GOAL = 3500;

interface WaterDrop {
    id: number;
    x: number;
    delay: number;
    size: number;
}
let dropIdCounter = 0;

export default function TreeMonitorExternal() {
    const { totalWater, treeStage, _hasHydrated } = useGameStore();
    const [mounted, setMounted] = useState(false);
    const [isMuted, setIsMutedState] = useState(false);
    const [isLevelingUp, setIsLevelingUp] = useState(false);
    const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
    const [isWatering, setIsWatering] = useState(false);
    const audio = useTreeAudio();
    const prevWaterRef = useRef(totalWater);
    const prevStageRef = useRef(treeStage);
    const bgmStarted = useRef(false);
    const wateringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useSocket(); // Vital to subscribe to backend state broadcasts

    useEffect(() => {
        setMounted(true);
    }, []);

    // Start BGM on first user interaction (click anywhere)
    const startBGMOnce = useCallback(() => {
        if (!bgmStarted.current) {
            bgmStarted.current = true;
            audio.playBGM();
        }
    }, [audio]);

    // Attach global listeners for BGM Autoplay
    useEffect(() => {
        window.addEventListener('click', startBGMOnce, { once: true });
        window.addEventListener('keydown', startBGMOnce, { once: true });
        return () => {
            window.removeEventListener('click', startBGMOnce);
            window.removeEventListener('keydown', startBGMOnce);
        };
    }, [startBGMOnce]);

    // Stage-up SFX
    useEffect(() => {
        if (treeStage > prevStageRef.current) {
            setIsLevelingUp(true);
            audio.playStageUp();
            if (treeStage >= 9) audio.playComplete();

            const t = setTimeout(() => setIsLevelingUp(false), 3000);
            prevStageRef.current = treeStage;
            return () => clearTimeout(t);
        }
        prevStageRef.current = treeStage;
    }, [treeStage, audio]);

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
    const isMaxStage = treeStage >= 9;

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
                        {isWatering ? '💧 USERS SEDANG MENYIRAM...' : 'DIGIMA ASIA 10TH ANNIVERSARY'}
                    </div>
                </div>

                {/* Mute Toggle Button */}
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
                        title={isMuted ? 'Aktifkan BGM' : 'Matikan BGM'}
                    >
                        {isMuted ? '🔇' : '🔊'}
                    </button>

                    {isWatering && (
                        <div style={{
                            background: 'var(--blue-light)', border: '3px solid var(--blue-bright)',
                            borderRadius: '12px', padding: '6px 16px', fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(14px, 1.8vw, 18px)', fontWeight: 800, color: 'var(--blue-bright)',
                            animation: 'tm-waterPulse 0.8s ease-in-out infinite'
                        }}>
                            💧 LIVE TAPPING
                        </div>
                    )}
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
                        <span className="live-dot" style={{ width: '12px', height: '12px', background: 'red', borderRadius: '50%', animation: 'blink 1.5s infinite' }} />
                        ON AIR
                    </div>
                </div>
            </div>

            {/* Tree Central Focus */}
            <div style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3vw',
                marginTop: '8px',
                marginBottom: '8px',
                position: 'relative',
                zIndex: 11
            }}>
                {!isMaxStage && (
                    <div style={{
                        background: 'var(--blue-light)',
                        border: '3px solid var(--black)',
                        boxShadow: '6px 6px 0 var(--black)',
                        padding: '12px 20px',
                        borderRadius: '16px',
                        flexShrink: 0
                    }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 0.8vw, 14px)', color: '#666', marginBottom: '8px' }}>STAGE CURRENT</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 42px)', color: 'var(--navy-dark)', lineHeight: 1 }}>
                            {treeStage + 1} / 10
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1vw, 14px)', color: 'var(--pink-hot)', fontWeight: 800, marginTop: '8px' }}>
                            {TREE_STAGE_LABELS[Math.min(treeStage, 9)]}
                        </div>
                    </div>
                )}

                {/* Center Tree */}
                <div style={{
                    height: '100%',
                    maxHeight: '40vh',
                    aspectRatio: '1',
                    display: 'flex',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <TreeVisual stage={treeStage} size="100%" isLevelingUp={isLevelingUp} />

                    {/* 💧 Water Droplets Animation Container */}
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
                                zIndex: 20,
                                transformOrigin: 'center top',
                            }}
                        >
                            💧
                        </div>
                    ))}
                </div>

                {!isMaxStage && (
                    <div style={{
                        background: 'var(--blue-light)',
                        border: '3px solid var(--black)',
                        boxShadow: '6px 6px 0 var(--black)',
                        padding: '12px 20px',
                        borderRadius: '16px',
                        textAlign: 'right',
                        flexShrink: 0
                    }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 0.8vw, 14px)', color: '#666', marginBottom: '8px' }}>TOTAL AIR</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 3.5vw, 48px)', color: 'var(--blue-bright)', lineHeight: 1 }}>
                            {totalWater} L
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1vw, 14px)', color: 'var(--navy-dark)', fontWeight: 800, marginTop: '8px' }}>
                            TARGET: 3500 L
                        </div>
                    </div>
                )}

                {isMaxStage && (
                    <div style={{
                        background: 'var(--lime)',
                        border: '4px solid var(--black)',
                        boxShadow: '8px 8px 0 var(--black)',
                        padding: '16px 24px',
                        borderRadius: '20px',
                        textAlign: 'center',
                        animation: 'pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                        flexShrink: 0,
                    }}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(28px, 3vw, 46px)',
                            color: 'var(--black)',
                            letterSpacing: '2px',
                            lineHeight: 1
                        }}>
                            <img src="/assets/branding/Pohon 10.png" alt="" style={{ height: 'clamp(50px, 6vw, 80px)', filter: 'drop-shadow(3px 3px 0 var(--black))' }} />
                            <span>GRAND TREE</span>
                            <span>TERCAPAI!</span>
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'clamp(10px, 1.2vw, 14px)',
                            fontWeight: 800,
                            color: 'var(--navy-dark)',
                            marginTop: '16px',
                            letterSpacing: '1px',
                            background: 'var(--blue-light)',
                            border: '3px solid black',
                            padding: '6px 12px',
                            borderRadius: '12px',
                            display: 'inline-block'
                        }}>
                            {totalWater}L AIR TELAH DIKUMPULKAN
                        </div>
                    </div>
                )}
            </div>

            {/* Monitor Progress Bar */}
            <div style={{ flexShrink: 0, background: 'var(--blue-light)', padding: '12px 16px', borderRadius: '16px', border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)', position: 'relative', zIndex: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'clamp(12px, 1.2vw, 16px)', fontWeight: 800, color: 'var(--navy-dark)', letterSpacing: '2px', marginBottom: '8px' }}>
                    <span>PROGRESS MENUJU GRAND TREE</span>
                    <span>{Math.round(progress)}% · {totalWater} / {TOTAL_WATER_GOAL} L</span>
                </div>
                <div style={{ height: '24px', background: '#e5e7eb', borderRadius: '12px', overflow: 'hidden', border: '3px solid #ccc' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: isMaxStage ? 'linear-gradient(90deg, #ffd700, #ff8c00)' : 'linear-gradient(90deg, var(--lime), #34d399)',
                        borderRadius: '12px',
                        transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                </div>
            </div>
        </TVFrame>
    );
}
