# PEAK — Dysgraphia Writing Support

An interactive prototype of a scaffolded writing workflow for students
with dysgraphia, dyslexia, and ADHD. Built as a take-home for a Product
Designer role.

The design principle in one line: **AI handles the mechanical work
(transcription, punctuation, formatting). AI does not compose,
rewrite, or generate the student's ideas.** The student's voice and
reasoning are visibly preserved in every output.

## Where the AI lives in this product

Two narrow, mechanical places — never as a co-author:

1. **Parsing the worksheet** so the questions can be presented to the
   student one at a time. Teacher upload → questions list.
2. **Drafting follow-up prompts from the student's own brain-dump.**
   The follow-ups exist to help the student organise what they
   *already said*, not to outline what they "should" say. The teacher
   never authors them — they come from the student's voice, after the
   student speaks.

Light cleanup (punctuation, capitalisation, sentence breaks, filler
removal) is rules-based, not a model. Submissions read as the
student's own words.

## Run it

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and choose **I'm a teacher** or
**I'm a student** from the landing page.

A small **Reset demo** control lives in the sidebar footer of every
work screen, and in the landing header.

## The flow

| # | Path | Screen |
|---|------|--------|
|   | `/` | Landing · teacher / student paths |
| 1 | `/teacher` | Teacher · upload worksheet · review parsed questions · approve |
| 2 | `/student` | Student · read all the worksheet questions, pick one |
| 3 | `/student/think` | Student · think out loud about the chosen question |
| 4 | `/student/scaffolding` | Student · AI-drafted follow-ups, one at a time |
| 5 | `/student/review` | Student · polished answer with the full thinking trail in a drawer **(the key screen)** |
| 6 | `/teacher/review` | Teacher · provenance / thinking-trail view |

Plus two confirmation interstitials: `/teacher/sent` and `/student/done`.

### Walking the demo

**Teacher path:** Landing → `/teacher` (upload, review the 4 detected
questions, set the "allow skip follow-ups" toggle, send) →
`/teacher/sent` (confirmation) → **View submissions** → `/teacher/review`.

**Student path:** Landing → `/student` (read or play the questions
aloud, pick one) → `/student/think` (mic or type brain-dump) →
"Done thinking" triggers the **AI follow-up drafting** transition →
`/student/scaffolding` (one follow-up at a time, with a step indicator
and skip option when the teacher allowed it) → "Put it together" →
`/student/review` (split view with subtle highlights) → **Submit** →
`/student/done`.

For the round trip the panel will want to see: walk teacher, then
walk student, then come back to `/teacher/review` and you'll see the
provenance trail populated with the same answer the student just
submitted.

## The app shell

Every work screen (teacher and student) shares one layout:

```
┌──────────────┬──────────────────────────────────┐
│              │  topbar (page eyebrow)           │
│   sidebar    ├──────────────────────────────────┤
│   (sticky)   │  main content                    │
│              ├──────────────────────────────────┤
│              │  sticky bottom bar (primary CTA) │
└──────────────┴──────────────────────────────────┘
```

The **sidebar** is the persistent context surface:

- For students: the four-step progress list (Pick a question →
  First thoughts → Follow-ups → Your answer), the worksheet question
  the student chose (with a read-aloud button), and a quote of their
  brain-dump. Completed steps are clickable for back-navigation.
- For teachers: a section nav (Worksheet prep / Sent / Submissions).

The **bottom bar** holds the primary action (Submit, Done thinking,
Next, etc.) and an inline status line — it never overlaps content
because it lives inside the flex column rather than `position: fixed`.

On mobile the sidebar becomes a slide-in sheet from a menu icon in
the top bar.

## What's mocked and how

- **Voice input** — clicking the mic enters a "listening" state with a
  soft sage pulse animation. After a short delay, a pre-written
  transcript streams in 2–4 words at a time so it looks like real
  speech-to-text. Includes "um"s and a self-correction on purpose;
  the messiness is part of the demo.
- **AI parsing the worksheet** — short "Reading the worksheet…"
  shimmer on `/teacher`, then 4 plausible questions appear in the
  questions list panel. The teacher cannot edit them — they're
  treated as ground truth from the source.
- **AI follow-up drafting** — when the student hits "Done thinking",
  the next screen plays a short "Drafting a few follow-ups from what
  you said…" state, then reveals 3–4 prompts. The prompts are
  pre-written per worksheet question; in production they'd come from
  an LLM with the brain-dump as input.
- **Polished draft** — `lib/demo-store.tsx` → `polishDraft()` returns
  a pre-canned, structured polished draft per worksheet question (and
  falls back to a deterministic `assembleDraft()` for safety). The
  pre-canned drafts use the same vocabulary as the canned brain-dump
  and follow-up answers, but organised into a paragraph that reads as
  a coherent response — that's the structural-edit promise.
- **"Read aloud"** — backed by the real **Web Speech API** via the
  `useSpeech` hook. Works per-question on the question-selection
  screen, on the polished answer / "my words" tabs of the review
  screen, and on the worksheet question card in the student sidebar.

## Accessibility decisions

These are research-backed for the target population, not generic a11y.

- **Typography.** Atkinson Hyperlegible (Google Fonts), 18px minimum
  on student body text. Line height **1.6 globally, 1.75 on long
  reading blocks** via a `reading-leading` utility — the BDA min is
  1.5, and the do/don't reference image specifically called out
  cramped line-height. Letter spacing 0.02em, left-aligned. No
  italics anywhere (we override `<em>` / `<i>` to use weight). No
  ALL-CAPS body — eyebrows are the only uppercase, kept small and
  high-contrast.
- **Line length.** Long-form text is capped at **60ch on hero copy
  and 68ch on supporting copy** — below the BDA 72ch max, which the
  do/don't reference image also called out.
- **Colour.** Warm off-white background `#FAF8F5` — never pure white.
  Dark slate text `#1F2937` — never pure black. Soft sage for "your
  words preserved" cues, pale mist blue for "AI-touched" cues. No
  saturated reds anywhere in the student-facing flow; the mic is
  sage.
- **Focus / attention.** One primary task per screen. The sidebar
  shows the four steps with the current one clearly highlighted, so
  the student is never wondering "where am I?". Visible focus rings
  on every interactive element. Step dots, never timers or word
  counts. All transitions are short and `prefers-reduced-motion` is
  respected globally — including the page-level stagger animation.
- **Motor.** All click targets are ≥ 44 × 44 px. Mic button is
  96 × 96 px. Buttons never wrap labels (`whitespace-nowrap`) so
  "Done thinking" and "Send to student" don't break onto two lines.
  Sticky bottom bar means the primary action is always reachable
  without scrolling.
- **Reading support.** All text is selectable. Real text-to-speech
  via the Web Speech API is wired into per-question Listen buttons,
  the sidebar question card, and the review screen hero. Spellcheck
  underlines are turned off on student textareas — they read as
  "wrong" cues to dyslexic users.

## Motion

Framer Motion. Two patterns:

1. **Page enter** — `PageAnim` wraps the main content and runs a
   subtle staggered fade-up on direct `PageAnim.Item` children.
   Every screen uses it so navigation feels continuous instead of
   the harsh cut a typical SPA gives you.
2. **In-place transitions** — `AnimatePresence` on the follow-up
   carousel (between prompts), the review screen drawer (height
   tween), and the modal between brain-dump and follow-ups.

All motion is disabled (or collapsed to opacity-only) when
`prefers-reduced-motion` is set, via `useReducedMotion()`.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS 3 with a custom token system (`tailwind.config.ts`)
- Framer Motion for short, opt-out-able transitions
- lucide-react for icons
- React Context + `localStorage` for cross-screen demo state. No backend.

shadcn/ui's design language is followed (small composable primitives
in `components/ui`) but the components are written directly rather
than scaffolded via the CLI, to keep the prototype self-contained.

## Project structure

```
app/
  layout.tsx              root layout, font + DemoProvider
  globals.css             design tokens, base text rules
  page.tsx                landing
  teacher/
    page.tsx              Screen 1 — upload + question review
    sent/page.tsx         teacher confirmation
    review/page.tsx       Screen 6 — provenance
  student/
    page.tsx              Screen 2 — pick a question (with per-question read-aloud)
    think/page.tsx        Screen 3 — brain-dump for selected question
    scaffolding/page.tsx  Screen 4 — AI-drafted follow-ups, one at a time
    review/page.tsx       Screen 5 — before/after (key screen)
    done/page.tsx         student confirmation
components/
  shell/                  app-shell, student-sidebar, teacher-sidebar, topbar, page-anim, peak-mark
  ui/                     button, card, textarea, step-dots, modal
  teacher/                sample worksheet SVG
  student/                mic-button, read-aloud
lib/
  demo-store.tsx          DemoProvider + polishDraft() + tidyUp() + generateScaffolding()
  use-speech.ts           Web Speech API hook
  diff.ts                 word-level LCS diff (kept for reference)
  utils.ts                cn() + wait()
```

## Things to look at when reviewing

1. **The follow-ups come from the student.** On `/student/scaffolding`
   the prompts are framed as "drawn from what you said" and shown one
   at a time with a step indicator. The teacher never wrote these;
   the design choice deliberately moves authorship of the scaffolding
   away from a teacher's guess at "the right outline" and toward
   prompts that follow the student's own thinking.
2. **The sidebar keeps the student grounded.** Across every student
   work screen, the sidebar shows the four-step progress, the
   worksheet question they chose (with a Listen button), and a quote
   of their brain-dump. No-one has to remember where they are or what
   they said.
3. **Screen 5 (`/student/review`)** is where the philosophy becomes
   visible. The hero card presents the polished answer first; a
   single tab flips to "My words" to verify the vocabulary is
   preserved; a drawer below holds the full thinking trail. No
   side-by-side diff, no "correction" framing — just the final
   output, the receipts, and an Edit button.
4. **Screen 6's "A note" panel** sets the tone for the teacher
   provenance view — it's framed as a window into how the student
   worked, not as surveillance. The tabs are *First thoughts →
   Working through it → Submitted*, not "Logs."
5. **Tokens not colours.** Every colour in the UI comes from the
   `canvas / ink / sage / mist / sand` token families in
   `tailwind.config.ts`. No raw hex values in component code.
# LDSInterviewCaseStudy
