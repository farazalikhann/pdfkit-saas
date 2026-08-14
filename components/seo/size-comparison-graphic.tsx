/**
 * Inline SVG bar comparison instead of a raster image: this environment has no
 * image-generation/rasterization tooling (no sharp/cwebp/ImageMagick available),
 * so a real WebP couldn't be produced honestly. Inline SVG gets the same
 * fixed-dimension, no-layout-shift, zero-request result without a fabricated
 * asset, swap in a real WebP screenshot here if one becomes available.
 *
 * Labels are drawn above each bar in the page's normal text color rather than
 * inside it: a bar representing a big reduction (the component's main use
 * case) can be too narrow to hold its own label, and text relying on the bar
 * for contrast becomes unreadable once it overflows onto the page background.
 */
export function SizeComparisonGraphic({
  beforeLabel,
  afterLabel,
  beforeWidthPct = 100,
  afterWidthPct,
  caption,
}: {
  beforeLabel: string;
  afterLabel: string;
  beforeWidthPct?: number;
  afterWidthPct: number;
  caption: string;
}) {
  const labelH = 14;
  const barH = 16;
  const rowH = labelH + barH + 4;
  const rowGap = 10;
  const width = 320;
  const height = rowH * 2 + rowGap;

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
        <text x="0" y={labelH - 2} className="fill-foreground text-[11px] font-medium">
          {beforeLabel}
        </text>
        <rect
          x="0"
          y={labelH + 2}
          width={(beforeWidthPct / 100) * width}
          height={barH}
          rx="4"
          className="fill-muted-foreground"
          fillOpacity={0.3}
        />

        <text x="0" y={rowH + rowGap + labelH - 2} className="fill-foreground text-[11px] font-medium">
          {afterLabel}
        </text>
        <rect
          x="0"
          y={rowH + rowGap + labelH + 2}
          width={Math.max(14, (afterWidthPct / 100) * width)}
          height={barH}
          rx="4"
          className="fill-primary"
        />
      </svg>
      <figcaption className="mt-1 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
