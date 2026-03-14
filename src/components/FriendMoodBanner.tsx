"use client";

import { useEffect, useState } from "react";
import { X, ChevronRight } from "lucide-react";
import type { MapEntry } from "@/components/MapView";
import UserAvatar from "@/components/UserAvatar";
import { EMOTION_CATEGORIES } from "@/utils/categories";
import { getEmotionBubbleBorder } from "@/utils/emotion-color";

interface FriendMoodBannerProps {
  entries: MapEntry[];
  onViewEntry: (entry: MapEntry) => void;
  onDismiss: () => void;
  onMarkRead: (id: string) => void;
}

/**
 * Top banner notification for new friend moods.
 * - Single entry → shows inline preview, tap to view.
 * - Multiple entries → shows count, tap to open unread list.
 */
export default function FriendMoodBanner({
  entries,
  onViewEntry,
  onDismiss,
  onMarkRead,
}: FriendMoodBannerProps) {
  const [listOpen, setListOpen] = useState(false);

  // Auto-dismiss banner (not list) after 8s
  useEffect(() => {
    if (listOpen) return;
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss, listOpen]);

  if (entries.length === 0) return null;

  const isSingle = entries.length === 1;
  const first = entries[0];
  const authorName = first.profiles?.display_name ?? "A friend";
  const avatarUrl = first.profiles?.avatar_url ?? null;
  const cat = EMOTION_CATEGORIES[first.category];

  // Collect unique author names for multi
  const authorNames = [
    ...new Set(entries.map((e) => e.profiles?.display_name ?? "Friend")),
  ];
  const multiLabel =
    authorNames.length === 1
      ? `${authorNames[0]} shared ${entries.length} moods`
      : authorNames.length === 2
        ? `${authorNames[0]} and ${authorNames[1]} shared moods`
        : `${authorNames[0]} and ${authorNames.length - 1} others shared moods`;

  return (
    <>
      {/* Banner */}
      {!listOpen && (
        <div className="fixed top-[max(env(safe-area-inset-top,12px),12px)] left-3 right-3 z-[10000] animate-banner-in">
          <button
            type="button"
            onClick={() => {
              if (isSingle) {
                onMarkRead(first.id);
                onViewEntry(first);
              } else {
                setListOpen(true);
              }
            }}
            className="w-full flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-[20px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] px-4 py-3 text-left"
          >
            {isSingle ? (
              <UserAvatar url={avatarUrl} name={authorName} size={40} />
            ) : (
              <div className="w-[40px] h-[40px] rounded-full bg-[#EF4444] flex items-center justify-center shrink-0">
                <span className="text-white text-[16px] font-bold">
                  {entries.length}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#101828] truncate">
                {isSingle ? `${authorName} shared a mood` : multiLabel}
              </p>
              <p className="text-[12px] text-[#6a7282] truncate">
                {isSingle
                  ? `${cat.emoji} ${cat.label}${first.note ? ` — ${first.note}` : ""}`
                  : "Tap to see all new moods"}
              </p>
            </div>

            {!isSingle && (
              <ChevronRight size={18} className="text-[#99a1af] shrink-0" />
            )}

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
        </div>
      )}

      {/* Unread list overlay */}
      {listOpen && (
        <>
          <div
            className="fixed inset-0 z-[9997] bg-black/20"
            onClick={() => {
              setListOpen(false);
              onDismiss();
            }}
          />
          <div className="fixed top-[max(env(safe-area-inset-top,12px),12px)] left-3 right-3 z-[10000] max-h-[60vh] flex flex-col bg-white/95 backdrop-blur-md rounded-[24px] shadow-[0px_8px_30px_rgba(0,0,0,0.15)] overflow-hidden animate-banner-in">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
              <h3 className="text-[15px] font-semibold text-[#101828]">
                New Moods ({entries.length})
              </h3>
              <button
                type="button"
                onClick={() => {
                  setListOpen(false);
                  onDismiss();
                }}
                className="w-[32px] h-[32px] rounded-full bg-[#f3f4f6] flex items-center justify-center hover:bg-[#e5e7eb] transition-colors"
              >
                <X size={16} className="text-[#6a7282]" />
              </button>
            </div>

            {/* Entry list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
              {entries.map((entry) => {
                const name = entry.profiles?.display_name ?? "Friend";
                const avatar = entry.profiles?.avatar_url ?? null;
                const entryCat = EMOTION_CATEGORIES[entry.category];
                const dotColor = getEmotionBubbleBorder(entry.emotion_score);

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => {
                      onMarkRead(entry.id);
                      onViewEntry(entry);
                      setListOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-[16px] hover:bg-[#f3f4f6] transition-colors text-left"
                  >
                    <UserAvatar url={avatar} name={name} size={36} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#101828] truncate">
                        {name}
                      </p>
                      <p className="text-[12px] text-[#6a7282] truncate">
                        {entryCat.emoji} {entryCat.label}
                        {entry.note ? ` — ${entry.note}` : ""}
                      </p>
                    </div>
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

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
    </>
  );
}
