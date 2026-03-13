export function getEmotionColor(score) {

  if (score <= 3) return "#ff4d4d";  // negative
  if (score <= 6) return "#ffc107";  // neutral
  return "#4caf50"; // positive

}