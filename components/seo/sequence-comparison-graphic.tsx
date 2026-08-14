/**
 * Same rationale as SizeComparisonGraphic: no sharp/cwebp/ImageMagick in this
 * environment, so a real WebP screenshot can't be produced honestly. Inline
 * SVG gives the same fixed-dimension, zero-request result for a sequence
 * comparison (not a magnitude, so bar width is never used to imply one).
 */
export function SequenceComparisonGraphic({
  wrongLabel,
  wrongSequence,
  rightLabel,
  rightSequence,
  caption,
}: {
  wrongLabel: string;
  wrongSequence: string;
  rightLabel: string;
  rightSequence: string;
  caption: string;
}) {
  const width = 320;
  const rowH = 44;
  const gap = 12;
  const height = rowH * 2 + gap;

  return (
    <figure className="my-2">
      <svg
        role="img"
        aria-label={caption}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="h-auto w-full max-w-sm"
      >
        <title>{caption}</title>
        <rect x="0" y="0" width={width} height={rowH} rx="8" className="fill-destructive" fillOpacity={0.12} />
        <text x="10" y="16" className="fill-destructive text-[9px] font-semibold uppercase tracking-wide">
          {wrongLabel}
        </text>
        <text x="10" y="34" className="fill-foreground text-[12px] font-mono">
          {wrongSequence}
        </text>

        <rect x="0" y={rowH + gap} width={width} height={rowH} rx="8" className="fill-primary" fillOpacity={0.1} />
        <text x="10" y={rowH + gap + 16} className="fill-primary text-[9px] font-semibold uppercase tracking-wide">
          {rightLabel}
        </text>
        <text x="10" y={rowH + gap + 34} className="fill-foreground text-[12px] font-mono">
          {rightSequence}
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
