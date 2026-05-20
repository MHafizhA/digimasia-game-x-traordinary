'use client';

import TriviaMonitor from '@/components/TriviaMonitor';
import { useSocket } from '@/hooks/useSocket';
import TVFrame from '@/components/TVFrame';
import { useTreeAudio } from '@/hooks/useTreeAudio';
import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

export default function TriviaMonitoringPage() {
    useSocket();
    const { timer, phase } = useGameStore();

    // ── Audio Setup ──
    const [bgmEnabled, setBgmEnabled] = useState(false);
    const { playBGM, playStageUp, playComplete, setMuted } = useTreeAudio(bgmEnabled);
    const hasStartedBGM = useRef(false);

    const toggleGlobalMute = () => {
        setBgmEnabled(!bgmEnabled);
        setMuted(bgmEnabled);
        if (!bgmEnabled && !hasStartedBGM.current) {
            playBGM();
            hasStartedBGM.current = true;
        }
    };

    // React to game events (e.g., timer hitting 0)
    useEffect(() => {
        if (!bgmEnabled) return;
        if (phase === 'TRIVIA' && timer === 0) {
            playStageUp();
        } else if (phase === 'TRANSITION') {
            // Play victory sound once when moving to final leaderboard
            playComplete();
        }
    }, [timer, phase, bgmEnabled, playStageUp, playComplete]);

    return (
        <TVFrame bgImage="/assets/branding/BG2.png">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', position: 'relative' }}>

                {/* Audio Toggle Top Right */}
                <button
                    onClick={toggleGlobalMute}
                    style={{
                        position: 'absolute', top: 0, right: 0,
                        width: '48px', height: '48px', borderRadius: '50%',
                        background: bgmEnabled ? 'var(--blue-bright)' : 'var(--gray-light)',
                        border: '3px solid var(--black)',
                        boxShadow: '4px 4px 0 var(--black)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', cursor: 'pointer', zIndex: 10,
                        WebkitAppearance: 'none' // For TV projection if interacted
                    }}
                >
                    {bgmEnabled ? '🔊' : '🔇'}
                </button>

                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '4px', color: 'var(--yellow)', textShadow: '3px 3px 0 var(--black)' }}>
                        LIVE TRIVIA MONITOR
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1.2vw, 14px)', color: 'var(--white)', letterSpacing: '3px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span className="live-dot" style={{ width: '8px', height: '8px', background: 'red', borderRadius: '50%', animation: 'blink 1.5s infinite' }} /> X-TRAORDINARY — GROW WITH HEART : TOP CONTRIBUTORS
                    </div>
                </div>
                <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto', flex: 1, minHeight: 0, overflowY: 'auto' }}>
                    <TriviaMonitor />
                </div>
            </div>
        </TVFrame>
    );
}
