'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { getBackendUrl } from '@/lib/config';

interface Candidate {
    id: string;
    name: string;
    division: string;
    imageUrl: string;
    type: string;
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

const AVATAR_COLORS = ['var(--pink-hot)', 'var(--orange)', 'var(--lime)', 'var(--blue-bright)', 'var(--navy-dark)'];

export default function Vote({ type }: { type: 'team' | 'digimer' }) {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [votedId, setVotedId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { user, voteTeam, voteDigi, setUserState } = useGameStore();

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await fetch(`${getBackendUrl()}/candidates?type=${type}`);
                const data = await res.json();
                setCandidates(data);
            } catch (err) {
                setError('Gagal mengambil data kandidat');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCandidates();
        setVotedId(null);
        setSelectedId(null);

        if (type === 'team' && voteTeam) setVotedId(voteTeam);
        if (type === 'digimer' && voteDigi) setVotedId(voteDigi);
    }, [type, voteTeam, voteDigi]);

    const handleSubmit = async () => {
        if (!selectedId || votedId || !user || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${getBackendUrl()}/votes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    candidateId: selectedId,
                    category: type,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Gagal mengirim suara');
            }

            setVotedId(selectedId);
            if (type === 'team') setUserState({ voteTeam: selectedId });
            if (type === 'digimer') setUserState({ voteDigi: selectedId });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div style={{ minHeight: 'calc(100dvh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card" style={{ padding: '24px 40px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '2px' }}>MEMUAT DATA KANDIDAT...</div>
            </div>
        </div>
    );

    return (
        <div style={{
            minHeight: 'calc(100dvh - 120px)',
            padding: '24px',
            maxWidth: '960px',
            margin: '0 auto',
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <img
                    src={type === 'team' ? '/assets/branding/Logo_X-Traordinary Team.png' : '/assets/branding/Logo_X-Traordinary Digimers.png'}
                    alt={type === 'team' ? 'The X-Traordinary Squad' : 'The X-Traordinary Digimers'}
                    style={{ height: 'auto', width: '100%', maxWidth: '350px', margin: '0 auto', display: 'block' }}
                />
                <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: 'var(--white)',
                    letterSpacing: '2px',
                    marginTop: '6px',
                }}>
                    {type === 'team'
                        ? 'PILIH JAGOAN TIM KAMU (SELAIN TIM SENDIRI)'
                        : 'PILIH DIGIMER TERBAIK TAHUN INI'}
                </div>
            </div>

            {/* Grid Container */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 'clamp(10px, 3vw, 20px)',
                margin: '0 auto 40px auto',
                maxWidth: '800px',
                padding: '0 20px',
            }}>
                {candidates.map((c, idx) => {
                    const isSelected = selectedId === c.id;
                    const isVoted = votedId === c.id;
                    const isOwnTeam = type === 'team' && c.division === user?.division;
                    const isSelf = type === 'digimer' && c.id === user?.id;
                    const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                    const isDisabled = Boolean(votedId) || isOwnTeam || isSelf;

                    return (
                        <div
                            key={c.id}
                            className={`candidate animate-pop-in${isSelected ? ' selected' : ''}${isDisabled && !isVoted ? ' locked' : ''}`}
                            style={{
                                position: 'relative',
                                padding: 'clamp(16px, 4vw, 24px) clamp(10px, 2vw, 16px) clamp(12px, 3vw, 20px)',
                                border: isVoted ? '4px solid var(--navy-dark)' : isSelected ? '4px solid var(--blue-bright)' : '3px solid var(--black)',
                                background: isVoted ? 'var(--lime)' : isSelected ? 'var(--blue-light)' : 'var(--blue-light)',
                                opacity: (votedId && c.id !== votedId) ? 0.55 : 1,
                                filter: (votedId && c.id !== votedId) ? 'grayscale(0.7)' : 'none',
                                width: 'clamp(140px, 42vw, 180px)',
                                minWidth: '130px',
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                animationDelay: `${idx * 0.05}s`,
                                cursor: isDisabled ? 'default' : 'pointer',
                                borderRadius: '16px',
                                boxShadow: isSelected ? '5px 5px 0 var(--blue-bright)' : '4px 4px 0 var(--black)',
                                transition: 'box-shadow 0.15s, border 0.15s',
                            }}
                            onClick={() => !isDisabled && setSelectedId(c.id)}
                        >
                            {/* Status Badge - inside card, no overflow clipping risk */}
                            {(isVoted || isOwnTeam || isSelected) && (
                                <div style={{
                                    background: isVoted ? 'var(--navy-dark)' : isOwnTeam ? '#555' : 'var(--blue-bright)',
                                    color: 'var(--white)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '9px',
                                    fontWeight: 700,
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    border: '2px solid var(--black)',
                                    whiteSpace: 'nowrap',
                                    letterSpacing: '1px',
                                    boxShadow: '2px 2px 0 var(--black)',
                                    order: -1,
                                }}>
                                    {isVoted ? '✔ TERKUNCI' : isOwnTeam || isSelf ? (isOwnTeam ? '🚫 TIM SENDIRI' : '🚫 DIRI SENDIRI') : '★ TERPILIH'}
                                </div>
                            )}

                            {/* Full-width Profile Photo */}
                            <div style={{
                                width: '100%',
                                aspectRatio: '1',
                                borderRadius: '12px',
                                border: '3px solid var(--black)',
                                overflow: 'hidden',
                                background: avatarColor,
                                order: -2,
                                boxShadow: '2px 2px 0 var(--black)'
                            }}>
                                <img
                                    src={c.imageUrl || PLACEHOLDER_IMAGES[idx % PLACEHOLDER_IMAGES.length]}
                                    alt={c.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Name + Division below */}
                            <div>
                                <div className="cand-name" style={{ fontSize: '14px', lineHeight: '1.2' }}>{c.name}</div>
                                <span className="cand-div" style={{ marginTop: '6px', display: 'inline-block' }}>{c.division}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Submit / Confirmed */}
            <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
                {!votedId ? (
                    <button
                        className="btn"
                        style={{
                            padding: '18px 52px',
                            fontSize: '16px',
                            fontFamily: 'var(--font-display)',
                            letterSpacing: '2px',
                            background: selectedId ? 'var(--pink-hot)' : '#888',
                            color: 'var(--white)',
                            border: '3px solid var(--black)',
                            opacity: selectedId ? 1 : 0.6,
                        }}
                        disabled={!selectedId || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? 'MENGIRIM...' : 'SUBMIT'}
                    </button>
                ) : (
                    <div className="card" style={{ display: 'inline-block', padding: '16px 32px', background: 'var(--lime)', animation: 'fadeIn 0.5s ease-out' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '2px' }}>
                            ✔ SUARA TERKIRIM!
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#444', marginTop: '4px' }}>
                            TERIMA KASIH ATAS PARTISIPASIMU
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
