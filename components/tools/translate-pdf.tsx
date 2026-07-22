"use client";

import * as React from "react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ToolDefinition } from "@/lib/tools";

const LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Hindi",
  "Japanese",
  "Mandarin Chinese",
  "Arabic",
];

export function TranslatePdfTool({ tool }: { tool: ToolDefinition }) {
  const [language, setLanguage] = React.useState("Spanish");

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => `Translate to ${language}`}
      options={() => (
        <div className="space-y-1.5">
          <Label>Target language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      onProcess={async (files) => {
        const form = new FormData();
        form.append("file", files[0]);
        form.append("targetLanguage", language);

        const res = await fetch("/api/ai/translate", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Translation failed");

        return [
          {
            name: `translated-${language.toLowerCase()}.txt`,
            blob: new Blob([data.translation], { type: "text/plain" }),
          },
        ];
      }}
    />
  );
}
