"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { motion } from "framer-motion";
import clsx from "clsx";

export default function TypingArea() {
  const { text, userInput, status, handleInput, resetTest } = useTypingStore();
  // Using a hidden input to capture typing on mobile too, but keeping focus
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Focus input on click
  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    // Auto focus on mount
    focusInput();
    // Also reset on mount if no text
    if (!text) resetTest();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInput(e.target.value);
  };

  // Prevent cursor moving in input (we just want the value)
  // Actually, we need to handle backspace and such properly.
  // The store generic handleInput takes the full string.
  // We need to keep the input value in sync.

  // But we want to prevent default behavior for some keys if needed?
  // No, let native input handle composition provided we just take the value.

  // Handling Reset with Tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        resetTest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [resetTest]);

  // Split text into words for rendering
  const words = useMemo(() => text.split(" "), [text]);
  const userChars = userInput.split("");

  // Character rendering logic
  // We need to map global distinct characters to words for word wrapping.

  let globalCharIndex = 0;

  return (
    <div
      className="relative w-full max-w-4xl mx-auto min-h-[150px] outline-none select-none cursor-text"
      onClick={focusInput}
    >
      {/* Hidden Input for capturing typing */}
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

      {/* Overlay to show "Click to focus" if blurred */}
      {!isFocused && status !== "finished" && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-punk-bg/50 backdrop-blur-sm pointer-events-none">
          <span className="text-punk-cyan text-lg animate-pulse">
            Click to focus
          </span>
        </div>
      )}

      {/* Text Display */}
      <div
        ref={containerRef}
        className="flex flex-wrap gap-x-3 gap-y-2 text-2xl md:text-3xl lg:text-4xl font-mono leading-relaxed tracking-wide text-justify"
      >
        {words.map((word, wIndex) => {
          const currentWordStart = globalCharIndex;
          const currentWordEnd = currentWordStart + word.length;
          // including space after word if not last
          globalCharIndex += word.length + 1;

          const isCurrentWord =
            userInput.length >= currentWordStart &&
            userInput.length <= currentWordEnd;

          return (
            <div key={wIndex} className="relative flex">
              {word.split("").map((char, cIndex) => {
                const charAbsIndex = currentWordStart + cIndex;
                const typed = userChars[charAbsIndex];
                const isCorrect = typed === char;
                const isTyped = typed !== undefined;
                const isCurrent = charAbsIndex === userInput.length;

                return (
                  <span
                    key={cIndex}
                    className={clsx("relative transition-colors duration-75", {
                      "text-punk-dim": !isTyped,
                      "text-punk-cyan text-glow-cyan": isTyped && isCorrect,
                      "text-punk-red": isTyped && !isCorrect,
                      "bg-punk-red/20": isTyped && !isCorrect, // Highlight error background
                    })}
                  >
                    {/* Caret */}
                    {isCurrent && isFocused && (
                      <motion.div
                        layoutId="caret"
                        className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-punk-cyan shadow-[0_0_8px_2px_rgba(0,243,255,0.8)] z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "steps(2)",
                        }}
                      />
                    )}
                    {char}
                  </span>
                );
              })}

              {/* Handle Space character (implicit between words) */}
              {/* If userInput[currentWordEnd] is typed, it should be a space. */}
              {/* We can visualize incorrect space as a red box. */}
              {wIndex < words.length - 1 && (
                <span
                  className={clsx("relative inline-block w-2", {
                    "bg-punk-red/50":
                      userInput[currentWordEnd] &&
                      userInput[currentWordEnd] !== " ",
                  })}
                >
                  {/* Caret on space */}
                  {userInput.length === currentWordEnd && isFocused && (
                    <motion.div
                      layoutId="caret"
                      className="absolute -left-[2px] top-0 bottom-0 w-[2px] bg-punk-cyan shadow-[0_0_8px_2px_rgba(0,243,255,0.8)] z-10"
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "steps(2)",
                      }}
                    />
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
