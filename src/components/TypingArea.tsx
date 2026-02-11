"use client";

import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useSound } from "@/hooks/useSound";
import { Volume2, VolumeX } from "lucide-react";

export default function TypingArea() {
  const { text, userInput, status, handleInput, resetTest } = useTypingStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const { playClick, initAudio } = useSound(soundEnabled);
  const [railOffset, setRailOffset] = useState(0);

  // Focus input on click
  const focusInput = () => {
    inputRef.current?.focus();
    initAudio();
  };

  useEffect(() => {
    focusInput();
    if (!text) resetTest();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInput(e.target.value);
    playClick();
  };

  // Handling Reset with Tab and Focus with Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        resetTest();
      }
      if (e.key === "Enter" && !isFocused) {
        e.preventDefault();
        focusInput();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetTest, isFocused]);

  // Calculate Rail Offset to center active word
  useLayoutEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const activeWordLeft = activeWordRef.current.offsetLeft;
      const activeWordWidth = activeWordRef.current.offsetWidth;

      // Calculate offset to center the active word
      // We want: containerCenter = activeWordLeft + offset + activeWordWidth/2
      // offset = containerCenter - activeWordLeft - activeWordWidth/2
      const targetOffset =
        containerWidth / 2 - activeWordLeft - activeWordWidth / 2;

      setRailOffset(targetOffset);
    }
  }, [userInput, text]); // Re-calc when input changes (word might change)

  // Split text into words
  const words = useMemo(() => text.split(" "), [text]);
  const userChars = userInput.split("");

  // Calculate distinct word boundaries
  let globalCharIndex = 0;
  const wordObjects = words.map((word, index) => {
    const start = globalCharIndex;
    const end = start + word.length;
    globalCharIndex += word.length + 1; // +1 for space
    return { word, start, end, index };
  });

  return (
    <div
      className="relative w-full max-w-5xl mx-auto outline-none select-none cursor-text perspective-1000"
      onClick={focusInput}
    >
      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 opacity-0 z-0 cursor-default"
        value={userInput}
        onChange={handleChange}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Focus Overlay */}
      {!isFocused && status !== "finished" && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-punk-bg/80 backdrop-blur-sm pointer-events-none rounded-2xl border border-punk-cyan/20">
          <span className="text-punk-cyan text-xl animate-pulse font-mono tracking-widest text-glow-cyan">
            &gt; CLICK_TO_INITIALIZE_LINK
          </span>
        </div>
      )}

      {/* Sound Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSoundEnabled(!soundEnabled);
          initAudio();
        }}
        className="absolute -top-10 right-0 p-2 text-punk-dim hover:text-punk-cyan transition-colors z-30 flex items-center gap-2 text-xs font-mono border border-white/5 bg-punk-surface rounded-full"
        title={soundEnabled ? "Mute Sound" : "Enable Sound"}
      >
        {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        <span>AUDIO: {soundEnabled ? "ON" : "OFF"}</span>
      </button>

      {/* Typing Rail Container */}
      <div
        ref={containerRef}
        className="relative h-32 overflow-hidden glass-panel rounded-[24px] border-glow-cyan flex items-center px-8"
      >
        {/* Gradient Masks for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-punk-bg to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-punk-bg to-transparent z-10 pointer-events-none"></div>

        {/* Sliding Rail */}
        <motion.div
          className="flex items-center gap-4 whitespace-nowrap will-change-transform"
          animate={{ x: railOffset }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 25,
            mass: 0.5,
          }}
        >
          {wordObjects.map(({ word, start, end, index }) => {
            const isCurrentWord =
              userInput.length >= start && userInput.length <= end;
            // Determine word status for coloring mostly
            // If word is completely past (userInput.length > end), check if correct
            // But checking whole word correctness is tricky without checking every char.
            // Simpler: Just render chars.

            return (
              <div
                key={index}
                ref={isCurrentWord ? activeWordRef : null}
                className={clsx(
                  "flex text-3xl md:text-4xl font-mono font-medium tracking-wide px-3 py-2 rounded-lg transition-colors duration-200",
                  {
                    "bg-punk-cyan/10 ring-1 ring-punk-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.1)]":
                      isCurrentWord,
                    "opacity-40 blur-[1px]":
                      index <
                      wordObjects.find(
                        (w) =>
                          userInput.length >= w.start &&
                          userInput.length <= w.end,
                      )?.index! -
                        1, // Start fading previous words
                  },
                )}
              >
                {word.split("").map((char, charIdx) => {
                  const absIndex = start + charIdx;
                  const typed = userChars[absIndex];
                  const isCorrect = typed === char;
                  const isTyped = typed !== undefined;
                  const isCurrentChar = absIndex === userInput.length;

                  return (
                    <span key={charIdx} className="relative">
                      <span
                        className={clsx({
                          "text-punk-dim": !isTyped,
                          "text-punk-cyan text-glow-cyan": isTyped && isCorrect,
                          "text-punk-red text-shadow-red":
                            isTyped && !isCorrect,
                        })}
                      >
                        {char}
                      </span>

                      {/* Caret */}
                      {isCurrentChar && isFocused && (
                        <motion.div
                          layoutId="caret"
                          className="absolute -left-[2px] -top-1 -bottom-1 w-[3px] bg-punk-cyan shadow-[0_0_10px_2px_rgba(0,243,255,0.8)] rounded-full z-20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                    </span>
                  );
                })}

                {/* Space logic (Active indicator for space) */}
                {index < wordObjects.length - 1 && (
                  <div className="relative w-4">
                    {/* If this word is current and we are at the end (space position) */}
                    {userInput.length === end && isFocused && (
                      <motion.div
                        layoutId="caret"
                        className="absolute left-0 -top-1 -bottom-1 w-[3px] bg-punk-cyan shadow-[0_0_10px_2px_rgba(0,243,255,0.8)] rounded-full z-20"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    {/* Error on space */}
                    {userInput[end] && userInput[end] !== " " && (
                      <span className="absolute inset-0 h-[3px] bottom-1 bg-punk-red shadow-[0_0_8px_rgba(255,49,49,0.8)]"></span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Static Center Guide (Optional, user didn't ask but helps visual centering) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-linear-to-b from-transparent via-punk-cyan/20 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
