"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { MapEntry } from "@/components/MapView";
import UserAvatar from "@/components/UserAvatar";
import { EMOTION_CATEGORIES } from "@/utils/categories";

interface FriendMoodBannerProps {
  entry: MapEntry;
  onView: () => void;
  onDismiss: () => void;
}

/**
 * Top banner notification when a friend posts a new mood.
 * Auto-dismisses after 6 seconds.
 */
export default function FriendMoodBanner({
  entry,
  onView,
  onDismiss,
}: FriendMoodBannerProps) {
  const authorName = entry.profiles?.display_name ?? "A friend";
  const avatarUrl = entry.profiles?.avatar_url ?? null;
  const cat = EMOTION_CATEGORIES[entry.category];

  // Auto-dismiss after 6s
  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed top-[max(env(safe-area-inset-top,12px),12px)] left-3 right-3 z-[10000] animate-banner-in">
      <button
        type="button"
        onClick={onView}
        className="w-full flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-[20px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] px-4 py-3 text-left"
      >
        {/* Avatar */}
        <UserAvatar url={avatarUrl} name={authorName} size={40} />

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#101828] truncate">
            {authorName} shared a mood
          </p>
          <p className="text-[12px] text-[#6a7282] truncate">
            {cat.emoji} {cat.label}
            {entry.note ? ` — ${entry.note}` : ""}
          </p>
        </div>

        {/* Close button */}
        <div
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="w-[28px] h-[28px] rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0 hover:bg-[#e5e7eb] transition-colors"
        >
          <X size={14} className="text-[#6a7282]" />
        </div>
      </button>

      <style jsx>{`
        @keyframes banner-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-banner-in {
          animation: banner-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
