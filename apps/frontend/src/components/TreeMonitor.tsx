'use client';

import { useGameStore } from '@/store/useGameStore';
import TreeVisual, { TREE_STAGE_LABELS } from './TreeVisual';

const TOTAL_WATER_GOAL = 1000;
const WATER_PER_STAGE = 100;

export default function TreeMonitor() {
    const { totalWater, treeStage } = useGameStore();
    const progress = Math.min(100, (totalWater / TOTAL_WATER_GOAL) * 100);
    const stageProgress = ((totalWater % WATER_PER_STAGE) / WATER_PER_STAGE) * 100;
    const isMaxStage = treeStage >= 9;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '1px' }}>
                        LIVE TREE GROWTH
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px' }}>
                        REAL-TIME UPDATING
                    </div>
                </div>
                <span className="badge badge-green">
                    <span className="live-dot" /> LIVE
                </span>
            </div>

            {/* Main layout: tall tree hero panel on top */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Tree image — full-width hero */}
                <div style={{
                    width: '100%',
                    height: '300px', // Reduced from 400px to avoid massive scaling on dashboard
                    background: "url('/assets/branding/BG1.png') center/cover no-repeat",
                    border: '3px solid var(--black)',
                    boxShadow: '4px 4px 0 var(--black)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                }}>
                    <TreeVisual stage={treeStage} size="100%" />
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
