import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/check";
import { getAuthenticatedUser } from "@/lib/supabase/auth-guard";

const NOT_CONFIGURED = NextResponse.json(
  {
    error:
      "Supabase is not configured. Fill in .env.local with your credentials.",
  },
  { status: 503 },
);

/**
 * GET /api/moods
 * Fetch mood entries visible to the current user.
 * RLS automatically filters: own entries + friends' entries where visibility='friends'.
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Join with profiles to get author display_name for friend entries
    let query = supabase
      .from("mood_entries")
      .select("*, profiles!fk_mood_entries_profile(display_name, avatar_url)")
      .order("created_at", { ascending: false });

    const userId = searchParams.get("user_id");
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const visibility = searchParams.get("visibility");
    if (visibility) {
      query = query.eq("visibility", visibility);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add is_own flag and filter: friend entries only visible for 24 hours
    const twentyFourHoursAgo = new Date(
      Date.now() - 24 * 60 * 60 * 1000,
    ).toISOString();

    const entries = (data ?? [])
      .map((entry) => ({
        ...entry,
        is_own: entry.user_id === user.id,
      }))
      .filter((entry) => {
        // Own entries — always visible
        if (entry.is_own) return true;
        // Friend entries — only visible if created within last 24 hours
        return entry.created_at >= twentyFourHoursAgo;
      });

    return NextResponse.json(entries);
  } catch (err) {
    console.error("GET /api/moods error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/moods
 * Create a new mood entry. user_id is injected from the auth session.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    const { user, error: authError } = await getAuthenticatedUser();
    if (authError) return authError;

    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const body = await request.json();

    // Basic validation (user_id is NOT accepted from the client)
    if (
      !body.latitude ||
      !body.longitude ||
      !body.emotion_score ||
      !body.category
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: latitude, longitude, emotion_score, category",
        },
        { status: 400 },
      );
    }

    // Inject user_id from auth session
    const insertData = {
      user_id: user.id,
      latitude: body.latitude,
      longitude: body.longitude,
      emotion_score: body.emotion_score,
      category: body.category,
      note: body.note || null,
      media_url: body.media_url || null,
      visibility: body.visibility || "private",
    };

    const { data, error } = await supabase
      .from("mood_entries")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("POST /api/moods error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
