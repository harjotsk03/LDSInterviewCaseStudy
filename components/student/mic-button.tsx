"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Pencil } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The mic is the primary input affordance for students. It is large,
 * centered, and visually obvious. It is NEVER red.
 *
 * Behaviour:
 *  - Click → "listening" state with soft pulsing rings.
 *  - The supplied `mockTranscript` is streamed in via onTranscriptChunk
 *    a few words at a time so it feels like real speech-to-text.
 *  - Click again → stop. Caller can then advance.
 *
 * We deliberately do not use the real Web Speech API. The deck demos
 * a designed experience; a real recogniser is noisy and inconsistent.
 */
export function MicButton({
  mockTranscript,
  onTranscriptChunk,
  onStateChange,
  disabled,
  className,
}: {
  mockTranscript: string;
  onTranscriptChunk: (chunk: string) => void;
  onStateChange?: (state: "idle" | "listening") => void;
  disabled?: boolean;
  className?: string;
}) {
  const [listening, setListening] = useState(false);
  const reduceMotion = useReducedMotion();
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      // Clear any in-flight chunk timers if the component unmounts mid-stream.
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const startListening = () => {
    if (disabled || listening) return;
    setListening(true);
    onStateChange?.("listening");

    // Stream the mock transcript in 2–4 word chunks with a small initial
    // "I'm listening…" delay, so it feels like a real STT pipeline.
    const words = mockTranscript.split(/\s+/);
    let cursor = 0;
    const queueChunk = (delay: number) => {
      const t = window.setTimeout(() => {
        if (cursor >= words.length) return;
        const chunkSize = Math.min(
          words.length - cursor,
          2 + Math.floor(Math.random() * 3),
        );
        const next = words.slice(cursor, cursor + chunkSize).join(" ") + " ";
        cursor += chunkSize;
        onTranscriptChunk(next);
        if (cursor < words.length) queueChunk(220 + Math.random() * 260);
      }, delay);
      timersRef.current.push(t);
    };
    queueChunk(900);
  };

  const stopListening = () => {
    setListening(false);
    onStateChange?.("idle");
    clearTimers();
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className,
      )}
    >
      <button
        type="button"
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Start speaking"}
        onClick={listening ? stopListening : startListening}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-24 w-24 items-center justify-center rounded-full",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mist-200",
          listening
            ? "bg-sage-500 text-canvas shadow-lift"
            : "bg-sage-100 text-sage-700 hover:bg-sage-200 shadow-soft",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {/* Pulsing rings — calm, sage, opt-out under reduce-motion. */}
        {listening && !reduceMotion && (
          <>
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-sage-300/60"
              initial={{ scale: 1, opacity: 0.55 }}
              animate={{ scale: 1.6, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.span
              aria-hidden
              className="absolute inset-0 rounded-full bg-sage-300/40"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.4,
              }}
            />
          </>
        )}
        {listening ? (
          <MicOff className="relative h-9 w-9" strokeWidth={2} />
        ) : (
          <Mic className="relative h-9 w-9" strokeWidth={2} />
        )}
      </button>

      <div className="text-center">
        <p className="text-body text-ink">
          {listening ? "Listening — take your time" : "Tap to speak"}
        </p>
        <p className="mt-1 text-body-sm text-ink-mute">
          {listening
            ? "Speak in fragments, change your mind, pause. That's fine."
            : "Or, if you prefer:"}
        </p>
      </div>

      {!listening && (
        <button
          type="button"
          className="inline-flex items-center gap-2 text-body-sm text-mist-700 underline-offset-4 hover:underline focus-visible:underline"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} />
          type instead
        </button>
      )}
    </div>
  );
}
