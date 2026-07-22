"use client";

import * as React from "react";
import { Send, Loader2, FileText } from "lucide-react";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { toast } from "sonner";
import type { ToolDefinition } from "@/lib/tools";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Chat is a multi-turn conversation, not a single transform-and-download task,
 * so it uses its own layout instead of the shared ToolShell.
 */
export function ChatWithPdfTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [base64, setBase64] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, sending]);

  async function handleFiles(files: File[]) {
    const f = files[0];
    setFile(f);
    setBase64(await fileToBase64(f));
    setMessages([]);
  }

  async function handleSend() {
    const question = input.trim();
    if (!question || !base64 || sending) return;

    const nextHistory: ChatMessage[] = [...messages, { role: "user", text: question }];
    setMessages(nextHistory);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, history: nextHistory }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat failed");
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100dvh-56px)] max-w-2xl flex-col px-4 pb-[calc(72px+56px+env(safe-area-inset-bottom))] pt-4 md:h-[calc(100dvh-56px)] md:pb-20">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <tool.icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold leading-tight">{tool.name}</h1>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </div>

      {!file ? (
        <UploadZone
          accept={tool.accept}
          multiple={false}
          maxFiles={1}
          onFiles={handleFiles}
          acceptHint="One PDF at a time"
        />
      ) : (
        <>
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{file.name}</span>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-border bg-muted/20 p-3"
          >
            {messages.length === 0 && (
              <p className="pt-8 text-center text-sm text-muted-foreground">
                Ask anything about this document to get started.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3.5 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="fixed inset-x-0 z-40 flex gap-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur bottom-[calc(56px+env(safe-area-inset-bottom))] md:bottom-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this PDF…"
              className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none ring-primary/30 focus:ring-2"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              aria-label="Send"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
