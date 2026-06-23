'use client';

import { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/config';

interface NomineeStats {
    id: string;
    name: string;
    count: number;
    division?: string;
    imageUrl?: string;
}

interface ParticipationMetadata {
    totalVoters: number;
    votedCount: number;
    percentage: number;
    voterNames?: string[];
}

const PLACEHOLDER_IMAGES = [
    '/assets/candidates/media__1779164263170.jpg',
    '/assets/candidates/media__1779164294994.jpg',
    '/assets/candidates/media__1779164304832.jpg',
    '/assets/candidates/media__1779164313964.jpg',
    '/assets/candidates/media__1779164322572.jpg'
];

const ACCENT_COLORS = ['var(--pink-hot)', 'var(--orange)', 'var(--lime)', 'var(--blue-bright)', '#8B5CF6', 'var(--navy-dark)'];

export default function NomineeMonitor({ category }: { category: 'team' | 'digimer' }) {
    const [stats, setStats] = useState<NomineeStats[]>([]);
    const [metadata, setMetadata] = useState<ParticipationMetadata | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${getBackendUrl()}/votes/stats?category=${category}`);
            const data = await res.json();
            setStats(data.items || []);
            setMetadata(data.metadata || null);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch nominee stats');
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 3000);
        return () => clearInterval(interval);
    }, [category]);

    if (loading) return (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: '#888', padding: '24px', textAlign: 'center' }}>
            MEMUAT DATA...
        </div>
    );

    const maxVotes = Math.max(...stats.map(s => s.count), 1);
    const totalVotes = stats.reduce((sum, s) => sum + s.count, 0);
    const barColor = category === 'team' ? 'var(--orange)' : 'var(--blue-bright)';
    const pct = Math.round(metadata?.percentage ?? 0);

    return (
        <div className="no-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', overflowY: 'auto', padding: '2px' }}>

            {/* ── TOP: Participation Card ────────────────────────── */}
            <div style={{
                background: 'white',
                border: '3px solid var(--black)',
                borderRadius: '16px',
                boxShadow: '4px 4px 0 var(--black)',
                padding: '14px 18px',
                flexShrink: 0,
            }}>
                {/* Row: counts + percentage */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#888', letterSpacing: '1.5px', marginBottom: '2px' }}>VOTING PARTICIPATION</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '26px', lineHeight: 1 }}>
                            {metadata?.votedCount ?? 0}
                            <span style={{ fontSize: '14px', color: '#aaa', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>
                                {' '}/ {metadata?.totalVoters ?? 0} voters
                            </span>
                        </div>
                    </div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '36px',
                        lineHeight: 1,
                        color: barColor,
                    }}>
                        {pct}%
                    </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: '10px', background: '#eee', borderRadius: '99px', overflow: 'hidden', border: '2px solid var(--black)' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                </div>

                {/* Recent voters */}
                {metadata?.voterNames && metadata.voterNames.length > 0 && (
                    <div style={{ marginTop: '10px', borderTop: '1px dashed #ddd', paddingTop: '8px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#888', letterSpacing: '1.5px', marginBottom: '6px' }}>
                            RECENT VOTERS ({metadata.voterNames.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', maxHeight: '80px', overflowY: 'auto' }}>
                            {metadata.voterNames.map((name, i) => (
                                <span key={i} style={{
                                    display: 'inline-block',
                                    background: '#f0f0f0',
                                    color: '#333',
                                    border: '1.5px solid var(--black)',
                                    borderRadius: '99px',
                                    padding: '2px 10px',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    animation: 'fadeIn 0.4s ease-out',
                                }}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── MIDDLE: Metrics row ────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingInline: '2px' }}>
                <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
                    letterSpacing: '1px', background: 'var(--black)', color: 'white',
                    padding: '4px 12px', borderRadius: '99px'
                }}>
                    {stats.length} NOMINEES
                </span>
            </div>

            {/* ── BOTTOM: Nominee cards ────────────────────────── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: category === 'team' ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
                gap: '10px',
            }}>
                {stats.map((item, idx) => {
                    const accent = ACCENT_COLORS[idx % ACCENT_COLORS.length];
                    const pctOfTotal = totalVotes > 0 ? Math.round((item.count / totalVotes) * 100) : 0;
                    const pctOfMax = maxVotes > 0 ? (item.count / maxVotes) * 100 : 0;
                    const isLeader = item.count > 0 && item.count === maxVotes;

                    return (
                        <div key={item.id} style={{
                            background: 'white',
                            border: `2.5px solid var(--black)`,
                            borderRadius: '14px',
                            boxShadow: isLeader ? `4px 4px 0 ${accent}` : '3px 3px 0 #ccc',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'box-shadow 0.3s',
                        }}>
                            {/* Blurred photo */}
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                                <img
                                    src={PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                                    alt="Mystery Candidate"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(8px) grayscale(30%) brightness(0.8)', userSelect: 'none' }}
                                />
                                {/* Mystery overlay */}
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-1px', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>???</div>
                                </div>
                                {/* Leading badge */}
                                {isLeader && (
                                    <div style={{
                                        position: 'absolute', top: '6px', right: '6px',
                                        background: accent, border: '2px solid var(--black)',
                                        borderRadius: '8px', padding: '2px 7px',
                                        fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'white'
                                    }}>LEADING</div>
                                )}
                            </div>

                            {/* Stats row */}
                            <div style={{ padding: '8px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {/* Progress bar */}
                                <div style={{ height: '7px', background: '#eee', borderRadius: '99px', overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', width: `${pctOfMax}%`,
                                        background: accent, borderRadius: '99px',
                                        transition: 'width 0.5s ease',
                                    }} />
                                </div>
                                {/* Counts */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#666' }}>
                                        <strong style={{ color: '#111', fontSize: '13px' }}>{item.count}</strong> votes
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                                        color: item.count > 0 ? accent : '#ccc'
                                    }}>
                                        {pctOfTotal}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
