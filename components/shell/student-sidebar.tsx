"use client";

import Link from "next/link";
import { Check, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { PeakMark } from "@/components/shell/peak-mark";
import { ReadAloud } from "@/components/student/read-aloud";
import {
  useDemo,
  useSelectedWorksheetQuestion,
} from "@/lib/demo-store";
import { cn } from "@/lib/utils";

export type StudentStepId = "pick" | "think" | "scaffolding" | "review" | "done";

const STEPS: { id: StudentStepId; label: string; href: string }[] = [
  { id: "pick", label: "Pick a question", href: "/student" },
  { id: "think", label: "First thoughts", href: "/student/think" },
  { id: "scaffolding", label: "Follow-ups", href: "/student/scaffolding" },
  { id: "review", label: "Your answer", href: "/student/review" },
];

/**
 * Sidebar for the student flow.
 *
 *   1. Brand
 *   2. Progress steps (current highlighted; completed clickable to go
 *      back; future steps disabled).
 *   3. Context cards — the worksheet question and the brain-dump
 *      quote — so the student is never more than one glance away
 *      from their own words.
 *   4. Reset demo footer.
 */
export function StudentSidebar({ current }: { current: StudentStepId }) {
  const { state, reset } = useDemo();
  const selected = useSelectedWorksheetQuestion();
  const router = useRouter();

  // Determine which step is "done" for the indicator dot — based on
  // actual state, not just position relative to the current step.
  const done: Record<StudentStepId, boolean> = {
    pick: Boolean(state.selectedQuestionId),
    think: state.brainDump.trim().length > 0,
    scaffolding:
      state.scaffolding.length > 0 &&
      state.answers.some((a) => a.answer.trim() || a.skipped),
    review: state.tidiedDraft.trim().length > 0,
    done: state.submitted,
  };

  const showQuestionContext = Boolean(selected) && current !== "pick";
  const showBrainDumpContext =
    state.brainDump.trim().length > 0 && (current === "scaffolding" || current === "review");

  return (
    <div className="flex h-full min-h-screen flex-col px-4 pb-6">
      <div className="px-2 pt-6">
        <PeakMark />
      </div>

      <nav aria-label="Reading task progress" className="mt-8 px-1">
        <p className="px-2 text-eyebrow">Reading task</p>
        <ol className="mt-3 space-y-1">
          {STEPS.map((step, i) => {
            const isCurrent = step.id === current;
            const isDone = done[step.id] && !isCurrent;
            // Allow back-navigation only to completed steps.
            const isClickable = isDone || isCurrent;

            const inner = (
              <span
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-[15px] transition-colors",
                  isCurrent &&
                    "bg-ink text-canvas font-semibold shadow-soft",
                  !isCurrent &&
                    isDone &&
                    "text-ink-soft hover:bg-canvas-card hover:text-ink",
                  !isCurrent &&
                    !isDone &&
                    "text-ink-faint",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold",
                    isCurrent && "bg-canvas text-ink",
                    isDone && !isCurrent && "bg-sage-100 text-sage-700",
                    !isCurrent && !isDone && "bg-canvas-deep/80 text-ink-faint",
                  )}
                  aria-hidden
                >
                  {isDone ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className="truncate">{step.label}</span>
              </span>
            );

            return (
              <li key={step.id}>
                {isClickable ? (
                  <Link
                    href={step.href}
                    aria-current={isCurrent ? "page" : undefined}
                    className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300"
                  >
                    {inner}
                  </Link>
                ) : (
                  <span
                    className="block cursor-not-allowed"
                    aria-disabled="true"
                  >
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {(showQuestionContext || showBrainDumpContext) && (
        <section className="mt-7 space-y-3 px-1">
          {showQuestionContext && selected && (
            <article className="rounded-2xl border border-ink/[0.07] bg-canvas-card p-3 shadow-soft">
              <header className="flex items-center justify-between gap-2">
                <p className="text-eyebrow text-ink-mute">
                  Question {selected.number}
                </p>
                <ReadAloud
                  id={`sidebar-q-${selected.id}`}
                  text={selected.text}
                  label="Listen"
                  className="-mr-1"
                />
              </header>
              <p className="mt-2 text-[14px] leading-[1.55] text-ink">
                {selected.text}
              </p>
            </article>
          )}

          {showBrainDumpContext && (
            <article className="rounded-2xl border border-sage-200 bg-sage-50/40 p-3">
              <p className="text-eyebrow text-sage-700">Your first thoughts</p>
              <p className="mt-1.5 line-clamp-5 text-[13.5px] leading-[1.55] text-ink-soft">
                &ldquo;{state.brainDump.trim()}&rdquo;
              </p>
            </article>
          )}
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
