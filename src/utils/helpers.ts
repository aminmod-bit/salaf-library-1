/* Light helpers — no external deps */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^a-z0-9\u0400-\u04FF\u0600-\u06FF]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatNumber(n: number): string {
  try {
    return new Intl.NumberFormat().format(n);
  } catch {
    return String(n);
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function uniqueBy<T>(arr: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

/** Deterministic color from a string (used for placeholders) */
export function colorFromString(s: string): string {
  const palette = [
    "#0f3d2e", "#1b5e3f", "#144d3a", "#0e3a3d", "#2a3d1a",
    "#3a2a14", "#1f2a3a", "#3a1a2a", "#1a3a2a", "#2a3a1a",
    "#1a2a3a", "#2a1a3a", "#3a1a1a", "#2a2a1a", "#1a3a3a",
  ];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}