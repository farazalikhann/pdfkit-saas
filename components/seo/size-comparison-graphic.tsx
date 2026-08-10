/**
 * Inline SVG bar comparison instead of a raster image: this environment has no
 * image-generation/rasterization tooling (no sharp/cwebp/ImageMagick available),
 * so a real WebP couldn't be produced honestly. Inline SVG gets the same
 * fixed-dimension, no-layout-shift, zero-request result without a fabricated
 * asset, swap in a real WebP screenshot here if one becomes available.
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
  const barH = 28;
  const gap = 14;
  const width = 320;
  const height = barH * 2 + gap + 20;

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
        <rect x="0" y="0" width={(beforeWidthPct / 100) * width} height={barH} rx="6" className="fill-muted-foreground/30" />
        <text x="6" y={barH / 2 + 4} className="fill-foreground text-[11px] font-medium">
          {beforeLabel}
        </text>
        <rect
          x="0"
          y={barH + gap}
          width={Math.max(28, (afterWidthPct / 100) * width)}
          height={barH}
          rx="6"
          className="fill-primary"
        />
        <text x="6" y={barH + gap + barH / 2 + 4} className="fill-primary-foreground text-[11px] font-medium">
          {afterLabel}
        </text>
      </svg>
      <figcaption className="mt-1 text-xs text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}
