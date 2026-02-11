"use client";

import { useTypingStore } from "@/store/useTypingStore";
import { calculateWPM, calculateAccuracy } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw } from "lucide-react";

export default function ResultsModal() {
  const {
    status,
    correctCharCount,
    errorCharCount,
    totalKeystrokes,
    timerDuration,
    resetTest,
  } = useTypingStore();

  if (status !== "finished") return null;

  const wpm = calculateWPM(correctCharCount, timerDuration); // Full duration used for final Calc? Or actual time elapsed if finished early?
  // Ideally track actual duration. For now assume full duration if time ran out, or we need to track `endTime`.
  // Let's stick to timerDuration for simplicity if time ran out. If finished earlier (completed text), we might need `timeRemaining`.
  // But `timerDuration` is "safe" for fixed time mode.

  const accuracy = calculateAccuracy(correctCharCount, totalKeystrokes);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-punk-bg/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="glass-panel p-8 md:p-12 rounded-2xl w-full max-w-2xl mx-4 flex flex-col items-center gap-8 border border-punk-cyan/20 box-shadow-neon"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              System Hacked
            </h2>
            <p className="text-punk-dim">Upload Complete</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
            <StatResult
              label="WPM"
              value={wpm}
              color="text-punk-cyan"
              delay={0.1}
            />
            <StatResult
              label="Accuracy"
              value={accuracy + "%"}
              color="text-punk-magenta"
              delay={0.2}
            />
            <StatResult
              label="Errors"
              value={errorCharCount}
              color="text-punk-red"
              delay={0.3}
            />
            <StatResult
              label="Chars"
              value={`${correctCharCount}/${totalKeystrokes}`}
              color="text-white"
              delay={0.4}
            />
          </div>

          <button
            onClick={resetTest}
            className="group flex items-center gap-3 px-8 py-3 mt-4 bg-punk-cyan/10 hover:bg-punk-cyan/20 border border-punk-cyan/50 hover:border-punk-cyan text-punk-cyan rounded-full transition-all duration-300 outline-none focus:ring-2 ring-punk-cyan/50"
          >
            <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-mono font-bold tracking-widest">
              REBOOT SYSTEM
            </span>
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const StatResult = ({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="flex flex-col items-center gap-2"
  >
    <span className="text-xs uppercase tracking-widest text-punk-dim">
      {label}
    </span>
    <span className={`text-3xl md:text-4xl font-bold ${color}`}>{value}</span>
  </motion.div>
);
