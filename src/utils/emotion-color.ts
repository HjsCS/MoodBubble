/**
 * Continuous emotion color system.
 *
 * Score 0-100 maps to a smooth gradient:
 *   0   → Blue   rgb(59, 130, 246)   — low / sad
 *   50  → Yellow rgb(234, 179, 8)    — neutral
 *   100 → Red    rgb(239, 68, 68)    — high / excited
 */

/** RGB tuple */
type RGB = [number, number, number];

const BLUE: RGB = [59, 130, 246];
const YELLOW: RGB = [234, 179, 8];
const RED: RGB = [239, 68, 68];

/** Linearly interpolate between two RGB colors */
function lerp(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** Core: score (0-100) → RGB tuple */
function scoreToRgb(score: number): RGB {
  const s = Math.max(0, Math.min(100, score));
  if (s <= 50) {
    return lerp(BLUE, YELLOW, s / 50);
  }
  return lerp(YELLOW, RED, (s - 50) / 50);
}

/** Convert RGB tuple to hex string */
function rgbToHex([r, g, b]: RGB): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// ─── Public API (same signatures as before) ───────────────────

/** Solid fill color for cards, badges, etc. */
export function getEmotionColor(score: number): string {
  return rgbToHex(scoreToRgb(score));
}

/** Darker accent color for borders / text — same hue, higher saturation */
export function getEmotionAccentColor(score: number): string {
  const [r, g, b] = scoreToRgb(score);
  // Darken by 25%
  return rgbToHex([
    Math.round(r * 0.75),
    Math.round(g * 0.75),
    Math.round(b * 0.75),
  ]);
}

/** Background with alpha for map bubbles */
export function getEmotionBubbleBg(score: number): string {
  const [r, g, b] = scoreToRgb(score);
  return `rgba(${r},${g},${b},0.35)`;
}

/** Border color for map bubbles — slightly lighter */
export function getEmotionBubbleBorder(score: number): string {
  const [r, g, b] = scoreToRgb(score);
  return `rgba(${r},${g},${b},0.6)`;
}

/** Human-readable label */
export function getEmotionLabel(score: number): string {
  if (score <= 20) return "Very Low";
  if (score <= 40) return "Low";
  if (score <= 60) return "Neutral";
  if (score <= 80) return "High";
  return "Very High";
}

/** CSS gradient string for the slider track (blue → yellow → red) */
export function getSliderGradient(): string {
  return `linear-gradient(90deg, ${rgbToHex(BLUE)} 0%, ${rgbToHex(YELLOW)} 50%, ${rgbToHex(RED)} 100%)`;
}
