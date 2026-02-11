'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

export const useSound = (enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext on first user interaction to handle autoplay policies
  const initAudio = useCallback(() => {
    if (!enabled) return;
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [enabled]);

  const playClick = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const t = ctx.currentTime;

    // Create a "click" sound using an oscillator and noise buffer
    // Mechanical switch sound is complex, but we can approximate a "thock"

    // 1. Comparison tone (high click)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

    gain.gain.setValueAtTime(0.15, t); // Lower volume
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);

    // 2. Body tone (lower thud)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'square';
    osc2.frequency.setValueAtTime(150, t);
    osc2.frequency.exponentialRampToValueAtTime(50, t + 0.05);

    gain2.gain.setValueAtTime(0.1, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(t);
    osc2.stop(t + 0.05);

  }, [enabled]);

  return { playClick, initAudio };
};
