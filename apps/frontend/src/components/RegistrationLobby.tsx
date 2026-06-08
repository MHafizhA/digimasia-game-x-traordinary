'use client';

import { useState, useEffect } from 'react';
import { getBackendUrl } from '@/lib/config';

interface ParticipantEntry {
    name: string;
    division: string;
}

const AVATAR_COLORS = ['var(--pink-hot)', 'var(--orange)', 'var(--lime)', 'var(--blue-bright)', '#00E5FF', '#FFD600', '#B388FF'];

const getDeterministicIndex = (name: string, arrLength: number) => {
    if (!name) return 0;
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
    }
    return sum % arrLength;
};

export default function RegistrationLobby() {
    const [participants, setParticipants] = useState<ParticipantEntry[]>([]);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                // Reuse leaderboard endpoint since it returns all joined active users
                const res = await fetch(`${getBackendUrl()}/leaderboard`);
                const data = await res.json();
                if (Array.isArray(data)) setParticipants(data);
            } catch (err) {
                console.error('Failed to fetch participants');
            }
        };

        fetchParticipants();
        const interval = setInterval(fetchParticipants, 3000);
        return () => clearInterval(interval);
    }, []);

    if (!participants.length) return (
        <div className="card" style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#888', letterSpacing: '1px', padding: '32px' }}>
            BELUM ADA PENGGUNA TERHUBUNG KEDALAM LOBBY...
        </div>
    );

    return (
        <div>
            <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#888',
                letterSpacing: '1px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>LOBBY PESERTA</span>
                <span className="badge badge-yellow" style={{ fontSize: '12px' }}>{participants.length} CONNECTED</span>
            </div>

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '24px',
                justifyContent: 'center',
                maxHeight: '450px',
                overflowY: 'auto',
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '2px dashed rgba(0,0,0,0.1)',
                borderRadius: '16px'
            }}>
                {participants.map((entry, i) => {
                    const colorIdx = getDeterministicIndex(entry.name, AVATAR_COLORS.length);
                    const currentAvatarColor = AVATAR_COLORS[colorIdx];
                    const seedStr = encodeURIComponent(entry.name + entry.division);
                    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seedStr}`;

                    return (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            animation: `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${Math.random() * 0.2}s both`
                        }}>
                            {/* Avatar Bubble */}
                            <div style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '50%',
                                background: currentAvatarColor,
                                border: '3px solid #000',
                                boxShadow: '3px 3px 0 #000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <img src={avatarUrl} alt="Avatar" style={{ width: '120%', height: '120%', imageRendering: 'pixelated', marginTop: '8px' }} />

                                {/* Full Team Badge Centered Overlap */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    background: '#FFF',
                                    border: '2px solid #000',
                                    borderRadius: '12px',
                                    padding: '2px 8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '8px',
                                    fontWeight: 800,
                                    color: '#000',
                                    boxShadow: '1px 1px 0 #000',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {entry.division.toUpperCase()}
                                </div>
                            </div>

                            {/* Name Pill */}
                            <div style={{
                                background: '#FFF',
                                border: '2px solid #000',
                                borderRadius: '20px',
                                padding: '4px 12px',
                                fontFamily: 'var(--font-body)',
                                fontSize: '11px',
                                fontWeight: 800,
                                color: '#000',
                                boxShadow: '2px 2px 0 #000',
                                textAlign: 'center',
                                marginTop: '4px'
                            }}>
                                {entry.name.toUpperCase()}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}} />
        </div>
    );
}
