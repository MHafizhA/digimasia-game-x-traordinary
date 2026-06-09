'use client';

import { useGameStore } from '@/store/useGameStore';
import TreeVisual, { TREE_STAGE_LABELS } from './TreeVisual';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTreeAudio } from '@/hooks/useTreeAudio';

const TOTAL_WATER_GOAL = 5000;
const WATER_PER_STAGE = 500;

interface WaterDrop {
    id: number;
    x: number; // % from left
    delay: number; // stagger delay s
    size: number; // relative size
}

let dropIdCounter = 0;

export default function TreeMonitor() {
    const { totalWater, treeStage } = useGameStore();
    const progress = Math.min(100, (totalWater / TOTAL_WATER_GOAL) * 100);
    const stageProgress = ((totalWater % WATER_PER_STAGE) / WATER_PER_STAGE) * 100;
    const isMaxStage = treeStage >= 9;

    const [isLevelingUp, setIsLevelingUp] = useState(false);
    const [waterDrops, setWaterDrops] = useState<WaterDrop[]>([]);
    const [isWatering, setIsWatering] = useState(false);
    const prevWaterRef = useRef(totalWater);
    const prevStageRef = useRef(treeStage);
    const wateringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { playStageUp } = useTreeAudio(true);

    // Spawn water drops from above when totalWater increases
    const spawnDrops = useCallback(() => {
        const count = 5 + Math.floor(Math.random() * 5); // 5-9 drops per event
        const drops: WaterDrop[] = Array.from({ length: count }, (_, i) => ({
            id: dropIdCounter++,
            x: 15 + Math.random() * 70, // spread across 15–85% width
            delay: i * 0.05,
            size: 0.8 + Math.random() * 0.7,
        }));
        setWaterDrops(prev => [...prev, ...drops]);
        // Remove them after animation ends (1.2s + max delay)
        setTimeout(() => {
            const ids = drops.map(d => d.id);
            setWaterDrops(prev => prev.filter(d => !ids.includes(d.id)));
        }, 1600);
    }, []);

    useEffect(() => {
        if (totalWater > prevWaterRef.current) {
            // Water increased → user tapped
            spawnDrops();

            // Mark as watering for glow effect
            setIsWatering(true);
            if (wateringTimerRef.current) clearTimeout(wateringTimerRef.current);
            wateringTimerRef.current = setTimeout(() => setIsWatering(false), 2000);
        }
        prevWaterRef.current = totalWater;
    }, [totalWater, spawnDrops]);

    useEffect(() => {
        if (treeStage > prevStageRef.current) {
            setIsLevelingUp(true);
            playStageUp();
            const t = setTimeout(() => setIsLevelingUp(false), 3000);
            prevStageRef.current = treeStage;
            return () => clearTimeout(t);
        }
        prevStageRef.current = treeStage;
    }, [treeStage, playStageUp]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Keyframes */}
            <style>{`
                @keyframes tm-dropFall {
                    0%   { transform: translateY(-20px) scale(0.6); opacity: 0; }
                    20%  { opacity: 1; }
                    80%  { opacity: 0.8; }
                    100% { transform: translateY(260px) scale(0.9); opacity: 0; }
                }
                @keyframes tm-waterPulse {
                    0%, 100% { box-shadow: 4px 4px 0 var(--black); }
                    50%      { box-shadow: 0 0 0 6px rgba(59,130,246,0.4), 4px 4px 0 var(--black); }
                }
            `}</style>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '1px' }}>
                        LIVE TREE GROWTH
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px' }}>
                        {isWatering ? '💧 USERS SEDANG MENYIRAM...' : 'REAL-TIME UPDATING'}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isWatering && (
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '1px',
                            color: 'var(--blue-bright)', fontWeight: 700,
                            animation: 'tm-waterPulse 0.8s ease-in-out infinite',
                            padding: '3px 10px', borderRadius: '20px',
                            border: '2px solid var(--blue-bright)',
                        }}>
                            💧 LIVE TAPPING
                        </div>
                    )}
                    <span className="badge badge-green">
                        <span className="live-dot" /> LIVE
                    </span>
                </div>
            </div>

            {/* Main layout: tall tree hero panel on top */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Tree image — full-width hero */}
                <div style={{
                    width: '100%',
                    height: '300px',
                    background: "url('/assets/branding/BG1.png') center/cover no-repeat",
                    border: '3px solid var(--black)',
                    boxShadow: isWatering
                        ? '4px 4px 0 var(--black), 0 0 0 4px rgba(59,130,246,0.4)'
                        : '4px 4px 0 var(--black)',
                    borderRadius: '16px',
                    overflow: 'visible',
                    position: 'relative',
                    transition: 'box-shadow 0.3s ease',
                }}>
                    <TreeVisual stage={treeStage} size="100%" isLevelingUp={isLevelingUp} />

                    {/* 💧 Water Droplets Animation Overlay */}
                    {waterDrops.map(drop => (
                        <div
                            key={drop.id}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: `${drop.x}%`,
                                fontSize: `${16 * drop.size}px`,
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

                    {/* Stage badge overlay */}
                    <div style={{
                        position: 'absolute', top: '12px', left: '12px',
                        background: 'var(--black)', color: 'var(--yellow)',
                        fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                        letterSpacing: '1px', padding: '4px 12px', borderRadius: '20px',
                    }}>
                        STAGE {treeStage + 1} / 10
                    </div>
                    <div style={{
                        position: 'absolute', top: '12px', right: '12px',
                        background: 'var(--blue-bright)', color: 'white',
                        fontFamily: 'var(--font-display)', fontSize: '20px',
                        padding: '4px 14px', borderRadius: '20px',
                        border: '2px solid var(--black)',
                    }}>
                        {totalWater}L
                    </div>

                    {/* Watering particles splash at base */}
                    {isWatering && (
                        <div style={{
                            position: 'absolute',
                            bottom: '6px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '4px',
                            zIndex: 10,
                            pointerEvents: 'none',
                        }}>
                            {['🌊', '💦', '🌊'].map((e, i) => (
                                <span key={i} style={{
                                    fontSize: '14px',
                                    opacity: 0.85,
                                    animation: `tm-waterPulse ${0.8 + i * 0.15}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.2}s`,
                                }}>{e}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats row below the tree */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px', marginBottom: '2px' }}>
                            CURRENT STAGE
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px, 2.5vw, 24px)', letterSpacing: '1px', lineHeight: 1 }}>
                            {treeStage + 1} / 10 · {TREE_STAGE_LABELS[Math.min(treeStage, 9)]}
                        </div>
                    </div>

                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px', marginBottom: '2px' }}>
                            TOTAL AIR TERKUMPUL
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', color: 'var(--blue-bright)', lineHeight: 1 }}>
                            {totalWater}L
                        </div>
                    </div>

                    {/* Stage mini-dots — spans full width */}
                    <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#888', letterSpacing: '1px', marginBottom: '6px' }}>
                            10-STAGE PROGRESS
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {Array.from({ length: 10 }, (_, i) => (
                                <div key={i} title={`Stage ${i + 1}: ${TREE_STAGE_LABELS[i]}`} style={{
                                    width: '22px', height: '22px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--black)',
                                    background: i < treeStage ? 'var(--lime)' : i === treeStage ? 'var(--blue-bright)' : '#e5e7eb',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700,
                                    color: i <= treeStage ? 'var(--black)' : '#aaa',
                                    transition: 'all 0.4s ease',
                                    boxShadow: i === treeStage ? '2px 2px 0 var(--black)' : 'none',
                                }}>
                                    {i < treeStage ? '✓' : i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Global progress bar */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px', marginBottom: '4px' }}>
                    <span>PROGRESS KE GRAND TREE</span>
                    <span>{Math.round(progress)}% · {totalWater} / {TOTAL_WATER_GOAL} L</span>
                </div>
                <div className="progress-track" style={{ height: '14px', borderRadius: '7px' }}>
                    <div className="progress-fill" style={{
                        width: `${progress}%`,
                        borderRadius: '7px',
                        background: isMaxStage ? 'linear-gradient(90deg, #ffd700, #b8860b)' : undefined,
                        transition: 'width 0.5s ease',
                    }} />
                </div>
            </div>

            {/* Stage-level progress */}
            {!isMaxStage && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#aaa', letterSpacing: '1px', marginBottom: '4px' }}>
                        <span>MENUJU STAGE {treeStage + 2}</span>
                        <span>{totalWater % WATER_PER_STAGE} / {WATER_PER_STAGE} L</span>
                    </div>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden', border: '2px solid #ddd' }}>
                        <div style={{
                            height: '100%',
                            width: `${stageProgress}%`,
                            background: 'var(--lime)',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease',
                        }} />
                    </div>
                </div>
            )}

            {/* Grand Tree reached */}
            {isMaxStage && (
                <div style={{
                    background: 'var(--lime)',
                    border: '4px solid var(--black)',
                    boxShadow: '6px 6px 0 var(--black)',
                    borderRadius: '14px',
                    padding: '20px',
                    textAlign: 'center',
                    animation: 'pop-in 0.5s ease-out',
                }}>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '32px',
                        letterSpacing: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}>
                        <img src="/assets/branding/Pohon 10.png" alt="" style={{ height: '48px', filter: 'drop-shadow(2px 2px 0 var(--black))' }} />
                        <span>GRAND TREE TERCAPAI!</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#333', letterSpacing: '1px', marginTop: '6px' }}>
                        {totalWater}L AIR TELAH DIKUMPULKAN BERSAMA
                    </div>
                </div>
            )}
        </div>
    );
}
