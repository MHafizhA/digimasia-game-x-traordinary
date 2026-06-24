'use client';

import { useState, useEffect } from 'react';
import TVFrame from '@/components/TVFrame';
import { useSocket } from '@/hooks/useSocket';
import { getBackendUrl } from '@/lib/config';

interface ParticipantEntry {
    name: string;
    division: string;
}

const AVATAR_COLORS = ['var(--pink-hot)', 'var(--orange)', 'var(--lime)', 'var(--blue-bright)', '#00E5FF', '#FFD600', '#B388FF'];

const getDeterministicIndex = (name: string, arrLength: number) => {
    if (!name) return 0;
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return sum % arrLength;
};

export default function LobbyMonitorPage() {
    useSocket();
    const [participants, setParticipants] = useState<ParticipantEntry[]>([]);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const res = await fetch(`${getBackendUrl()}/leaderboard`);
                const data = await res.json();
                if (Array.isArray(data)) setParticipants(data);
            } catch { /* silent */ }
        };
        fetchParticipants();
        const interval = setInterval(fetchParticipants, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const clock = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(clock);
    }, []);

    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    return (
        <TVFrame bgImage="/assets/branding/BG2.png">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3vw, 40px)', letterSpacing: '4px', color: 'var(--yellow)', textShadow: '3px 3px 0 var(--black)' }}>
                            REGISTRASI DIBUKA
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1.2vw, 13px)', color: 'var(--white)', letterSpacing: '3px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', display: 'inline-block', animation: 'blink 1.5s infinite' }} />
                            X-TRAORDINARY — GROW WITH HEART · PARTICIPANT LOBBY
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <div style={{
                            background: 'var(--lime)', color: 'var(--black)',
                            border: '3px solid var(--black)', boxShadow: '4px 4px 0 var(--black)',
                            borderRadius: '12px', padding: '6px 16px',
                            fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 2vw, 22px)',
                        }}>
                            {participants.length} CONNECTED
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
                            {timeStr}
                        </div>
                    </div>
                </div>

                {/* ── Participant Grid ── */}
                <div className="card" style={{
                    flex: 1, overflow: 'hidden',
                    padding: '20px',
                    display: 'flex', flexDirection: 'column',
                }}>
                    {participants.length === 0 ? (
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-mono)', fontSize: '14px', color: '#888',
                            letterSpacing: '2px', textAlign: 'center'
                        }}>
                            🔒 MENUNGGU PESERTA BERGABUNG...
                        </div>
                    ) : (
                        <div style={{
                            flex: 1, overflowY: 'auto',
                            display: 'flex', flexWrap: 'wrap',
                            gap: 'clamp(12px, 2vw, 24px)',
                            justifyContent: 'center',
                            alignContent: 'flex-start',
                            padding: '8px 4px',
                        }}>
                            {participants.map((entry, i) => {
                                const colorIdx = getDeterministicIndex(entry.name, AVATAR_COLORS.length);
                                const avatarColor = AVATAR_COLORS[colorIdx];
                                const seedStr = encodeURIComponent(entry.name + entry.division);
                                const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${seedStr}`;
                                const avatarSize = participants.length > 30 ? 52 : participants.length > 20 ? 60 : 76;
                                const nameFontSize = participants.length > 30 ? '9px' : '11px';

                                return (
                                    <div key={i} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                        animation: `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${(i % 10) * 0.04}s both`,
                                    }}>
                                        {/* Avatar Bubble */}
                                        <div style={{
                                            width: `${avatarSize}px`, height: `${avatarSize}px`,
                                            borderRadius: '50%', background: avatarColor,
                                            border: '3px solid var(--black)', boxShadow: '3px 3px 0 var(--black)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            position: 'relative', overflow: 'hidden', flexShrink: 0,
                                        }}>
                                            <img src={avatarUrl} alt="Avatar" style={{ width: '120%', height: '120%', imageRendering: 'pixelated', marginTop: '8px' }} />
                                            {/* Division Badge */}
                                            <div style={{
                                                position: 'absolute', bottom: '-4px',
                                                background: '#FFF', border: '2px solid var(--black)',
                                                borderRadius: '12px', padding: '1px 5px',
                                                fontFamily: 'var(--font-mono)', fontSize: '7px',
                                                fontWeight: 800, color: 'var(--black)',
                                                boxShadow: '1px 1px 0 var(--black)', whiteSpace: 'nowrap',
                                                maxWidth: `${avatarSize + 16}px`, overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {entry.division.toUpperCase()}
                                            </div>
                                        </div>

                                        {/* Name Pill */}
                                        <div style={{
                                            background: '#FFF', border: '2px solid var(--black)',
                                            borderRadius: '20px', padding: '3px 10px',
                                            fontFamily: 'var(--font-body)', fontSize: nameFontSize,
                                            fontWeight: 800, color: 'var(--black)',
                                            boxShadow: '2px 2px 0 var(--black)',
                                            textAlign: 'center', maxWidth: '100px',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {entry.name.toUpperCase()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(9px, 1vw, 11px)', color: 'rgba(255,255,255,0.4)', letterSpacing: '3px' }}>
                        X-TRAORDINARY — GROW WITH HEART : THE FINAL CELEBRATION
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes popIn {
                    0% { transform: scale(0); opacity: 0; }
                    80% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            ` }} />
        </TVFrame>
    );
}
