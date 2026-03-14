// ============================================================
// Supabase Database Types
// Mirrors the tables defined in supabase/schema.sql
//
// This follows the exact shape that @supabase/supabase-js expects.
// After setting up Supabase CLI you can auto-generate this with:
//   npx supabase gen types typescript --local > src/types/database.ts
// ============================================================

export type EmotionCategory =
  | "food_dining"
  | "nature"
  | "social"
  | "work_study"
  | "relaxation"
  | "travel"
  | "health_exercise"
  | "environment"
  | "entertainment"
  | "other";

export type Visibility = "private" | "friends";

/** Row shape returned from `mood_entries` table */
export interface MoodEntry {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  emotion_score: number; // 1-10
  category: EmotionCategory;
  note: string | null;
  media_url: string | null;
  visibility: Visibility;
  created_at: string;
}

/** Payload for creating a new mood entry */
export type MoodEntryInsert = Omit<MoodEntry, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

/** Payload for updating a mood entry */
export type MoodEntryUpdate = Partial<MoodEntryInsert>;

// ============================================================
// Full Supabase Database interface
// ============================================================
export interface Database {
  public: {
    Tables: {
      mood_entries: {
        Row: MoodEntry;
        Insert: MoodEntryInsert;
        Update: MoodEntryUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      emotion_category: EmotionCategory;
      visibility: Visibility;
    };
    CompositeTypes: Record<string, never>;
  };
}
