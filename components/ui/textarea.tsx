"use client";

import { useEffect, useRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  autoGrow?: boolean;
};

export function Textarea({ className, autoGrow = true, ...rest }: Props) {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!autoGrow || !ref.current) return;
    const el = ref.current;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 0)}px`;
  }, [autoGrow, rest.value]);

  return (
    <textarea
      ref={ref}
      // No spell-correction underlines — they read as "wrong" cues to this
      // population. Students can still spell-check by choice elsewhere.
      spellCheck={false}
      className={cn(
        "block w-full resize-none rounded-xl2 border border-ink/10",
        "bg-canvas-card px-5 py-4 text-body text-ink placeholder:text-ink-faint",
        "focus:border-mist-300 focus:outline-none focus:ring-2 focus:ring-mist-200/60",
        "transition-colors",
        className,
      )}
      {...rest}
    />
  );
}
