"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * The demo store holds everything the panel needs to walk through both
 * the teacher and the student paths.
 *
 * New model (v2):
 *  - The worksheet has multiple questions parsed from the upload.
 *  - The teacher does NOT author scaffolding. Their job is to upload
 *    the worksheet and approve assignment settings.
 *  - The student picks one worksheet question, brain-dumps, and THEN
 *    the AI generates follow-up questions based on what the student
 *    actually said — so the prompts reflect their voice, not a
 *    teacher's guess at the "right" outline.
 */

export type WorksheetQuestion = {
  id: string;
  number: number;
  text: string;
};

export type ScaffoldingQuestion = {
  id: string;
  text: string;
};

export type ScaffoldingAnswer = {
  questionId: string;
  questionText: string;
  answer: string;
  skipped: boolean;
};

export type DemoState = {
  /** Worksheet questions parsed from the teacher's upload. */
  worksheetQuestions: WorksheetQuestion[];
  /** Whether students may skip individual follow-up prompts. */
  allowSkip: boolean;
  /** Which worksheet question the student chose to answer. */
  selectedQuestionId: string | null;
  /** Raw brain-dump for the selected question. */
  brainDump: string;
  /**
   * AI-generated follow-ups for the selected question. Populated only
   * after the student finishes their brain-dump.
   */
  scaffolding: ScaffoldingQuestion[];
  /** The student's answers to each AI-generated follow-up. */
  answers: ScaffoldingAnswer[];
  /** The lightly-tidied final draft. */
  tidiedDraft: string;
  /** Whether the student has submitted. */
  submitted: boolean;
};

const DEFAULT_WORKSHEET_QUESTIONS: WorksheetQuestion[] = [
  {
    id: "w1",
    number: 1,
    text: "In the passage, how does Mira's attitude toward the lighthouse change between the beginning and the end? Use specific details from the text.",
  },
  {
    id: "w2",
    number: 2,
    text: "What role does Mira's grandmother play in how Mira sees the lighthouse? Refer to the passage in your answer.",
  },
  {
    id: "w3",
    number: 3,
    text: "Describe one image or phrase from the passage that stayed with you, and explain why.",
  },
  {
    id: "w4",
    number: 4,
    text: "If you were Mira at the start of the story, would you have climbed the lighthouse? Explain your reasoning.",
  },
];

/**
 * Canned "AI" follow-ups per worksheet question.
 *
 * Design rule (the central thesis): every textual detail or quote
 * that ends up in the polished draft must FIRST appear in the
 * student's own answer to a follow-up. The AI never silently
 * imports evidence from the source passage. The first follow-up for
 * every question is therefore an EVIDENCE-RETRIEVAL prompt — the
 * student looks at the passage and pulls out the specific detail
 * themselves. The remaining follow-ups push for reasoning, contrast,
 * or a sharper articulation.
 *
 * If a student skips a follow-up, the corresponding contribution to
 * the polished draft is omitted too (see POLISH_PLANS below) — so
 * "Skipped" in the provenance trail and "missing in polished" stay
 * in sync.
 */
const FOLLOWUPS_BY_QUESTION: Record<string, string[]> = {
  // w1 — how Mira's attitude toward the lighthouse changes
  w1: [
    "What's one specific detail from the passage that shows that change?",
    "Why do you think the grandma's story was enough to shift Mira's view — what about it landed?",
    "Where exactly is the turning point — before and after what moment?",
    "Is there a single word that captures the shift better than 'scared' or 'liked'?",
  ],
  // w2 — the grandmother's role
  w2: [
    "What's the specific story or detail from the passage that the grandmother shares with Mira?",
    "What actually changed — the lighthouse itself, or how Mira sees it? Why does that distinction matter?",
    "Why might a family story have that effect when other things wouldn't?",
    "If you had to describe the grandmother's role in two words, what would they be?",
  ],
  // w3 — an image that stayed with you
  w3: [
    "Why those two images — what does each one make you feel?",
    "Does that contrast connect to anything else in the passage you noticed?",
    "If the writer had used a totally different image in that spot, what would you lose?",
    "Why this image and not another — what does it do that the rest of the writing doesn't?",
  ],
  // w4 — would you have climbed it?
  w4: [
    "What in the passage made you feel that way at first — which specific details?",
    "What would have had to be true for you to actually go up?",
    "Mira had something specific that helped her — what was it, and would that be enough for you?",
    "If your answer is the same as Mira's, why? If it's different, what's the difference about?",
  ],
};

const FALLBACK_FOLLOWUPS = [
  "What's the single strongest piece of evidence from the passage you'd point to?",
  "Why does this matter — what does it tell us beyond what's on the page?",
  "Is there anything in your first thoughts you'd want to soften or push harder on?",
];

const DEFAULT_STATE: DemoState = {
  worksheetQuestions: DEFAULT_WORKSHEET_QUESTIONS,
  allowSkip: true,
  selectedQuestionId: null,
  brainDump: "",
  scaffolding: [],
  answers: [],
  tidiedDraft: "",
  submitted: false,
};

const STORAGE_KEY = "peak-demo-state-v2";

type DemoContextValue = {
  state: DemoState;
  update: (patch: Partial<DemoState>) => void;
  reset: () => void;
  hydrated: boolean;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DemoState>;
        setState({ ...DEFAULT_STATE, ...parsed });
      }
    } catch {
      // Bad JSON — fall back to defaults silently. This is a demo.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Quota or private mode — demo continues in-memory only.
    }
  }, [state, hydrated]);

  const update = useCallback((patch: Partial<DemoState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({ state, update, reset, hydrated }),
    [state, update, reset, hydrated],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside <DemoProvider>");
  return ctx;
}

/**
 * Convenience selector — returns the worksheet question the student
 * picked, or null if they haven't picked one yet.
 */
export function useSelectedWorksheetQuestion() {
  const { state } = useDemo();
  return useMemo(
    () =>
      state.worksheetQuestions.find((q) => q.id === state.selectedQuestionId) ??
      null,
    [state.worksheetQuestions, state.selectedQuestionId],
  );
}

/**
 * "AI" follow-up generator. In production this would prompt an LLM
 * with the student's brain-dump and the worksheet question; here it
 * returns a canned-but-plausible list keyed by question id.
 *
 * We accept the brainDump argument so the call site reads correctly
 * and so we can lightly customise the prompts later if we want.
 */
export function generateScaffolding(
  questionId: string | null,
  _brainDump: string,
): ScaffoldingQuestion[] {
  const list = (questionId && FOLLOWUPS_BY_QUESTION[questionId]) || FALLBACK_FOLLOWUPS;
  return list.map((text, i) => ({ id: `s-${questionId ?? "x"}-${i}`, text }));
}

/**
 * Per-question polish plan.
 *
 * A polished draft is assembled from:
 *  1. `opening` — a short frame drawn from the student's brain-dump
 *     vocabulary;
 *  2. one `perFollowup` contribution per follow-up the student
 *     actually answered (skipped follow-ups contribute nothing);
 *  3. an optional `closing` sentence that wraps the paragraph if
 *     present.
 *
 * Every clause in every contribution has been audited against the
 * sample brain-dump (in `SAMPLE_BRAIN_DUMPS`, on the brain-dump
 * page) and the sample follow-up answers (in `SAMPLE_ANSWERS`, on
 * the scaffolding page). If you change the wording of one, change
 * the matching student-voice source too — otherwise the polished
 * draft will start asserting things the student never said, which is
 * exactly the failure mode this product is designed against.
 */
type PolishPlan = {
  opening: string;
  perFollowup: Record<string, string>;
  closing?: string;
};

const POLISH_PLANS: Record<string, PolishPlan> = {
  // w1 — how Mira's attitude toward the lighthouse changes
  w1: {
    opening:
      "At the start, Mira is scared of the lighthouse. She calls it creepy and she doesn't want to go near it.",
    perFollowup: {
      "s-w1-0":
        "She even said it didn't belong to the village. The turning point is her grandma's story about her great-grandfather climbing the lighthouse on storm nights to keep the boats safe.",
      "s-w1-1":
        "The story landed because it made the lighthouse about her own family — it stopped being some random scary thing and became part of who she was.",
      "s-w1-2":
        "The line in the passage right after the story is the hinge: it says she doesn't hurry quite so much after it.",
      "s-w1-3":
        "A better word for the shift than 'scared' or 'liked' would be 'belonging' — at the start she's outside of it, and by the end she's part of it.",
    },
    closing:
      "By the end, she's at the top of it watching the sunset, and she calls it hers.",
  },

  // w2 — the grandmother's role
  w2: {
    opening:
      "Mira's grandmother changes things for Mira. Before her grandma's story, Mira just thought the lighthouse was creepy. After the story, she's different about it.",
    perFollowup: {
      "s-w2-0":
        "The story the grandmother tells is about Mira's great-grandfather: the lighthouse used to be his, and he climbed it on storm nights to keep the boats safe.",
      "s-w2-1":
        "What actually changes is how Mira sees the lighthouse, not the lighthouse itself. The building doesn't change, but what it means to her does.",
      "s-w2-2":
        "A family story makes the lighthouse personal. If a stranger had told Mira the same story it probably wouldn't have done that — it mattered because it was her own family.",
      "s-w2-3":
        "In two words, her grandmother is a storyteller and a bridge — she bridges the family history with what Mira sees every day.",
    },
  },

  // w3 — an image that stayed with you
  w3: {
    opening:
      "The image that stayed with me is the moment the writer calls the lighthouse a bone, and then later a candle. They're the same shape but a totally different feeling.",
    perFollowup: {
      "s-w3-0":
        "Bone feels dead — like something old and dry, with nothing alive about it. Candle feels warm and alive, like there's a flame at the top.",
      "s-w3-1":
        "That contrast connects to the change in Mira: the lighthouse going from bone to candle is basically the same as her going from scared to attached. The image is doing the story in one move.",
      "s-w3-2":
        "If the writer had used a totally different image — just called the lighthouse pretty or tall — you'd lose the contrast.",
      "s-w3-3":
        "The bone-to-candle move does the whole story in one image. That's why it stayed with me — it's the passage in miniature.",
    },
  },

  // w4 — would you have climbed it?
  w4: {
    opening:
      "At the start of the story, I don't think I would have climbed the lighthouse. It looks creepy and the door is always closed.",
    perFollowup: {
      "s-w4-0":
        "Everything about the lighthouse in the first part of the passage says do not enter — the door is always shut, the windows look dark, and it even gets called creepy.",
      "s-w4-1":
        "For me to actually have gone up, I'd have needed someone to have done it before me — a parent or a grandparent. Otherwise it would feel like walking alone into a dark scary place.",
      "s-w4-2":
        "Mira had something specific that helped her: her grandma's story about her great-grandfather climbing the lighthouse on storm nights. I think that would actually be enough for me too, if it was my own family.",
      "s-w4-3":
        "Without that family connection, I'd probably stay scared of it, same as Mira was at the start.",
    },
  },
};

/**
 * Assemble the polished draft for the current attempt.
 *
 * Composition rule: take the question's opening frame; then, for
 * each follow-up the student actually answered (i.e. not skipped and
 * non-empty), append that follow-up's per-question contribution; end
 * with the closing if there is one.
 *
 * Skipped follow-ups contribute nothing. That keeps the polished
 * draft consistent with the provenance trail: if the student didn't
 * say it, it doesn't appear here.
 */
export function polishDraft(
  questionId: string | null,
  _brainDump: string,
  answers: ScaffoldingAnswer[],
): string {
  const plan = questionId ? POLISH_PLANS[questionId] : null;
  if (!plan) return assembleDraft(answers);

  const parts: string[] = [plan.opening];
  for (const a of answers) {
    if (a.skipped) continue;
    if (!a.answer.trim()) continue;
    const contribution = plan.perFollowup[a.questionId];
    if (contribution) parts.push(contribution);
  }
  if (plan.closing) parts.push(plan.closing);
  return parts.join(" ");
}

/**
 * Light-cleanup logic. The heart of the product philosophy:
 * we ONLY normalise punctuation/capitalisation/sentence breaks and
 * strip a small set of obvious filler words. We never paraphrase,
 * reorder, or add content.
 */
export function tidyUp(raw: string): string {
  if (!raw.trim()) return "";

  let text = raw
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b(um+|uh+|er+|hmm+)\b[\s,]*/gi, "")
    .replace(/\blike,\s+/gi, "")
    .replace(/\s+,/g, ",")
    .replace(/\s+\./g, ".")
    .replace(/\s+/g, " ")
    .trim();

  text = text
    .replace(/([^.?!])\s+(And then\b)/g, "$1. $2")
    .replace(/([^.?!])\s+(By the end\b)/gi, "$1. $2")
    .replace(/([^.?!])\s+(Then\b)/g, "$1. $2");

  text = text.replace(/(^|[.!?]\s+)([a-z])/g, (_m, p1, p2) => p1 + p2.toUpperCase());

  if (!/[.!?]$/.test(text)) text = text + ".";

  return text;
}

/**
 * Assemble the tidied draft from the student's per-question answers
 * in the exact order they answered them. We do NOT reorder. We do NOT
 * add transition words.
 */
export function assembleDraft(answers: ScaffoldingAnswer[]): string {
  const kept = answers.filter((a) => !a.skipped && a.answer.trim());
  if (kept.length === 0) return "";
  return kept.map((a) => tidyUp(a.answer)).join(" ");
}
