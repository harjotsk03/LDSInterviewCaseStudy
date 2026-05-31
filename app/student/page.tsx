"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check, Volume2, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/shell/app-shell";
import { StudentSidebar } from "@/components/shell/student-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { PageAnim } from "@/components/shell/page-anim";
import { useDemo } from "@/lib/demo-store";
import { useSpeech } from "@/lib/use-speech";
import { cn } from "@/lib/utils";

/**
 * Student Screen — pick a worksheet question.
 *
 * Each question has a Listen button backed by the real Web Speech
 * API. The primary "Start with this one" action lives in the sticky
 * bottom bar so it's always reachable.
 */
export default function StudentSelectPage() {
  const router = useRouter();
  const { state, update, hydrated } = useDemo();
  const { speak, stop, speakingId, supported } = useSpeech();

  const pick = (id: string) => {
    // Picking a different question resets downstream state so a
    // previous run's brain-dump / follow-ups don't bleed through.
    if (state.selectedQuestionId && state.selectedQuestionId !== id) {
      update({
        selectedQuestionId: id,
        brainDump: "",
        scaffolding: [],
        answers: [],
        tidiedDraft: "",
        submitted: false,
      });
    } else {
      update({ selectedQuestionId: id });
    }
  };

  const confirm = () => {
    if (!state.selectedQuestionId) return;
    stop();
    router.push("/student/think");
  };

  const readAll = () => {
    if (speakingId === "read-all") {
      stop();
      return;
    }
    const text = state.worksheetQuestions
      .map((q) => `Question ${q.number}. ${q.text}`)
      .join(" ... ");
    speak("read-all", text);
  };

  if (!hydrated) {
    return (
      <AppShell
        sidebar={<StudentSidebar current="pick" />}
        topbar={<Topbar eyebrow="Reading task · step 1 of 4" />}
      >
        <div className="h-[50vh]" />
      </AppShell>
    );
  }

  return (
    <AppShell
      sidebar={<StudentSidebar current="pick" />}
      topbar={<Topbar eyebrow="Reading task · step 1 of 4" />}
      bottomBar={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 truncate text-body-sm text-ink-soft">
            {state.selectedQuestionId
              ? "Ready when you are — your first thoughts come next."
              : "Pick one question to focus on."}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={readAll}
              disabled={!supported}
            >
              {speakingId === "read-all" ? (
                <Square className="h-4 w-4 fill-current" strokeWidth={2} />
              ) : (
                <Volume2 className="h-4 w-4" strokeWidth={2} />
              )}
              {speakingId === "read-all" ? "Stop" : "Read all"}
            </Button>
            <Button
              size="lg"
              onClick={confirm}
              disabled={!state.selectedQuestionId}
            >
              Start with this one
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </Button>
          </div>
        </div>
      }
    >
      <PageAnim>
        <PageAnim.Item>
          <h1 className="text-student-xl font-bold text-ink leading-[1.2]">
            Pick a question to answer.
          </h1>
          <p className="mt-3 text-body text-ink-soft reading-leading max-w-[52ch]">
            Read them yourself, or tap Listen on any question to hear it. You
            can change your mind before you start.
          </p>
        </PageAnim.Item>

        <PageAnim.Item>
          <ul className="mt-7 space-y-3">
            {state.worksheetQuestions.map((q) => {
              const selected = state.selectedQuestionId === q.id;
              const speakerId = `q-${q.id}`;
              const reading = speakingId === speakerId;
              return (
                <li key={q.id}>
                  <div
                    className={cn(
                      "group relative flex items-start gap-1.5 rounded-2xl border bg-canvas-card pr-2 shadow-soft transition-all",
                      selected
                        ? "border-sage-300 bg-sage-50/40 shadow-hero"
                        : "border-ink/[0.08] hover:border-mist-300 hover:shadow-lift",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => pick(q.id)}
                      aria-pressed={selected}
                      aria-label={`Choose question ${q.number}`}
                      className={cn(
                        "flex flex-1 items-start gap-4 rounded-2xl px-5 py-5 text-left",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[15px] font-bold transition-colors",
                          selected
                            ? "bg-sage-500 text-canvas"
                            : "bg-canvas-deep text-ink-soft group-hover:bg-mist-100 group-hover:text-mist-700",
                        )}
                        aria-hidden
                      >
                        {selected ? (
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          q.number
                        )}
                      </span>
                      <span className="flex-1 text-student text-ink reading-leading max-w-[58ch]">
                        {q.text}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => speak(speakerId, q.text)}
                      aria-pressed={reading}
                      disabled={!supported}
                      aria-label={
                        reading
                          ? `Stop reading question ${q.number}`
                          : `Read question ${q.number} aloud`
                      }
                      className={cn(
                        "mt-4 inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3.5 transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist-300",
                        reading
                          ? "bg-mist-100 text-mist-700"
                          : "text-ink-mute hover:bg-canvas-deep hover:text-ink",
                        !supported && "opacity-60 cursor-not-allowed",
                      )}
                    >
                      {reading ? (
                        <Square
                          className="h-4 w-4 fill-current"
                          strokeWidth={2}
                        />
                      ) : (
                        <Volume2 className="h-4 w-4" strokeWidth={2} />
                      )}
                      <span className="text-body-sm font-bold">
                        {reading ? "Stop" : "Listen"}
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </PageAnim.Item>
      </PageAnim>
    </AppShell>
  );
}
