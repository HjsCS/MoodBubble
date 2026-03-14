"use client";

import { useCallback, useState } from "react";
import { X, MapPin, Clock, Eye, Pencil, Check, Loader2 } from "lucide-react";
import type {
  MoodEntry,
  MoodEntryWithAuthor,
  EmotionCategory,
} from "@/types/database";
import {
  getEmotionColor,
  getEmotionBubbleBorder,
  getSliderGradient,
} from "@/utils/emotion-color";
import { getEmotionEmoji } from "@/utils/emotion-emoji";
import { EMOTION_CATEGORIES } from "@/utils/categories";
import UserAvatar from "@/components/UserAvatar";
import ReactionBar from "@/components/ReactionBar";

interface MoodDetailModalProps {
  entry: (MoodEntry | MoodEntryWithAuthor) & { is_own?: boolean };
  isOpen: boolean;
  onClose: () => void;
  onLocate?: () => void;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  locationName?: string | null;
  /** Called after a successful edit to refresh parent data */
  onEntryUpdated?: (updated: MoodEntry) => void;
}

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

/** Check if entry was created less than 10 minutes ago */
function isEditable(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 10 * 60 * 1000;
}

const CATEGORY_KEYS = Object.keys(EMOTION_CATEGORIES) as EmotionCategory[];

export default function MoodDetailModal({
  entry,
  isOpen,
  onClose,
  onLocate,
  authorName,
  authorAvatarUrl,
  locationName,
  onEntryUpdated,
}: MoodDetailModalProps) {
  const cat = EMOTION_CATEGORIES[entry.category];
  const dotColor = getEmotionBubbleBorder(entry.emotion_score);
  const bgColor = getEmotionColor(entry.emotion_score);
  const isOwn = entry.is_own !== false;
  const canEdit = isOwn && isEditable(entry.created_at);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editScore, setEditScore] = useState(entry.emotion_score);
  const [editNote, setEditNote] = useState(entry.note ?? "");
  const [editCategory, setEditCategory] = useState(entry.category);
  const [saving, setSaving] = useState(false);

  const stopPropagation = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.stopPropagation();
    },
    [],
  );

  function startEditing() {
    setEditScore(entry.emotion_score);
    setEditNote(entry.note ?? "");
    setEditCategory(entry.category);
    setEditing(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/moods/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion_score: editScore,
          note: editNote || null,
          category: editCategory,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        onEntryUpdated?.(updated);
        setEditing(false);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[9998] bg-black/30" onClick={onClose} />

      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] max-h-[85vh] flex flex-col rounded-t-[32px] bg-[#fefbf6] shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] animate-slide-up"
        onTouchMove={stopPropagation}
        onTouchStart={stopPropagation}
        onMouseDown={stopPropagation}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          {canEdit && !editing && (
            <button
              onClick={startEditing}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors"
              aria-label="Edit mood"
            >
              <Pencil size={16} className="text-[#6a7282]" />
            </button>
          )}
          {editing && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-[#b8e6d5] hover:bg-[#9dd9c3] transition-colors disabled:opacity-50"
              aria-label="Save changes"
            >
              {saving ? (
                <Loader2 size={16} className="text-[#2d6b59] animate-spin" />
              ) : (
                <Check size={16} className="text-[#2d6b59]" />
              )}
            </button>
          )}
          {!canEdit && !editing && <div className="w-9" />}
          <div className="w-[40px] h-[4px] rounded-full bg-[#d1d5db]" />
          <button
            onClick={() => {
              setEditing(false);
              onClose();
            }}
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
              <UserAvatar url={authorAvatarUrl} name={authorName} size={22} />
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

          {/* ─── Edit mode: inline editing ─── */}
          {editing ? (
            <div className="flex flex-col gap-4 mb-5">
              {/* Emotion slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] font-medium text-[#364153]">
                    Emotion
                  </span>
                  <span className="text-[18px]">
                    {getEmotionEmoji(editScore)}
                  </span>
                </div>
                <div className="relative">
                  <div
                    className="w-full h-[6px] rounded-full"
                    style={{ backgroundImage: getSliderGradient() }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-[24px] h-[24px] rounded-full border-2 border-white shadow-md"
                    style={{
                      left: `calc(${editScore}% - 12px)`,
                      backgroundColor: getEmotionColor(editScore),
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={editScore}
                    onChange={(e) => setEditScore(Number(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-[24px] top-1/2 -translate-y-1/2"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <span className="text-[13px] font-medium text-[#364153] mb-2 block">
                  Category
                </span>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORY_KEYS.map((key) => {
                    const meta = EMOTION_CATEGORIES[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditCategory(key)}
                        className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                          editCategory === key
                            ? "bg-[#364153] text-white"
                            : "bg-[#f3f4f6] text-[#6a7282]"
                        }`}
                      >
                        {meta.emoji} {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note */}
              <div>
                <span className="text-[13px] font-medium text-[#364153] mb-2 block">
                  Note
                </span>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value.slice(0, 280))}
                  rows={3}
                  className="w-full resize-none rounded-[12px] bg-[#f9fafb] border border-[#e5e7eb] px-3 py-2 text-[14px] text-[#364153] outline-none focus:ring-2 focus:ring-[#b8e6d5]"
                  placeholder="How are you feeling..."
                />
              </div>
            </div>
          ) : (
            <>
              {/* ─── View mode ─── */}
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
            </>
          )}

          {/* Metadata section */}
          <div className="flex flex-col gap-3 mb-5">
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

            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                <MapPin size={16} className="text-[#6a7282]" />
              </div>
              <span className="text-[13px] font-medium text-[#364153]">
                {locationName ||
                  `${entry.latitude.toFixed(4)}, ${entry.longitude.toFixed(4)}`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-[32px] h-[32px] rounded-full bg-[#f3f4f6] flex items-center justify-center shrink-0">
                <Eye size={16} className="text-[#6a7282]" />
              </div>
              <span className="text-[13px] font-medium text-[#364153]">
                {entry.visibility === "friends"
                  ? "Shared with Friends"
                  : "Private"}
              </span>
            </div>
          </div>

          {/* Reaction bar — for all moods */}
          <div className="mb-5">
            <ReactionBar moodId={entry.id} reactions={entry.reactions ?? []} />
          </div>

          {/* Show on Map button */}
          {onLocate && !editing && (
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
