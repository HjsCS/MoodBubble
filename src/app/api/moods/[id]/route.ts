import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/check";

const NOT_CONFIGURED = NextResponse.json(
  {
    error:
      "Supabase is not configured. Fill in .env.local with your credentials.",
  },
  { status: 503 },
);

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/moods/[id]
 * Fetch a single mood entry by ID.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    const { id } = await context.params;
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /api/moods/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/moods/[id]
 * Update a mood entry.
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    const { id } = await context.params;
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from("mood_entries")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("PATCH /api/moods/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/moods/[id]
 * Delete a mood entry.
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  if (!isSupabaseConfigured()) return NOT_CONFIGURED;

  try {
    const { id } = await context.params;
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const { error } = await supabase.from("mood_entries").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/moods/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
