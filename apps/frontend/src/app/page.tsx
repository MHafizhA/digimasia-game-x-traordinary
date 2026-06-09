'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useSocket } from '@/hooks/useSocket';
import Login from './Login';
import Vote from './Vote';
import Trivia from './Trivia';
import Tree from './Tree';
import Final from './Final';
import LeaderboardWidget from '@/components/LeaderboardWidget';

const getInitials = (name: string) =>
  name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) ?? '?';

function WaitingCard({ user }: { user: any }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div style={{
      minHeight: 'calc(100dvh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="card card-navy" style={{
        maxWidth: '360px',
        width: '100%',
        textAlign: 'center',
        padding: '36px 28px',
      }}>
        {/* Avatar Bubble */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: '3px solid var(--yellow)',
          background: 'var(--blue-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <img
            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent((user?.name ?? '') + (user?.division ?? ''))}`}
            alt="Avatar"
            style={{ width: '120%', height: '120%', imageRendering: 'pixelated', marginTop: '8px' }}
          />
        </div>

        {/* Name */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(20px, 6vw, 28px)',
          letterSpacing: '2px',
          color: 'var(--yellow)',
          lineHeight: 1,
        }}>
          Welcome, {user?.name}!
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '2px',
          margin: '6px 0 24px',
        }}>
          DIVISI {user?.division?.toUpperCase()}
        </div>

        {/* Waiting box */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px dashed rgba(255,255,255,0.2)',
          borderRadius: '10px',
          padding: '20px',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '14px',
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '6px',
          }}>
            MENUNGGU INSTRUKSI ADMIN...
          </div>
          <div style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
          }}>
            Game akan dimulai segera.
          </div>
          {/* Yellow spinner */}
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderTopColor: 'var(--yellow)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '16px auto 0',
          }} />
        </div>

        {/* Manual Reset Fallback */}
        <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '1px',
              textDecoration: 'underline',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Bukan {user?.name}? Klik untuk Keluar
          </button>
        </div>

        {/* Custom Logout Modal */}
        {showLogoutModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="animate-pop-in card" style={{ background: 'var(--white)', padding: '24px', maxWidth: '320px', width: '90%', textAlign: 'center', border: '4px solid var(--black)', boxShadow: '8px 8px 0 var(--black)' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👋</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '1px', color: 'var(--black)', marginBottom: '8px' }}>
                KONFIRMASI KELUAR
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#555', marginBottom: '24px', lineHeight: 1.5 }}>
                Apakah Anda yakin ingin keluar dan masuk dengan PIN lain?
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{ flex: 1, padding: '12px', background: '#ccc', border: '3px solid var(--black)', borderRadius: '8px', fontFamily: 'var(--font-display)', fontSize: '14px', cursor: 'pointer', color: 'var(--black)', boxShadow: '3px 3px 0 var(--black)' }}
                >
                  BATAL
                </button>
                <button
                  onClick={() => {
                    useGameStore.getState().reset();
                    window.location.reload();
                  }}
                  style={{ flex: 1, padding: '12px', background: 'var(--pink-hot)', border: '3px solid var(--black)', borderRadius: '8px', fontFamily: 'var(--font-display)', fontSize: '14px', cursor: 'pointer', color: 'var(--white)', boxShadow: '3px 3px 0 var(--black)' }}
                >
                  KELUAR
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { user, phase, treeStage, totalWater, _hasHydrated } = useGameStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useSocket();

  useEffect(() => {
    if (_hasHydrated && (user as any)?.isAdmin) {
      window.location.href = '/admin';
    }
  }, [user, _hasHydrated]);

  // Reset scroll position on phase change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [phase]);

  if (!mounted || !_hasHydrated) {
    return (
      <div style={{
        minHeight: 'calc(100dvh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ width: '48px', height: '48px', border: '5px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--yellow)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--white)', letterSpacing: '2px' }}>MENYINKRONKAN...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  switch (phase) {
    case 'LOGIN':
    case 'WAITING':
      return <WaitingCard user={user} />;

    case 'VOTING_TEAM':
      return <Vote type="team" />;

    case 'VOTING_DIGIMER':
      return <Vote type="digimer" />;

    case 'TRIVIA':
      return <Trivia />;

    case 'TRANSITION':
      return (
        <div style={{
          minHeight: 'calc(100dvh - 120px)',
          padding: '24px',
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {/* Header */}
          <div className="card" style={{
            background: 'var(--navy-dark)',
            border: '4px solid var(--black)',
            boxShadow: '6px 6px 0 var(--black)',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 8vw, 40px)', letterSpacing: '3px', color: 'var(--yellow)', lineHeight: 1, marginBottom: '6px' }}>
              🏆 TRIVIA SELESAI!
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
              SKOR AKHIRMU MASUK KE LEADERBOARD
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card" style={{ padding: '20px', border: '3px solid var(--black)', boxShadow: '5px 5px 0 var(--black)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginBottom: '12px', color: '#333' }}>
              📊 LEADERBOARD
            </div>
            <LeaderboardWidget />
          </div>

          {/* Waiting message */}
          <div className="card" style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.05)', border: '2px dashed rgba(255,255,255,0.3)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <div style={{ width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--yellow)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              MENUNGGU FASE BERIKUTNYA...
            </div>
          </div>
        </div>
      );

    case 'WATERING':
      if (treeStage >= 9 || totalWater >= 5000) return <Final />;
      return <Tree />;

    case 'FINAL':
      return <Final />;

    default:
      return (
        <div style={{
          minHeight: 'calc(100dvh - 120px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}>
          <div className="card" style={{ textAlign: 'center', padding: '28px 40px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '28px', letterSpacing: '2px', marginBottom: '8px' }}>
              SESI DIMULAI!
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#666', letterSpacing: '1px' }}>
              PHASE: {phase} · FITUR SEDANG DIAKTIFKAN OLEH ADMIN...
            </div>
          </div>
        </div>
      );
  }
}
