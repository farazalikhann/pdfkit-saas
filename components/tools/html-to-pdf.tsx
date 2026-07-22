"use client";

import * as React from "react";
import { toast } from "sonner";
import { Link2, Code2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ResultPanel, type ResultFile } from "@/components/tool-shell/result-panel";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ServerSideNotice } from "@/components/tool-shell/client-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { ToolDefinition } from "@/lib/tools";
import type { PageSize, Orientation } from "@/lib/pdf/html-to-pdf-render";

type Mode = "url" | "paste";
type Margin = "none" | "normal" | "wide";

const MARGIN_MM: Record<Margin, number> = { none: 0, normal: 15, wide: 25 };
const HTML_SIZE_WARN_CHARS = 2_000_000;

export function HtmlToPdfTool({ tool }: { tool: ToolDefinition }) {
  const [mode, setMode] = React.useState<Mode>("url");
  const [url, setUrl] = React.useState("");
  const [html, setHtml] = React.useState("");
  const [pageSize, setPageSize] = React.useState<PageSize>("a4");
  const [orientation, setOrientation] = React.useState<Orientation>("portrait");
  const [margin, setMargin] = React.useState<Margin>("normal");

  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<ResultFile[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const ready =
    mode === "url" ? url.trim().length > 0 : html.trim().length > 0;

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    setHtml(text);
  }

  async function handleConvert() {
    if (!ready) return;
    setState("processing");
    setProgress(0);
    setErrorMessage(null);

    try {
      let rawHtml: string;

      if (mode === "url") {
        let normalizedUrl = url.trim();
        if (!/^https?:\/\//i.test(normalizedUrl)) {
          normalizedUrl = `https://${normalizedUrl}`;
        }
        const res = await fetch("/api/fetch-html", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: normalizedUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Couldn't fetch that URL.");
        rawHtml = data.html;
      } else {
        rawHtml = html;
      }

      if (rawHtml.length > HTML_SIZE_WARN_CHARS) {
        toast.warning(
          "This is a lot of HTML — rendering it could be slow or use a lot of memory on a phone."
        );
      }
      setProgress(8);

      const { renderHtmlToPdf } = await import("@/lib/pdf/html-to-pdf-render");
      const bytes = await renderHtmlToPdf(
        rawHtml,
        { pageSize, orientation, marginMm: MARGIN_MM[margin] },
        (fraction) => setProgress(8 + fraction * 92)
      );

      setResults([
        {
          name: "page.pdf",
          blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
        },
      ]);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      toast.error("Conversion failed", {
        description:
          err instanceof Error ? err.message : "Please try a different page or HTML.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-4 md:pb-16">
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <tool.icon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <ServerSideNotice>
          Fetching a URL runs through our server briefly to avoid browser CORS
          blocks — the page is not stored. Pasted HTML never leaves your device.
        </ServerSideNotice>
        <p className="text-xs text-muted-foreground">
          Renders a snapshot of the page or HTML you provide. JavaScript-heavy
          pages, pages behind a login, and blocked external stylesheets/fonts
          may not render perfectly, and links won&apos;t be clickable in the
          exported PDF.
        </p>
      </div>

      {state === "done" && results ? (
        <div className="space-y-3">
          <ResultPanel tool={tool} results={results} />
          <button
            type="button"
            onClick={() => {
              setResults(null);
              setState("idle");
            }}
            className="mx-auto block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Convert another page
          </button>
        </div>
      ) : state === "processing" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
          <ProgressRing progress={progress} />
          <p className="text-sm text-muted-foreground">Rendering your PDF…</p>
          <div className="w-full max-w-xs space-y-2 px-6">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="url" className="gap-1.5">
                <Link2 className="h-4 w-4" />
                From URL
              </TabsTrigger>
              <TabsTrigger value="paste" className="gap-1.5">
                <Code2 className="h-4 w-4" />
                Paste HTML
              </TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="space-y-1.5">
              <Label htmlFor="html-pdf-url">Page URL</Label>
              <Input
                id="html-pdf-url"
                placeholder="example.com/page"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                inputMode="url"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </TabsContent>
            <TabsContent value="paste" className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="html-pdf-paste">Raw HTML</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload .html
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm,text/html"
                  className="hidden"
                  onChange={handleUploadFile}
                />
              </div>
              <textarea
                id="html-pdf-paste"
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="<html>...</html>"
                rows={10}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Page size</Label>
              <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="letter">Letter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Orientation</Label>
              <Select
                value={orientation}
                onValueChange={(v) => setOrientation(v as Orientation)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Margins</Label>
              <Select value={margin} onValueChange={(v) => setMargin(v as Margin)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="wide">Wide</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {errorMessage && state === "error" && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {state !== "done" && (
        <ActionBar
          state={!ready ? "idle" : state === "idle" ? "ready" : state}
          label="Convert to PDF"
          progress={progress}
          onAction={handleConvert}
          disabledReason={
            !ready
              ? mode === "url"
                ? "Enter a URL to get started"
                : "Paste some HTML to get started"
              : undefined
          }
        />
      )}
    </div>
  );
}
