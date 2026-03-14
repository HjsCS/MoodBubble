"use client";

import type { MoodEntry } from "@/types/database";
import { getEmotionColor, getEmotionLabel } from "@/utils/emotion-color";
import { EMOTION_CATEGORIES } from "@/utils/categories";

interface EntryCardProps {
  entry: MoodEntry;
}

/**
 * A card showing details of a single mood entry.
 */
export default function EntryCard({ entry }: EntryCardProps) {
  const color = getEmotionColor(entry.emotion_score);
  const label = getEmotionLabel(entry.emotion_score);
  const cat = EMOTION_CATEGORIES[entry.category];
  const time = new Date(entry.created_at).toLocaleString();

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{time}</span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
          style={{ backgroundColor: color }}
        >
          {label} ({entry.emotion_score}/10)
        </span>
      </div>

      {/* Category */}
      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 mb-1">
        {cat.emoji} {cat.label}
      </p>

      {/* Note */}
      {entry.note && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{entry.note}</p>
      )}

      {/* Media */}
      {entry.media_url && (
        <img
          src={entry.media_url}
          alt="Mood entry media"
          className="mt-2 rounded-lg w-full max-h-48 object-cover"
        />
      )}
    </div>
  );
}
