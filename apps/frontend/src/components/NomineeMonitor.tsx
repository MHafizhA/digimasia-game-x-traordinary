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
const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

const AVATAR_COLORS = ['var(--pink-hot)', 'var(--orange)', 'var(--lime)', 'var(--blue-bright)', 'var(--navy-dark)', '#8B5CF6'];

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
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '1px', color: '#888', padding: '16px' }}>
            MEMUAT DATA...
        </div>
    );

    const maxVotes = Math.max(...stats.map(s => s.count), 1);
    const totalVotes = stats.reduce((sum, s) => sum + s.count, 0);
    const accentColor = category === 'team' ? 'var(--yellow)' : 'var(--blue-bright)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', justifyContent: 'center' }}>
            {/* Participation header */}
            <div className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px' }}>VOTING PARTICIPATION</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '32px', letterSpacing: '1px', lineHeight: 1, marginTop: '2px' }}>
                            {metadata?.votedCount ?? 0}
                            <span style={{ fontSize: '16px', color: '#aaa', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>
                                {' '}/ {metadata?.totalVoters ?? 0}
                            </span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: category === 'team' ? 'var(--orange)' : 'var(--blue-bright)' }}>
                            {Math.round(metadata?.percentage ?? 0)}%
                        </span>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px' }}>OF TOTAL</div>
                    </div>
                </div>

                {/* Participation bar */}
                <div className="progress-track" style={{ height: '14px' }}>
                    <div className="progress-fill" style={{
                        width: `${metadata?.percentage ?? 0}%`,
                        background: category === 'team' ? 'var(--orange)' : 'var(--blue-bright)',
                    }} />
                </div>

                {/* Recent voters */}
                {metadata?.voterNames && metadata.voterNames.length > 0 && (
                    <div style={{ marginTop: '10px', borderTop: '1px dashed #ddd', paddingTop: '10px' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', letterSpacing: '1px', marginBottom: '6px' }}>
                            RECENT VOTERS
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '64px', overflowY: 'auto' }}>
                            {metadata.voterNames.map((name, i) => (
                                <span key={i} className="badge badge-blue" style={{ animation: 'fadeIn 0.4s ease-out' }}>
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Section label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <img
                    src={category === 'team' ? '/assets/branding/Logo_X-Traordinary Team.png' : '/assets/branding/Logo_X-Traordinary Digimers.png'}
                    alt={category === 'team' ? 'Squad Candidates' : 'Individual Nominees'}
                    style={{ height: '48px', width: 'auto' }}
                />
                <span className="badge badge-blue">{stats.length} NOMINEES</span>
            </div>

            {/* Candidate Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {stats.map((item, idx) => (
                    <div key={item.id} className="candidate" style={{ padding: '10px', cursor: 'default', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            {/* Blurred Avatar - mystery effect */}
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '2px solid var(--black)',
                            }}>
                                <img
                                    src={item.imageUrl || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                                    alt="Mystery Candidate"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        filter: 'blur(6px) grayscale(50%)',
                                        userSelect: 'none'
                                    }}
                                />
                            </div>
                            <div style={{ overflow: 'hidden', flex: 1 }}>
                                {/* Censored name */}
                                <div className="cand-name" style={{ fontSize: '14px', filter: 'blur(5px)', userSelect: 'none', letterSpacing: '2px', color: '#222' }}>
                                    {'▓▓▓▓▓▓▓'}
                                </div>
                                {item.division && (
                                    <span className="cand-div" style={{ fontSize: '9px', filter: 'blur(4px)', userSelect: 'none' }}>
                                        {'▒▒▒▒▒'}
                                    </span>
                                )}
                            </div>
                            {/* Mystery badge */}
                            <div style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '18px',
                                color: '#bbb',
                                fontWeight: 900,
                                letterSpacing: '-2px'
                            }}>
                                ???
                            </div>
                        </div>

                        {/* Vote bar - also blurred */}
                        <div className="progress-track" style={{ height: '10px' }}>
                            <div className="progress-fill" style={{
                                width: `${(item.count / maxVotes) * 100}%`,
                                background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                                filter: 'blur(3px)',
                            }} />
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#888', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.count} votes</span>
                            <span>{totalVotes > 0 ? Math.round((item.count / totalVotes) * 100) : 0}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
