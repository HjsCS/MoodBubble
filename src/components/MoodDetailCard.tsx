"use client";

import type { MoodEntry } from "@/types/database";
import type { MoodEntryWithAuthor } from "@/types/database";
import { getEmotionColor, getEmotionBubbleBorder } from "@/utils/emotion-color";
import { EMOTION_CATEGORIES } from "@/utils/categories";
import UserAvatar from "@/components/UserAvatar";

interface MoodDetailCardProps {
  entry: MoodEntry | MoodEntryWithAuthor;
  onClick?: () => void;
  /** Show "Xxx's mood" label for friend entries */
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  locationName?: string | null;
}

/** Format relative time */
function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/**
 * MoodDetail card matching Figma MoodDetail design (node 35:229).
 *
 * Layout:
 * - Optional image (rounded top, full width)
 * - Colored dot + category label (uppercase, tracking-wide)
 * - Note text
 * - Time · Location row
 */
export default function MoodDetailCard({
  entry,
  onClick,
  authorName,
  authorAvatarUrl,
  locationName,
}: MoodDetailCardProps) {
  const cat = EMOTION_CATEGORIES[entry.category];
  const dotColor = getEmotionBubbleBorder(entry.emotion_score);

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white flex flex-col items-start p-6 rounded-[32px] shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] w-full text-left transition-transform active:scale-[0.98] overflow-hidden"
    >
      {/* Author label (friend entries) */}
      {authorName && (
        <div className="flex items-center gap-1.5 mb-2">
          <UserAvatar url={authorAvatarUrl} name={authorName} size={20} />
          <p className="text-[11px] font-medium text-[#9b72c0]">
            {authorName}&apos;s mood
          </p>
        </div>
      )}

      {/* Image — only shown if media_url exists */}
      {entry.media_url && (
        <div
          className="w-full h-[116px] rounded-[24px] overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] mb-[15px]"
          style={{ backgroundColor: getEmotionColor(entry.emotion_score) }}
        >
          <img
            src={entry.media_url}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Colored dot + Category label */}
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded-full shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
          style={{ backgroundColor: dotColor }}
        />
        <span className="font-['Poppins',sans-serif] text-[12px] font-semibold text-[#6a7282] uppercase tracking-[1.2px]">
          {cat.label}
        </span>
      </div>

      {/* Note */}
      {entry.note && (
        <p className="font-['Poppins',sans-serif] text-[15px] font-medium text-[#1e2939] leading-[24px] mt-2">
          {entry.note}
        </p>
      )}

      {/* Reaction summary (read-only — card itself is a button) */}
      {(entry.reactions ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(() => {
            const counts = new Map<string, number>();
            for (const r of entry.reactions ?? []) {
              counts.set(r.emoji, (counts.get(r.emoji) ?? 0) + 1);
            }
            return Array.from(counts.entries()).map(([emoji, count]) => (
              <span
                key={emoji}
                className="flex items-center gap-0.5 h-[24px] px-1.5 rounded-full bg-[#f3f4f6] text-[12px]"
              >
                <span>{emoji}</span>
                <span className="text-[10px] text-[#6a7282] font-medium">
                  {count}
                </span>
              </span>
            ));
          })()}
        </div>
      )}

      {/* Time · Location row */}
      <div className="flex items-center flex-wrap gap-x-0.5 mt-[5px]">
        <span className="font-['Poppins',sans-serif] text-[12px] font-medium text-[#6a7282]">
          {timeAgo(entry.created_at)}
        </span>
        {locationName && (
          <>
            <svg
              width="16"
              height="16"
              viewBox="0 0 256 256"
              className="text-[#6a7282] shrink-0"
            >
              <circle cx="128" cy="128" r="48" fill="currentColor" />
            </svg>
            <span className="font-['Poppins',sans-serif] text-[12px] font-medium text-[#6a7282] truncate max-w-[160px]">
              {locationName}
            </span>
          </>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 256 256"
          className="text-[#6a7282] shrink-0"
        >
          <circle cx="128" cy="128" r="48" fill="currentColor" />
        </svg>
        <span className="font-['Poppins',sans-serif] text-[12px] font-medium text-[#6a7282]">
          {entry.visibility === "friends" ? "Shared" : "Private"}
        </span>
      </div>
    </button>
  );
}
