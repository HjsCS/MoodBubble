import {
  ArrowLeft,
  Settings,
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
import { isSupabaseConfigured } from "@/lib/supabase/check";
import type { MoodEntry } from "@/types/database";
import type { EmotionCategory } from "@/types/database";

/**
 * Profile / Insights page — Server Component.
 * Redesigned to match the Figma Profile screen.
 */
export default async function InsightsPage() {
  let moods: MoodEntry[] = [];

  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data: entries } = await supabase
      .from("mood_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    moods = (entries as MoodEntry[]) ?? [];
  }

  // Stats
  const total = moods.length;
  const avgScore =
    total > 0
      ? (moods.reduce((sum, m) => sum + m.emotion_score, 0) / total).toFixed(1)
      : "0";

  const positive = moods.filter((m) => m.emotion_score >= 7).length;

  // Category breakdown
  const categoryCount: Partial<Record<EmotionCategory, number>> = {};
  moods.forEach((m) => {
    categoryCount[m.category] = (categoryCount[m.category] || 0) + 1;
  });

  // Unique places (rough count by rounding lat/lng)
  const uniquePlaces = new Set(
    moods.map((m) => `${m.latitude.toFixed(3)},${m.longitude.toFixed(3)}`),
  ).size;

  // Average mood label
  const avgLabel =
    Number(avgScore) >= 7 ? "Happy" : Number(avgScore) >= 4 ? "Neutral" : "Low";
  const avgEmoji =
    Number(avgScore) >= 7 ? "☀️" : Number(avgScore) >= 4 ? "🌤️" : "🌧️";

  const maxCategoryCount = Math.max(
    ...Object.values(categoryCount).map((v) => v ?? 0),
    1,
  );

  const categoryDisplayData: {
    key: string;
    label: string;
    count: number;
    color: string;
    iconBg: string;
  }[] = [
    {
      key: "food_dining",
      label: "Food",
      count: categoryCount.food_dining ?? 0,
      color: "#ffe8b8",
      iconBg: "#ffe8b8",
    },
    {
      key: "nature",
      label: "Nature",
      count: categoryCount.nature ?? 0,
      color: "#b8e6d5",
      iconBg: "#b8e6d5",
    },
    {
      key: "social",
      label: "Social",
      count: categoryCount.social ?? 0,
      color: "#e8d4f8",
      iconBg: "#e8d4f8",
    },
    {
      key: "work_study",
      label: "Work",
      count: categoryCount.work_study ?? 0,
      color: "#ffd4d4",
      iconBg: "#ffd4d4",
    },
  ];

  return (
    <div className="bg-[#fefbf6] min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[50px] pb-4">
        <div className="w-[40px] h-[40px] flex items-center justify-center">
          <ArrowLeft size={24} className="text-[#364153]" />
        </div>
        <span className="text-[16px] font-medium text-[#101828]">Profile</span>
        <div className="w-[40px] h-[40px] flex items-center justify-center">
          <Settings size={20} className="text-[#364153]" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex flex-col gap-4 px-0 pb-[120px] overflow-y-auto">
        {/* Supabase warning */}
        {!isSupabaseConfigured() && (
          <div className="mx-5 rounded-[16px] border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Supabase not configured.</strong> Add credentials to{" "}
            <code className="rounded bg-amber-200/50 px-1 py-0.5">
              .env.local
            </code>
          </div>
        )}

        {/* Profile Card */}
        <div className="mx-0 bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-6 py-7 flex items-center gap-4">
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#b8e6d5] to-[#ffe8b8] flex items-center justify-center text-3xl">
            🫧
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-[16px] font-medium text-[#101828]">
              MoodBubble User
            </h2>
            <p className="text-[13px] text-[#6a7282]">@anonymous</p>
            <div className="flex gap-2">
              <span className="bg-[#b8e6d5] text-[#6baa96] text-[11px] px-[11px] py-[5px] rounded-full">
                Level {Math.min(Math.floor(total / 5) + 1, 10)}
              </span>
              <span className="bg-[#ffe8b8] text-[#e8b963] text-[11px] px-[11px] py-[5px] rounded-full">
                {total} Entries
              </span>
            </div>
          </div>
        </div>

        {/* Mood Highlights */}
        <div className="mx-0 rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5 bg-gradient-to-b from-[rgba(184,230,213,0.2)] to-[rgba(168,214,197,0.2)]">
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
                <span className="text-[13px] text-[#4a8a76]">Average Mood</span>
              </div>
              <span className="text-[13px] font-medium text-[#2d6b59]">
                {avgLabel} {avgEmoji}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid — 3 cards */}
        <div className="mx-0 flex items-center justify-between gap-3">
          {/* Mood Entries */}
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

          {/* Places Recorded */}
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

          {/* Positive */}
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
        <div className="mx-0 bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5">
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

        {/* Mood Trend (placeholder chart area) */}
        <div className="mx-0 bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-medium text-[#101828]">
              Mood Trend
            </h3>
            <span className="text-[12px] text-[#6a7282]">Last 7 Days</span>
          </div>

          {/* Placeholder chart area */}
          <div className="w-full h-[160px] bg-gradient-to-b from-[rgba(184,230,213,0.3)] to-transparent rounded-[16px] flex items-end justify-between px-4 pb-2">
            {["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"].map((day, i) => (
              <div key={day} className="flex flex-col items-center gap-2">
                <div
                  className="w-[6px] rounded-full bg-[#b8e6d5]"
                  style={{ height: `${40 + Math.random() * 80}px` }}
                />
                <span className="text-[11px] text-[#9ca3af]">{day}</span>
              </div>
            ))}
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-around mt-4 pt-4 border-t border-[#f3f4f6]">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-[#6a7282]">Happiest Day</span>
              <span className="text-[13px] font-medium text-[#101828]">
                Saturday
              </span>
            </div>
            <div className="w-px h-[40px] bg-[#e5e7eb]" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] text-[#6a7282]">Overall Trend</span>
              <span className="text-[13px] font-medium text-[#6baa96]">
                ↑ Improving
              </span>
            </div>
          </div>
        </div>

        {/* Map Insights */}
        <div className="mx-0 rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5 bg-gradient-to-b from-[rgba(255,232,184,0.2)] to-[rgba(255,224,160,0.2)]">
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
              {Number(avgScore) >= 7 ? "Happy and Excited" : "varied"} vibes! ✨
            </p>
          </div>
        </div>

        {/* Monthly Recap */}
        <div className="mx-0 bg-white rounded-[24px] shadow-[0px_2px_12px_0px_rgba(0,0,0,0.06)] px-5 py-5">
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
              You&apos;re doing great! Keep tracking your wellness journey 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
