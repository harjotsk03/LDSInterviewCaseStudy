"use client";

import { cn } from "@/lib/utils";

/**
 * A calm, dot-style step indicator. No urgency, no countdown.
 * Filled dots = answered, hollow = upcoming, ring = current.
 */
export function StepDots({
  total,
  currentIndex,
  answeredIndices,
  className,
}: {
  total: number;
  currentIndex: number;
  answeredIndices: number[];
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={currentIndex + 1}
      aria-label={`Question ${currentIndex + 1} of ${total}`}
      className={cn("flex items-center gap-2.5", className)}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isCurrent = i === currentIndex;
        const isAnswered = answeredIndices.includes(i);
        return (
          <span
            key={i}
            aria-hidden
            className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              isCurrent && "ring-2 ring-sage-300 ring-offset-2 ring-offset-canvas bg-sage-500 h-3 w-3",
              !isCurrent && isAnswered && "bg-sage-300",
              !isCurrent && !isAnswered && "bg-ink/15",
            )}
          />
        );
      })}
      <span className="ml-3 text-body-sm text-ink-soft">
        {currentIndex + 1} of {total}
      </span>
    </div>
  );
}
