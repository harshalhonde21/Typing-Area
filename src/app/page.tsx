"use client";

import Timer from "@/components/Timer";
import TypingArea from "@/components/TypingArea";
import StatsDisplay from "@/components/StatsDisplay";
import ResultsModal from "@/components/ResultsModal";
import { useTypingStore } from "@/store/useTypingStore";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const { resetTest, setDuration, timerDuration } = useTypingStore();

  useEffect(() => {
    resetTest();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background/Grid elements could go here if not in body */}

      <div className="w-full max-w-5xl flex flex-col gap-12 z-10">
        {/* Header / Nav */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 w-full px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-punk-cyan to-punk-magenta">
              NEON_TYPE_v1.0
            </h1>
          </div>

          {/* Mode Selectors */}
          <div className="flex items-center gap-2 bg-punk-surface p-1 rounded-lg border border-white/5">
            {[15, 30, 60, 120].map((time) => (
              <button
                key={time}
                onClick={() => {
                  setDuration(time);
                  resetTest();
                }}
                className={`px-3 py-1 text-sm font-mono rounded-md transition-all ${timerDuration === time ? "bg-punk-cyan/20 text-punk-cyan shadow-[0_0_10px_rgba(0,243,255,0.2)]" : "text-punk-dim hover:text-white"}`}
              >
                {time}s
              </button>
            ))}
          </div>
        </header>

        {/* Stats & Timer Bar */}
        <div className="flex items-center justify-between px-8 py-4 glass-panel rounded-full mx-auto w-full max-w-3xl">
          <Timer />
          <StatsDisplay />
        </div>

        {/* Main Typing Area */}
        <div className="relative min-h-[300px] flex items-center justify-center">
          <div className="absolute -top-10 left-0 text-xs text-punk-dim/50 font-mono">
            // SYSTEM_READY
          </div>
          <TypingArea />
        </div>

        {/* Footer / Controls */}
        <footer className="flex flex-col items-center gap-6 mt-8">
          <div className="text-punk-dim text-sm flex gap-4">
            <kbd className="bg-punk-surface px-2 py-1 rounded border border-white/10 text-xs">
              Tab
            </kbd>{" "}
            to restart
          </div>

          <button
            onClick={resetTest}
            className="p-3 rounded-full bg-punk-surface hover:bg-punk-cyan/20 text-punk-dim hover:text-punk-cyan transition-all border border-transparent hover:border-punk-cyan/50"
            aria-label="Restart Test"
          >
            <RefreshCw size={20} />
          </button>
        </footer>
      </div>

      <ResultsModal />
    </main>
  );
}
