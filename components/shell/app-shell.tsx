"use client";

import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

/**
 * App shell. Sidebar on the left, main column on the right.
 *
 *   ┌──────────────┬──────────────────────────────────┐
 *   │              │ optional topbar (page eyebrow)   │
 *   │   sidebar    ├──────────────────────────────────┤
 *   │   (sticky)   │ main content (scrollable)        │
 *   │              ├──────────────────────────────────┤
 *   │              │ sticky bottom bar (primary CTA)  │
 *   └──────────────┴──────────────────────────────────┘
 *
 * Layout properties:
 *  - On lg+, sidebar is permanently visible at 288px.
 *  - On smaller viewports the sidebar collapses to a top sheet that
 *    the student opens with a menu button — keeps the main content
 *    full-width on a phone.
 *  - The bottom bar uses `position: sticky` inside the flex column so
 *    it always hugs the bottom of the visible area, without ever
 *    overlapping the main content.
 *  - The shell sets a single `max-w-5xl` content container — slightly
 *    narrower than the dashboard reference — to keep line lengths
 *    inside the BDA-recommended reading width.
 */
export function AppShell({
  sidebar,
  topbar,
  bottomBar,
  children,
  mainClassName,
  contentWidth = "default",
}: {
  sidebar?: ReactNode;
  topbar?: ReactNode;
  bottomBar?: ReactNode;
  children: ReactNode;
  mainClassName?: string;
  /** "default" = max-w-5xl; "wide" = max-w-6xl for dashboard-style screens. */
  contentWidth?: "default" | "wide" | "narrow";
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const maxW =
    contentWidth === "wide"
      ? "max-w-6xl"
      : contentWidth === "narrow"
        ? "max-w-3xl"
        : "max-w-5xl";

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar — permanent on lg+, slide-down sheet on mobile. */}
      {sidebar && (
        <>
          <aside
            className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:border-r lg:border-ink/[0.06] lg:bg-canvas-deep/30"
            aria-label="Section navigation"
          >
            <div className="sticky top-0 max-h-screen overflow-y-auto">
              {sidebar}
            </div>
          </aside>

          <AnimatePresence>
            {sheetOpen && (
              <motion.div
                className="lg:hidden fixed inset-0 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.18 }}
              >
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setSheetOpen(false)}
                  className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.28,
                    ease: [0.22, 0.61, 0.36, 1],
                  }}
                  className="relative h-full w-80 max-w-[85vw] overflow-y-auto border-r border-ink/[0.07] bg-canvas-deep shadow-lift"
                >
                  <div className="flex items-center justify-end p-3">
                    <button
                      type="button"
                      onClick={() => setSheetOpen(false)}
                      aria-label="Close menu"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft hover:bg-canvas-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300"
                    >
                      <X className="h-5 w-5" strokeWidth={2} />
                    </button>
                  </div>
                  {sidebar}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {(topbar || sidebar) && (
          <header className="sticky top-0 z-30 border-b border-ink/[0.06] bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/70">
            <div
              className={cn(
                "mx-auto flex items-center gap-3 px-5 sm:px-8 py-3",
                maxW,
              )}
            >
              {sidebar && (
                <button
                  type="button"
                  onClick={() => setSheetOpen(true)}
                  aria-label="Open menu"
                  className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft hover:bg-canvas-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300"
                >
                  <Menu className="h-5 w-5" strokeWidth={2} />
                </button>
              )}
              <div className="min-w-0 flex-1">{topbar}</div>
            </div>
          </header>
        )}

        <main
          className={cn(
            "mx-auto w-full flex-1 px-5 sm:px-8 pt-6 sm:pt-8 pb-8",
            maxW,
            mainClassName,
          )}
        >
          {children}
        </main>

        {bottomBar && (
          <div className="sticky bottom-0 z-30 border-t border-ink/[0.07] bg-canvas-card/95 backdrop-blur supports-[backdrop-filter]:bg-canvas-card/85">
            <div className={cn("mx-auto px-5 sm:px-8 py-3", maxW)}>
              {bottomBar}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
