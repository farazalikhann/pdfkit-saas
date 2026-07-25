"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ServerSideNotice } from "@/components/tool-shell/client-badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractPdfText } from "@/lib/pdf/extract-text";
import { buildQuizHtml, buildQuizText } from "@/lib/ai/quiz-pdf";
import type { McqQuestion, McqDifficulty } from "@/lib/ai/provider";
import { downloadBlob, cn } from "@/lib/utils";
import type { ToolDefinition } from "@/lib/tools";

const LIMITS = { maxPages: 50, maxCharacters: 100_000 };
const LETTERS = ["A", "B", "C", "D"];

export function McqPdfTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [count, setCount] = React.useState(10);
  const [difficulty, setDifficulty] = React.useState<McqDifficulty>("medium");
  const [includeAnswerKey, setIncludeAnswerKey] = React.useState(true);
  const [revealed, setRevealed] = React.useState<Set<number>>(new Set());

  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [questions, setQuestions] = React.useState<McqQuestion[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function handleFiles(files: File[]) {
    const f = files[0] ?? null;
    setFile(f);
    setQuestions(null);
    setRevealed(new Set());
    setState("idle");
  }

  function toggleReveal(index: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleGenerate() {
    if (!file) return;
    setState("processing");
    setProgress(0.1);
    setErrorMessage(null);
    try {
      const { text } = await extractPdfText(file, LIMITS, (f) => setProgress(f * 0.4));
      if (!text.trim()) {
        throw new Error("Couldn't find any text in this PDF — it may be a scanned image without OCR.");
      }
      const res = await fetch("/api/ai/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, count, difficulty }),
      });
      setProgress(0.9);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Question generation failed");
      setQuestions(data.questions);
      setRevealed(new Set());
      setProgress(1);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      toast.error("Couldn't generate questions", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  function downloadTxt() {
    if (!questions) return;
    downloadBlob(
      new Blob([buildQuizText(questions, includeAnswerKey)], { type: "text/plain" }),
      "quiz.txt"
    );
  }

  async function downloadPdf() {
    if (!questions) return;
    const { renderHtmlToPdf } = await import("@/lib/pdf/html-to-pdf-render");
    const bytes = await renderHtmlToPdf(buildQuizHtml(questions, includeAnswerKey), {
      pageSize: "a4",
      orientation: "portrait",
      marginMm: 20,
    });
    downloadBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "quiz.pdf");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-4 md:pb-16">
      <div className="mb-4 space-y-2">
        <ServerSideNotice>
          This tool sends your document&apos;s text to Google&apos;s Gemini API for
          processing. See our{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </ServerSideNotice>
      </div>

      {!file ? (
        <UploadZone accept={tool.accept} multiple={false} maxFiles={1} onFiles={handleFiles} acceptHint="One file at a time" />
      ) : state === "processing" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
          <ProgressRing progress={progress * 100} />
          <p className="text-sm text-muted-foreground">Generating questions…</p>
        </div>
      ) : questions ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="space-y-2 rounded-xl border border-border bg-card p-4">
                <p className="font-medium">
                  {i + 1}. {q.question}
                </p>
                <div className="space-y-1">
                  {q.options.map((opt, j) => (
                    <div
                      key={j}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm",
                        revealed.has(i) && j === q.correctIndex
                          ? "border-emerald-500 bg-emerald-500/10 font-medium"
                          : "border-border"
                      )}
                    >
                      {LETTERS[j]}. {opt}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-xs font-medium text-primary"
                  onClick={() => toggleReveal(i)}
                >
                  {revealed.has(i) ? "Hide answer" : "Show answer"}
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={downloadTxt}>
              Download .txt
            </Button>
            <Button className="flex-1" onClick={downloadPdf}>
              Download PDF
            </Button>
          </div>

          <button
            type="button"
            onClick={() => {
              setFile(null);
              setQuestions(null);
              setState("idle");
            }}
            className="mx-auto block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Generate another quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="mcq-count">Number of questions</Label>
              <Input
                id="mcq-count"
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as McqDifficulty)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={includeAnswerKey} onCheckedChange={(v) => setIncludeAnswerKey(v === true)} />
            Include answer key
          </label>
        </div>
      )}

      {errorMessage && state === "error" && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p>
      )}

      {state !== "done" && file && (
        <ActionBar state={state === "idle" ? "ready" : state} label="Generate MCQs" progress={progress * 100} onAction={handleGenerate} />
      )}
    </div>
  );
}
