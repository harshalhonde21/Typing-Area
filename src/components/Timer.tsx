"use client";

import { useEffect, useRef } from "react";
import { useTypingStore } from "@/store/useTypingStore";

export default function Timer() {
  const { status, timerDuration, timeRemaining, tickTimer, testMode } =
    useTypingStore();
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Initialize worker
    workerRef.current = new Worker(
      new URL("../workers/timer.worker.ts", import.meta.url),
    );

    workerRef.current.onmessage = (e: MessageEvent) => {
      const { type, timeLeft, elapsed } = e.data;
      if (type === "TICK") {
        tickTimer(timeLeft, elapsed);
      } else if (type === "DONE") {
        tickTimer(0, timerDuration); // Approx
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [tickTimer, timerDuration]);

  useEffect(() => {
    if (!workerRef.current) return;

    if (status === "running") {
      workerRef.current.postMessage({
        type: "START",
        duration: timerDuration,
        mode: testMode === "words" ? "stopwatch" : "timer",
      });
    } else if (status === "finished") {
      workerRef.current.postMessage({ type: "STOP" });
    } else if (status === "idle") {
      workerRef.current.postMessage({ type: "RESET" });
      // Ensure timer display is reset
      tickTimer(timerDuration, 0);
    }
  }, [status, timerDuration, testMode]);
  // Removed tickTimer from dependency to avoid loop, though it's stable from zustand

  // Visual display of timer
  return (
    <div className="text-punk-cyan font-mono text-xl md:text-2xl font-bold tracking-widest text-glow-cyan">
      {timeRemaining}s
    </div>
  );
}
