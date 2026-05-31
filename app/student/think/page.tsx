"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { AppShell } from "@/components/shell/app-shell";
import { StudentSidebar } from "@/components/shell/student-sidebar";
import { Topbar } from "@/components/shell/topbar";
import { PageAnim } from "@/components/shell/page-anim";
import { MicButton } from "@/components/student/mic-button";
import { ReadAloud } from "@/components/student/read-aloud";
import {
  useDemo,
  useSelectedWorksheetQuestion,
  generateScaffolding,
} from "@/lib/demo-store";

/**
 * Brain-dump for the selected worksheet question. Mic is the hero
 * affordance. Hitting "Done thinking" opens an explanation modal
 * before navigating to the follow-up step.
 */
const SAMPLE_BRAIN_DUMPS: Record<string, string> = {
  w1: "Okay so um at the start she's kind of scared of it? Like she calls it creepy and she doesn't want to go near it. And then her grandma tells her that story about her dad and then she like — she starts to think it's different. By the end she's at the top of it watching the sunset. She calls it hers.",
  w2: "Her grandma kind of changes things for her. She tells Mira about her great-grandfather climbing it on storm nights. Before that Mira just thought it was creepy. After the story she's different about it.",
  w3: "There's this bit where she calls the lighthouse a bone and then later a candle. That's the image that stuck with me. Same shape but totally different feeling.",
  w4: "I don't think I would have at the start. It looks creepy and the door is always closed. But maybe if my grandma told me a story like that about my own family I'd want to.",
};

export default function StudentThinkPage() {
  const router = useRouter();
  const { state, update, hydrated } = useDemo();
  const selected = useSelectedWorksheetQuestion();
  const [listening, setListening] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const liveDumpRef = useRef(state.brainDump);
  useEffect(() => {
    liveDumpRef.current = state.brainDump;
  }, [state.brainDump]);

  useEffect(() => {
    if (hydrated && !state.selectedQuestionId) {
      router.replace("/student");
    }
  }, [hydrated, state.selectedQuestionId, router]);

  if (!hydrated || !selected) {
    return (
      <AppShell
        sidebar={<StudentSidebar current="think" />}
        topbar={<Topbar eyebrow="Reading task · step 2 of 4" />}
      >
        <div className="h-[50vh]" />
      </AppShell>
    );
  }

  const onTranscriptChunk = (chunk: string) => {
    liveDumpRef.current = (liveDumpRef.current + chunk).replace(/\s+/g, " ");
    update({ brainDump: liveDumpRef.current });
  };

  const canAdvance = state.brainDump.trim().length > 0;

  const openNextStep = () => {
    if (!canAdvance) return;
    setModalOpen(true);
  };

  const confirmContinue = () => {
    if (navigating) return;
    setNavigating(true);
    const generated = generateScaffolding(
      state.selectedQuestionId,
      state.brainDump,
    );
    update({ scaffolding: generated, answers: [] });
    router.push("/student/scaffolding");
  };

  const mockText = SAMPLE_BRAIN_DUMPS[selected.id] ?? SAMPLE_BRAIN_DUMPS["w1"];

  return (
    <>
      <AppShell
        sidebar={<StudentSidebar current="think" />}
        topbar={<Topbar eyebrow="Reading task · step 2 of 4" />}
        bottomBar={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="min-w-0 truncate text-body-sm text-ink-soft">
              Next: a few follow-ups drawn from what you said.
            </p>
            <Button
              size="lg"
              onClick={openNextStep}
              disabled={!canAdvance || listening || navigating}
            >
              Done thinking
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            </Button>
          </div>
        }
      >
        <PageAnim>
          <PageAnim.Item>
            <h1 className="text-student-xl font-bold text-ink leading-[1.2]">
              First thoughts.
            </h1>
            <p className="mt-3 text-body text-ink-soft reading-leading max-w-[52ch]">
              Speak or type — fragments and pauses are fine. Nobody is grading
              this part. We&apos;re just getting your first version out.
            </p>
          </PageAnim.Item>

          <PageAnim.Item>
            <section
              className="mt-7 rounded-3xl border border-ink/[0.07] bg-canvas-card p-5 sm:p-7 shadow-soft"
              aria-labelledby="question-headline"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-ink/[0.06] pb-4">
                <div className="min-w-0">
                  <p className="text-eyebrow">Your question</p>
                  <p
                    id="question-headline"
                    className="mt-1.5 text-student font-semibold text-ink reading-leading max-w-[54ch]"
                  >
                    {selected.text}
                  </p>
                </div>
                <ReadAloud
                  id={`think-q-${selected.id}`}
                  text={selected.text}
                  label="Listen"
                />
              </div>

              <div className="mt-5 flex flex-col items-center">
                <MicButton
                  mockTranscript={mockText}
                  onTranscriptChunk={onTranscriptChunk}
                  onStateChange={(s) => setListening(s === "listening")}
                />
              </div>

              <div className="mt-6">
                <label
                  htmlFor="brain-dump"
                  className="text-eyebrow"
                >
                  Your thoughts so far
                </label>
                <Textarea
                  id="brain-dump"
                  value={state.brainDump}
                  onChange={(e) => {
                    liveDumpRef.current = e.target.value;
                    update({ brainDump: e.target.value });
                  }}
                  placeholder="It's okay to be messy here. Speak or type — fragments are fine."
                  className="mt-2 min-h-[120px] text-student reading-leading"
                  aria-live="polite"
                  aria-busy={listening}
                />
              </div>
            </section>
          </PageAnim.Item>
        </PageAnim>
      </AppShell>

      <Modal
        open={modalOpen}
        onClose={() => !navigating && setModalOpen(false)}
        icon={<Sparkles className="h-5 w-5" strokeWidth={2} />}
        title="Nice work. Here's what's next."
        primaryAction={
          <Button size="md" onClick={confirmContinue} disabled={navigating}>
            {navigating ? "Setting up…" : "OK, let's go"}
            {!navigating && (
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
            )}
          </Button>
        }
        secondaryAction={
          <Button
            variant="ghost"
            size="md"
            onClick={() => setModalOpen(false)}
            disabled={navigating}
          >
            Keep thinking
          </Button>
        }
      >
        <p className="reading-leading">
          I&apos;ll ask you a few short follow-up questions to help you
          organise what you said into a clear answer. Each one comes from your
          own words — they&apos;re not a checklist, and they&apos;re not a
          test.
        </p>
        <p className="mt-3 reading-leading">
          Answer them in any order you like. You can skip any prompt that
          doesn&apos;t fit, and you&apos;ll see the final answer before you
          submit.
        </p>
      </Modal>
    </>
  );
}
