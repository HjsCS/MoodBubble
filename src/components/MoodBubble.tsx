"use client";

import { getEmotionColor } from "@/utils/emotion-color";
import { getBubbleSize } from "@/utils/bubble-scale";

interface MoodBubbleProps {
  emotionScore: number;
  entryCount?: number;
  onClick?: () => void;
}

/**
 * A circular bubble marker whose color reflects emotion
 * and size reflects the number of entries at a location.
 */
export default function MoodBubble({
  emotionScore,
  entryCount = 1,
  onClick,
}: MoodBubbleProps) {
  const size = getBubbleSize(entryCount);
  const color = getEmotionColor(emotionScore);

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border-2 border-white/60 shadow-lg transition-transform hover:scale-110 cursor-pointer"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity: 0.85,
      }}
      aria-label={`Mood bubble — score ${emotionScore}`}
    />
  );
}
