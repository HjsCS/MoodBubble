"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { X, ChevronLeft, Clock, MapPin, Eye } from "lucide-react";
import type { MapEntry } from "@/components/MapView";
import type { EmotionCategory } from "@/types/database";
import { EMOTION_CATEGORIES } from "@/utils/categories";
import { getEmotionColor, getEmotionBubbleBorder } from "@/utils/emotion-color";
import { reverseGeocode } from "@/utils/geocoding";

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

            {/* Entry list — MoodDetailCard style */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-3 pb-28 space-y-3">
              {filteredEntries.length === 0 ? (
                <p className="text-center text-[13px] text-[#99a1af] py-8">
                  No entries for this filter.
                </p>
              ) : (
                filteredEntries.map((entry) => {
                  const cat = EMOTION_CATEGORIES[entry.category];
                  const dotColor = getEmotionBubbleBorder(entry.emotion_score);
                  const isOwn = entry.is_own !== false;
                  const authorName = entry.profiles?.display_name;

                  return (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className="w-full flex flex-col items-start p-4 rounded-[24px] bg-[#fafafa] hover:bg-[#f3f4f6] transition-colors text-left"
                    >
                      {/* Author label for friend entries */}
                      {!isOwn && authorName && (
                        <span className="text-[11px] text-[#9b72c0] font-medium mb-1.5">
                          {authorName}&apos;s mood
                        </span>
                      )}

                      {/* Thumbnail if media exists */}
                      {entry.media_url && (
                        <div
                          className="w-full h-[80px] rounded-[16px] overflow-hidden mb-2.5"
                          style={{
                            backgroundColor: getEmotionColor(
                              entry.emotion_score,
                            ),
                          }}
                        >
                          <img
                            src={entry.media_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Colored dot + Category */}
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full shadow-[0px_1px_2px_0px_rgba(0,0,0,0.1)]"
                          style={{ backgroundColor: dotColor }}
                        />
                        <span className="font-['Poppins',sans-serif] text-[11px] font-semibold text-[#6a7282] uppercase tracking-[1px]">
                          {cat.label}
                        </span>
                      </div>

                      {/* Note (truncated) */}
                      {entry.note && (
                        <p className="text-[14px] font-medium text-[#1e2939] leading-[22px] line-clamp-2">
                          {entry.note}
                        </p>
                      )}

                      {/* Time row */}
                      <span className="text-[11px] text-[#99a1af] mt-1">
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

/** Detail view for a single mood entry — redesigned to match MoodDetailModal */
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
  const dotColor = getEmotionBubbleBorder(entry.emotion_score);
  const bgColor = getEmotionColor(entry.emotion_score);
  const isOwn = entry.is_own !== false;
  const authorName = entry.profiles?.display_name;

  // Reverse geocode on mount
  const [locationName, setLocationName] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    reverseGeocode(entry.latitude, entry.longitude).then((name) => {
      if (!cancelled) setLocationName(name);
    });
    return () => {
      cancelled = true;
    };
  }, [entry.latitude, entry.longitude]);

  return (
    <div className="flex flex-col px-5 pt-4 pb-28 overflow-y-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[13px] text-[#6a7282] hover:text-[#364153] transition-colors mb-4 self-start"
      >
        <ChevronLeft size={16} />
        Back to list
      </button>

      {/* Author (if friend entry) */}
      {!isOwn && authorName && (
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
            className="w-full max-h-[200px] object-cover"
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
        <p className="font-['Poppins',sans-serif] text-[15px] font-medium text-[#1e2939] leading-[24px] mb-5">
          {entry.note}
        </p>
      ) : (
        <p className="text-[13px] text-[#99a1af] italic mb-5">No note added.</p>
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
            {locationName ||
              `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`}
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

      {/* Locate on map button */}
      <button
        onClick={onLocate}
        className="w-full py-3.5 rounded-[20px] bg-[#b8e6d5] text-[14px] font-medium text-[#2d6b59] hover:scale-[1.01] active:scale-[0.99] transition-transform"
      >
        Show on Map
      </button>
    </div>
  );
}
