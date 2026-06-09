'use client';

import React, { useEffect, useState, useMemo } from 'react';

const VALUE_ICONS = [
    { id: 'harmony', label: 'HARMONY', image: '/assets/branding/1_Harmony.png', color: '#FF00FF' },
    { id: 'excellence', label: 'EXCELLENCE', image: '/assets/branding/2_Excellence.png', color: '#FACC15' },
    { id: 'growth', label: 'ACCELERATE GROWTH', image: '/assets/branding/3_Accelerate Growth.png', color: '#4ADE80' },
    { id: 'reliable', label: 'RELIABLE', image: '/assets/branding/4_Reliable.png', color: '#60A5FA' },
    { id: 'teamwork', label: 'TEAMWORK', image: '/assets/branding/5_Team Work.png', color: '#F472B6' }
];

const BackgroundParticles = () => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const particles = useMemo(() => {
        if (!mounted) return [];
        return Array.from({ length: 25 }).map((_, i) => ({
            id: i, left: Math.random() * 100, top: Math.random() * 100, delay: Math.random() * 5, size: Math.random() * 24 + 10, color: ['#4ADE80', '#FACC15', '#FF1493', '#2979FF'][Math.floor(Math.random() * 4)], type: Math.random() > 0.6 ? 'gem' : 'star'
        }));
    }, [mounted]);
    if (!mounted) return null;
    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            {particles.map(p => (
                <div key={p.id} className="animate-particle" style={{ position: 'absolute', left: `${p.left}%`, top: `${p.top}%`, animationDelay: `${p.delay}s`, color: p.color, opacity: 0.4 }}>
                    {p.type === 'star' ? (
                        <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="currentColor"><path d="M12,2L14.7,8.6L22,9.2L16.4,14L18.1,21.1L12,17.3L5.9,21.1L7.6,14L2,9.2L9.3,8.6L12,2Z" stroke="#000" strokeWidth="1" /></svg>
                    ) : (
                        <rect transform="rotate(45)" width={p.size / 1.5} height={p.size / 1.5} fill="currentColor" stroke="#000" strokeWidth="1.5" />
                    )}
                </div>
            ))}
        </div>
    );
};

const ValueMascot = ({ size = 110, showLabel = true, interval = 900 }: { size?: number, showLabel?: boolean, interval?: number }) => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setIndex((prev) => (prev + 1) % VALUE_ICONS.length), interval);
        return () => clearInterval(timer);
    }, [interval]);
    const value = VALUE_ICONS[index];
    return (
        <div style={{ marginBottom: '35px', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: showLabel ? '145px' : 'auto' }}>
            <div className="animate-value" key={value.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background: '#FFF',
                    border: '4px solid #000',
                    boxShadow: '8px 8px 0 #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    transform: 'rotate(-2deg)',
                    position: 'relative'
                }}>
                    <img src={value.image} alt={value.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                {showLabel && (
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '20px',
                        letterSpacing: '3px',
                        marginTop: '15px',
                        color: '#FFFFFF',
                        textShadow: '4px 4px 0 #000000',
                        fontWeight: 'bold',
                        background: 'var(--black)',
                        padding: '4px 15px',
                        transform: 'rotate(-2deg)',
                        textAlign: 'center',
                        width: 'fit-content',
                        border: '2px solid #000'
                    }}>{value.label}</div>
                )}
            </div>
        </div>
    );
};

const DigimasiaBrandLogo = () => (
    <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto clamp(24px, 5vw, 40px) auto' }}>
        <div style={{ width: 'clamp(140px, 35vw, 300px)', height: 'auto', position: 'relative' }}>
            <img
                src="/assets/branding/Logo_DAA_Transparant copy.png"
                alt="Digima Asia Logo"
                style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(4px 4px 0 rgba(0,0,0,0.5))' }}
            />
        </div>
    </div>
);

const ArcadeBootSequence = () => (
    <div style={{ position: 'relative' }}>
        <div style={{ marginBottom: '40px' }}>
            <ValueMascot size={120} showLabel={true} />
            <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                color: 'var(--yellow)',
                letterSpacing: '5px',
                marginTop: '-15px',
                textTransform: 'uppercase',
                textShadow: '2px 2px 0 var(--black)'
            }}>
                INITIALIZING VALUES
            </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', opacity: 0.6, marginTop: '20px' }}>
            <div style={{ height: '4px', width: '320px', background: 'var(--white)', border: '1px solid var(--black)' }} />
            <div style={{ height: '4px', width: '420px', background: 'var(--white)', border: '1px solid var(--black)' }} />
        </div>
    </div>
);

export default function SplashScreen({ onComplete, mode = 'login' }: { onComplete: () => void, mode?: 'boot' | 'login' }) {
    const [status, setStatus] = useState(mode === 'boot' ? 'INITIALIZING...' : 'LOGGING IN...');
    const [title, setTitle] = useState(mode === 'boot' ? 'DIGIMA ASIA' : 'X-TRAORDINARY');
    const [subtitle, setSubtitle] = useState(mode === 'boot' ? 'PRESENTS' : 'GROW WITH HEART');

    useEffect(() => {
        const sequence = mode === 'boot'
            ? [
                { time: 0, title: 'DIGIMA ASIA', subtitle: 'P R E S E N T S', status: 'LOADING ASSETS...' },
                { time: 3000, title: 'X-TRAORDINARY', subtitle: 'GROW WITH HEART', status: 'READY TO START!' },
                { time: 6000, title: 'X-TRAORDINARY', subtitle: 'GROW WITH HEART', status: 'GAME ON!' }
            ]
            : [
                { time: 0, title: 'X-TRAORDINARY', subtitle: 'GROW WITH HEART', status: 'AUTHENTICATING...' },
                { time: 1000, title: 'X-TRAORDINARY', subtitle: 'GROW WITH HEART', status: 'SYNCING VALUES...' },
                { time: 4200, title: 'X-TRAORDINARY', subtitle: 'GROW WITH HEART', status: 'ACCESS GRANTED!' }
            ];

        sequence.forEach(s => setTimeout(() => { setTitle(s.title); setSubtitle(s.subtitle); setStatus(s.status); }, s.time));
        const timer = setTimeout(() => onComplete(), mode === 'boot' ? 8400 : 5500);
        return () => clearTimeout(timer);
    }, [onComplete, mode]);

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: '#1565C0', backgroundImage: `url('/assets/branding/BG2.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '20px', overflow: 'hidden' }}>
            <div className="crt-overlay" /><BackgroundParticles />
            <div style={{ position: 'relative', zIndex: 20 }}>
                <DigimasiaBrandLogo />
                {mode === 'boot' ? <ArcadeBootSequence /> : <ValueMascot />}
                <div className="animate-pop-in" key={title} style={{ marginBottom: 'clamp(20px, 5vw, 45px)', marginTop: ' clamp(10px, 2vw, 20px)' }}>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(32px, 8vw, 64px)',
                        letterSpacing: 'clamp(2px, 0.5vw, 5px)',
                        color: mode === 'boot' ? 'var(--yellow)' : '#FFD600',
                        textShadow: 'clamp(3px, 1vw, 6px) clamp(3px, 1vw, 6px) 0 #000000, -1px -1px 0 var(--pink-hot)',
                        lineHeight: 0.9,
                        transform: mode === 'boot' ? 'scale(1.1) rotate(-1deg)' : 'none'
                    }}>{title}</div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(18px, 4vw, 28px)',
                        letterSpacing: 'clamp(4px, 1vw, 8px)',
                        color: '#FFFFFF',
                        lineHeight: 1,
                        opacity: 0.9,
                        marginTop: 'clamp(6px, 1vw, 10px)'
                    }}>{subtitle}</div>
                </div>
                <div style={{ width: '100%', maxWidth: '340px', height: '32px', border: '5px solid #000', background: 'rgba(255,255,255,0.05)', padding: '5px', position: 'relative', boxShadow: '12px 12px 0 #000', margin: '0 auto' }}>
                    <div className="animate-loading" style={{ height: '100%', background: mode === 'boot' ? 'var(--pink-hot)' : '#9ACD32', animationDuration: mode === 'boot' ? '8s' : '4s', animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }} />
                </div>
                <div style={{
                    marginTop: '28px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '18px',
                    letterSpacing: '3px',
                    color: 'var(--yellow)',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    textShadow: '2px 2px 0 var(--black)'
                }} className="animate-flash">{status}</div>
            </div>

            {/* ── BOTTOM RIGHT ELEMENT DECORATION ── */}
            <div style={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                zIndex: 10,
                pointerEvents: 'none',
                display: 'flex'
            }}>
                <img
                    src="/assets/branding/Element.png"
                    alt="Decoration Element"
                    style={{
                        width: 'clamp(100px, 20vw, 200px)',
                        height: 'auto',
                        display: 'block'
                    }}
                />
            </div>
        </div>
    );
}
