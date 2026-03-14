/**
 * Map an emotion score (1-10) to a color (Figma palette).
 *
 * - 1–3  → soft pink (negative)
 * - 4–6  → warm yellow (neutral)
 * - 7–10 → soft green (positive)
 */
export function getEmotionColor(score: number): string {
  if (score <= 3) return "#ffd4d4";
  if (score <= 6) return "#ffe8b8";
  return "#b8e6d5";
}

/** Darker accent color for borders / text */
export function getEmotionAccentColor(score: number): string {
  if (score <= 3) return "#e89b9b";
  if (score <= 6) return "#e8b963";
  return "#6baa96";
}

/** Background with alpha for map bubbles */
export function getEmotionBubbleBg(score: number): string {
  if (score <= 3) return "rgba(255,200,200,0.4)";
  if (score <= 6) return "rgba(255,248,200,0.4)";
  return "rgba(200,240,200,0.4)";
}

/** Border color for map bubbles */
export function getEmotionBubbleBorder(score: number): string {
  if (score <= 3) return "#ffc8c8";
  if (score <= 6) return "#fff8c8";
  return "#c8f0c8";
}

/**
 * Return a human-readable label for the emotion score range.
 */
export function getEmotionLabel(score: number): string {
  if (score <= 3) return "Negative";
  if (score <= 6) return "Neutral";
  return "Positive";
}
