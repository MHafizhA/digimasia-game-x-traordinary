import React from 'react';

interface TVFrameProps {
    children: React.ReactNode;
    bgImage?: string;
}

export default function TVFrame({ children, bgImage = '/assets/branding/BG1.png' }: TVFrameProps) {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999, // Cover entire layout
            background: '#1a1a1a', // Wall behind TV
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2vh 3vw', // Responsive padding around TV
            boxSizing: 'border-box',
        }}>
            {/* TV Keyframes */}
            <style>{`
                @keyframes tv-knob-1 {
                    0% { transform: rotate(0deg); }
                    30% { transform: rotate(35deg); }
                    60% { transform: rotate(-20deg); }
                    80% { transform: rotate(45deg); }
                    100% { transform: rotate(0deg); }
                }
                @keyframes tv-knob-2 {
                    0% { transform: rotate(45deg); }
                    25% { transform: rotate(110deg); }
                    50% { transform: rotate(20deg); }
                    75% { transform: rotate(80deg); }
                    100% { transform: rotate(45deg); }
                }
            `}</style>

            {/* 📺 Outer TV Casing */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxHeight: '100%',
                aspectRatio: '16 / 10', // Taller TV aspect ratio to avoid scroll
                maxWidth: '1400px',
                background: '#30b0b8', // Cyan TV body
                border: '8px solid var(--black)',
                borderRadius: '48px',
                boxShadow: '16px 16px 0 rgba(0,0,0,0.8)',
                display: 'flex',
                padding: '24px 24px 64px 24px', // Extra bottom padding for the pink strip
                boxSizing: 'border-box',
            }}>
                {/* 📡 Antennas */}
                <div style={{ position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)', width: '200px', height: '80px', zIndex: -1 }}>
                    <div style={{ position: 'absolute', bottom: '0', left: '30%', width: '8px', height: '100px', background: 'var(--black)', transformOrigin: 'bottom center', transform: 'rotate(-35deg)' }}>
                        <div style={{ position: 'absolute', top: '-12px', left: '-8px', width: '24px', height: '24px', background: 'var(--pink-hot)', border: '4px solid var(--black)', borderRadius: '50%' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: '0', right: '30%', width: '8px', height: '120px', background: 'var(--black)', transformOrigin: 'bottom center', transform: 'rotate(25deg)' }}>
                        <div style={{ position: 'absolute', top: '-12px', left: '-8px', width: '24px', height: '24px', background: 'var(--pink-hot)', border: '4px solid var(--black)', borderRadius: '50%' }} />
                    </div>
                    <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '40px', background: 'var(--pink-hot)', border: '8px solid var(--black)', borderRadius: '100px 100px 0 0' }} />
                </div>

                {/* 🦿 TV Feet */}
                <div style={{ position: 'absolute', bottom: '-30px', left: '15%', width: '40px', height: '40px', background: '#1c747a', border: '8px solid var(--black)', borderTop: 'none', zIndex: -1, borderRadius: '0 0 12px 12px', transform: 'skewX(15deg)' }} />
                <div style={{ position: 'absolute', bottom: '-30px', right: '15%', width: '40px', height: '40px', background: '#1c747a', border: '8px solid var(--black)', borderTop: 'none', zIndex: -1, borderRadius: '0 0 12px 12px', transform: 'skewX(-15deg)' }} />

                {/* 🎀 Bottom Pink Strip */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '48px',
                    background: 'var(--pink-hot)',
                    borderTop: '8px solid var(--black)',
                    borderRadius: '0 0 38px 38px' // Match outer border radius minus thickness
                }} />

                {/* 🖥️ Left Side: The CRT Screen */}
                <div style={{
                    flex: 1,
                    background: '#0a0a0a',
                    border: '8px solid #14383a', // Inner bezel
                    borderRadius: '32px',
                    padding: '8px',
                    position: 'relative',
                    zIndex: 2,
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,1)'
                }}>
                    {/* Screen Content Window */}
                    <div style={{
                        height: '100%',
                        width: '100%',
                        background: `url('${bgImage}') center/cover no-repeat`,
                        borderRadius: '20px',
                        overflow: 'hidden',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '16px 24px',
                        boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8)',
                        boxSizing: 'border-box',
                    }}>
                        {/* Vintage TV Scanlines Overlay - Optimized */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'repeating-linear-gradient(rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)',
                            zIndex: 10,
                            pointerEvents: 'none'
                        }} />

                        {/* Injected Content */}
                        <div style={{ height: '100%', width: '100%', zIndex: 11, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            {children}
                        </div>
                    </div>
                </div>

                {/* 🎛️ Right Side: TV Control Panel */}
                <div style={{
                    width: 'clamp(80px, 10vw, 140px)',
                    marginLeft: '3vw',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'clamp(16px, 3vh, 32px)',
                    zIndex: 2,
                    paddingTop: '24px'
                }}>
                    {/* Top Knob */}
                    <div style={{
                        width: 'clamp(60px, 7vw, 100px)', aspectRatio: '1', borderRadius: '50%', background: '#ffe47a', border: '8px solid var(--black)',
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)', position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '10%', border: '4px solid rgba(0,0,0,0.15)', borderRadius: '50%' }} />
                        <div style={{ position: 'absolute', inset: 0, animation: 'tv-knob-1 8s infinite alternate ease-in-out' }}>
                            <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: '15%', height: '35%', background: 'var(--black)', borderRadius: '4px' }} />
                        </div>
                    </div>

                    {/* Bottom Knob */}
                    <div style={{
                        width: 'clamp(50px, 6vw, 80px)', aspectRatio: '1', borderRadius: '50%', background: '#ffefad', border: '8px solid var(--black)',
                        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)', position: 'relative'
                    }}>
                        <div style={{ position: 'absolute', inset: 0, animation: 'tv-knob-2 12s infinite alternate ease-in-out' }}>
                            <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: '15%', height: '30%', background: 'var(--black)', borderRadius: '4px' }} />
                        </div>
                    </div>

                    {/* Speaker Grilles */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(8px, 1.5vh, 12px)', marginTop: '24px', width: '80%' }}>
                        <div style={{ height: 'clamp(6px, 1vh, 10px)', background: 'var(--black)', borderRadius: '5px', width: '100%' }} />
                        <div style={{ height: 'clamp(6px, 1vh, 10px)', background: 'var(--black)', borderRadius: '5px', width: '100%' }} />
                        <div style={{ height: 'clamp(6px, 1vh, 10px)', background: 'var(--black)', borderRadius: '5px', width: '70%', alignSelf: 'center' }} />
                        <div style={{ height: 'clamp(6px, 1vh, 10px)', background: 'var(--black)', borderRadius: '5px', width: '40%', alignSelf: 'center' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
