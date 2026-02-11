"use client";

import Timer from "@/components/Timer";
import TypingArea from "@/components/TypingArea";
import StatsDisplay from "@/components/StatsDisplay";
import ResultsModal from "@/components/ResultsModal";
import { useTypingStore } from "@/store/useTypingStore";
import { useEffect, useState } from "react";
import { RefreshCw, Maximize2, Minimize2, Clock, Type } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function Home() {
  const {
    resetTest,
    setDuration,
    setWordCount,
    timerDuration,
    wordCount,
    testMode,
    setMode,
  } = useTypingStore();

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    resetTest();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden transition-all duration-500">
      {/* Background/Grid elements could go here if not in body */}

      <div className="w-full max-w-[1600px] flex flex-col gap-10 z-10">
        {/* Header / Nav */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 w-full px-6 py-4 md:py-6 relative z-50">
          {/* Branding Block */}
          <div className="flex items-center gap-4 relative group">
            <div className="absolute -inset-4 bg-punk-cyan/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-punk-cyan via-white to-punk-magenta text-glow-cyan relative z-10 transition-transform duration-300 hover:scale-105">
              NEXUS_TYPE
            </h1>
            <span className="bg-punk-surface border border-white/10 text-[10px] md:text-xs px-2 py-1 rounded text-punk-dim font-mono tracking-widest uppercase shadow-[0_0_10px_rgba(0,0,0,0.5)]">
              v2.0
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            {/* Mode Switcher Block - Enhanced */}
            <div className="flex items-center gap-2 bg-punk-surface/80 p-2 rounded-2xl border border-white/5 backdrop-blur-xl shadow-2xl">
              {/* Mode Toggle Icons */}
              <div className="flex gap-1 pr-4 border-r border-white/10">
                <button
                  onClick={() => setMode("time")}
                  className={`p-2 rounded-xl transition-all duration-300 ${testMode === "time" ? "text-punk-cyan bg-white/5 shadow-[inset_0_0_10px_rgba(0,243,255,0.1)] icon-glow" : "text-punk-dim hover:text-white hover:bg-white/5"}`}
                  title="Time Mode"
                >
                  <Clock size={18} />
                </button>
                <button
                  onClick={() => setMode("words")}
                  className={`p-2 rounded-xl transition-all duration-300 ${testMode === "words" ? "text-punk-magenta bg-white/5 shadow-[inset_0_0_10px_rgba(255,0,255,0.1)] icon-glow" : "text-punk-dim hover:text-white hover:bg-white/5"}`}
                  title="Words Mode"
                >
                  <Type size={18} />
                </button>
              </div>

              {/* Sub-options based on mode */}
              <div className="flex items-center gap-1.5 pl-2">
                {testMode === "time"
                  ? [15, 30, 60, 120].map((time) => (
                      <button
                        key={time}
                        onClick={() => setDuration(time)}
                        className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all duration-200 border border-transparent ${timerDuration === time ? "text-punk-cyan bg-punk-cyan/10 border-punk-cyan/20 shadow-[0_0_15px_rgba(0,243,255,0.15)]" : "text-punk-dim hover:text-white hover:bg-white/5"}`}
                      >
                        {time}s
                      </button>
                    ))
                  : [10, 25, 50, 100].map((count) => (
                      <button
                        key={count}
                        onClick={() => setWordCount(count)}
                        className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all duration-200 border border-transparent ${wordCount === count ? "text-punk-magenta bg-punk-magenta/10 border-punk-magenta/20 shadow-[0_0_15px_rgba(255,0,255,0.15)]" : "text-punk-dim hover:text-white hover:bg-white/5"}`}
                      >
                        {count}
                      </button>
                    ))}
              </div>
            </div>

            {/* Fullscreen Toggle - Separate and larger */}
            <button
              onClick={toggleFullscreen}
              className="p-3 text-punk-dim hover:text-punk-cyan transition-all duration-300 bg-punk-surface/50 hover:bg-punk-surface border border-white/5 hover:border-punk-cyan/30 rounded-xl"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
            </button>
          </div>
        </header>

        {/* Stats & Timer Bar */}
        <div
          className={`flex items-center justify-between px-8 py-5 glass-panel rounded-2xl mx-auto w-full max-w-4xl transition-all duration-300 ${isFullscreen ? "scale-110 my-8" : ""}`}
        >
          <Timer />
          <StatsDisplay />
        </div>

        {/* Main Typing Area */}
        <div
          className={`relative min-h-[300px] flex items-center justify-center transition-all duration-300 ${isFullscreen ? "grow" : ""}`}
        >
          <div className="absolute -top-12 left-0 text-[10px] text-punk-dim/30 font-mono flex flex-col gap-1">
            <span>// SYSTEM_READY</span>
            <span>
              // MODE: {testMode.toUpperCase()}_
              {testMode === "time" ? timerDuration : wordCount}
            </span>
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
