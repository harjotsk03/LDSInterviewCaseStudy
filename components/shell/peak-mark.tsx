"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The PEAK brand mark — a tiny stylised mountain. Used everywhere
 * the brand appears so the logo treatment is identical on every
 * surface. Defaults to a link to the landing page; pass
 * `interactive={false}` for a non-clickable usage (e.g. a print
 * surface).
 */
export function PeakMark({
  size = 22,
  withWordmark = true,
  className,
  interactive = true,
  href = "/",
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
  interactive?: boolean;
  href?: string;
}) {
  const body = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5",
        className,
      )}
    >
      <span
        className="inline-flex items-center justify-center rounded-xl bg-sage-100"
        style={{ width: size + 12, height: size + 12 }}
        aria-hidden
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden
        >
          <path
            d="M3 18 L9 6 L13 13 L15 10 L19 18 Z"
            fill="#6E9A66"
            stroke="#4F7548"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {withWordmark && (
        <span className="text-[15px] font-bold tracking-comfy text-ink">
          PEAK
        </span>
      )}
    </span>
  );

  if (!interactive) return body;
  return (
    <Link
      href={href}
      className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300"
      aria-label="PEAK — home"
    >
      {body}
    </Link>
  );
}
