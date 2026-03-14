"use client";

import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/** Full emoji palette for the picker */
const EMOJI_PALETTE = [
  "❤️",
  "😂",
  "🥺",
  "🔥",
  "👏",
  "😍",
  "😢",
  "😮",
  "🥰",
  "😤",
  "💪",
  "🎉",
  "✨",
  "🤗",
  "😭",
  "💔",
  "🙏",
  "💯",
  "🌈",
  "☀️",
  "🍀",
  "💩",
  "👀",
  "💤",
];

interface Reaction {
  user_id: string;
  emoji: string;
}

interface ReactionBarProps {
  moodId: string;
  reactions: Reaction[];
  /** Called after toggling a reaction — parent should refresh entry data */
  onReactionChange?: (updatedReactions: Reaction[]) => void;
}

/**
 * Emoji reaction bar with picker.
 * Reads from entry.reactions JSONB, writes via PATCH /api/moods/:id.
 */
export default function ReactionBar({
  moodId,
  reactions,
  onReactionChange,
}: ReactionBarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localReactions, setLocalReactions] = useState<Reaction[]>(reactions);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // Sync with parent when reactions prop changes
  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  // Aggregate reactions: { emoji → { count, reacted } }
  const aggregated = new Map<string, { count: number; reacted: boolean }>();
  for (const r of localReactions) {
    const existing = aggregated.get(r.emoji) ?? { count: 0, reacted: false };
    existing.count += 1;
    if (r.user_id === currentUserId) existing.reacted = true;
    aggregated.set(r.emoji, existing);
  }

  async function toggleReaction(emoji: string) {
    if (loading || !currentUserId) return;
    setLoading(true);
    setPickerOpen(false);

    // Optimistic update
    const alreadyReacted = localReactions.some(
      (r) => r.user_id === currentUserId && r.emoji === emoji,
    );

    let updated: Reaction[];
    if (alreadyReacted) {
      updated = localReactions.filter(
        (r) => !(r.user_id === currentUserId && r.emoji === emoji),
      );
    } else {
      updated = [...localReactions, { user_id: currentUserId, emoji }];
    }

    setLocalReactions(updated);
    onReactionChange?.(updated);

    try {
      await fetch(`/api/moods/${moodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reactions: updated }),
      });
    } catch {
      // Revert on error
      setLocalReactions(localReactions);
      onReactionChange?.(localReactions);
    } finally {
      setLoading(false);
    }
  }

  // Get unique emojis that have been used (to show in bar)
  const usedEmojis = Array.from(aggregated.keys());

  return (
    <div className="flex flex-col gap-2">
      {/* Reaction pills */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {usedEmojis.map((emoji) => {
          const data = aggregated.get(emoji)!;
          return (
            <button
              key={emoji}
              type="button"
              onClick={() => toggleReaction(emoji)}
              className={`flex items-center gap-1 h-[30px] px-2 rounded-full text-[13px] transition-all active:scale-95 ${
                data.reacted
                  ? "bg-[#e8d4f8] border border-[#c9a5e0]"
                  : "bg-[#f3f4f6] border border-transparent hover:bg-[#e5e7eb]"
              }`}
            >
              <span className="text-[15px]">{emoji}</span>
              <span
                className={`text-[11px] font-medium ${
                  data.reacted ? "text-[#9b72c0]" : "text-[#6a7282]"
                }`}
              >
                {data.count}
              </span>
            </button>
          );
        })}

        {/* Add emoji button */}
        <button
          type="button"
          onClick={() => setPickerOpen(!pickerOpen)}
          className={`flex items-center justify-center w-[30px] h-[30px] rounded-full transition-all active:scale-95 ${
            pickerOpen
              ? "bg-[#364153] text-white"
              : "bg-[#f3f4f6] text-[#6a7282] hover:bg-[#e5e7eb]"
          }`}
        >
          {pickerOpen ? <X size={14} /> : <Plus size={14} />}
        </button>
      </div>

      {/* Emoji picker grid */}
      {pickerOpen && (
        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(0,0,0,0.1)] p-3 grid grid-cols-8 gap-1">
          {EMOJI_PALETTE.map((emoji) => {
            const data = aggregated.get(emoji);
            const isActive = data?.reacted ?? false;
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleReaction(emoji)}
                className={`w-[36px] h-[36px] rounded-[10px] flex items-center justify-center text-[20px] transition-all active:scale-90 ${
                  isActive ? "bg-[#e8d4f8]" : "hover:bg-[#f3f4f6]"
                }`}
              >
                {emoji}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
