"use client";

import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Topbar slot for AppShell. Renders the page eyebrow on the left and
 * an optional action slot on the right. Kept deliberately thin — the
 * page title belongs in the main content, not the chrome.
 */
export function Topbar({
  eyebrow,
  title,
  actions,
  className,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-eyebrow text-ink-mute">{eyebrow}</p>
        )}
        {title && (
          <p className="mt-0.5 truncate text-body-sm font-semibold text-ink">
            {title}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
