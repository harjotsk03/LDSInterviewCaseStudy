"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "md" | "lg" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  // Primary — soft sage. The "your words" colour. Calm, never alarming.
  primary:
    "bg-sage-500 text-canvas hover:bg-sage-700 active:bg-sage-700 disabled:bg-sage-200 disabled:text-canvas/80 shadow-soft",
  // Secondary — pale mist. Used for AI-touched / system actions.
  secondary:
    "bg-mist-100 text-mist-700 hover:bg-mist-200 active:bg-mist-200 border border-mist-200",
  // Ghost — outlined, for low-emphasis actions.
  ghost:
    "bg-transparent text-ink hover:bg-canvas-deep border border-ink/15",
  // Quiet — text-only, for "Skip" style links that should not look judgmental.
  quiet:
    "bg-transparent text-ink-soft hover:text-ink hover:bg-canvas-deep",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-[15px] rounded-lg",
  md: "h-12 px-5 text-[16px] rounded-xl",
  // 56px tall, comfortably above the 44px WCAG AAA motor minimum.
  lg: "h-14 px-7 text-[18px] rounded-xl2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", type = "button", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          // Labels must never wrap inside a button — keeps two-word
          // labels like "Done thinking" on one line, even in narrow
          // flex/grid contexts. Parents are responsible for stacking.
          "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-comfy",
          "transition-colors duration-150",
          "disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...rest}
      />
    );
  },
);
