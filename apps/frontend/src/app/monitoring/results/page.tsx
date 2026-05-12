'use client';

import WinnerAnnouncer from '@/components/WinnerAnnouncer';
import styles from '../../page.module.css';
import { useSocket } from '@/hooks/useSocket';

export default function WinnerRevealPage() {
    // Initialize socket to receive updates
    useSocket();

    return (
        <main className={styles.adminContainer} style={{ padding: '4rem' }}>
            <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                <h1 className="gradient-text" style={{ fontSize: '4rem', margin: 0 }}>VOTING WINNERS</h1>
                <p style={{ opacity: 0.6, letterSpacing: '4px', fontWeight: 800 }}>X-CELERATE THE TREE — THE FINAL CELEBRATION</p>
            </header>

            <div className="glass" style={{ padding: '4rem' }}>
                <WinnerAnnouncer />
            </div>
        </main>
    );
}
