import { create } from 'zustand';
import { calculateWPM, calculateAccuracy, generateText } from '@/lib/utils'; // Assuming utils are here

interface TypingState {
  status: 'idle' | 'running' | 'finished';
  text: string;
  userInput: string;
  caretPosition: number;

  // Timer
  timerDuration: number; // 15, 30, 60
  timeRemaining: number;

  // Stats
  correctCharCount: number;
  errorCharCount: number;
  totalKeystrokes: number;

  // Actions
  setText: (mode?: 'words' | 'quote') => void;
  startTest: () => void;
  resetTest: () => void;
  finishTest: () => void;
  handleInput: (input: string) => void;
  tickTimer: (timeLeft: number) => void;
  setDuration: (duration: number) => void;
}

export const useTypingStore = create<TypingState>((set, get) => ({
  status: 'idle',
  text: '',
  userInput: '',
  caretPosition: 0,
  timerDuration: 60,
  timeRemaining: 60,
  correctCharCount: 0,
  errorCharCount: 0,
  totalKeystrokes: 0,

  setText: (mode = 'words') => {
    const newText = generateText(mode, 50); // Generate enough words
    set({ text: newText, userInput: '', caretPosition: 0 });
  },

  setDuration: (duration) => {
    set({ timerDuration: duration, timeRemaining: duration });
  },

  startTest: () => {
    set({ status: 'running' });
  },

  resetTest: () => {
    const { timerDuration } = get();
    const newText = generateText('words', 50);
    set({
      status: 'idle',
      text: newText,
      userInput: '',
      caretPosition: 0,
      timeRemaining: timerDuration,
      correctCharCount: 0,
      errorCharCount: 0,
      totalKeystrokes: 0,
    });
  },

  finishTest: () => {
    set({ status: 'finished' });
  },

  tickTimer: (timeLeft) => {
    const { status, finishTest } = get();
    if (status === 'finished') return;

    set({ timeRemaining: timeLeft });
    if (timeLeft <= 0) {
      finishTest();
    }
  },

  handleInput: (input: string) => {
    const { status, text, startTest, finishTest, totalKeystrokes } = get();

    if (status === 'finished') return;
    if (status === 'idle' && input.length > 0) {
      startTest();
    }

    // Limit input length to text length
    if (input.length > text.length) {
      return;
    }

    // Calculate stats incrementally
    let correct = 0;
    let errors = 0;
    // Simple calc for now, for real-time highlighting we need per-char check in UI
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

    // Auto-finish if end of text reached
    if (input.length === text.length) {
      finishTest();
    }
  },
}));
