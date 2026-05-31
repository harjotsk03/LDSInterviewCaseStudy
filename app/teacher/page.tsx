"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  Check,
  Info,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/shell/app-shell";
import { TeacherSidebar } from "@/components/shell/teacher-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { PageAnim } from "@/components/shell/page-anim";
import { SampleWorksheetImage } from "@/components/teacher/sample-worksheet-image";
import { useDemo } from "@/lib/demo-store";
import { wait } from "@/lib/utils";

type Phase = "upload" | "reading" | "review";

/**
 * Teacher Screen 1. Upload a worksheet, review parsed questions,
 * approve and send. The teacher does NOT author scaffolding prompts —
 * those are generated against the student's brain-dump later, so they
 * reflect the student's voice rather than the teacher's guess.
 */
export default function TeacherPage() {
  const router = useRouter();
  const { state, update, hydrated } = useDemo();
  const [phase, setPhase] = useState<Phase>("upload");

  if (!hydrated) {
    return (
      <AppShell
        sidebar={<TeacherSidebar current="worksheet" />}
        topbar={<Topbar eyebrow="Teacher · worksheet prep" />}
        contentWidth="wide"
      >
        <div className="h-[60vh]" />
      </AppShell>
    );
  }

  const handleUpload = async () => {
    setPhase("reading");
    await wait(1400);
    setPhase("review");
  };

  const approveAndSend = () => {
    router.push("/teacher/sent");
  };

  return (
    <AppShell
      sidebar={<TeacherSidebar current="worksheet" />}
      topbar={<Topbar eyebrow="Teacher · worksheet prep" />}
      contentWidth="wide"
      bottomBar={
        phase === "review" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 truncate text-body-sm text-ink-soft">
              {state.worksheetQuestions.length} questions ready. Your student
              picks one to focus on.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setPhase("upload")}
              >
                Re-upload
              </Button>
              <Button size="lg" onClick={approveAndSend}>
                Send to student
                <Send className="h-4 w-4" strokeWidth={2.25} />
              </Button>
            </div>
          </div>
        ) : undefined
      }
    >
      <PageAnim>
        <PageAnim.Item>
          <h1 className="text-[34px] sm:text-[40px] leading-[1.15] font-bold text-ink">
            {phase === "review"
              ? "Review and send."
              : "Upload a worksheet."}
          </h1>
          <p className="mt-3 text-body text-ink-soft reading-leading max-w-[60ch]">
            {phase === "review"
              ? "Your student will pick one question to work on. They'll think out loud first, and follow-up prompts will be drawn from what they actually say."
              : "Photograph or attach a worksheet page. We'll pull out the questions so your student can pick one to focus on."}
          </p>
        </PageAnim.Item>

        <PageAnim.Item>
          <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-3xl border border-ink/[0.07] bg-canvas-card shadow-soft">
                <div className="flex items-center justify-between border-b border-ink/[0.06] bg-canvas-deep/40 px-5 py-3">
                  <p className="text-eyebrow">Worksheet</p>
                  {phase !== "upload" && (
                    <span className="inline-flex items-center gap-1.5 text-body-sm font-semibold text-sage-700">
                      <Check className="h-4 w-4" strokeWidth={2.25} />
                      Uploaded
                    </span>
                  )}
                </div>
                <div className="bg-canvas-deep/30 p-6 sm:p-8">
                  {phase === "upload" ? (
                    <UploadDropzone onUpload={handleUpload} />
                  ) : (
                    <div className="mx-auto max-w-md">
                      <SampleWorksheetImage className="h-auto w-full" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <AnimatePresence mode="wait" initial={false}>
                {phase === "upload" && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
                  >
                    <div className="rounded-3xl border border-ink/[0.07] bg-canvas-card p-6 sm:p-8 shadow-soft">
                      <p className="text-eyebrow">What happens next</p>
                      <ol className="mt-5 space-y-4 text-body text-ink-soft">
                        <Step
                          n={1}
                          title="We read the worksheet"
                          body="Questions are pulled out so your student can pick one."
                        />
                        <Step
                          n={2}
                          title="Your student picks a question"
                          body="They can read it themselves or have it read aloud."
                        />
                        <Step
                          n={3}
                          title="They think out loud"
                          body="Voice or typing — fragments and pauses are fine."
                        />
                        <Step
                          n={4}
                          title="Follow-ups come from what they said"
                          body="Small prompts in their own words to help them organise it."
                        />
                      </ol>
                    </div>
                  </motion.div>
                )}

                {phase === "reading" && (
                  <motion.div
                    key="reading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28 }}
                  >
                    <div className="rounded-3xl border border-mist-200 bg-canvas-card p-6 sm:p-8 text-center shadow-soft">
                      <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-mist-100">
                        <Sparkles
                          className="h-6 w-6 text-mist-700 animate-pulse"
                          strokeWidth={2}
                        />
                      </div>
                      <p className="mt-5 text-body font-semibold text-ink">
                        Reading the worksheet and pulling out the questions…
                      </p>
                      <p className="mt-2 text-body-sm text-ink-mute reading-leading max-w-[44ch] mx-auto">
                        You&apos;ll see them on the right in a moment.
                      </p>
                      <ProgressShimmer className="mt-6" />
                    </div>
                  </motion.div>
                )}

                {phase === "review" && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                    className="space-y-5"
                  >
                    <div className="rounded-3xl border border-ink/[0.07] bg-canvas-card p-6 sm:p-7 shadow-soft">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-eyebrow">
                            Questions detected ·{" "}
                            {state.worksheetQuestions.length}
                          </p>
                          <p className="mt-2 text-body-sm text-ink-soft reading-leading max-w-[42ch]">
                            Your student picks one to answer. Follow-up prompts
                            come from their own words, not a fixed outline.
                          </p>
                        </div>
                      </div>

                      <ol className="mt-5 space-y-2.5">
                        {state.worksheetQuestions.map((q) => (
                          <li
                            key={q.id}
                            className="flex items-start gap-3 rounded-2xl border border-ink/[0.08] bg-canvas px-4 py-3.5"
                          >
                            <span
                              className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas-deep text-[13px] font-bold text-ink-soft"
                              aria-hidden
                            >
                              {q.number}
                            </span>
                            <p className="text-body text-ink reading-leading">
                              {q.text}
                            </p>
                          </li>
                        ))}
                      </ol>

                      <div className="mt-5 inline-flex items-start gap-2 rounded-xl bg-mist-50/60 px-3.5 py-3 text-body-sm text-mist-700 reading-leading">
                        <Info
                          className="mt-0.5 h-4 w-4 shrink-0"
                          strokeWidth={2}
                        />
                        <p>
                          Follow-up prompts are drafted after your student
                          speaks — so they sound like extensions of their
                          thinking, not a teacher&apos;s checklist.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-ink/[0.07] bg-canvas-card p-5 sm:p-6 shadow-soft">
                      <label className="flex cursor-pointer items-center justify-between gap-4">
                        <div>
                          <p className="text-body font-bold text-ink">
                            Let your student skip follow-up questions
                          </p>
                          <p className="mt-1 text-body-sm text-ink-soft reading-leading max-w-[42ch]">
                            They can move on if a follow-up isn&apos;t a fit.
                            Useful for warm-up tasks and shorter answers.
                          </p>
                        </div>
                        <Toggle
                          checked={state.allowSkip}
                          onChange={(checked) =>
                            update({ allowSkip: checked })
                          }
                        />
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </PageAnim.Item>
      </PageAnim>
    </AppShell>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-canvas-deep text-[13px] font-bold text-ink-soft"
        aria-hidden
      >
        {n}
      </span>
      <span>
        <span className="block text-body font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-body-sm text-ink-soft reading-leading">
          {body}
        </span>
      </span>
    </li>
  );
}

function UploadDropzone({ onUpload }: { onUpload: () => void }) {
  return (
    <button
      type="button"
      onClick={onUpload}
      className="group flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-ink/15 bg-canvas-card/70 px-8 py-14 text-center transition-colors hover:border-mist-300 hover:bg-mist-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300"
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-mist-100 text-mist-700">
        <UploadCloud className="h-6 w-6" strokeWidth={2} />
      </span>
      <span className="text-body text-ink">
        Drop a worksheet here, or click to upload
      </span>
      <span className="inline-flex items-center gap-2 text-body-sm text-ink-mute">
        <ImageIcon className="h-4 w-4" strokeWidth={2} />
        JPG, PNG, or PDF · for the demo, click to load a sample
      </span>
    </button>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300 " +
        (checked ? "bg-sage-500" : "bg-ink/15")
      }
    >
      <span
        className={
          "inline-block h-5 w-5 transform rounded-full bg-canvas-card shadow-soft transition-transform " +
          (checked ? "translate-x-6" : "translate-x-1")
        }
      />
    </button>
  );
}

function ProgressShimmer({ className }: { className?: string }) {
  return (
    <div
      className={
        "relative h-1.5 w-full overflow-hidden rounded-full bg-mist-100 " +
        (className ?? "")
      }
      aria-hidden
    >
      <motion.span
        className="absolute inset-y-0 w-1/3 rounded-full bg-mist-300"
        initial={{ x: "-100%" }}
        animate={{ x: "300%" }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
