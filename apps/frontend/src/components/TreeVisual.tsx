'use client';

import React from 'react';
import Image from 'next/image';

interface TreeVisualProps {
    stage: number;
    size?: number | string;
    isAnimated?: boolean;
    isLevelingUp?: boolean;
}

// Maps stage 0-9 to the corresponding PNG asset
const TREE_IMAGES = [
    '/assets/branding/Pohon1.png',
    '/assets/branding/Pohon2.png',
    '/assets/branding/Pohon3.png',
    '/assets/branding/Pohon4.png',
    '/assets/branding/Pohon5.png',
    '/assets/branding/Pohon6.png',
    '/assets/branding/Pohon7.png',
    '/assets/branding/Pohon8.png',
    '/assets/branding/Pohon9.png',
    '/assets/branding/Pohon 10.png',
];

export const TREE_STAGE_LABELS = [
    'BENIH', 'KECAMBAH', 'TUNAS', 'BIBIT',
    'POHON MUDA', 'POHON REMAJA', 'POHON DEWASA',
    'POHON BESAR', 'POHON TUMBUH SUBUR', 'GRAND TREE 🏆',
];

export default function TreeVisual({ stage, size = '100%', isAnimated = true, isLevelingUp = false }: TreeVisualProps) {
    const currentStage = Math.min(Math.max(stage, 0), 9);
    const src = TREE_IMAGES[currentStage];

    // Determine animation based on isLevelingUp override vs normal loop
    let anim = 'none';
    if (isLevelingUp) {
        anim = 'marioGrowth 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) both';
    } else if (currentStage === 9) {
        anim = 'pulseGlow 2.5s ease-in-out infinite';
    } else if (isAnimated) {
        // floating gently
        anim = 'floating 3.5s ease-in-out infinite';
    }

    return (
        <div style={{
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'visible',
        }}>
            {/* Grand Tree Glorious Sun Rays Background */}
            {currentStage === 9 && (
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: '180%', height: '180%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(circle at 45% 50%, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%)',
                        animation: 'pulseAura 3s ease-in-out infinite alternate'
                    }}>
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.3) 0deg 10deg, transparent 10deg 20deg)',
                            borderRadius: '50%',
                            animation: 'spinRays 25s linear infinite',
                            maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
                            WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)'
                        }} />
                    </div>
                </div>
            )}

            <img
                key={`tree-${currentStage}-${isLevelingUp}`} // Force re-render on level up for animation trigger
                src={src}
                alt={`Tree Stage ${currentStage + 1}`}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'bottom',
                    animation: anim,
                    filter: currentStage === 9 ? undefined : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                    transition: 'filter 0.8s ease',
                    transformOrigin: 'bottom center', // crucial for growth animation from the ground
                    position: 'relative',
                    zIndex: 1,
                }}
            />

            <style>{`
                @keyframes floating {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0); }
                }
                
                @keyframes pulseGlow {
                    0% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(255,215,0,0.8)) brightness(1); }
                    50% { transform: scale(1.05); filter: drop-shadow(0 0 30px rgba(255,215,0,1)) drop-shadow(0 0 50px rgba(255,255,255,0.6)) brightness(1.2); }
                    100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(255,215,0,0.8)) brightness(1); }
                }
                
                @keyframes spinRays {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulseAura {
                    0% { opacity: 0.6; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1.1); }
                }

                @keyframes marioGrowth {
                    0% { transform: scale(1) translateY(0); }
                    25% { transform: scale(0.9, 0.8) translateY(10px); }
                    60% { transform: scale(1.2, 1.3) translateY(-15px); }
                    80% { transform: scale(0.95, 0.95) translateY(5px); }
                    100% { transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
