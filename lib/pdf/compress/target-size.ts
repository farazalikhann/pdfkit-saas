/** Parses "500 KB", "2MB", "1.5 mb", "800000" etc. into a byte count, or null if unparseable. */
export function parseTargetSize(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const match = trimmed.match(/^([\d.]+)\s*(b|kb|mb|gb)?$/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  const unit = (match[2] ?? "mb").toLowerCase();
  const multiplier = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 }[unit] ?? 1024 * 1024;
  return Math.round(value * multiplier);
}
