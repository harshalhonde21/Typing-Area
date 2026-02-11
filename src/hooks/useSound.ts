'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

export const useSound = (enabled: boolean = true) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  // Initialize and load sound
  const initAudio = useCallback(async () => {
    if (!enabled) return;

    // Create Context
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
      }
    }

    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Load buffer if not loaded
    if (!bufferRef.current) {
      try {
        const response = await fetch('/sounds/click.mp3');
        if (!response.ok) throw new Error('Network response was not ok');
        const arrayBuffer = await response.arrayBuffer();
        bufferRef.current = await ctx.decodeAudioData(arrayBuffer);
      } catch (error) {
        console.error('Failed to load sound:', error);
        // Fallback to synthesis if load fails is handled in playClick checks
      }
    }
  }, [enabled]);

  const playClick = useCallback(() => {
    if (!enabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;

    if (bufferRef.current) {
      // Play from buffer (Real Sound)
      const source = ctx.createBufferSource();
      source.buffer = bufferRef.current;

      // Randomize pitch slightly for realism
      source.playbackRate.value = 0.95 + Math.random() * 0.1;

      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.3 + Math.random() * 0.1; // Randomize volume

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    } else {
      // Fallback Synthesis (Better "Thock")
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);

      // Add noise burst for "click"
      const bufferSize = ctx.sampleRate * 0.01; // 10ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0.1;

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);
    }
  }, [enabled]);

  // Preload on mount
  useEffect(() => {
    if (enabled) initAudio();
  }, [enabled, initAudio]);

  return { playClick, initAudio };
};
