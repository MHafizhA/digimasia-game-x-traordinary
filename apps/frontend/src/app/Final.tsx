'use client';

import { useGameStore } from '@/store/useGameStore';
import TreeVisual from '@/components/TreeVisual';
import { useTreeAudio } from '@/hooks/useTreeAudio';
import { useEffect } from 'react';

export default function Final() {
    const { totalWater } = useGameStore();
    const audio = useTreeAudio(true);

    useEffect(() => {
        audio.playComplete();
    }, [audio]);

    return (
        <div style={{
            height: '100dvh',
            padding: '10px',
            maxWidth: '480px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
        }}>
            {/* Main Congratulations Card */}
            <div className="card" style={{
                width: '100%',
                padding: '0',
                overflow: 'hidden',
                background: 'var(--navy-dark)',
                border: '4px solid var(--black)',
                boxShadow: '8px 8px 0 var(--black)',
                borderRadius: '24px',
                animation: 'pop-in 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
            }}>
                {/* Header Decoration */}
                <div style={{
                    background: 'var(--pink-hot)',
                    padding: '12px',
                    borderBottom: '4px solid var(--black)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px'
                }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            fontSize: '18px',
                            animation: `crownFloat 2s ease-in-out ${i * 0.3}s infinite`,
                            color: i % 2 === 0 ? 'var(--yellow)' : 'var(--white)'
                        }}>
                            ★
                        </div>
                    ))}
                </div>

                <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        letterSpacing: '3px',
                        color: 'rgba(255,255,255,0.6)',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        marginBottom: '8px'
                    }}>
                        DIGIMA ASIA · 10TH ANNIVERSARY
                    </div>

                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(32px, 12vw, 56px)',
                        letterSpacing: '2px',
                        color: 'var(--yellow)',
                        textShadow: '4px 4px 0px var(--black)',
                        lineHeight: 0.9,
                        margin: '10px 0 24px',
                        transform: 'rotate(-2deg)',
                        display: 'inline-block'
                    }}>
                        CONGRATULATIONS!
                    </h1>

                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 3vw, 11px)',
                        color: 'var(--white)',
                        letterSpacing: '1px',
                        marginBottom: '28px',
                        background: 'rgba(0,0,0,0.3)',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        display: 'inline-block',
                    }}>
                        POHON BERHASIL TUMBUH MAKSIMAL 🌳✨
                    </div>

                    {/* Tree Visual with Ambient Glow */}
                    <div style={{
                        position: 'relative',
                        width: 'clamp(200px, 60vw, 280px)',
                        height: 'clamp(140px, 35vh, 200px)',
                        marginTop: 'auto',
                        margin: '0 auto 28px',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                    }}>
                        {/* Glow Disk */}
                        <div style={{
                            position: 'absolute',
                            width: '80%',
                            height: '80%',
                            background: 'radial-gradient(circle, var(--yellow) 0%, transparent 70%)',
                            opacity: 0.3,
                            filter: 'blur(20px)',
                            animation: 'pulse 3s infinite',
                        }} />

                        <div style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
                            <TreeVisual stage={9} />
                        </div>
                    </div>

                    {/* Total Water Achievement */}
                    <div style={{
                        background: 'var(--white)',
                        border: '3px solid var(--black)',
                        boxShadow: '4px 4px 0 var(--black)',
                        borderRadius: '16px',
                        padding: '16px 24px',
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        animation: 'pop-in 1s 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                    }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 800, color: '#666', letterSpacing: '1px' }}>
                            PENCAPAIAN BERSAMA
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: 'clamp(24px, 8vw, 36px)',
                            color: 'var(--blue-bright)',
                            lineHeight: 1
                        }}>
                            💧 {totalWater} L AIR
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--pink-hot)' }}>
                            SUKSES TERKUMPUL!
                        </div>
                    </div>

                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: 'rgba(255,255,255,0.4)',
                        letterSpacing: '1px',
                        marginTop: '32px',
                    }}>
                        TERIMA KASIH ATAS PARTISIPASI KAMU!
                    </div>
                </div>
            </div>

            {/* Support Message or Secondary info */}
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                letterSpacing: '1px',
                animation: 'fadeIn 2s forwards',
            }}>
                SESSION COMPLETED · DIGIMA ASIA 2026
            </div>
        </div>
    );
}
