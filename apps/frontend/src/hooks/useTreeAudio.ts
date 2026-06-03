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
    const masterGainRef = useRef<GainNode | null>(null);
    const bgmRef = useRef<HTMLAudioElement | null>(null);
    const bgmSchedulerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const bgmStartTimeRef = useRef<number>(0);
    const isBGMPlayingRef = useRef(false);
    const activeOscillators = useRef<Set<OscillatorNode>>(new Set());

    // Sync isMutedRef if the 'enabled' prop changes from outside
    useEffect(() => {
        isMutedRef.current = !enabled;
        if (masterGainRef.current && audioCtxRef.current) {
            const time = audioCtxRef.current.currentTime;
            masterGainRef.current.gain.setTargetAtTime(enabled ? 1 : 0, time, 0.05);
        }
    }, [enabled]);

    // ── Get or create shared AudioContext & Master Gain ──
    const getAudioCtx = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
            audioCtxRef.current = new AudioContextClass();
            masterGainRef.current = audioCtxRef.current.createGain();
            masterGainRef.current.connect(audioCtxRef.current.destination);

            // Initial volume based on isMutedRef
            masterGainRef.current.gain.value = isMutedRef.current ? 0 : 1;
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    }, []);

    // ── Stop All Running Oscillators ──
    const stopAllOscillators = useCallback(() => {
        activeOscillators.current.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (_) { }
        });
        activeOscillators.current.clear();
    }, []);

    const scheduleBGMLoop = useCallback(() => {
        // Obsolete synthesized BGM loop removed per user asset request
    }, []);

    const playBGM = useCallback(() => {
        isBGMPlayingRef.current = true;

        if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current.src = ""; }

        const audio = new Audio('/assets/audio/bgm-retro-grow-the-tree.mp3');
        audio.loop = true;
        audio.volume = 0.5;
        bgmRef.current = audio;

        if (!isMutedRef.current) {
            audio.play().catch(() => { });
        }
    }, []);

    // ── BGM: Trivia (MP3 File) ──
    const playTriviaBGM = useCallback(() => {
        if (bgmRef.current) { bgmRef.current.pause(); bgmRef.current.src = ""; }

        const audio = new Audio('/assets/audio/bgm-retro-trivia.mp3');
        audio.loop = true;
        audio.volume = 0.5;
        bgmRef.current = audio;

        if (!isMutedRef.current) {
            audio.play().catch(() => { });
        }
    }, []);

    const stopBGM = useCallback(() => {
        isBGMPlayingRef.current = false;
        if (bgmSchedulerRef.current) {
            clearTimeout(bgmSchedulerRef.current);
            bgmSchedulerRef.current = null;
        }
        stopAllOscillators();

        if (bgmRef.current) {
            const audio = bgmRef.current;
            // Smooth fade out
            const startVolume = audio.volume;
            let currentVolume = startVolume;
            const fadeInterval = setInterval(() => {
                if (currentVolume > 0.05) {
                    currentVolume -= 0.05;
                    audio.volume = Math.max(0, currentVolume);
                } else {
                    clearInterval(fadeInterval);
                    audio.pause();
                    audio.src = "";
                    bgmRef.current = null;
                }
            }, 30); // ~300ms total fade duration
        }
    }, [stopAllOscillators]);

    useEffect(() => {
        return () => { stopBGM(); };
    }, [stopBGM]);

    // ── SFX ──
    const playWaterDrop = useCallback(() => {
        if (isMutedRef.current || typeof window === 'undefined') return;
        try {
            const ctx = getAudioCtx();
            const master = masterGainRef.current;
            if (!master) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(master);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.8, ctx.currentTime); // Much louder
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.22);
        } catch (_) { }
    }, [getAudioCtx]);

    const playMenuSelect = useCallback(() => {
        if (isMutedRef.current || typeof window === 'undefined') return;
        try {
            const ctx = getAudioCtx();
            const master = masterGainRef.current;
            if (!master) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(master);
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.05);
        } catch (_) { }
    }, [getAudioCtx]);

    const playTick = useCallback(() => {
        if (isMutedRef.current || typeof window === 'undefined') return;
        try {
            const ctx = getAudioCtx();
            const master = masterGainRef.current;
            if (!master) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(master);
            osc.type = 'square';
            // Classic tension tick
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.1);
        } catch (_) { }
    }, [getAudioCtx]);

    const tensionDroneRef = useRef<HTMLAudioElement | null>(null);

    const playTensionDrone = useCallback(() => {
        if (isMutedRef.current || typeof window === 'undefined') return;
        try {
            const audio = new Audio('/assets/audio/jakob_welik-level-one-8-bit-pixel-warriors-chapter-one-415685.mp3');
            audio.volume = 0.8;
            tensionDroneRef.current = audio;
            audio.play().catch(() => { });
        } catch (_) { }
    }, []);

    const stopTensionDrone = useCallback(() => {
        if (tensionDroneRef.current) {
            try {
                tensionDroneRef.current.pause();
                tensionDroneRef.current.src = "";
            } catch (_) { }
            tensionDroneRef.current = null;
        }
    }, []);

    const playStageUp = useCallback(() => {
        if (isMutedRef.current) return;
        try {
            const sfx = new Audio('/assets/audio/sfx-level-up-pohon.ogg');
            sfx.volume = 0.7;
            sfx.play().catch(() => { });
        } catch (_) { }
    }, []);

    const playComplete = useCallback(() => {
        if (isMutedRef.current) return;
        try {
            const sfx = new Audio('/assets/audio/sfx-reveal-4.mp3');
            sfx.volume = 0.8;
            sfx.play().catch(() => { });
        } catch (_) { }
    }, []);

    const setMuted = useCallback((muted: boolean) => {
        isMutedRef.current = muted;
        const ctx = getAudioCtx();

        if (muted) {
            // STOP EVERYTHING
            if (bgmSchedulerRef.current) {
                clearTimeout(bgmSchedulerRef.current);
                bgmSchedulerRef.current = null;
            }
            stopAllOscillators();

            if (bgmRef.current) {
                bgmRef.current.pause();
            }

            if (tensionDroneRef.current) {
                try {
                    tensionDroneRef.current.pause();
                    tensionDroneRef.current.src = "";
                } catch (_) { }
                tensionDroneRef.current = null;
            }
            if (masterGainRef.current) {
                masterGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
            }
        } else {
            // RESUME EVERYTHING
            if (masterGainRef.current) {
                masterGainRef.current.gain.setTargetAtTime(1, ctx.currentTime, 0.05);
            }

            if (ctx.state === 'suspended') ctx.resume();

            // Resume BGM chiptune if it was supposed to play
            if (isBGMPlayingRef.current && !bgmSchedulerRef.current) {
                bgmStartTimeRef.current = ctx.currentTime;
                scheduleBGMLoop();
            }

            // Resume Trivia BGM if it exists
            if (bgmRef.current && bgmRef.current.src !== "" && bgmRef.current.paused) {
                bgmRef.current.play().catch(() => { });
            }
        }
    }, [getAudioCtx, scheduleBGMLoop, stopAllOscillators]);

    return { playBGM, playTriviaBGM, stopBGM, playWaterDrop, playMenuSelect, playTick, playTensionDrone, stopTensionDrone, playStageUp, playComplete, setMuted };
}
