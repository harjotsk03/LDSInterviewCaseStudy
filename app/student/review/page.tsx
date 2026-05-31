"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Pencil,
  MessageSquareQuote,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AppShell } from "@/components/shell/app-shell";
import { StudentSidebar } from "@/components/shell/student-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { PageAnim } from "@/components/shell/page-anim";
import { ReadAloud } from "@/components/student/read-aloud";
import {
  polishDraft,
  useDemo,
  useSelectedWorksheetQuestion,
} from "@/lib/demo-store";
import { cn } from "@/lib/utils";

/**
 * Review screen — the key screen.
 *
 * Visual hierarchy:
 *   1. Hero card with the polished answer (primary focus, generous
 *      type, comfortable line height).
 *   2. Tab to flip to "My words" — the student's actual transcript.
 *   3. Drawer below for the full thinking trail (brain-dump + each
 *      follow-up Q&A pair). Closed by default to keep the page calm.
 *
 * Sidebar carries the question and brain-dump context so the main
 * column can breathe.
 */
type View = "polished" | "raw";

export default function StudentReviewPage() {
  const router = useRouter();
  const { state, update, hydrated } = useDemo();
  const selected = useSelectedWorksheetQuestion();
  const [view, setView] = useState<View>("polished");
  const [draft, setDraft] = useState(state.tidiedDraft);
  const [editing, setEditing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.tidiedDraft) {
      const fresh = polishDraft(
        state.selectedQuestionId,
        state.brainDump,
        state.answers,
      );
      update({ tidiedDraft: fresh });
      setDraft(fresh);
    } else {
      setDraft(state.tidiedDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const rawCombined = useMemo(() => {
    const parts: string[] = [];
    if (state.brainDump.trim()) parts.push(state.brainDump.trim());
    for (const a of state.answers) {
      if (!a.skipped && a.answer.trim()) parts.push(a.answer.trim());
    }
    return parts.join("\n\n");
  }, [state.brainDump, state.answers]);

  const onSubmit = async () => {
    setSubmitting(true);
    update({ tidiedDraft: draft, submitted: true });
    await new Promise((r) => setTimeout(r, 800));
    router.push("/student/done");
  };

  if (!hydrated) {
    return (
      <AppShell
        sidebar={<StudentSidebar current="review" />}
        topbar={<Topbar eyebrow="Reading task · step 4 of 4" />}
      >
        <div className="h-[50vh]" />
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebar={<StudentSidebar current="review" />}
      topbar={<Topbar eyebrow="Reading task · step 4 of 4" />}
      bottomBar={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 truncate text-body-sm text-ink-soft">
            Your teacher will see this answer and how you got here.
          </p>
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={submitting || !draft.trim()}
          >
            {submitting ? "Submitting…" : "Submit my answer"}
            {!submitting && <Check className="h-4 w-4" strokeWidth={2.25} />}
          </Button>
        </div>
      }
    >
      <PageAnim>
        <PageAnim.Item>
          <h1 className="text-student-xl font-bold text-ink leading-[1.2]">
            Your words, organised into a clear answer.
          </h1>
          <p className="mt-3 text-body text-ink-soft reading-leading max-w-[54ch]">
            Built from your first thoughts and your follow-up answers. Nothing
            new was added — you can change anything before submitting.
          </p>
        </PageAnim.Item>

        <PageAnim.Item>
          <section className="mt-7 overflow-hidden rounded-3xl border border-sage-200 bg-canvas-card shadow-hero">
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/[0.06] bg-sage-50/40 px-4 sm:px-5 py-2.5">
              <div role="tablist" aria-label="View" className="inline-flex gap-1">
                <Tab
                  active={view === "polished"}
                  onClick={() => setView("polished")}
                  icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={2} />}
                  label="Polished"
                />
                <Tab
                  active={view === "raw"}
                  onClick={() => {
                    setView("raw");
                    setEditing(false);
                  }}
                  icon={
                    <MessageSquareQuote
                      className="h-3.5 w-3.5"
                      strokeWidth={2}
                    />
                  }
                  label="My words"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <ReadAloud
                  id="hero-read"
                  text={view === "polished" ? draft : rawCombined}
                  label="Listen"
                />
                {view === "polished" && (
                  <button
                    type="button"
                    onClick={() => setEditing((v) => !v)}
                    aria-pressed={editing}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-body-sm font-bold transition-colors",
                      editing
                        ? "bg-canvas-deep text-ink"
                        : "text-ink-soft hover:bg-canvas-deep hover:text-ink",
                    )}
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                    {editing ? "Done editing" : "Edit"}
                  </button>
                )}
              </div>
            </header>

            <div className="px-5 py-6 sm:px-8 sm:py-7">
              {view === "polished" ? (
                editing ? (
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    className="min-h-[240px] text-student reading-leading"
                    aria-label="Edit your polished answer"
                  />
                ) : (
                  <p className="text-student text-ink reading-leading max-w-[60ch]">
                    {draft || (
                      <span className="text-ink-mute">
                        No polished draft yet — go back and answer the
                        follow-ups.
                      </span>
                    )}
                  </p>
                )
              ) : (
                <RawWordsView
                  brainDump={state.brainDump}
                  answers={state.answers}
                />
              )}

              <p className="mt-5 text-body-sm text-ink-mute reading-leading max-w-[60ch]">
                {view === "polished"
                  ? "Your vocabulary is preserved — the polish is structure and flow only."
                  : "Exactly what you said, untouched."}
              </p>
            </div>
          </section>
        </PageAnim.Item>

        <PageAnim.Item>
          <section className="mt-5">
            <button
              type="button"
              onClick={() => setDrawerOpen((v) => !v)}
              aria-expanded={drawerOpen}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-ink/[0.08] bg-canvas-card/80 px-4 py-4 text-left transition-colors hover:bg-canvas-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300"
            >
              <span className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mist-100 text-mist-700">
                  <ListChecks className="h-4 w-4" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-body font-bold text-ink">
                    See how you got here
                  </span>
                  <span className="block text-body-sm text-ink-soft reading-leading">
                    Your first thoughts and each follow-up question with your
                    answer.
                  </span>
                </span>
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-ink-mute transition-transform",
                  drawerOpen && "rotate-180",
                )}
                strokeWidth={2}
              />
            </button>

            <AnimatePresence initial={false}>
              {drawerOpen && (
                <DrawerContent
                  brainDump={state.brainDump}
                  answers={state.answers}
                  questionText={selected?.text}
                />
              )}
            </AnimatePresence>
          </section>
        </PageAnim.Item>
      </PageAnim>
    </AppShell>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-body-sm font-bold transition-colors",
        active
          ? "bg-canvas-card text-ink shadow-soft"
          : "text-ink-soft hover:text-ink",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function RawWordsView({
  brainDump,
  answers,
}: {
  brainDump: string;
  answers: ReturnType<typeof useDemo>["state"]["answers"];
}) {
  const hasBrain = brainDump.trim().length > 0;
  const realAnswers = answers.filter((a) => !a.skipped && a.answer.trim());

  if (!hasBrain && realAnswers.length === 0) {
    return (
      <p className="text-body text-ink-mute">
        Nothing on file for this attempt yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {hasBrain && (
        <p className="text-student text-ink reading-leading max-w-[60ch]">
          {brainDump}
        </p>
      )}
      {realAnswers.map((a) => (
        <p
          key={a.questionId}
          className="text-student text-ink reading-leading max-w-[60ch]"
        >
          {a.answer}
        </p>
      ))}
    </div>
  );
}

function DrawerContent({
  brainDump,
  answers,
  questionText,
}: {
  brainDump: string;
  answers: ReturnType<typeof useDemo>["state"]["answers"];
  questionText?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 0.61, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-3 space-y-5 rounded-2xl border border-ink/[0.06] bg-canvas-card/60 p-5 sm:p-6">
        {questionText && (
          <div className="rounded-xl bg-sand-50/70 px-4 py-3">
            <p className="text-eyebrow text-ink-soft">Your worksheet question</p>
            <p className="mt-1.5 text-body text-ink reading-leading max-w-[58ch]">
              {questionText}
            </p>
          </div>
        )}

        <DrawerSection
          title="Your first thoughts"
          subtitle="Raw brain-dump, untouched"
          icon={<MessageSquareQuote className="h-4 w-4" strokeWidth={2} />}
        >
          {brainDump.trim() ? (
            <p className="text-body text-ink reading-leading max-w-[60ch]">
              &ldquo;{brainDump.trim()}&rdquo;
            </p>
          ) : (
            <p className="text-body text-ink-mute">No brain-dump captured.</p>
          )}
        </DrawerSection>

        <DrawerSection
          title="Working through it"
          subtitle="Each follow-up and your answer"
          icon={<ListChecks className="h-4 w-4" strokeWidth={2} />}
        >
          <ol className="space-y-3">
            {answers.length === 0 && (
              <li className="text-body text-ink-mute">
                No follow-up answers on file.
              </li>
            )}
            {answers.map((a, i) => (
              <li
                key={a.questionId}
                className="rounded-xl border border-ink/[0.06] bg-canvas-card px-4 py-3.5"
              >
                <p className="text-body-sm font-bold text-ink reading-leading">
                  <span className="text-ink-mute mr-1.5">{i + 1}.</span>
                  {a.questionText}
                </p>
                {a.skipped ? (
                  <p className="mt-1.5 text-body-sm text-ink-mute">
                    Skipped — you chose to move on.
                  </p>
                ) : a.answer.trim() ? (
                  <p className="mt-2 text-body text-ink reading-leading max-w-[58ch]">
                    {a.answer}
                  </p>
                ) : (
                  <p className="mt-1.5 text-body-sm text-ink-mute">
                    No answer recorded.
                  </p>
                )}
              </li>
            ))}
          </ol>
        </DrawerSection>
      </div>
    </motion.div>
  );
}

function DrawerSection({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-center gap-2.5">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-mist-50 text-mist-700">
          {icon}
        </span>
        <div>
          <p className="text-body-sm font-bold text-ink leading-[1.2]">
            {title}
          </p>
          <p className="text-[12px] text-ink-mute leading-[1.2]">{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
