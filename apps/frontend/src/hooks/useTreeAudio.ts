'use client';
import { useRef, useCallback, useEffect } from 'react';

/**
 * useTreeAudio
 * Manages BGM and SFX for the Grow the Tree game.
 * - BGM: looping MP3 with fade-in / fade-out
 * - SFX water drop: synthesized via Web Audio API (no file needed)
 * - SFX stage-up: MP3 fanfare
 * - SFX complete: MP3 victory sound
 */
export function useTreeAudio(enabled = true) {
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const isMutedRef = useRef(!enabled);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // ── Initialize BGM on client only ────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const bgm = new Audio('/assets/audio/bgm-tree.mp3');
        bgm.loop = true;
        bgm.volume = 0;
        bgmRef.current = bgm;

        return () => {
            bgm.pause();
            bgm.src = '';
        };
    }, []);

    // ── Get or create shared AudioContext ─────────────────
    const getAudioCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return audioCtxRef.current;
    }, []);

    // ── BGM control ───────────────────────────────────────
    const playBGM = useCallback(() => {
        const bgm = bgmRef.current;
        if (!bgm || isMutedRef.current) return;
        bgm.play().catch(() => { }); // Autoplay policy handling
        // Fade in
        let vol = 0;
        const interval = setInterval(() => {
            vol = Math.min(vol + 0.02, 0.35);
            bgm.volume = vol;
            if (vol >= 0.35) clearInterval(interval);
        }, 80);
    }, []);

    const stopBGM = useCallback(() => {
        const bgm = bgmRef.current;
        if (!bgm) return;
        // Fade out
        let vol = bgm.volume;
        const interval = setInterval(() => {
            vol = Math.max(vol - 0.03, 0);
            bgm.volume = vol;
            if (vol === 0) { clearInterval(interval); bgm.pause(); }
        }, 60);
    }, []);

    // ── SFX: Water drop (synthesized tone) ────────────────
    const playWaterDrop = useCallback(() => {
        if (isMutedRef.current || typeof window === 'undefined') return;
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square'; // 8-bit retro wave
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.15, ctx.currentTime); // Square waves are loud
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch (_) { }
    }, [getAudioCtx]);

    // ── SFX: Menu Select (Trivia answer click) ────────────
    const playMenuSelect = useCallback(() => {
        if (isMutedRef.current || typeof window === 'undefined') return;
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch flat beep

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.05);
        } catch (_) { }
    }, [getAudioCtx]);

    // ── SFX: Stage up ─────────────────────────────────────
    const playStageUp = useCallback(() => {
        if (isMutedRef.current) return;
        try {
            const sfx = new Audio('/assets/audio/sfx-stage-up.mp3');
            sfx.volume = 0.8;
            sfx.play().catch(() => { });
        } catch (_) { }
    }, []);

    // ── SFX: Game complete ────────────────────────────────
    const playComplete = useCallback(() => {
        if (isMutedRef.current) return;
        try {
            const sfx = new Audio('/assets/audio/sfx-complete.mp3');
            sfx.volume = 0.9;
            sfx.play().catch(() => { });
        } catch (_) { }
    }, []);

    // ── Mute toggle ───────────────────────────────────────
    const setMuted = useCallback((muted: boolean) => {
        isMutedRef.current = muted;
        const bgm = bgmRef.current;
        if (!bgm) return;
        if (muted) {
            bgm.volume = 0;
            bgm.pause();
        } else {
            playBGM();
        }
    }, [playBGM]);

    return { playBGM, stopBGM, playWaterDrop, playMenuSelect, playStageUp, playComplete, setMuted };
}
