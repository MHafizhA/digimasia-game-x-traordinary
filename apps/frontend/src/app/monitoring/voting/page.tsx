'use client';

import NomineeMonitor from '@/components/NomineeMonitor';
import { useSocket } from '@/hooks/useSocket';
import TVFrame from '@/components/TVFrame';

export default function VotingMonitoringPage() {
    useSocket();
    return (
        <TVFrame bgImage="/assets/branding/BG2.png">
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '4px', color: 'var(--yellow)', textShadow: '3px 3px 0 var(--black)' }}>
                        LIVE VOTING MONITOR
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(10px, 1.2vw, 14px)', color: 'var(--white)', letterSpacing: '3px', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span className="live-dot" style={{ width: '8px', height: '8px', background: 'red', borderRadius: '50%', animation: 'blink 1.5s infinite' }} /> X-TRAORDINARY — GROW WITH HEART : REAL-TIME PARTICIPATION
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
                    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <img
                            src="/assets/branding/Logo_X-Traordinary Team.png"
                            alt="Team Nominees"
                            style={{ height: '60px', width: 'auto', marginBottom: '10px', alignSelf: 'center' }}
                        />
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <NomineeMonitor category="team" />
                        </div>
                    </div>
                    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <img
                            src="/assets/branding/Logo_X-Traordinary Digimers.png"
                            alt="Digimer Nominees"
                            style={{ height: '60px', width: 'auto', marginBottom: '10px', alignSelf: 'center' }}
                        />
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <NomineeMonitor category="digimer" />
                        </div>
                    </div>
                </div>
            </div>
        </TVFrame>
    );
}
