"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileEdit,
  Inbox,
  Send,
  RotateCcw,
} from "lucide-react";

import { PeakMark } from "@/components/shell/peak-mark";
import { useDemo } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export type TeacherStepId = "worksheet" | "sent" | "submissions";

const NAV: {
  id: TeacherStepId;
  label: string;
  href: string;
  icon: typeof FileEdit;
}[] = [
  { id: "worksheet", label: "Worksheet prep", href: "/teacher", icon: FileEdit },
  { id: "sent", label: "Sent to student", href: "/teacher/sent", icon: Send },
  {
    id: "submissions",
    label: "Submissions",
    href: "/teacher/review",
    icon: Inbox,
  },
];

/**
 * Sidebar for the teacher flow. A simple section nav — not a
 * progress indicator, because teachers move between these views
 * freely rather than in a strict order.
 */
export function TeacherSidebar({ current }: { current: TeacherStepId }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, reset } = useDemo();

  return (
    <div className="flex h-full min-h-screen flex-col px-4 pb-6">
      <div className="px-2 pt-6">
        <PeakMark />
      </div>

      <p className="mt-7 px-3 text-eyebrow">Teacher</p>

      <nav aria-label="Teacher sections" className="mt-3 px-1">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isCurrent =
              item.id === current || pathname === item.href;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300",
                    isCurrent
                      ? "bg-ink text-canvas font-semibold shadow-soft"
                      : "text-ink-soft hover:bg-canvas-card hover:text-ink",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      isCurrent
                        ? "bg-canvas/15 text-canvas"
                        : "bg-canvas-deep/70 text-ink-soft",
                    )}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {state.submitted && (
        <section className="mt-7 rounded-2xl border border-sage-200 bg-sage-50/40 p-3.5">
          <p className="text-eyebrow text-sage-700">Latest submission</p>
          <p className="mt-1.5 text-[13.5px] leading-[1.55] text-ink-soft">
            Mira finished one question. Open Submissions to see her
            thinking trail.
          </p>
        </section>
      )}

      <div className="mt-auto px-1 pt-6">
        <button
          type="button"
          onClick={() => {
            reset();
            router.push("/");
          }}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-ink/10 bg-canvas-card px-3 py-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-ink/20 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300"
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          Reset the demo
        </button>
      </div>
    </div>
  );
}
