"use client";

import { useEffect, useState } from "react";
import {
  Smile,
  MapPin,
  Heart,
  Users,
  Utensils,
  TreePine,
  UserRound,
  Briefcase,
  ChevronRight,
  Calendar,
} from "lucide-react";
import SettingsButton from "@/components/SettingsButton";
import BackButton from "@/components/BackButton";
import ProfileHeader from "@/components/ProfileHeader";
import type { EmotionCategory } from "@/types/database";
import { getEmotionColor } from "@/utils/emotion-color";

interface DailyMood {
  date: string;
  dayLabel: string;
  avgScore: number;
  count: number;
}

interface InsightsData {
  profile: { display_name: string; email: string; avatar_url: string | null };
  totalMoods: number;
  averageScore: number;
  positiveCount: number;
  categoryBreakdown: Partial<Record<EmotionCategory, number>>;
  uniquePlaces: number;
  friendCount: number;
  dailyMoods: DailyMood[];
}

/** Skeleton placeholder with pulse animation */
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-[#e5e7eb] rounded-[12px] animate-pulse ${className ?? ""}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 pb-[120px]">
      {/* Profile card skeleton */}
      <div className="bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-6 py-7 flex items-center gap-4">
        <Skeleton className="w-[80px] h-[80px] rounded-full shrink-0" />
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-[18px] w-[120px]" />
          <Skeleton className="h-[14px] w-[180px]" />
          <div className="flex gap-2">
            <Skeleton className="h-[22px] w-[60px] rounded-full" />
            <Skeleton className="h-[22px] w-[70px] rounded-full" />
            <Skeleton className="h-[22px] w-[80px] rounded-full" />
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <Skeleton className="h-[48px] w-full rounded-[16px]" />

      {/* Mood Highlights skeleton */}
      <div className="rounded-[24px] bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5">
        <Skeleton className="h-[16px] w-[120px] mb-4" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-[16px] w-full" />
          <Skeleton className="h-[16px] w-full" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="flex gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-1 bg-white rounded-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-3 py-4 px-3 h-[138px]"
          >
            <Skeleton className="w-[48px] h-[48px] rounded-full" />
            <Skeleton className="h-[20px] w-[30px]" />
            <Skeleton className="h-[12px] w-[60px]" />
          </div>
        ))}
      </div>

      {/* Categories skeleton */}
      <div className="bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5">
        <Skeleton className="h-[16px] w-[140px] mb-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 mb-3">
            <Skeleton className="w-[40px] h-[40px] rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-[14px] w-full mb-2" />
              <Skeleton className="h-[8px] w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/insights");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load insights:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const total = data?.totalMoods ?? 0;
  const avgScore = data?.averageScore ?? 0;
  const positive = data?.positiveCount ?? 0;
  const uniquePlaces = data?.uniquePlaces ?? 0;
  const categoryBreakdown = data?.categoryBreakdown ?? {};

  const avgLabel = avgScore >= 7 ? "Happy" : avgScore >= 4 ? "Neutral" : "Low";
  const avgEmoji = avgScore >= 7 ? "☀️" : avgScore >= 4 ? "🌤️" : "🌧️";

  const categoryDisplayData = [
    {
      key: "food_dining",
      label: "Food",
      count: categoryBreakdown.food_dining ?? 0,
      color: "#ffe8b8",
      iconBg: "#ffe8b8",
    },
    {
      key: "nature",
      label: "Nature",
      count: categoryBreakdown.nature ?? 0,
      color: "#b8e6d5",
      iconBg: "#b8e6d5",
    },
    {
      key: "social",
      label: "Social",
      count: categoryBreakdown.social ?? 0,
      color: "#e8d4f8",
      iconBg: "#e8d4f8",
    },
    {
      key: "work_study",
      label: "Work",
      count: categoryBreakdown.work_study ?? 0,
      color: "#ffd4d4",
      iconBg: "#ffd4d4",
    },
  ];

  const maxCategoryCount = Math.max(
    ...categoryDisplayData.map((c) => c.count),
    1,
  );

  return (
    <div className="bg-[#fefbf6] min-h-screen pb-[120px]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top,12px),12px)] pb-3">
        <BackButton />
        <span className="text-[16px] font-medium text-[#101828]">Profile</span>
        <SettingsButton />
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex flex-col gap-4 px-5 pb-[120px] overflow-y-auto">
          {/* Profile Card + Search */}
          <ProfileHeader
            displayName={data?.profile.display_name || "MoodBubble User"}
            email={data?.profile.email || "Not logged in"}
            avatarUrl={data?.profile.avatar_url}
            totalEntries={total}
            friendCount={data?.friendCount ?? 0}
          />

          {/* Mood Highlights */}
          <div className="rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5 bg-gradient-to-b from-[rgba(184,230,213,0.2)] to-[rgba(168,214,197,0.2)]">
            <h3 className="text-[15px] font-medium text-[#4a8a76] mb-4">
              Mood Highlights
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#6baa96]" />
                  <span className="text-[13px] text-[#4a8a76]">
                    Happiest Place
                  </span>
                </div>
                <span className="text-[13px] font-medium text-[#2d6b59]">
                  {uniquePlaces > 0 ? "Melbourne Area" : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smile size={16} className="text-[#6baa96]" />
                  <span className="text-[13px] text-[#4a8a76]">
                    Average Mood
                  </span>
                </div>
                <span className="text-[13px] font-medium text-[#2d6b59]">
                  {avgLabel} {avgEmoji}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid — 3 cards */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 bg-white rounded-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] flex flex-col items-center justify-between py-4 px-5 h-[138px]">
              <div className="w-[48px] h-[48px] bg-[#ffe8b8] rounded-full flex items-center justify-center">
                <Heart size={20} className="text-[#e8b963]" />
              </div>
              <span className="text-[20px] font-medium text-[#101828]">
                {total}
              </span>
              <span className="text-[11px] text-[#6a7282] text-center">
                Mood Entries
              </span>
            </div>

            <div className="flex-1 bg-white rounded-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] flex flex-col items-center justify-between py-4 px-5 h-[138px]">
              <div className="w-[48px] h-[48px] bg-[#b8e6d5] rounded-full flex items-center justify-center">
                <MapPin size={20} className="text-[#6baa96]" />
              </div>
              <span className="text-[20px] font-medium text-[#101828]">
                {uniquePlaces}
              </span>
              <span className="text-[11px] text-[#6a7282] text-center">
                Places Recorded
              </span>
            </div>

            <div className="flex-1 bg-white rounded-[16px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] flex flex-col items-center justify-between py-4 px-5 h-[138px]">
              <div className="w-[48px] h-[48px] bg-[#ffd4d4] rounded-full flex items-center justify-center">
                <Users size={20} className="text-[#e89b9b]" />
              </div>
              <span className="text-[20px] font-medium text-[#101828]">
                {positive}
              </span>
              <span className="text-[11px] text-[#6a7282] text-center">
                Positive Moods
              </span>
            </div>
          </div>

          {/* Emotion Categories */}
          <div className="bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5">
            <h3 className="text-[15px] font-medium text-[#101828] mb-4">
              Emotion Categories
            </h3>
            <div className="flex flex-col gap-3">
              {categoryDisplayData.map((cat) => {
                const IconComponent =
                  cat.key === "food_dining"
                    ? Utensils
                    : cat.key === "nature"
                      ? TreePine
                      : cat.key === "social"
                        ? UserRound
                        : Briefcase;

                return (
                  <div key={cat.key} className="flex items-center gap-3">
                    <div
                      className="w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.iconBg }}
                    >
                      <IconComponent size={20} className="text-[#364153]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] text-[#364153]">
                          {cat.label}
                        </span>
                        <span className="text-[12px] text-[#6a7282]">
                          {cat.count} moods
                        </span>
                      </div>
                      <div className="w-full h-[8px] bg-[#f3f4f6] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            backgroundColor: cat.color,
                            width: `${maxCategoryCount > 0 ? (cat.count / maxCategoryCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mood Trend */}
          <div className="bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-[#101828]">
                Mood Trend
              </h3>
              <span className="text-[12px] text-[#6a7282]">Last 7 Days</span>
            </div>

            <div className="w-full h-[160px] bg-gradient-to-b from-[rgba(184,230,213,0.15)] to-transparent rounded-[16px] flex items-end justify-between px-4 pb-2">
              {(data?.dailyMoods ?? []).map((day) => {
                const barHeight =
                  day.count > 0 ? Math.max(day.avgScore * 1.2, 16) : 8;
                const barColor =
                  day.count > 0 ? getEmotionColor(day.avgScore) : "#e5e7eb";
                return (
                  <div
                    key={day.date}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      {day.count > 0 && (
                        <span className="text-[9px] text-[#99a1af]">
                          {day.count}
                        </span>
                      )}
                      <div
                        className="w-[8px] rounded-full transition-all"
                        style={{
                          height: `${barHeight}px`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-[#9ca3af]">
                      {day.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-around mt-4 pt-4 border-t border-[#f3f4f6]">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] text-[#6a7282]">Happiest Day</span>
                <span className="text-[13px] font-medium text-[#101828]">
                  {(() => {
                    const days = data?.dailyMoods ?? [];
                    const withData = days.filter((d) => d.count > 0);
                    if (withData.length === 0) return "—";
                    const best = withData.reduce((a, b) =>
                      a.avgScore > b.avgScore ? a : b,
                    );
                    return best.dayLabel;
                  })()}
                </span>
              </div>
              <div className="w-px h-[40px] bg-[#e5e7eb]" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[11px] text-[#6a7282]">
                  Overall Trend
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ color: getEmotionColor(data?.averageScore ?? 50) }}
                >
                  {(() => {
                    const days = data?.dailyMoods ?? [];
                    const withData = days.filter((d) => d.count > 0);
                    if (withData.length < 2) return "— Not enough data";
                    const first = withData[0].avgScore;
                    const last = withData[withData.length - 1].avgScore;
                    if (last > first + 5) return "↑ Improving";
                    if (last < first - 5) return "↓ Declining";
                    return "→ Stable";
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Map Insights */}
          <div className="rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5 bg-gradient-to-b from-[rgba(255,232,184,0.2)] to-[rgba(255,224,160,0.2)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-[#9d7d3f]">
                Map Insights
              </h3>
              <ChevronRight size={20} className="text-[#9d7d3f]" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] text-[#9d7d3f]">
                Most Emotional Place
              </span>
              <span className="text-[16px] font-medium text-[#7a5f2f]">
                Melbourne CBD
              </span>
              <p className="text-[12px] text-[#9d7d3f] leading-[18px]">
                You&apos;ve recorded {total} moods here, mostly{" "}
                {avgScore >= 7 ? "Happy and Excited" : "varied"} vibes!
              </p>
            </div>
          </div>

          {/* Monthly Recap */}
          <div className="bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-[#101828]">
                March Recap
              </h3>
              <Calendar size={20} className="text-[#6a7282]" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6a7282]">Total Moods</span>
                <span className="text-[18px] font-medium text-[#101828]">
                  {total}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6a7282]">Best Week</span>
                <span className="text-[18px] font-medium text-[#101828]">
                  Week 1
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6a7282]">New Places</span>
                <span className="text-[18px] font-medium text-[#101828]">
                  {uniquePlaces}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] text-[#6a7282]">Mood Score</span>
                <span className="text-[18px] font-medium text-[#6baa96]">
                  {avgScore}/10
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f3f4f6]">
              <p className="text-[12px] text-[#4a5565] text-center leading-[18px]">
                You&apos;re doing great! Keep tracking your wellness journey
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
