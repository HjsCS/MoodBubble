"use client";

import type { MoodEntry } from "@/types/database";
import {
  getEmotionColor,
  getEmotionAccentColor,
  getEmotionLabel,
} from "@/utils/emotion-color";
import { EMOTION_CATEGORIES } from "@/utils/categories";

interface EntryCardProps {
  entry: MoodEntry;
}

/**
 * A card showing details of a single mood entry — Figma-styled.
 */
export default function EntryCard({ entry }: EntryCardProps) {
  const bgColor = getEmotionColor(entry.emotion_score);
  const accentColor = getEmotionAccentColor(entry.emotion_score);
  const label = getEmotionLabel(entry.emotion_score);
  const cat = EMOTION_CATEGORIES[entry.category];
  const time = new Date(entry.created_at);
  const timeAgo = getTimeAgo(time);

  return (
    <div className="bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] p-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-[16px] h-[16px] rounded-full"
            style={{ backgroundColor: bgColor }}
          />
          <span className="text-[13px]" style={{ color: accentColor }}>
            {label.toLowerCase()}
          </span>
        </div>
        <span className="text-[12px] text-[#6a7282]">
          {entry.emotion_score}/10
        </span>
      </div>

      {/* Note */}
      {entry.note && (
        <p className="text-[14px] font-medium text-[#101828] mb-2">
          {entry.note}
        </p>
      )}

      {/* Category + time */}
      <div className="flex items-center gap-1 text-[12px] text-[#6a7282]">
        <span>
          {cat.emoji} {cat.label}
        </span>
        <span>·</span>
        <span>{timeAgo}</span>
      </div>

      {/* Media */}
      {entry.media_url && (
        <img
          src={entry.media_url}
          alt="Mood entry media"
          className="mt-3 rounded-[16px] w-full max-h-48 object-cover"
        />
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
