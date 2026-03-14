"use client";

import { useCallback } from "react";
import { X, MapPin, Clock, Eye } from "lucide-react";
import type { MoodEntry, MoodEntryWithAuthor } from "@/types/database";
import {
  getEmotionColor,
  getEmotionBubbleBorder,
} from "@/utils/emotion-color";
import { EMOTION_CATEGORIES } from "@/utils/categories";

interface MoodDetailModalProps {
  entry: (MoodEntry | MoodEntryWithAuthor) & { is_own?: boolean };
  isOpen: boolean;
  onClose: () => void;
  /** Called when user taps "Show on Map" */
  onLocate?: () => void;
  /** For friend entries */
  authorName?: string | null;
  /** Resolved location name */
  locationName?: string | null;
}

/** Format full date */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
 * Full-screen modal showing detailed mood entry info.
 * Shown when clicking a MoodDetailCard.
 *
 * Layout (top to bottom):
 * - Image (if exists, full-width hero)
 * - Colored dot + Category label
 * - Note text
 * - Time row (clock icon + full date)
 * - Location row (pin icon + location name)
 * - Visibility badge
 * - "Show on Map" button (optional)
 */
export default function MoodDetailModal({
  entry,
  isOpen,
  onClose,
  onLocate,
  authorName,
  locationName,
}: MoodDetailModalProps) {
  const cat = EMOTION_CATEGORIES[entry.category];
  const dotColor = getEmotionBubbleBorder(entry.emotion_score);
  const bgColor = getEmotionColor(entry.emotion_score);

  const stopPropagation = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.stopPropagation();
    },
    [],
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/30"
        onClick={onClose}
      />

      {/* Bottom sheet modal */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] max-h-[85vh] flex flex-col rounded-t-[32px] bg-[#fefbf6] shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] animate-slide-up"
        onTouchMove={stopPropagation}
        onTouchStart={stopPropagation}
        onMouseDown={stopPropagation}
      >
        {/* Close button */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <div className="w-9" />
          <div className="w-[40px] h-[4px] rounded-full bg-[#d1d5db]" />
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors"
            aria-label="Close"
          >
            <X size={16} className="text-[#6a7282]" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-[max(env(safe-area-inset-bottom,24px),24px)]">
          {/* Author label */}
          {authorName && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-[12px] bg-[#f5f0ff]">
              <span className="text-[12px] text-[#9b72c0] font-medium">
                {authorName}&apos;s mood
              </span>
            </div>
          )}

          {/* Hero image */}
          {entry.media_url && (
            <div
              className="w-full rounded-[24px] overflow-hidden shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] mb-5"
              style={{ backgroundColor: bgColor }}
            >
              <img
                src={entry.media_url}
                alt="Mood photo"
                className="w-full max-h-[240px] object-cover"
              />
            </div>
          )}

          {/* Colored dot + Category */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-4 h-4 rounded-full shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]"
              style={{ backgroundColor: dotColor }}
            />
            <span className="font-['Poppins',sans-serif] text-[12px] font-semibold text-[#6a7282] uppercase tracking-[1.2px]">
              {cat.label}
            </span>
          </div>

          {/* Note */}
          {entry.note ? (
            <p className="font-['Poppins',sans-serif] text-[16px] font-medium text-[#1e2939] leading-[26px] mb-5">
              {entry.note}
            </p>
          ) : (
            <p className="text-[14px] text-[#99a1af] italic mb-5">
              No note added.
            </p>
          )}

          {/* Metadata section */}
          <div className="flex flex-col gap-3 mb-5">
            {/* Time */}
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                <Clock size={16} className="text-[#6a7282]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-medium text-[#364153]">
                  {formatDate(entry.created_at)}
                </span>
                <span className="text-[11px] text-[#99a1af]">
                  {timeAgo(entry.created_at)}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-[#6a7282]" />
              </div>
              <span className="text-[13px] font-medium text-[#364153]">
                {locationName || `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`}
              </span>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                <Eye size={16} className="text-[#6a7282]" />
              </div>
              <span className="text-[13px] font-medium text-[#364153]">
                {entry.visibility === "friends" ? "Shared with Friends" : "Private"}
              </span>
            </div>
          </div>

          {/* Show on Map button */}
          {onLocate && (
            <button
              onClick={onLocate}
              className="w-full py-3.5 rounded-[20px] bg-[#b8e6d5] text-[14px] font-medium text-[#2d6b59] hover:scale-[1.01] active:scale-[0.99] transition-transform mb-4"
            >
              Show on Map
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
