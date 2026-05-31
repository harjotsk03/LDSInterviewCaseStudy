"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, SkipForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StepDots } from "@/components/ui/step-dots";
import { AppShell } from "@/components/shell/app-shell";
import { StudentSidebar } from "@/components/shell/student-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { PageAnim } from "@/components/shell/page-anim";
import { MicButton } from "@/components/student/mic-button";
import {
  generateScaffolding,
  polishDraft,
  useDemo,
  useSelectedWorksheetQuestion,
  type ScaffoldingAnswer,
} from "@/lib/demo-store";

/**
 * Follow-ups screen — one AI-generated prompt at a time.
 *
 * On arrival we play a short "drafting follow-ups from what you said"
 * transition so the AI-generation moment feels real, then reveal the
 * first prompt.
 */

// Sample answers keyed by deterministic scaffolding id.
//
// The first follow-up for every question is now an EVIDENCE-RETRIEVAL
// prompt — the student looks at the passage and pulls out the
// specific detail themselves. This means the textual evidence that
// later appears in the polished draft enters the system through the
// student's own answer, not through silent insertion by the AI.
//
// If you edit any of these strings, also check POLISH_PLANS in
// `lib/demo-store.tsx` — the polished output is composed of
// per-follow-up contributions and assumes the corresponding student
// vocabulary lives here.
const SAMPLE_ANSWERS: Record<string, string> = {
  // w1 — Mira's attitude change
  "s-w1-0":
    "The bit where her grandma tells her about her great-grandfather climbing the lighthouse on storm nights to keep the boats safe. And the line at the end where she calls it hers — earlier she said it didn't even belong to the village, so that word does a lot.",
  "s-w1-1":
    "I think it landed because it made the lighthouse about her own family. It stopped being some random scary thing and became part of who she was.",
  "s-w1-2":
    "The turning point is the bit right after the grandma's story. The passage even says she doesn't hurry quite so much after that. That sentence is the hinge.",
  "s-w1-3":
    "Maybe belonging. At the start she's outside of it, by the end she's part of it.",

  // w2 — grandmother's role
  "s-w2-0":
    "It's the story about Mira's great-grandfather. The lighthouse used to be his, and he climbed it on storm nights to keep the boats safe.",
  "s-w2-1":
    "How she sees it, definitely. The lighthouse doesn't change at all, but what it means to her does. That's actually the whole point of the passage I think.",
  "s-w2-2":
    "Because a family story makes a thing personal. Like if a stranger told her the same story it probably wouldn't have done that. It mattered because it was her family.",
  "s-w2-3":
    "Storyteller and bridge. She bridged the family history with what Mira saw every day.",

  // w3 — image that stayed with you
  "s-w3-0":
    "Bone feels dead — like something old and dry, with nothing alive about it. Candle feels warm and alive, like there's a flame at the top. Same shape but totally opposite feeling.",
  "s-w3-1":
    "Yeah it connects to the change in Mira. The lighthouse going from bone to candle is basically the same thing as her going from scared to attached. The image is doing the story in one move.",
  "s-w3-2":
    "You'd lose the contrast. If it was just called pretty or tall, you wouldn't feel the shift the way the bone-to-candle move makes you feel it.",
  "s-w3-3":
    "It does the whole story in one image. That's why it stayed with me — it's the passage in miniature.",

  // w4 — would you have climbed it
  "s-w4-0":
    "Everything about the lighthouse in the first part says do not enter. The door is always shut. The windows look dark. It even gets called creepy.",
  "s-w4-1":
    "I'd have needed someone to have done it before me — like a parent or a grandparent. Then it wouldn't feel like just me walking alone into a dark scary place.",
  "s-w4-2":
    "She had her grandma's story about her great-grandfather climbing it on storm nights. I think that would actually be enough for me too, if it was my own family.",
  "s-w4-3":
    "Mira's reason for going up is the family connection. Without that I'd probably stay scared of it, same as she was at the start.",
};

export default function StudentScaffoldingPage() {
  const router = useRouter();
  const { state, update, hydrated } = useDemo();
  const selected = useSelectedWorksheetQuestion();

  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.selectedQuestionId) {
      router.replace("/student");
      return;
    }
    if (!state.brainDump.trim()) {
      router.replace("/student/think");
      return;
    }
  }, [hydrated, state.selectedQuestionId, state.brainDump, router]);

  useEffect(() => {
    if (!hydrated) return;
    if (state.scaffolding.length > 0) return;
    if (!state.selectedQuestionId) return;
    setGenerating(true);
    const t = window.setTimeout(() => {
      const generated = generateScaffolding(
        state.selectedQuestionId,
        state.brainDump,
      );
      update({ scaffolding: generated });
      setGenerating(false);
    }, 1400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (state.scaffolding.length === 0) return;
    if (state.answers.length !== state.scaffolding.length) {
      const seeded: ScaffoldingAnswer[] = state.scaffolding.map((q) => {
        const existing = state.answers.find((a) => a.questionId === q.id);
        return (
          existing ?? {
            questionId: q.id,
            questionText: q.text,
            answer: "",
            skipped: false,
          }
        );
      });
      update({ answers: seeded });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, state.scaffolding.length]);

  const current = state.scaffolding[index];
  const currentAnswer = state.answers.find((a) => a.questionId === current?.id);

  useEffect(() => {
    setDraft(currentAnswer?.answer ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  const answeredIndices = useMemo(
    () =>
      state.answers
        .map((a, i) =>
          (!a.skipped && a.answer.trim()) || a.skipped ? i : -1,
        )
        .filter((i) => i >= 0),
    [state.answers],
  );

  if (!hydrated || !selected) {
    return (
      <AppShell
        sidebar={<StudentSidebar current="scaffolding" />}
        topbar={<Topbar eyebrow="Reading task · step 3 of 4" />}
      >
        <div className="h-[50vh]" />
      </AppShell>
    );
  }

  if (generating || state.scaffolding.length === 0) {
    return (
      <AppShell
        sidebar={<StudentSidebar current="scaffolding" />}
        topbar={<Topbar eyebrow="Reading task · step 3 of 4" />}
      >
        <PageAnim>
          <PageAnim.Item>
            <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-mist-200 bg-canvas-card p-8 text-center shadow-soft">
              <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-mist-100 text-mist-700">
                <Sparkles className="h-6 w-6 animate-pulse" strokeWidth={2} />
              </span>
              <p className="mt-5 text-student font-semibold text-ink">
                Drafting a few follow-ups from what you said…
              </p>
              <p className="mt-2 text-body text-ink-soft reading-leading max-w-[44ch] mx-auto">
                These come from your own words, not a checklist. You&apos;ll see
                them in a moment.
              </p>
              <motion.div
                className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-mist-100"
                aria-hidden
              >
                <motion.span
                  className="block h-full w-1/3 rounded-full bg-mist-300"
                  initial={{ x: "-100%" }}
                  animate={{ x: "300%" }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
          </PageAnim.Item>
        </PageAnim>
      </AppShell>
    );
  }

  const persistDraft = (overrides?: Partial<ScaffoldingAnswer>) => {
    const next = state.answers.map((a) =>
      a.questionId === current.id
        ? {
            ...a,
            answer: overrides?.answer ?? draft,
            skipped: overrides?.skipped ?? false,
          }
        : a,
    );
    update({ answers: next });
  };

  const goNext = () => {
    persistDraft();
    if (index < state.scaffolding.length - 1) {
      setIndex(index + 1);
    } else {
      const persisted = state.answers.map((a) =>
        a.questionId === current.id
          ? { ...a, answer: draft, skipped: false }
          : a,
      );
      update({
        answers: persisted,
        tidiedDraft: polishDraft(
          state.selectedQuestionId,
          state.brainDump,
          persisted,
        ),
      });
      router.push("/student/review");
    }
  };

  const goBack = () => {
    persistDraft();
    if (index > 0) {
      setIndex(index - 1);
    } else {
      router.push("/student/think");
    }
  };

  const skip = () => {
    persistDraft({ answer: "", skipped: true });
    if (index < state.scaffolding.length - 1) {
      setIndex(index + 1);
    } else {
      const persisted = state.answers.map((a) =>
        a.questionId === current.id
          ? { ...a, answer: "", skipped: true }
          : a,
      );
      update({
        answers: persisted,
        tidiedDraft: polishDraft(
          state.selectedQuestionId,
          state.brainDump,
          persisted,
        ),
      });
      router.push("/student/review");
    }
  };

  const onTranscriptChunk = (chunk: string) => {
    setDraft((prev) => (prev + chunk).replace(/\s+/g, " "));
  };

  const isLast = index === state.scaffolding.length - 1;

  return (
    <AppShell
      sidebar={<StudentSidebar current="scaffolding" />}
      topbar={
        <Topbar
          eyebrow={`Reading task · step 3 of 4 · follow-up ${index + 1} of ${state.scaffolding.length}`}
        />
      }
      bottomBar={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" size="md" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" strokeWidth={2.25} />
            Back
          </Button>
          <div className="flex items-center gap-2">
            {state.allowSkip && (
              <Button variant="quiet" size="md" onClick={skip}>
                <SkipForward className="h-4 w-4" strokeWidth={2} />
                Skip this one
              </Button>
            )}
            <Button
              size="lg"
              onClick={goNext}
              disabled={listening || (!draft.trim() && !state.allowSkip)}
            >
              {isLast ? "Put it together" : "Next follow-up"}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </Button>
          </div>
        </div>
      }
    >
      <PageAnim>
        <PageAnim.Item>
          <div className="flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 rounded-full bg-mist-50 px-3 py-1 text-eyebrow text-mist-700">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              Drawn from what you said
            </p>
            <StepDots
              total={state.scaffolding.length}
              currentIndex={index}
              answeredIndices={answeredIndices}
            />
          </div>
        </PageAnim.Item>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <h1 className="mt-5 text-student-xl font-bold text-ink leading-[1.2] max-w-[54ch]">
              {current.text}
            </h1>

            <section className="mt-7 rounded-3xl border border-ink/[0.07] bg-canvas-card p-5 sm:p-7 shadow-soft">
              <div className="flex flex-col items-center">
                <MicButton
                  mockTranscript={
                    SAMPLE_ANSWERS[current.id] ??
                    "I think it shows how she changed her mind about it."
                  }
                  onTranscriptChunk={onTranscriptChunk}
                  onStateChange={(s) => setListening(s === "listening")}
                />
              </div>

              <div className="mt-6">
                <label htmlFor="answer" className="text-eyebrow">
                  Your answer
                </label>
                <Textarea
                  id="answer"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="A sentence or two is plenty. Fragments are fine."
                  className="mt-2 min-h-[120px] text-student reading-leading"
                  aria-live="polite"
                  aria-busy={listening}
                />
              </div>
            </section>
          </motion.div>
        </AnimatePresence>
      </PageAnim>
    </AppShell>
  );
}
