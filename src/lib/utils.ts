import { ACCENT_COLORS } from "./types";

export function applyAccent(color: string) {
  const c = ACCENT_COLORS[color] ?? ACCENT_COLORS.cyan;
  document.documentElement.style.setProperty("--accent", c.rgb);
}

export function formatDateRange(start: string, end: string, current?: boolean): string {
  if (current || !end) return `${start} — Present`;
  return `${start} — ${end}`;
}
