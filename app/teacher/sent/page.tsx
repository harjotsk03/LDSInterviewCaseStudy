"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, ArrowRight, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/shell/app-shell";
import { TeacherSidebar } from "@/components/shell/teacher-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { useDemo } from "@/lib/demo-store";

export default function TeacherSentPage() {
  const { state, hydrated } = useDemo();
  const reduceMotion = useReducedMotion();

  if (!hydrated) {
    return (
      <AppShell
        sidebar={<TeacherSidebar current="sent" />}
        topbar={<Topbar eyebrow="Teacher · sent to student" />}
      >
        <div className="h-[60vh]" />
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebar={<TeacherSidebar current="sent" />}
      topbar={<Topbar eyebrow="Teacher · sent to student" />}
    >
      <div className="mx-auto max-w-2xl pt-2">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          className="overflow-hidden rounded-3xl border border-sage-200 bg-canvas-card shadow-hero"
        >
          <div className="bg-sage-50/50 px-6 py-7 sm:px-8 sm:py-9 text-center">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: reduceMotion ? 0 : 0.45,
                ease: "easeOut",
                delay: 0.1,
              }}
              className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-sage-500 text-canvas shadow-soft"
            >
              <Check className="h-7 w-7" strokeWidth={2.5} />
            </motion.span>
            <h1 className="mt-6 text-[28px] sm:text-[34px] leading-[1.2] font-bold text-ink">
              Sent to your student.
            </h1>
            <p className="mt-3 text-body text-ink-soft reading-leading max-w-[48ch] mx-auto">
              {state.worksheetQuestions.length}{" "}
              {state.worksheetQuestions.length === 1
                ? "question is"
                : "questions are"}{" "}
              ready. Your student picks one to focus on, and follow-up prompts
              are drafted from what they say.
              {state.allowSkip
                ? " Skipping follow-ups is on."
                : " Skipping follow-ups is off."}
            </p>
          </div>

          <div className="border-t border-ink/[0.06] px-6 py-6 sm:px-8 sm:py-7">
            <p className="text-eyebrow">Worksheet questions</p>
            <ul className="mt-3 space-y-2.5">
              {state.worksheetQuestions.map((q) => (
                <li key={q.id} className="flex items-start gap-3">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-canvas-deep text-[13px] font-bold text-ink-soft">
                    {q.number}
                  </span>
                  <span className="text-body-sm text-ink-soft reading-leading">
                    {q.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link href="/teacher/review">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <BookOpen className="h-4 w-4" strokeWidth={2} />
              View submissions
            </Button>
          </Link>
          <Link href="/student">
            <Button size="lg" className="w-full sm:w-auto">
              Preview student flow
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-center text-body-sm text-ink-mute">
          Your student&apos;s work will appear in submissions as they finish.
        </p>
      </div>
    </AppShell>
  );
}
