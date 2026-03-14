"use client";

import { useState, useMemo, useCallback } from "react";
import { X, ChevronLeft } from "lucide-react";
import type { MapEntry } from "@/components/MapView";
import type { EmotionCategory } from "@/types/database";
import { EMOTION_CATEGORIES } from "@/utils/categories";
import {
  getEmotionColor,
  getEmotionAccentColor,
  getEmotionLabel,
} from "@/utils/emotion-color";

interface ClusterDetailPanelProps {
  entries: MapEntry[];
  isOpen: boolean;
  onClose: () => void;
  onEntryLocate: (entry: MapEntry) => void;
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

export default function ClusterDetailPanel({
  entries,
  isOpen,
  onClose,
  onEntryLocate,
}: ClusterDetailPanelProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | EmotionCategory>(
    "all",
  );
  const [selectedEntry, setSelectedEntry] = useState<MapEntry | null>(null);

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

  // Reset filter and detail view when entries change
  useMemo(() => {
    setActiveFilter("all");
    setSelectedEntry(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  // Stop touch events from reaching the map
  const stopPropagation = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.stopPropagation();
    },
    [],
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop — above everything */}
      <div
        className="fixed inset-0 z-[9998] bg-black/20"
        onClick={() => {
          setSelectedEntry(null);
          onClose();
        }}
      />

      {/* Panel — highest z-index */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] max-h-[70vh] flex flex-col rounded-t-[24px] bg-white shadow-[0px_-10px_40px_rgba(0,0,0,0.12)] animate-slide-up"
        onTouchMove={stopPropagation}
        onTouchStart={stopPropagation}
        onMouseDown={stopPropagation}
      >
        {/* Detail view */}
        {selectedEntry ? (
          <EntryDetail
            entry={selectedEntry}
            onBack={() => setSelectedEntry(null)}
            onLocate={() => {
              onEntryLocate(selectedEntry);
              setSelectedEntry(null);
            }}
          />
        ) : (
          <>
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
                onClick={() => {
                  setSelectedEntry(null);
                  onClose();
                }}
                className="flex items-center justify-center w-[36px] h-[36px] rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors"
                aria-label="Close panel"
              >
                <X size={18} className="text-[#6a7282]" />
              </button>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2.5 px-5 pb-4 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveFilter("all")}
                className={`flex-shrink-0 flex items-center justify-center px-4 py-2 rounded-full text-[14px] font-medium leading-none transition-colors ${
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
                    className={`flex-shrink-0 flex items-center justify-center gap-1 px-4 py-2 rounded-full text-[14px] font-medium leading-none transition-colors ${
                      activeFilter === cat
                        ? "bg-[#364153] text-white"
                        : "bg-[#f3f4f6] text-[#6a7282] hover:bg-[#e5e7eb]"
                    }`}
                  >
                    <span>{meta.emoji}</span> {meta.label} ({count})
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-px bg-[#f3f4f6] mx-5" />

            {/* Entry list — extra bottom padding for nav bar */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3 pb-28 space-y-2">
              {filteredEntries.length === 0 ? (
                <p className="text-center text-[13px] text-[#99a1af] py-8">
                  No entries for this filter.
                </p>
              ) : (
                filteredEntries.map((entry) => {
                  const cat = EMOTION_CATEGORIES[entry.category];
                  const accentColor = getEmotionAccentColor(
                    entry.emotion_score,
                  );
                  const bgColor = getEmotionColor(entry.emotion_score);
                  const isOwn = entry.is_own !== false;
                  const authorName = entry.profiles?.display_name;

                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-[#fafafa] hover:bg-[#f3f4f6] transition-colors text-left"
                    >
                      <div
                        className="flex-shrink-0 w-[44px] h-[44px] rounded-full flex items-center justify-center text-[14px] font-semibold"
                        style={{ backgroundColor: bgColor, color: accentColor }}
                      >
                        {entry.emotion_score}
                      </div>
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
                      <span className="flex-shrink-0 text-[11px] text-[#99a1af]">
                        {timeAgo(entry.created_at)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </>
        )}
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

/** Detail view for a single mood entry */
function EntryDetail({
  entry,
  onBack,
  onLocate,
}: {
  entry: MapEntry;
  onBack: () => void;
  onLocate: () => void;
}) {
  const cat = EMOTION_CATEGORIES[entry.category];
  const accentColor = getEmotionAccentColor(entry.emotion_score);
  const bgColor = getEmotionColor(entry.emotion_score);
  const emotionLabel = getEmotionLabel(entry.emotion_score);
  const isOwn = entry.is_own !== false;
  const authorName = entry.profiles?.display_name;

  return (
    <div className="flex flex-col px-5 pt-4 pb-28">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[13px] text-[#6a7282] hover:text-[#364153] transition-colors mb-4 self-start"
      >
        <ChevronLeft size={16} />
        Back to list
      </button>

      {/* Score + Category header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-[56px] h-[56px] rounded-full flex items-center justify-center text-[20px] font-bold"
          style={{ backgroundColor: bgColor, color: accentColor }}
        >
          {entry.emotion_score}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[20px]">{cat.emoji}</span>
            <span
              className="text-[16px] font-semibold"
              style={{ color: accentColor }}
            >
              {cat.label}
            </span>
          </div>
          <p className="text-[12px] text-[#6a7282] mt-0.5">
            {emotionLabel} &middot; Score {entry.emotion_score}/10
          </p>
        </div>
      </div>

      {/* Author (if friend entry) */}
      {!isOwn && authorName && (
        <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-[12px] bg-[#f5f0ff]">
          <span className="text-[12px] text-[#9b72c0] font-medium">
            {authorName}&apos;s mood
          </span>
        </div>
      )}

      {/* Note */}
      {entry.note ? (
        <div className="mb-4">
          <p className="text-[11px] font-medium text-[#99a1af] uppercase tracking-wider mb-1">
            Note
          </p>
          <p className="text-[14px] text-[#364153] leading-relaxed">
            {entry.note}
          </p>
        </div>
      ) : (
        <p className="text-[13px] text-[#99a1af] italic mb-4">No note added.</p>
      )}

      {/* Metadata */}
      <div className="flex items-center gap-4 text-[12px] text-[#6a7282] mb-5">
        <span>{formatDate(entry.created_at)}</span>
        <span className="px-2 py-0.5 rounded-full bg-[#f3f4f6] text-[11px]">
          {entry.visibility === "friends" ? "Friends" : "Private"}
        </span>
      </div>

      {/* Locate on map button */}
      <button
        onClick={onLocate}
        className="w-full py-3 rounded-[16px] bg-[#b8e6d5] text-[14px] font-medium text-[#2d6b59] hover:scale-[1.01] active:scale-[0.99] transition-transform"
      >
        Show on Map
      </button>
    </div>
  );
}
