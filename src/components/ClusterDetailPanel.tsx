"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import type { MapEntry } from "@/components/MapView";
import type { EmotionCategory } from "@/types/database";
import { EMOTION_CATEGORIES } from "@/utils/categories";
import {
  getEmotionColor,
  getEmotionAccentColor,
} from "@/utils/emotion-color";

interface ClusterDetailPanelProps {
  entries: MapEntry[];
  isOpen: boolean;
  onClose: () => void;
  onEntryClick: (entry: MapEntry) => void;
}

/** Format relative time like "3m ago", "2h ago", "5d ago" */
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

export default function ClusterDetailPanel({
  entries,
  isOpen,
  onClose,
  onEntryClick,
}: ClusterDetailPanelProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | EmotionCategory>(
    "all",
  );

  // Get unique categories present in the cluster
  const availableCategories = useMemo(() => {
    const cats = new Set<EmotionCategory>();
    entries.forEach((e) => cats.add(e.category));
    return Array.from(cats);
  }, [entries]);

  // Filter entries by selected category
  const filteredEntries = useMemo(() => {
    if (activeFilter === "all") return entries;
    return entries.filter((e) => e.category === activeFilter);
  }, [entries, activeFilter]);

  // Reset filter when entries change (new cluster clicked)
  useMemo(() => {
    setActiveFilter("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] flex flex-col rounded-t-[24px] bg-white shadow-[0px_-10px_40px_rgba(0,0,0,0.12)] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="text-[16px] font-semibold text-[#101828]">
              Mood Entries
            </h2>
            <p className="text-[12px] text-[#6a7282] mt-0.5">
              {filteredEntries.length} of {entries.length} entries
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-[36px] h-[36px] rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors"
            aria-label="Close panel"
          >
            <X size={18} className="text-[#6a7282]" />
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto scrollbar-hide">
          {/* All pill */}
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              activeFilter === "all"
                ? "bg-[#364153] text-white"
                : "bg-[#f3f4f6] text-[#6a7282] hover:bg-[#e5e7eb]"
            }`}
          >
            All ({entries.length})
          </button>

          {availableCategories.map((cat) => {
            const meta = EMOTION_CATEGORIES[cat];
            const count = entries.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                  activeFilter === cat
                    ? "bg-[#364153] text-white"
                    : "bg-[#f3f4f6] text-[#6a7282] hover:bg-[#e5e7eb]"
                }`}
              >
                {meta.emoji} {meta.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-[#f3f4f6] mx-5" />

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {filteredEntries.length === 0 ? (
            <p className="text-center text-[13px] text-[#99a1af] py-8">
              No entries for this filter.
            </p>
          ) : (
            filteredEntries.map((entry) => {
              const cat = EMOTION_CATEGORIES[entry.category];
              const accentColor = getEmotionAccentColor(entry.emotion_score);
              const bgColor = getEmotionColor(entry.emotion_score);
              const isOwn = entry.is_own !== false;
              const authorName = entry.profiles?.display_name;

              return (
                <button
                  key={entry.id}
                  onClick={() => onEntryClick(entry)}
                  className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-[#fafafa] hover:bg-[#f3f4f6] transition-colors text-left"
                >
                  {/* Score badge */}
                  <div
                    className="flex-shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center text-[14px] font-semibold"
                    style={{
                      backgroundColor: bgColor,
                      color: accentColor,
                    }}
                  >
                    {entry.emotion_score}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px]">{cat.emoji}</span>
                      <span
                        className="text-[13px] font-medium truncate"
                        style={{ color: accentColor }}
                      >
                        {cat.label}
                      </span>
                      {!isOwn && authorName && (
                        <span className="text-[11px] text-[#9b72c0] ml-1">
                          {authorName}
                        </span>
                      )}
                    </div>
                    {entry.note && (
                      <p className="text-[12px] text-[#6a7282] truncate mt-0.5">
                        {entry.note}
                      </p>
                    )}
                  </div>

                  {/* Time */}
                  <span className="flex-shrink-0 text-[11px] text-[#99a1af]">
                    {timeAgo(entry.created_at)}
                  </span>
                </button>
              );
            })
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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
