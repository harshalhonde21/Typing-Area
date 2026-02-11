import { create } from 'zustand';
import { calculateWPM, calculateAccuracy, generateText } from '@/lib/utils'; // Assuming utils are here

interface TypingState {
  status: 'idle' | 'running' | 'finished';
  testMode: 'time' | 'words';
  text: string;
  userInput: string;
  caretPosition: number;

  // Settings
  timerDuration: number; // 15, 30, 60
  wordCount: number; // 10, 25, 50, 100

  // Dynamic
  timeRemaining: number;
  timeElapsed: number;

  // Stats
  correctCharCount: number;
  errorCharCount: number;
  totalKeystrokes: number;

  // Actions
  setMode: (mode: 'time' | 'words') => void;
  setDuration: (duration: number) => void;
  setWordCount: (count: number) => void;
  startTest: () => void;
  resetTest: () => void;
  finishTest: () => void;
  handleInput: (input: string) => void;
  tickTimer: (timeLeft: number, elapsed: number) => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  status: 'idle',
  testMode: 'time',
  text: '',
  userInput: '',
  caretPosition: 0,
  timerDuration: 60,
  wordCount: 25,
  timeRemaining: 60,
  timeElapsed: 0,
  correctCharCount: 0,
  errorCharCount: 0,
  totalKeystrokes: 0,

  setMode: (mode) => {
    set({ testMode: mode });
    get().resetTest();
  },

  setDuration: (duration) => {
    set({ timerDuration: duration, testMode: 'time' });
    get().resetTest();
  },

  setWordCount: (count) => {
    set({ wordCount: count, testMode: 'words' });
    get().resetTest();
  },

  startTest: () => {
    set({ status: 'running' });
  },

  resetTest: () => {
    const { testMode, timerDuration, wordCount } = get();
    // Generate text based on mode
    const countToGen = testMode === 'words' ? wordCount : 100;

    const newText = generateText('words', countToGen);
    set({
      status: 'idle',
      text: newText,
      userInput: '',
      caretPosition: 0,
      timeRemaining: testMode === 'time' ? timerDuration : 0,
      timeElapsed: 0,
      correctCharCount: 0,
      errorCharCount: 0,
      totalKeystrokes: 0,
    });
  },

  finishTest: () => {
    set({ status: 'finished' });
  },

  tickTimer: (timeLeft, elapsed) => {
    const { status, finishTest, testMode } = get();
    if (status === 'finished') return;

    if (testMode === 'time') {
      set({ timeRemaining: timeLeft, timeElapsed: elapsed });
      if (timeLeft <= 0) {
        finishTest();
      }
    } else {
      // In stopwatch mode, timeLeft from worker IS the elapsed time (as per worker update)
      // actually worker sends real elapsed too.
      set({ timeElapsed: elapsed, timeRemaining: elapsed });
    }
  },

  handleInput: (input: string) => {
    const { status, text, startTest, finishTest, totalKeystrokes } = get();

    if (status === 'finished') return;
    if (status === 'idle' && input.length > 0) {
      startTest();
    }

    if (input.length > text.length) {
      return;
    }

    let correct = 0;
    let errors = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) correct++;
      else errors++;
    }

    set({
      userInput: input,
      caretPosition: input.length,
      correctCharCount: correct,
      errorCharCount: errors,
      totalKeystrokes: totalKeystrokes + 1,
    });

    if (input.length === text.length) {
      finishTest();
    }
  },
}));
