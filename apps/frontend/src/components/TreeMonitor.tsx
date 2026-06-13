'use client';

import { useGameStore } from '@/store/useGameStore';
import TreeVisual, { TREE_STAGE_LABELS } from './TreeVisual';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTreeAudio } from '@/hooks/useTreeAudio';
import { getBackendUrl } from '@/lib/config';

const TOTAL_WATER_GOAL = 100;
const WATER_PER_STAGE = 10;

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
    const [topContributors, setTopContributors] = useState<{ id: string, name: string, division: string, contributedWater: number }[]>([]);
    const [stageToast, setStageToast] = useState<string | null>(null);
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
            const label = TREE_STAGE_LABELS[Math.min(treeStage, 9)];
            setStageToast(`STAGE ${treeStage + 1}|${label}`);
            setTimeout(() => setStageToast(null), 3000);

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>

                {/* Stage-up Toast (Shared styles with Tree.tsx but centered absolutely) */}
                {stageToast && (() => {
                    const [stageLabel, treeName] = stageToast.split('|');
                    return (
                        <div style={{
                            position: 'absolute',
                            top: '40%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 10000,
                            pointerEvents: 'none',
                            width: '90%',
                            maxWidth: '300px',
                        }}>
                            <div style={{
                                background: 'var(--yellow)',
                                border: '4px solid var(--black)',
                                boxShadow: '5px 5px 0 var(--black)',
                                borderRadius: '16px',
                                padding: '12px 16px',
                                textAlign: 'center',
                                animation: 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                            }}>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '2px', color: '#555', marginBottom: '4px' }}>⬆️ LEVEL UP!</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '1px', color: 'var(--black)', lineHeight: 1.1 }}>
                                    {stageLabel}
                                </div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#333', marginTop: '4px', fontWeight: 800 }}>
                                    {treeName}
                                </div>
                            </div>
                        </div>
                    );
                })()}

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

                    {/* GRAND TREE ACHIEVED OVERLAY */}
                    {isMaxStage && (
                        <div style={{
                            position: 'absolute',
                            top: '40%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: 'var(--lime)',
                            border: '3px solid var(--black)',
                            boxShadow: '6px 6px 0 var(--black)',
                            padding: '16px 20px',
                            borderRadius: '20px',
                            textAlign: 'center',
                            animation: 'pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                            zIndex: 30,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'max-content',
                            maxWidth: '90%'
                        }}>
                            <img src="/assets/branding/Pohon 10.png" alt="" style={{ height: '40px', filter: 'drop-shadow(2px 2px 0 var(--black))', marginBottom: '4px' }} />
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 28px)', color: 'var(--black)', letterSpacing: '1px', lineHeight: 1 }}>
                                GRAND TREE TERCAPAI!
                            </div>
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800,
                                background: 'white', border: '2px solid black', padding: '4px 10px',
                                borderRadius: '12px', display: 'inline-block', marginTop: '6px'
                            }}>
                                {totalWater}L TERKUMPUL
                            </div>
                        </div>
                    )}

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
            {/* Top Contributors Leaderboard */}
            <div style={{
                background: 'var(--blue-light)',
                border: '3px solid var(--black)',
                boxShadow: '4px 4px 0 var(--black)',
                borderRadius: '16px',
                padding: '16px',
                marginTop: '8px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px' }}>🏆 TOP CONTRIBUTORS</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'var(--lime)', border: '2px solid var(--black)', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>
                        LIVE RANKING
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {topContributors.length === 0 && (
                        <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#666', padding: '10px' }}>
                            BELUM ADA KONTRIBUSI AIR
                        </div>
                    )}
                    {topContributors.map((c, i) => (
                        <div key={c.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: i === 0 ? 'var(--yellow)' : i === 1 ? '#e2e8f0' : i === 2 ? '#edd1b0' : 'white',
                            border: '2px solid var(--black)',
                            borderRadius: '10px',
                            padding: '8px 12px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)', fontSize: '18px',
                                    width: '24px', textAlign: 'center'
                                }}>
                                    #{i + 1}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800 }}>{c.name}</div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#555' }}>{c.division}</div>
                                </div>
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--blue-bright)' }}>
                                {c.contributedWater}<span style={{ fontSize: '10px' }}>L</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
