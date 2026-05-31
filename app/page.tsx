"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Ear,
  HeartHandshake,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { PeakMark } from "@/components/shell/peak-mark";
import { useDemo } from "@/lib/demo-store";

/**
 * Landing page. Two big role choices, with the dyslexia-aware spacing
 * rules from the BDA baked in:
 *
 *   - line length capped well under 72 chars,
 *   - line-height 1.7+ on long-form copy,
 *   - sentence-case headings, no ALL CAPS body,
 *   - no italics — emphasis is via weight,
 *   - never pure white / never pure black.
 */
export default function LandingPage() {
  const reduceMotion = useReducedMotion();
  const router = useRouter();
  const { reset } = useDemo();

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-[480px] w-[480px] rounded-full bg-sage-100/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-[420px] w-[420px] rounded-full bg-sand-50 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:py-12">
        <header className="flex items-center justify-between">
          <PeakMark />
          <div className="flex items-center gap-3">
            <span className="hidden text-eyebrow sm:inline">
              Writing support · prototype
            </span>
            <button
              type="button"
              onClick={() => {
                reset();
                router.refresh();
              }}
              className="rounded-full border border-ink/10 bg-canvas-card px-3 py-1.5 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-mute hover:text-ink hover:border-ink/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300"
            >
              Reset demo
            </button>
          </div>
        </header>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-14 sm:mt-20 max-w-[52ch]"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-sage-200 bg-sage-50/70 px-3 py-1 text-[12px] font-bold uppercase tracking-[0.08em] text-sage-700">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            A scaffolded writing workflow
          </p>
          <h1 className="mt-5 text-[44px] sm:text-[58px] leading-[1.08] font-bold tracking-[0.005em] text-ink">
            Your words,
            <br />
            <span className="text-sage-700">lightly tidied.</span>
          </h1>
          <p className="mt-6 text-lede text-ink-soft reading-leading max-w-[48ch]">
            A writing space for students who think faster than they can write.
            Speak your thoughts, answer a few small questions, and we&apos;ll
            tidy the punctuation — without changing what you said.
          </p>
        </motion.section>

        <motion.section
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
          }}
          className="mt-12 sm:mt-14 grid gap-4 sm:grid-cols-2"
        >
          <PathCard
            href="/teacher"
            icon={<GraduationCap className="h-5 w-5" strokeWidth={2} />}
            eyebrow="For teachers"
            title="I'm preparing a worksheet."
            body="Upload a worksheet, review the questions, and send it to your student. Follow-ups are drafted live from their own words."
          />
          <PathCard
            href="/student"
            icon={<BookOpen className="h-5 w-5" strokeWidth={2} />}
            eyebrow="For students"
            title="I'm working on my worksheet."
            body="Read the question, speak your thinking, and answer a few small prompts in any order that feels right."
            accent
          />
        </motion.section>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 sm:mt-16 grid gap-4 sm:grid-cols-3"
        >
          <FactCard
            icon={<Ear className="h-4 w-4" strokeWidth={2} />}
            title="Read every prompt aloud"
            body="Real text-to-speech on every question, so reading is never the barrier to writing."
          />
          <FactCard
            icon={<Sparkles className="h-4 w-4" strokeWidth={2} />}
            title="Follow-ups from your own words"
            body="Small prompts are drafted from what the student actually said — not a teacher's checklist."
          />
          <FactCard
            icon={<HeartHandshake className="h-4 w-4" strokeWidth={2} />}
            title="Voice and reasoning preserved"
            body="AI helps with structure and punctuation. Vocabulary, ideas, and ordering stay the student's."
          />
        </motion.section>

        <footer className="mt-auto pt-14">
          <p className="text-body-sm text-ink-mute max-w-[60ch] reading-leading">
            Designed for students with dysgraphia, dyslexia, and ADHD. AI handles
            the punctuation and the formatting. The student&apos;s voice and
            reasoning remain untouched.
          </p>
        </footer>
      </div>
    </div>
  );
}

function PathCard({
  href,
  icon,
  eyebrow,
  title,
  body,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.36, ease: [0.22, 0.61, 0.36, 1] },
        },
      }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <Link
        href={href}
        className={
          "group block h-full rounded-2xl border bg-canvas-card p-6 sm:p-7 shadow-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300 " +
          (accent
            ? "border-sage-200 hover:border-sage-300 hover:shadow-hero"
            : "border-ink/[0.08] hover:border-mist-300 hover:shadow-lift")
        }
      >
        <div className="flex items-center gap-3">
          <span
            className={
              "inline-flex h-11 w-11 items-center justify-center rounded-xl " +
              (accent
                ? "bg-sage-100 text-sage-700"
                : "bg-mist-100 text-mist-700")
            }
            aria-hidden
          >
            {icon}
          </span>
          <span className="text-eyebrow">{eyebrow}</span>
        </div>
        <h2 className="mt-6 text-[24px] leading-[1.3] font-bold text-ink">
          {title}
        </h2>
        <p className="mt-3 text-body text-ink-soft reading-leading max-w-[40ch]">
          {body}
        </p>
        <span className="mt-7 inline-flex items-center gap-2 text-body-sm font-bold text-ink">
          Get started
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2.25}
          />
        </span>
      </Link>
    </motion.div>
  );
}

function FactCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }}
      className="rounded-2xl border border-ink/[0.07] bg-canvas-card/70 p-5"
    >
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-canvas-deep/80 text-ink-soft"
        aria-hidden
      >
        {icon}
      </span>
      <h3 className="mt-4 text-body font-bold text-ink leading-[1.4]">
        {title}
      </h3>
      <p className="mt-1.5 text-body-sm text-ink-soft reading-leading">{body}</p>
    </motion.article>
  );
}
