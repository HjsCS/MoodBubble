/**
 * Map emotion score (0-100) to an emoji.
 *
 * Ranges:
 *   0-10   → 💩  (extremely low)
 *   11-25  → 😢  (sad)
 *   26-45  → 😐  (meh)
 *   46-55  → 🙂  (okay)
 *   56-75  → 😊  (happy)
 *   76-90  → 😄  (very happy)
 *   91-100 → 🌈  (euphoric)
 */
export function getEmotionEmoji(score: number): string {
  if (score <= 10) return "💩";
  if (score <= 25) return "😢";
  if (score <= 45) return "😐";
  if (score <= 55) return "🙂";
  if (score <= 75) return "😊";
  if (score <= 90) return "😄";
  return "🌈";
}
