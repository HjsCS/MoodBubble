"use client";

import { useEffect } from "react";
import { X, MapPin, Calendar } from "lucide-react";
import type { MemoryReminder } from "@/hooks/useMemoryReminders";
import { getEmotionColor } from "@/utils/emotion-color";
import { getEmotionEmoji } from "@/utils/emotion-emoji";

interface MemoryReminderBannerProps {
  reminder: MemoryReminder;
  onView: () => void;
  onDismiss: () => void;
}

/**
 * Warm-toned banner for memory/location reminders.
 * Auto-dismisses after 12 seconds.
 */
export default function MemoryReminderBanner({
  reminder,
  onView,
  onDismiss,
}: MemoryReminderBannerProps) {
  const { entry, type, label } = reminder;
  const emoji = getEmotionEmoji(entry.emotion_score);
  const color = getEmotionColor(entry.emotion_score);

  // Auto-dismiss after 12s
  useEffect(() => {
    const timer = setTimeout(onDismiss, 12000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = type === "location" ? MapPin : Calendar;

  return (
    <div className="fixed top-[max(env(safe-area-inset-top,12px),12px)] left-3 right-3 z-[10000] animate-memory-in">
      <button
        type="button"
        onClick={onView}
        className="w-full flex items-center gap-3 rounded-[20px] shadow-[0px_8px_30px_rgba(0,0,0,0.12)] px-4 py-3.5 text-left backdrop-blur-md"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,248,240,0.95) 100%)`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        {/* Emoji circle */}
        <div
          className="w-[44px] h-[44px] rounded-full flex items-center justify-center shrink-0 text-[22px]"
          style={{ backgroundColor: `${color}30` }}
        >
          {emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon size={12} className="text-[#99a1af] shrink-0" />
            <p className="text-[11px] font-medium text-[#99a1af] uppercase tracking-wide">
              {type === "location" ? "Memory nearby" : "On this day"}
            </p>
          </div>
          <p className="text-[13px] font-semibold text-[#364153] truncate">
            {label}
          </p>
          {entry.note && type === "location" && (
            <p className="text-[12px] text-[#6a7282] truncate mt-0.5">
              &ldquo;{entry.note}&rdquo;
            </p>
          )}
        </div>

        {/* Close */}
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
        @keyframes memory-in {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-memory-in {
          animation: memory-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
