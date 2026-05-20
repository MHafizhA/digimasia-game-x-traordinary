'use client';
import { useRef, useCallback, useEffect } from 'react';

/**
 * useTreeAudio
 * Manages BGM and SFX for the game.
 * - BGM: synthesized chiptune loop via Web Audio API (no file dependency)
 * - SFX water drop: synthesized blip
 * - SFX menu select: synthesized beep (for trivia)
 * - SFX stage-up: MP3 fanfare
 * - SFX complete: MP3 victory sound
 */

// ── Chiptune BGM melody (note frequencies in Hz) ───────────────────────────
// Classic 8-bit adventure theme - C major scale melody loop
const NOTE = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
    G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25, G5: 783.99,
    REST: 0,
};

// [frequency, duration_seconds]
const MELODY: [number, number][] = [
    [NOTE.E4, 0.15], [NOTE.G4, 0.15], [NOTE.A4, 0.15], [NOTE.C5, 0.25],
    [NOTE.A4, 0.1], [NOTE.G4, 0.15], [NOTE.E4, 0.25],
    [NOTE.E4, 0.15], [NOTE.G4, 0.15], [NOTE.A4, 0.15], [NOTE.C5, 0.15],
    [NOTE.E5, 0.3], [NOTE.D5, 0.15], [NOTE.C5, 0.25],
    [NOTE.G4, 0.15], [NOTE.A4, 0.15], [NOTE.C5, 0.15], [NOTE.D5, 0.15],
    [NOTE.E5, 0.15], [NOTE.D5, 0.15], [NOTE.C5, 0.15], [NOTE.A4, 0.3],
    [NOTE.F4, 0.15], [NOTE.G4, 0.15], [NOTE.A4, 0.15], [NOTE.C5, 0.15],
    [NOTE.D5, 0.25], [NOTE.C5, 0.15], [NOTE.A4, 0.15], [NOTE.G4, 0.4],
    [NOTE.REST, 0.1],
];

const BASS_LINE: [number, number][] = [
    [NOTE.C4 / 2, 0.5], [NOTE.G4 / 2, 0.5], [NOTE.A4 / 2, 0.5], [NOTE.F4 / 2, 0.5],
    [NOTE.C4 / 2, 0.5], [NOTE.G4 / 2, 0.5], [NOTE.F4 / 2, 0.5], [NOTE.G4 / 2, 0.5],
];

function scheduleMelody(
    ctx: AudioContext,
    notes: [number, number][],
    startTime: number,
    volume: number,
    waveType: OscillatorType = 'square'
): number {
    let time = startTime;
    for (const [freq, dur] of notes) {
        if (freq === 0) { time += dur; continue; }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volume, time);
        gain.gain.setValueAtTime(0, time + dur - 0.01);
        osc.start(time);
        osc.stop(time + dur);
        time += dur;
    }
    return time;
}

export function useTreeAudio(enabled = true) {
    const isMutedRef = useRef(!enabled);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const bgmSchedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bgmStartTimeRef = useRef<number>(0);
    const isBGMPlayingRef = useRef(false);

    // ── Get or create shared AudioContext ─────────────────
    const getAudioCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    // ── Compute total melody duration ─────────────────────
    const MELODY_DURATION = MELODY.reduce((sum, [, dur]) => sum + dur, 0);
    const BASS_DURATION = BASS_LINE.reduce((sum, [, dur]) => sum + dur, 0);

    // ── Schedule one loop of the BGM ──────────────────────
    const scheduleBGMLoop = useCallback(() => {
        if (isMutedRef.current || !audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const now = ctx.currentTime;
        const startAt = Math.max(now, bgmStartTimeRef.current);

        // Schedule melody (lead)
        scheduleMelody(ctx, MELODY, startAt, 0.08, 'square');

        // Schedule bass line (repeated to match melody length)
        let bassTime = startAt;
        while (bassTime < startAt + MELODY_DURATION) {
            bassTime = scheduleMelody(ctx, BASS_LINE, bassTime, 0.04, 'triangle');
        }

        bgmStartTimeRef.current = startAt + MELODY_DURATION;

        // Schedule next loop 100ms before end to avoid gaps
        bgmSchedulerRef.current = setTimeout(
            scheduleBGMLoop,
            Math.max(0, (MELODY_DURATION - 0.1) * 1000)
        );
    }, [MELODY_DURATION]);

    // ── BGM control ───────────────────────────────────────
    const playBGM = useCallback(() => {
        if (isMutedRef.current || isBGMPlayingRef.current) return;
        isBGMPlayingRef.current = true;
        try {
            const ctx = getAudioCtx();
            bgmStartTimeRef.current = ctx.currentTime;
            scheduleBGMLoop();
        } catch (_) { }
    }, [getAudioCtx, scheduleBGMLoop]);

    const stopBGM = useCallback(() => {
        isBGMPlayingRef.current = false;
        if (bgmSchedulerRef.current) {
            clearTimeout(bgmSchedulerRef.current);
            bgmSchedulerRef.current = null;
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => { stopBGM(); };
    }, [stopBGM]);

    // ── SFX: Water drop (synthesized blip) ───────────────
    const playWaterDrop = useCallback(() => {
        if (isMutedRef.current || typeof window === 'undefined') return;
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.08);
        } catch (_) { }
    }, [getAudioCtx]);

    // ── SFX: Menu Select (Trivia answer click) ─────────── 
    const playMenuSelect = useCallback(() => {
        if (isMutedRef.current || typeof window === 'undefined') return;
        try {
            const ctx = getAudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
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
            sfx.volume = 0.7;
            sfx.play().catch(() => { });
        } catch (_) { }
    }, []);

    // ── SFX: Game complete ────────────────────────────────
    const playComplete = useCallback(() => {
        if (isMutedRef.current) return;
        try {
            const sfx = new Audio('/assets/audio/sfx-complete.mp3');
            sfx.volume = 0.8;
            sfx.play().catch(() => { });
        } catch (_) { }
    }, []);

    // ── Mute toggle ───────────────────────────────────────
    const setMuted = useCallback((muted: boolean) => {
        isMutedRef.current = muted;
        if (muted) {
            stopBGM();
        } else {
            isBGMPlayingRef.current = false; // allow restart
            playBGM();
        }
    }, [playBGM, stopBGM]);

    return { playBGM, stopBGM, playWaterDrop, playMenuSelect, playStageUp, playComplete, setMuted };
}
