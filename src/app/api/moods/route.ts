import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/check";

const NOT_CONFIGURED = NextResponse.json(
  {
    error:
      "Supabase is not configured. Fill in .env.local with your credentials.",
  },
  { status: 503 },
);

/**
 * GET /api/moods
 * Fetch all mood entries. Supports optional query params:
 *   ?user_id=xxx    — filter by user
 *   ?visibility=xxx — filter by visibility
 */
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    let query = supabase
      .from("mood_entries")
      .select("*")
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

    return NextResponse.json(data);
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
 * Create a new mood entry.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const body = await request.json();

    // Basic validation
    if (
      !body.user_id ||
      !body.latitude ||
      !body.longitude ||
      !body.emotion_score ||
      !body.category
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: user_id, latitude, longitude, emotion_score, category",
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("mood_entries")
      .insert(body)
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
