"use client";

import * as React from "react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { addWatermark } from "@/lib/pdf/watermark";
import type { ToolDefinition } from "@/lib/tools";

const COLORS = [
  { name: "Red", value: { r: 0.6, g: 0.05, b: 0.05 } },
  { name: "Gray", value: { r: 0.4, g: 0.4, b: 0.4 } },
  { name: "Blue", value: { r: 0.1, g: 0.2, b: 0.6 } },
  { name: "Black", value: { r: 0.05, g: 0.05, b: 0.05 } },
];

export function AddWatermarkTool({ tool }: { tool: ToolDefinition }) {
  const [text, setText] = React.useState("CONFIDENTIAL");
  const [opacity, setOpacity] = React.useState(25);
  const [colorIndex, setColorIndex] = React.useState(0);
  const [diagonal, setDiagonal] = React.useState(true);

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Add watermark"}
      canRun={() => text.trim().length > 0}
      options={() => (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wm-text">Watermark text</Label>
            <Input
              id="wm-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="CONFIDENTIAL"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Opacity — {opacity}%</Label>
            <Slider
              value={[opacity]}
              min={5}
              max={80}
              step={5}
              onValueChange={([v]) => setOpacity(v)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  aria-label={c.name}
                  onClick={() => setColorIndex(i)}
                  className={cn(
                    "h-9 w-9 rounded-full border-2",
                    colorIndex === i ? "border-primary" : "border-transparent"
                  )}
                  style={{
                    backgroundColor: `rgb(${c.value.r * 255}, ${c.value.g * 255}, ${c.value.b * 255})`,
                  }}
                />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={diagonal}
              onChange={(e) => setDiagonal(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Diagonal orientation
          </label>
        </div>
      )}
      onProcess={async (files) => {
        const bytes = await addWatermark(files[0], {
          text,
          opacity: opacity / 100,
          color: COLORS[colorIndex].value,
          rotationDegrees: diagonal ? -45 : 0,
        });
        return [
          {
            name: "watermarked.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
