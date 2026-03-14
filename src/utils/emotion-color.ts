/**
 * Map an emotion score (1-10) to a color.
 *
 * - 1–3  → red   (negative)
 * - 4–6  → amber (neutral)
 * - 7–10 → green (positive)
 */
export function getEmotionColor(score: number): string {
  if (score <= 3) return "#ef4444"; // red-500
  if (score <= 6) return "#f59e0b"; // amber-500
  return "#22c55e"; // green-500
}

/**
 * Return a human-readable label for the emotion score range.
 */
export function getEmotionLabel(score: number): string {
  if (score <= 3) return "Negative";
  if (score <= 6) return "Neutral";
  return "Positive";
}
