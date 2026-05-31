"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared text-to-speech hook backed by the browser's SpeechSynthesis
 * API. We use this instead of mocking the read-aloud affordance
 * because dyslexic / dysgraphia students rely on real audio when
 * processing dense text, and the API ships in every modern browser.
 *
 * Only one utterance plays at a time. Calling `speak` with the same
 * `id` while it's already speaking acts as a toggle (stops it).
 * Calling with a different id replaces the current utterance.
 */
export function useSpeech() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  // Mirror the id in a ref so closures inside speech callbacks see
  // the latest value.
  const idRef = useRef<string | null>(null);
  idRef.current = speakingId;

  useEffect(() => {
    return () => {
      // If the component using this hook unmounts mid-speech, cancel
      // so the page doesn't keep talking to nobody.
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((id: string, text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return false;
    }
    const synth = window.speechSynthesis;

    // Toggle: same speaker tapped twice stops the current utterance.
    if (idRef.current === id) {
      synth.cancel();
      setSpeakingId(null);
      return true;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";
    utterance.onend = () => {
      if (idRef.current === id) setSpeakingId(null);
    };
    utterance.onerror = () => {
      if (idRef.current === id) setSpeakingId(null);
    };
    setSpeakingId(id);
    synth.speak(utterance);
    return true;
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  }, []);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  return { speak, stop, speakingId, supported };
}
