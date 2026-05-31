"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MessageSquareQuote,
  ListChecks,
  FileText,
  ArrowRight,
  Inbox,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/shell/app-shell";
import { TeacherSidebar } from "@/components/shell/teacher-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { PageAnim } from "@/components/shell/page-anim";
import { useDemo, type ScaffoldingAnswer } from "@/lib/demo-store";
import { cn } from "@/lib/utils";

/**
 * Teacher submissions / provenance view. Reflects the new model
 * where the student picked one worksheet question and follow-ups
 * were drafted from their own brain-dump.
 *
 * The framing is warm — a window into how the student worked, not
 * audit / surveillance.
 */
type Tab = "first" | "working" | "submitted";

export default function TeacherReviewPage() {
  const { state, hydrated } = useDemo();
  const [tab, setTab] = useState<Tab>("submitted");

  const selectedQuestion = useMemo(
    () =>
      state.worksheetQuestions.find((q) => q.id === state.selectedQuestionId),
    [state.worksheetQuestions, state.selectedQuestionId],
  );

  const studentName = "Mira"; // mocked
  const subjectLine = "Reading · Lighthouse passage";

  const tabs = useMemo(
    () =>
      [
        {
          id: "first" as const,
          label: "First thoughts",
          icon: MessageSquareQuote,
          subtitle: "Raw brain-dump",
        },
        {
          id: "working" as const,
          label: "Working through it",
          icon: ListChecks,
          subtitle: `${state.answers.filter((a) => !a.skipped).length} of ${state.answers.length} answered`,
        },
        {
          id: "submitted" as const,
          label: "Submitted",
          icon: FileText,
          subtitle: "Final answer",
        },
      ],
    [state.answers],
  );

  if (!hydrated) {
    return (
      <AppShell
        sidebar={<TeacherSidebar current="submissions" />}
        topbar={<Topbar eyebrow="Teacher · submissions" />}
        contentWidth="wide"
      >
        <div className="h-[60vh]" />
      </AppShell>
    );
  }

  if (!state.submitted) {
    return (
      <AppShell
        sidebar={<TeacherSidebar current="submissions" />}
        topbar={<Topbar eyebrow="Teacher · submissions" />}
      >
        <div className="mx-auto max-w-xl pt-4 text-center">
          <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-canvas-deep text-ink-soft">
            <Inbox className="h-7 w-7" strokeWidth={2} />
          </span>
          <h1 className="mt-6 text-[26px] sm:text-[30px] font-bold text-ink leading-[1.2]">
            Nothing here yet.
          </h1>
          <p className="mt-3 text-body text-ink-soft reading-leading max-w-[46ch] mx-auto">
            Submissions will appear here as your students finish. Want to
            preview what they see?
          </p>
          <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Link href="/teacher">
              <Button size="lg" variant="ghost" className="w-full sm:w-auto">
                Back to worksheet prep
              </Button>
            </Link>
            <Link href="/student">
              <Button size="lg" className="w-full sm:w-auto">
                Walk the student flow
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </Button>
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebar={<TeacherSidebar current="submissions" />}
      topbar={<Topbar eyebrow={`Teacher · ${subjectLine}`} />}
      contentWidth="wide"
    >
      <PageAnim>
        <PageAnim.Item>
          <h1 className="text-[30px] sm:text-[36px] leading-[1.18] font-bold text-ink">
            See how {studentName} worked through this.
          </h1>
          <p className="mt-3 text-body text-ink-soft reading-leading max-w-[64ch]">
            A trail of {studentName}&apos;s thinking — from their first messy
            thoughts, through the follow-up prompts drafted from their own
            words, to the answer they chose to submit.
          </p>
        </PageAnim.Item>

        <PageAnim.Item>
          <div className="mt-8 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
            <aside>
              <div className="rounded-2xl border border-ink/[0.07] bg-canvas-card p-2 shadow-soft">
                <ul className="space-y-0.5">
                  {tabs.map((t) => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => setTab(t.id)}
                          className={cn(
                            "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300",
                            active
                              ? "bg-ink text-canvas"
                              : "hover:bg-canvas-deep",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <span
                            className={cn(
                              "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              active
                                ? "bg-canvas/15 text-canvas"
                                : "bg-canvas-deep/80 text-ink-mute",
                            )}
                          >
                            <Icon className="h-4 w-4" strokeWidth={2} />
                          </span>
                          <span>
                            <span
                              className={cn(
                                "block text-body-sm font-bold",
                                active ? "text-canvas" : "text-ink",
                              )}
                            >
                              {t.label}
                            </span>
                            <span
                              className={cn(
                                "block text-[13px]",
                                active
                                  ? "text-canvas/75"
                                  : "text-ink-mute",
                              )}
                            >
                              {t.subtitle}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-sage-200 bg-sage-50/40 p-4">
                <p className="inline-flex items-center gap-1.5 text-eyebrow text-sage-700">
                  <Heart className="h-3.5 w-3.5" strokeWidth={2.25} />A note
                </p>
                <p className="mt-2 text-body-sm text-ink-soft reading-leading">
                  This view is for you to see how your student got here.
                  The submitted answer is in their own words — we only
                  reorganised punctuation and structure.
                </p>
              </div>
            </aside>

            <section>
              <div className="overflow-hidden rounded-3xl border border-ink/[0.07] bg-canvas-card shadow-soft">
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/[0.06] px-6 py-5">
                  <div>
                    <p className="text-eyebrow">
                      {selectedQuestion
                        ? `Question ${selectedQuestion.number} · the one ${studentName} chose`
                        : "Question chosen by the student"}
                    </p>
                    <p className="mt-2 text-body text-ink reading-leading max-w-[58ch]">
                      {selectedQuestion?.text ??
                        "No question selection on file."}
                    </p>
                  </div>
                  <span className="hidden shrink-0 rounded-full bg-sage-100 px-3 py-1 text-body-sm font-bold text-sage-700 sm:inline-flex">
                    Submitted
                  </span>
                </header>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="px-6 py-6 sm:px-8 sm:py-7"
                  >
                    {tab === "first" && (
                      <FirstThoughts text={state.brainDump} />
                    )}
                    {tab === "working" && (
                      <WorkingThrough answers={state.answers} />
                    )}
                    {tab === "submitted" && (
                      <Submitted text={state.tidiedDraft} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </div>
        </PageAnim.Item>
      </PageAnim>
    </AppShell>
  );
}

function FirstThoughts({ text }: { text: string }) {
  return (
    <div>
      <p className="text-eyebrow text-sage-700">
        How they got started · their own words
      </p>
      <blockquote className="mt-4 rounded-2xl border-l-4 border-sage-300 bg-sage-50/40 px-5 py-4 text-body text-ink reading-leading">
        {text ? (
          <span>&ldquo;{text}&rdquo;</span>
        ) : (
          <span className="text-ink-mute">
            No brain-dump was captured for this attempt.
          </span>
        )}
      </blockquote>
      <p className="mt-4 text-body-sm text-ink-mute reading-leading max-w-[60ch]">
        We preserve the raw transcript on purpose — the &ldquo;um&rdquo;s and
        false starts are part of their thinking, not noise to clean up.
      </p>
    </div>
  );
}

function WorkingThrough({ answers }: { answers: ScaffoldingAnswer[] }) {
  return (
    <div>
      <p className="text-eyebrow text-mist-700">
        Follow-ups · drafted from their own words
      </p>
      <ol className="mt-5 space-y-3">
        {answers.length === 0 && (
          <li className="text-body text-ink-mute">
            No follow-up answers on file.
          </li>
        )}
        {answers.map((a, i) => (
          <li
            key={a.questionId}
            className="rounded-2xl border border-ink/[0.07] bg-canvas px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas-deep text-[13px] font-bold text-ink-soft"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-body-sm font-bold text-ink reading-leading">
                  {a.questionText}
                </p>
                {a.skipped ? (
                  <p className="mt-2 text-body text-ink-mute">
                    Skipped — they chose to move on.
                  </p>
                ) : a.answer.trim() ? (
                  <p className="mt-2 text-body text-ink reading-leading max-w-[60ch]">
                    {a.answer}
                  </p>
                ) : (
                  <p className="mt-2 text-body text-ink-mute">
                    No answer recorded.
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Submitted({ text }: { text: string }) {
  return (
    <div>
      <p className="inline-flex items-center gap-2 text-eyebrow text-sage-700">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        Submitted answer · their own words, tidied
      </p>
      <p className="mt-4 text-lede text-ink reading-leading max-w-[60ch]">
        {text || (
          <span className="text-ink-mute">No submission on file yet.</span>
        )}
      </p>
      <div className="mt-6 rounded-2xl border border-ink/[0.07] bg-canvas px-5 py-4">
        <p className="text-eyebrow">What we adjusted</p>
        <ul className="mt-2 space-y-1 text-body-sm text-ink-soft reading-leading">
          <li>· Sentence breaks and paragraph structure</li>
          <li>· Capitalisation at the start of sentences</li>
          <li>· Removed a few filler words (&ldquo;um&rdquo;, &ldquo;like,&rdquo;)</li>
          <li>· Nothing was rewritten, added, or reordered</li>
        </ul>
      </div>
    </div>
  );
}
