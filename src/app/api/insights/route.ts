import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/check";
import { getAuthenticatedUser } from "@/lib/supabase/auth-guard";
import type { EmotionCategory } from "@/types/database";

const NOT_CONFIGURED = NextResponse.json(
  { error: "Supabase is not configured." },
  { status: 503 },
);

/**
 * GET /api/insights
 * Returns the current user's profile + pre-computed mood statistics.
 * All queries run in parallel for speed.
 */
export async function GET() {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // Run all queries in parallel
    const [profileResult, moodsResult, friendCountResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("mood_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("friendships")
        .select("*", { count: "exact", head: true })
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq("status", "accepted"),
    ]);

    const profile = profileResult.data;
    const moods = moodsResult.data ?? [];
    const friendCount = friendCountResult.count ?? 0;

    // Pre-compute statistics
    const totalMoods = moods.length;
    const averageScore =
      totalMoods > 0
        ? Number(
            (
              moods.reduce((sum, m) => sum + m.emotion_score, 0) / totalMoods
            ).toFixed(1),
          )
        : 0;
    const positiveCount = moods.filter((m) => m.emotion_score >= 7).length;

    // Category breakdown
    const categoryBreakdown: Partial<Record<EmotionCategory, number>> = {};
    moods.forEach((m) => {
      const cat = m.category as EmotionCategory;
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    // Unique places
    const uniquePlaces = new Set(
      moods.map((m) => `${m.latitude.toFixed(3)},${m.longitude.toFixed(3)}`),
    ).size;

    // Daily mood averages for last 7 days
    const dailyMoods: {
      date: string;
      dayLabel: string;
      avgScore: number;
      count: number;
    }[] = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const dayMoods = moods.filter(
        (m) => m.created_at.slice(0, 10) === dateStr,
      );
      const avg =
        dayMoods.length > 0
          ? Math.round(
              dayMoods.reduce((s, m) => s + m.emotion_score, 0) /
                dayMoods.length,
            )
          : 0;
      dailyMoods.push({
        date: dateStr,
        dayLabel: dayNames[d.getDay()],
        avgScore: avg,
        count: dayMoods.length,
      });
    }

    return NextResponse.json({
      profile: {
        display_name: profile?.display_name ?? "MoodBubble User",
        email: user.email ?? "",
        avatar_url: profile?.avatar_url ?? null,
      },
      totalMoods,
      averageScore,
      positiveCount,
      categoryBreakdown,
      uniquePlaces,
      friendCount,
      dailyMoods,
    });
  } catch (err) {
    console.error("GET /api/insights error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
