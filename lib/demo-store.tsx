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
 * These do NOT ask the student to restate what they already said in
 * their brain-dump. They push them to:
 *   - find specific evidence from the text,
 *   - probe WHY something matters (not just what happened),
 *   - find the strongest articulation of an idea,
 *   - structure their answer into parts.
 *
 * Each prompt assumes the student has already told us their position;
 * the follow-up's job is to make them think one layer deeper.
 */
const FOLLOWUPS_BY_QUESTION: Record<string, string[]> = {
  // w1 — how Mira's attitude toward the lighthouse changes
  w1: [
    "What's one line from the passage you'd point to as the strongest evidence of that change?",
    "Why do you think the grandma's story was enough to shift her view — what about it landed?",
    "If you had to put your answer in two parts, before and after, where exactly is the turning point?",
    "Is there a single word that captures the shift better than 'scared' or 'liked'?",
  ],
  // w2 — the grandmother's role
  w2: [
    "What changed for Mira — the lighthouse itself, or something about how she sees it? Why does that distinction matter?",
    "Why might a family story have that effect when other things wouldn't?",
    "Find the moment in the passage where you can feel the shift happen — what's the exact line?",
    "If you had to describe the grandmother's role in two words, what would they be?",
  ],
  // w3 — an image that stayed with you
  w3: [
    "What is the writer asking the reader to picture there — what's the feeling?",
    "Does that image connect to anything else in the passage you noticed?",
    "If the writer had used a totally different image in that spot, what would you lose?",
    "Why this image and not another — what does it do that the rest of the writing doesn't?",
  ],
  // w4 — would you have climbed it?
  w4: [
    "What's the strongest reason against climbing it, in your own words?",
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
 * Pre-canned "polished" drafts per worksheet question.
 *
 * These are the structural-edit version of the tidy step: built from
 * the same vocabulary the student used in the brain-dump and the
 * follow-up answers, but reorganised into a complete, coherent
 * response to the worksheet question. Connective tissue is the only
 * material we add — and only enough to make the student's ideas read
 * as a paragraph rather than a list of fragments.
 *
 * In production these would come from a model with the student's
 * actual transcripts as input; for the demo, they're paired with the
 * canned brain-dump and sample answers so the panel sees the
 * before / after relationship clearly.
 */
const TIDIED_BY_QUESTION: Record<string, string> = {
  w1: "At the start, Mira is scared of the lighthouse. She calls it creepy and she doesn't want to go near it. The turning point is when her grandma tells her the story about her great-grandfather climbing it on storm nights to keep the boats safe. Right after that, the passage says she doesn't hurry quite so much. By the end, she's at the top of it watching the sunset, and she calls it hers. The real shift is about belonging — at the start the lighthouse doesn't belong to the village, but by the end it's hers.",
  w2: "Mira's grandmother doesn't change the lighthouse itself — she changes how Mira sees it. The grandmother tells Mira about her great-grandfather climbing the lighthouse on storm nights to keep the boats safe. Before the story, Mira just thought the lighthouse was creepy. After it, the passage says she doesn't hurry past it quite so much, and the white stone starts to look less like a bone and more like a candle. In two words, her grandmother is a storyteller and a bridge — she connects Mira's family history to the place Mira sees every day.",
  w3: "The image that stayed with me is the moment the lighthouse is first called a bone, and then later a candle. They're the same shape — long and white — but they feel completely opposite. A bone feels like something dead; a candle feels warm and alive. I think the writer wants the reader to feel that contrast directly. It also connects to Mira's own shift in the story: the lighthouse going from bone to candle is the same move as Mira going from scared to attached. The image does the whole story in one move, which is why it stayed with me.",
  w4: "At the start of the story, I don't think I would have climbed the lighthouse. Everything about it says do not enter — the door is always shut, the windows look dark. The strongest reason against going up is just how clearly the building itself signals that it's closed. For me to actually climb it, I would have needed what Mira had: a story about my own family. She had the story about her great-grandfather climbing it on storm nights, and that's what made it feel safe. Without that, I'd probably stay scared of it, the same way she was at the start.",
};

/**
 * Produce the polished draft for the current attempt. Prefers a canned
 * structured draft keyed to the worksheet question; falls back to the
 * deterministic punctuation-only assembleDraft when the question or
 * its canned draft isn't available.
 */
export function polishDraft(
  questionId: string | null,
  _brainDump: string,
  answers: ScaffoldingAnswer[],
): string {
  if (questionId && TIDIED_BY_QUESTION[questionId]) {
    return TIDIED_BY_QUESTION[questionId];
  }
  return assembleDraft(answers);
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
