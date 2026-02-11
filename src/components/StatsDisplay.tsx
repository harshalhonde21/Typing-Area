"use client";

import { useTypingStore } from "@/store/useTypingStore";
import { calculateWPM, calculateAccuracy } from "@/lib/utils"; // Make sure explicit import if used, or use store values if pre-calced

export default function StatsDisplay() {
  const {
    correctCharCount,
    errorCharCount,
    totalKeystrokes,
    timeRemaining,
    timerDuration,
  } = useTypingStore();

  const timeElapsed = timerDuration - timeRemaining;
  const wpm = calculateWPM(correctCharCount, timeElapsed);
  const accuracy = calculateAccuracy(correctCharCount, totalKeystrokes);

  return (
    <div className="flex gap-8 text-punk-dim font-mono text-sm md:text-base">
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-widest mb-1 text-gray-500">
          WPM
        </span>
        <span className="text-2xl text-punk-cyan text-glow-cyan font-bold">
          {wpm}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-widest mb-1 text-gray-500">
          ACC
        </span>
        <span className="text-2xl text-punk-magenta text-glow-magenta font-bold">
          {accuracy}%
        </span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-widest mb-1 text-gray-500">
          ERR
        </span>
        <span className="text-2xl text-punk-red font-bold">
          {errorCharCount}
        </span>
      </div>
    </div>
  );
}
