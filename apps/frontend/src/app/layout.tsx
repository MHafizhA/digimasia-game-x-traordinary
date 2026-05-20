import type { Metadata } from 'next';
import React, { Fragment } from 'react';
import './globals.css';
import ToastNotification from '@/components/ToastNotification';
export const metadata: Metadata = {
  title: 'X-traordinary - Grow with heart',
  description: 'Digima ASIA 10th Anniversary Event System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tickerItems = [
    '▶', 'DIGIMAVERSARY #10',
    '═', 'DIGIMAVERSARY #10',
    '●', 'DIGIMAVERSARY #10',
    '✕', 'DIGIMAVERSARY #10',
    '◀', 'DIGIMAVERSARY #10'
  ];
  // Duplicate for seamless loop
  const allItems = [...tickerItems, ...tickerItems, ...tickerItems];

  const renderTickerItem = (item: string) => {
    const iconStyle = { display: 'inline-flex', alignItems: 'center', height: '100%', padding: '0 8px' };
    switch (item) {
      case '▶':
        return <span style={iconStyle}><svg viewBox="0 0 24 24" width="1.6em" height="1.6em" fill="currentColor"><path d="M8 5v14l11-7z" /></svg></span>;
      case '◀':
        return <span style={iconStyle}><svg viewBox="0 0 24 24" width="1.6em" height="1.6em" fill="currentColor"><path d="M16 5v14l-11-7z" /></svg></span>;
      case '●':
        return <span style={iconStyle}><svg viewBox="0 0 24 24" width="1.4em" height="1.4em" fill="currentColor"><circle cx="12" cy="12" r="7" /></svg></span>;
      case '✕':
        return <span style={iconStyle}><svg viewBox="0 0 24 24" width="1.4em" height="1.4em" fill="none" stroke="currentColor" strokeWidth="4"><path d="M6 6l12 12M18 6L6 18" /></svg></span>;
      case '═':
        return <span style={iconStyle}><svg viewBox="0 0 24 24" width="2em" height="1.4em" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M1 9h22M1 15h22" /></svg></span>;
      default:
        return <span style={{ display: 'inline-flex', alignItems: 'center' }}>{item}</span>;
    }
  };

  return (
    <html lang="id">
      <head>
        {/* Viewport: user-scalable=yes allows screenshots on Chrome Android */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* ── TICKER TAPE ── */}
        <div className="ticker-wrap" aria-hidden="true">
          <div className="ticker-inner" style={{ alignItems: 'center' }}>
            {allItems.map((item, i) => (
              <React.Fragment key={i}>
                {renderTickerItem(item)}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── TOPBAR ── */}
        <header className="topbar">
          <div className="topbar-logo">
            <img
              src="/assets/branding/Logo_DAA.png"
              alt="Digima Asia"
              style={{ height: 'clamp(54px, 13vw, 76px)', width: 'auto', display: 'block' }}
            />
          </div>
          <div className="topbar-badges">
            <div className="topbar-badge">
              <span className="live-dot" />
              LIVE SYSTEM
            </div>
            <div className="topbar-badge">DIGIMAVERSARY #10</div>
          </div>
        </header>

        {children}

        <ToastNotification />

        <footer style={{ background: 'var(--navy-dark)', color: 'var(--white)', padding: '12px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px', borderTop: '3px solid var(--black)', marginTop: 'auto' }}>
          DIGIMASIA · X-TRAORDINARY — GROW WITH HEART © 2026 · ALL RIGHTS RESERVED
        </footer>

        {/* ── BACKGROUND DECORATIONS (STICKERS) ── */}
        <div className="sticker sticker-star">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
        </div>
        <div className="sticker sticker-circle">
          <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>
        </div>
        <div className="sticker sticker-squiggle">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17c2-5 5-5 7 0s5 5 7 0s5-5 7-0v2c-2-5-5-5-7 0s-5 5-7 0s-5-5-7-0v-2z" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" /></svg>
        </div>
        <div className="sticker sticker-gamepad">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 7.5V9h-3V7.5h3zM7 11h2v2H7v-2zm10 0h2v2h-2v-2zm-7-4h4v2h-4V7zm11 4v4c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2z" /></svg>
        </div>

        {/* ── BOTTOM RIGHT ELEMENT DECORATION ── */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          zIndex: 10, /* Higher than base bg, lower than important UI */
          pointerEvents: 'none', /* Prevent blocking clicks */
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
      </body>
    </html>
  );
}
