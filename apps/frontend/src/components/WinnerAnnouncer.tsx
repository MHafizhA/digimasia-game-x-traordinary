'use client';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getBackendUrl } from '@/lib/config';
import { useTreeAudio } from '@/hooks/useTreeAudio';

interface WinnerStats {
    id: string;
    name: string;
    division?: string;
    imageUrl?: string;
    count: number;
}

interface WinnerAnnouncerProps {
    onClose?: () => void;
}

const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

const PLACEHOLDER_IMAGES = [
    '/assets/candidates/media__1779164263170.jpg',
    '/assets/candidates/media__1779164294994.jpg',
    '/assets/candidates/media__1779164304832.jpg',
    '/assets/candidates/media__1779164313964.jpg',
    '/assets/candidates/media__1779164322572.jpg'
];

const getImageForId = (id: string | undefined, name: string, imageUrl?: string) => {
    if (imageUrl) return imageUrl;
    const key = id || name || 'unknown';
    let hash = 0;
    for (let i = 0; i < key.length; i++) hash += key.charCodeAt(i);
    return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
};

// ── Dramatic Nominee List (before winner) ─────────────
function NomineeList({ data, accentColor, textColor, maxVotes, showVotes }: {
    data: WinnerStats[];
    accentColor: string;
    textColor: string;
    maxVotes: number;
    showVotes: boolean;
}) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.map((item, idx) => (
                <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'white',
                    border: '3px solid var(--black)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    boxShadow: '4px 4px 0 var(--black)',
                    animation: `slideInLeft 0.4s ${idx * 0.1}s both cubic-bezier(0.34, 1.56, 0.64, 1)`,
                }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        {/* Avatar */}
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '12px',
                            background: 'var(--navy-dark)', border: '3px solid var(--black)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontSize: '24px', color: 'white',
                            overflow: 'hidden'
                        }}>
                            <img src={getImageForId(item.id, item.name, item.imageUrl)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {/* Rank badge */}
                        <div style={{
                            position: 'absolute', bottom: '-4px', right: '-4px',
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: accentColor, border: '2px solid var(--black)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-display)', fontSize: '12px', color: textColor,
                        }}>
                            {idx + 1}
                        </div>
                    </div>

                    {/* Name + Division */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 1.8vw, 18px)',
                            color: 'var(--black)', letterSpacing: '1px',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{item.name}</div>
                        {item.division && (
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 0.9vw, 11px)',
                                color: '#555', letterSpacing: '1px', marginTop: '2px', fontWeight: 600
                            }}>{item.division.toUpperCase()}</div>
                        )}
                    </div>
                    {/* Vote bar */}
                    {showVotes && (
                        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '80px', animation: `popInRight 0.5s ${idx * 0.15}s both cubic-bezier(0.34, 1.56, 0.64, 1)` }}>
                            <div style={{
                                fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1vw, 13px)',
                                fontWeight: 800, color: 'var(--black)', marginBottom: '4px',
                            }}>{item.count} votes</div>
                            <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', border: '2px solid #ccc', overflow: 'hidden', width: '80px' }}>
                                <div style={{
                                    height: '100%',
                                    width: `${(item.count / maxVotes) * 100}%`,
                                    background: accentColor,
                                    borderRadius: '4px',
                                    transformOrigin: 'left',
                                    animation: `expandWidth 1s ${idx * 0.15}s both cubic-bezier(0.34, 1.56, 0.64, 1)`,
                                }} />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Dramatic Winner Card ──────────────────────────────
function WinnerCard({ winner, accentColor, textColor, votes, maxVotes }: {
    winner: WinnerStats;
    accentColor: string;
    textColor: string;
    votes: number;
    maxVotes: number;
}) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'winnerReveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        }}>
            {/* Crown */}
            <div style={{ fontSize: 'clamp(40px, 5vw, 64px)', animation: 'crownFloat 2.5s ease-in-out infinite', marginBottom: '-12px', zIndex: 1 }}>
                👑
            </div>

            {/* Big Avatar */}
            <div style={{
                width: 'clamp(70px, 9vw, 110px)',
                height: 'clamp(70px, 9vw, 110px)',
                borderRadius: '16px',
                background: accentColor,
                border: '5px solid var(--black)',
                boxShadow: `0 0 40px ${accentColor}, 6px 6px 0 var(--black)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(28px, 4vw, 52px)',
                color: textColor,
                animation: 'sparkleGlow 2.5s ease-in-out infinite',
                marginBottom: '16px',
                overflow: 'hidden'
            }}>
                <img src={getImageForId(winner.id, winner.name, winner.imageUrl)} alt={winner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            {/* Name */}
            <div style={{
                background: accentColor,
                border: '4px solid var(--black)',
                boxShadow: '6px 6px 0 var(--black)',
                padding: '8px 24px',
                borderRadius: '50px',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(18px, 2.5vw, 28px)',
                letterSpacing: '2px',
                color: textColor,
                textAlign: 'center',
                marginBottom: '8px',
            }}>{winner.name}</div>

            {/* Division */}
            {winner.division && (
                <div style={{
                    background: 'var(--black)',
                    color: accentColor,
                    padding: '4px 16px',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(10px, 1.2vw, 14px)',
                    letterSpacing: '2px',
                    fontWeight: 800,
                    marginBottom: '16px',
                }}>{winner.division.toUpperCase()}</div>
            )}

            {/* Votes */}
            <div style={{
                background: 'white',
                border: '3px solid var(--black)',
                boxShadow: '4px 4px 0 var(--black)',
                padding: '8px 20px',
                borderRadius: '12px',
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(12px, 1.3vw, 16px)',
                fontWeight: 800,
                color: 'var(--navy-dark)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
            }}>
                <span>🗳️</span>
                <span>{votes} VOTES</span>
                <span style={{ color: '#999', fontSize: '0.85em' }}>({Math.round((votes / maxVotes) * 100)}%)</span>
            </div>
        </div>
    );
}

// ── Award Panel ────────────────────────────────────────
function AwardPanel({ title, accentColor, textColor = 'var(--black)', stats, winner, revealed, setRevealed, showVotes, setShowVotes, winnerRevealed, onRevealWinner }: {
    title: string;
    accentColor: string;
    textColor?: string;
    stats: WinnerStats[];
    winner: WinnerStats | null;
    revealed: boolean;
    setRevealed: (v: boolean) => void;
    showVotes: boolean;
    setShowVotes: (v: boolean) => void;
    winnerRevealed: boolean;
    onRevealWinner: () => void;
}) {
    const maxVotes = Math.max(...stats.map(d => d.count), 1);

    return (
        <div style={{
            background: 'white',
            border: '5px solid var(--black)',
            borderRadius: '20px',
            boxShadow: '8px 8px 0 var(--black)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Header strip */}
            <div style={{
                background: accentColor,
                borderBottom: '5px solid var(--black)',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(14px, 1.8vw, 22px)',
                    letterSpacing: '2px',
                    color: textColor,
                }}>{title}</div>
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'clamp(9px, 0.9vw, 11px)',
                    color: textColor === 'white' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                    letterSpacing: '1px',
                }}>{stats.length} FINALISTS</div>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto' }}>
                {!winnerRevealed ? (
                    // Hidden state with Neo-brutalist lock design
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        flex: 1, padding: '40px 20px', position: 'relative', overflow: 'hidden'
                    }}>
                        {/* Subtle background pattern to indicate 'classified' area */}
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
                            backgroundImage: 'radial-gradient(var(--navy-dark) 2px, transparent 2px)',
                            backgroundSize: '20px 20px'
                        }} />

                        {/* Dramatic Boxed Icon */}
                        <div style={{
                            position: 'relative', width: '100px', height: '100px',
                            background: 'white', border: '5px solid var(--black)',
                            borderRadius: '24px', boxShadow: '8px 8px 0 var(--black)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '48px', marginBottom: '24px', zIndex: 1,
                            animation: 'crownFloat 4s ease-in-out infinite'
                        }}>
                            🔒
                        </div>

                        {/* Lock Status Text */}
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 32px)',
                            color: 'var(--black)', letterSpacing: '2px',
                            marginBottom: '6px', zIndex: 1
                        }}>
                            CLASSIFIED
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 1vw, 11px)',
                            color: '#888', letterSpacing: '2px', fontWeight: 600,
                            marginBottom: '40px', zIndex: 1, textAlign: 'center'
                        }}>
                            RESULTS ARE LOCKED UNTIL REVEAL
                        </div>

                        {/* Action Button */}
                        <button
                            style={{
                                background: accentColor, border: '5px solid var(--black)',
                                boxShadow: `0 0 20px ${accentColor}, 8px 8px 0 var(--black)`, // glowing shadow
                                padding: '16px 32px', borderRadius: '16px', fontFamily: 'var(--font-display)',
                                fontSize: 'clamp(14px, 1.5vw, 18px)', letterSpacing: '2px',
                                cursor: 'pointer', transition: 'all 0.1s',
                                color: textColor, position: 'relative', zIndex: 1,
                            }}
                            onMouseDown={e => { (e.target as HTMLElement).style.transform = 'translate(4px,4px)'; (e.target as HTMLElement).style.boxShadow = '4px 4px 0 var(--black)'; }}
                            onMouseUp={e => { (e.target as HTMLElement).style.transform = ''; (e.target as HTMLElement).style.boxShadow = `0 0 20px ${accentColor}, 8px 8px 0 var(--black)`; }}
                            onClick={onRevealWinner}
                        >
                            🏆 REVEAL WINNER!
                        </button>
                    </div>
                ) : (
                    // Winner & Nominees revealed state
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {winner && (
                            <WinnerCard
                                winner={winner}
                                accentColor={accentColor}
                                textColor={textColor}
                                votes={winner.count}
                                maxVotes={maxVotes}
                            />
                        )}
                        <NomineeList data={stats} accentColor={accentColor} textColor={textColor} maxVotes={maxVotes} showVotes={true} />
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────
export default function WinnerAnnouncer({ onClose }: WinnerAnnouncerProps) {
    const [teamWinner, setTeamWinner] = useState<WinnerStats | null>(null);
    const [digimerWinner, setDigimerWinner] = useState<WinnerStats | null>(null);
    const [teamStats, setTeamStats] = useState<WinnerStats[]>([]);
    const [digimerStats, setDigimerStats] = useState<WinnerStats[]>([]);

    const [revealedNomineesTeam, setRevealedNomineesTeam] = useState(false);
    const [revealedNomineesDigimer, setRevealedNomineesDigimer] = useState(false);
    const [showTeamVotes, setShowTeamVotes] = useState(false);
    const [showDigimerVotes, setShowDigimerVotes] = useState(false);
    const [finalWinnerTeam, setFinalWinnerTeam] = useState(false);
    const [finalWinnerDigimer, setFinalWinnerDigimer] = useState(false);
    const [flashActive, setFlashActive] = useState(false);

    const audio = useTreeAudio(true);

    const triggerCelebration = () => {
        setFlashActive(true);
        setTimeout(() => setFlashActive(false), 700);

        const duration = 4 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 10000 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: ReturnType<typeof setInterval> = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 60 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 200);
    };

    const handleWinnerReveal = (type: 'team' | 'digimer') => {
        triggerCelebration();
        audio.playComplete();
        if (type === 'team') setFinalWinnerTeam(true);
        else setFinalWinnerDigimer(true);
    };

    const fetchData = async () => {
        try {
            const baseUrl = getBackendUrl();
            const [resTW, resDW, resTS, resDS] = await Promise.all([
                fetch(`${baseUrl}/votes/results?category=team`),
                fetch(`${baseUrl}/votes/results?category=digimer`),
                fetch(`${baseUrl}/votes/stats?category=team`),
                fetch(`${baseUrl}/votes/stats?category=digimer`),
            ]);
            setTeamWinner(await resTW.json());
            setDigimerWinner(await resDW.json());
            const dataTS = await resTS.json();
            const dataDS = await resDS.json();
            setTeamStats(dataTS.items || []);
            setDigimerStats(dataDS.items || []);
        } catch {
            console.error('Failed to fetch vote data');
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const anyRevealed = revealedNomineesTeam || revealedNomineesDigimer;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Keyframes */}
            <style>{`
                @keyframes slideInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes winnerReveal {
                    from { opacity: 0; transform: scale(0.5) rotate(-5deg); }
                    to   { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                @keyframes crownFloat {
                    0%, 100% { transform: translateY(0) rotate(-5deg); }
                    50% { transform: translateY(-10px) rotate(5deg); }
                }
                @keyframes sparkleGlow {
                    0%, 100% { box-shadow: 0 0 20px var(--glow-color, orange), 8px 8px 0 var(--black); }
                    50% { box-shadow: 0 0 50px var(--glow-color, orange), 8px 8px 0 var(--black); }
                }
                @keyframes screenFlash {
                    0% { opacity: 1; }
                    100% { opacity: 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popInRight {
                    0% { opacity: 0; transform: translateX(20px) scale(0.9); }
                    100% { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes expandWidth {
                    0% { transform: scaleX(0); }
                    100% { transform: scaleX(1); }
                }
            `}</style>

            {/* Screen flash overlay */}
            {flashActive && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'white', zIndex: 9999,
                    animation: 'screenFlash 0.7s ease-out forwards',
                    pointerEvents: 'none',
                }} />
            )}

            {/* Title Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(22px, 3vw, 40px)',
                        letterSpacing: '3px',
                        color: 'var(--yellow)',
                        textShadow: '3px 3px 0 var(--black)',
                        lineHeight: 1,
                    }}>🏆 AWARDS CEREMONY</div>
                    <div style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'clamp(9px, 1vw, 12px)',
                        color: 'var(--white)',
                        letterSpacing: '3px',
                        marginTop: '4px',
                        textShadow: '1px 1px 0 var(--black)',
                    }}>X-TRAORDINARY — GROW WITH HEART : THE FINAL CELEBRATION</div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: '#ff4d4d', border: '3px solid var(--black)',
                            boxShadow: '4px 4px 0 var(--black)', padding: '6px 16px',
                            borderRadius: '10px', fontFamily: 'var(--font-display)',
                            fontSize: '14px', cursor: 'pointer', color: 'white',
                        }}
                    >✕ CLOSE</button>
                )}
            </div>

            {/* Two Award Sections */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
            }}>
                <AwardPanel
                    title="🌟 DIGIMER OF THE YEAR"
                    accentColor="var(--blue-bright)"
                    textColor="white"
                    stats={digimerStats}
                    winner={digimerWinner}
                    revealed={revealedNomineesDigimer}
                    setRevealed={setRevealedNomineesDigimer}
                    showVotes={showDigimerVotes}
                    setShowVotes={setShowDigimerVotes}
                    winnerRevealed={finalWinnerDigimer}
                    onRevealWinner={() => handleWinnerReveal('digimer')}
                />
                <AwardPanel
                    title="🏅 BEST TEAM OF THE YEAR"
                    accentColor="var(--yellow)"
                    textColor="var(--black)"
                    stats={teamStats}
                    winner={teamWinner}
                    revealed={revealedNomineesTeam}
                    setRevealed={setRevealedNomineesTeam}
                    showVotes={showTeamVotes}
                    setShowVotes={setShowTeamVotes}
                    winnerRevealed={finalWinnerTeam}
                    onRevealWinner={() => handleWinnerReveal('team')}
                />
            </div>

            {/* Reset button */}
            {anyRevealed && (
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <button
                        onClick={() => {
                            setFinalWinnerTeam(false); setFinalWinnerDigimer(false);
                            setShowTeamVotes(false); setShowDigimerVotes(false);
                            setRevealedNomineesTeam(false); setRevealedNomineesDigimer(false);
                        }}
                        style={{
                            background: 'transparent', border: '2px solid rgba(255,255,255,0.3)',
                            color: 'rgba(255,255,255,0.5)', padding: '6px 20px',
                            borderRadius: '8px', fontFamily: 'var(--font-mono)',
                            fontSize: '11px', letterSpacing: '2px', cursor: 'pointer',
                        }}
                    >↺ RESET CEREMONY</button>
                </div>
            )}
        </div>
    );
}
