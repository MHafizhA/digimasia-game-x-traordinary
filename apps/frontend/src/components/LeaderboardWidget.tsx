'use client';

import { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/config';

interface LeaderboardEntry {
    name: string;
    division: string;
    amount: number;
    score: number;
}

const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

const AVATAR_COLORS = ['var(--pink-hot)', 'var(--orange)', 'var(--lime)', 'var(--blue-bright)', 'var(--navy-dark)'];

export default function LeaderboardWidget({ isPaused = false }: { isPaused?: boolean }) {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            if (isPaused) return;
            try {
                const res = await fetch(`${getBackendUrl()}/leaderboard`);
                const data = await res.json();
                if (Array.isArray(data)) setLeaderboard(data);
            } catch (err) {
                console.error('Failed to fetch leaderboard');
            }
        };

        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 2000); // Faster polling
        return () => clearInterval(interval);
    }, [isPaused]);

    if (!leaderboard.length) return (
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#888', letterSpacing: '1px', padding: '16px' }}>
            MENUNGGU DATA...
        </div>
    );

    return (
        <div className="rank-list">
            {leaderboard.map((entry, i) => (
                <div key={i} className="rank-row" style={{
                    background: i === 0 ? 'var(--lime)' : i === 1 ? '#E8E8E8' : i === 2 ? '#FFE4CC' : 'var(--white)',
                }}>
                    <div className="rank-num">#{i + 1}</div>
                    <div className="rank-avatar" style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {getInitials(entry.name)}
                    </div>
                    <div className="rank-info">
                        <div className="rank-name">{entry.name}</div>
                        <div className="rank-team">{entry.division}</div>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center' }}>
                        <div className="rank-water" style={{ fontSize: '20px' }}>{entry.amount}L</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
