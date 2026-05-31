"use client";

import { Volume2, Square } from "lucide-react";
import { useId } from "react";

import { useSpeech } from "@/lib/use-speech";
import { cn } from "@/lib/utils";

/**
 * Read-aloud control. Backed by the real Web Speech API.
 *
 * Pass `text` to have something specific read. Without `text`, the
 * button is purely a state demonstration and won't actually speak —
 * useful as a placeholder, but most usages should pass the text.
 */
export function ReadAloud({
  text,
  id,
  className,
  label = "Read aloud",
}: {
  text?: string;
  id?: string;
  className?: string;
  label?: string;
}) {
  const fallbackId = useId();
  const controlId = id ?? fallbackId;
  const { speak, speakingId, supported } = useSpeech();
  const reading = speakingId === controlId;

  const onClick = () => {
    if (!text) return;
    speak(controlId, text);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!text || !supported}
      aria-pressed={reading}
      aria-label={
        reading ? "Stop reading" : text ? label : "Read aloud (no text)"
      }
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-body-sm font-semibold transition-colors",
        reading
          ? "bg-mist-100 text-mist-700"
          : "text-mist-700 hover:bg-mist-50",
        (!text || !supported) && "opacity-60 cursor-not-allowed",
        className,
      )}
    >
      {reading ? (
        <Square className="h-3.5 w-3.5 fill-current" strokeWidth={2} />
      ) : (
        <Volume2 className="h-3.5 w-3.5" strokeWidth={2} />
      )}
      <span>{reading ? "Stop" : label}</span>
    </button>
  );
}
