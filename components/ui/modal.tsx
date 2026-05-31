"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

/**
 * A calm, accessible modal dialog. Used for the "Here's what's next"
 * explanation between the brain-dump and follow-ups, where it matters
 * that the student is told — clearly and without surprise — what the
 * next step is. No autoplay, no dismissable timers, ESC + backdrop
 * always close it.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
  accent = "mist",
  icon,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  accent?: "mist" | "sage";
  icon?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Focus the dialog when it opens so screen readers announce it and
  // keyboard users land inside. We focus the container; the primary
  // action's own tabindex behaviour takes over from there.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      dialogRef.current?.focus();
    }, 30);
    return () => window.clearTimeout(t);
  }, [open]);

  // ESC closes the dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open so the backdrop feels stable.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Render via portal so the modal isn't constrained by ancestor
  // overflow / transform contexts.
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: "easeOut",
            }}
            className="relative z-10 w-full max-w-md rounded-xl2 border border-ink/10 bg-canvas-card p-6 sm:p-7 shadow-lift focus:outline-none"
          >
            {icon && (
              <div
                className={cn(
                  "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full",
                  accent === "sage"
                    ? "bg-sage-100 text-sage-700"
                    : "bg-mist-100 text-mist-700",
                )}
                aria-hidden
              >
                {icon}
              </div>
            )}
            <h2
              id="modal-title"
              className="text-[22px] font-semibold leading-[1.3] text-ink"
            >
              {title}
            </h2>
            <div className="mt-3 text-body text-ink-soft leading-[1.55]">
              {children}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              {secondaryAction}
              {primaryAction}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
