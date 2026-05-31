"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Home, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/shell/app-shell";
import { StudentSidebar } from "@/components/shell/student-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { useDemo } from "@/lib/demo-store";

export default function StudentDonePage() {
  const { state, hydrated } = useDemo();
  const reduceMotion = useReducedMotion();

  if (!hydrated) {
    return (
      <AppShell
        sidebar={<StudentSidebar current="done" />}
        topbar={<Topbar eyebrow="Reading task · complete" />}
      >
        <div className="h-[60vh]" />
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebar={<StudentSidebar current="done" />}
      topbar={<Topbar eyebrow="Reading task · complete" />}
    >
      <div className="mx-auto max-w-2xl pt-4">
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
            <h1 className="mt-6 text-student-2xl font-bold text-ink">
              Sent to your teacher.
            </h1>
            <p className="mt-3 text-body text-ink-soft reading-leading max-w-[44ch] mx-auto">
              Nice work getting your thoughts down. Your teacher will see your
              answer along with how you got there.
            </p>
          </div>

          {state.tidiedDraft && (
            <div className="border-t border-ink/[0.06] px-6 py-6 sm:px-8 sm:py-7">
              <p className="inline-flex items-center gap-1.5 text-eyebrow text-sage-700">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                Your submitted answer
              </p>
              <p className="mt-3 text-body text-ink reading-leading max-w-[60ch]">
                {state.tidiedDraft}
              </p>
            </div>
          )}
        </motion.div>

        <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <Link href="/">
            <Button size="lg" variant="ghost" className="w-full sm:w-auto">
              <Home className="h-4 w-4" strokeWidth={2} />
              Back to start
            </Button>
          </Link>
          <Link href="/teacher/review">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Open the teacher view
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
