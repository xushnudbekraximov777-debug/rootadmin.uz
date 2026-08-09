import { ACCENT_COLORS } from "./types";

function hexToRgb(hex: string): string | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return `${parseInt(m[1], 16)} ${parseInt(m[2], 16)} ${parseInt(m[3], 16)}`;
}

export function applyAccent(color: string) {
  if (ACCENT_COLORS[color]) {
    document.documentElement.style.setProperty("--accent", ACCENT_COLORS[color].rgb);
    return;
  }
  const rgb = hexToRgb(color);
  if (rgb) {
    document.documentElement.style.setProperty("--accent", rgb);
  }
}

export function formatDateRange(start: string, end: string, current?: boolean): string {
  if (current || !end) return `${start} — Present`;
  return `${start} — ${end}`;
}
