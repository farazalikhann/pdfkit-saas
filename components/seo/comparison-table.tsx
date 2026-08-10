import { Check, X, Minus } from "lucide-react";

export interface ComparisonRow {
  feature: string;
  thisTool: string | boolean;
  typical: string | boolean;
}

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-label="Yes" />
    ) : (
      <X className="h-4 w-4 text-destructive" aria-label="No" />
    );
  }
  if (value === "n/a") return <Minus className="h-4 w-4 text-muted-foreground" aria-label="Not applicable" />;
  return <span>{value}</span>;
}

/** Renders a "this tool vs typical online compressors" table, no invented competitor names or numbers, only general, qualified patterns. */
export function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[480px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-left">
            <th className="px-3 py-2 font-semibold">Feature</th>
            <th className="px-3 py-2 font-semibold">This tool</th>
            <th className="px-3 py-2 font-semibold">Typical online compressor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i > 0 ? "border-t border-border" : undefined}>
              <td className="px-3 py-2.5 font-medium">{row.feature}</td>
              <td className="px-3 py-2.5">
                <Cell value={row.thisTool} />
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                <Cell value={row.typical} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
