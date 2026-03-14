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

export type FriendshipStatus = "pending" | "accepted" | "rejected";

/** Row shape returned from `mood_entries` table */
export interface MoodEntry {
  id: string;
  user_id: string;
  latitude: number;
  longitude: number;
  emotion_score: number; // 0-100
  category: EmotionCategory;
  note: string | null;
  media_url: string | null;
  visibility: Visibility;
  reactions: { user_id: string; emoji: string }[];
  created_at: string;
}

/** Extended mood entry with author profile info (for friend entries on map) */
export interface MoodEntryWithAuthor extends MoodEntry {
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

/** Payload for creating a new mood entry (user_id injected server-side) */
export type MoodEntryInsert = Omit<
  MoodEntry,
  "id" | "created_at" | "user_id"
> & {
  id?: string;
  created_at?: string;
};

/** Payload for updating a mood entry */
export type MoodEntryUpdate = Partial<MoodEntryInsert>;

/** Row shape returned from `profiles` table */
export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Payload for updating a profile */
export type ProfileUpdate = Partial<
  Pick<Profile, "display_name" | "avatar_url">
>;

/** Row shape returned from `mood_reactions` table */
export interface MoodReaction {
  id: string;
  mood_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

/** Aggregated reaction counts for display */
export interface ReactionSummary {
  emoji: string;
  count: number;
  reacted: boolean; // whether current user has reacted with this emoji
}

/** Row shape returned from `friendships` table */
export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

/** Friendship with joined profile data for display */
export interface FriendshipWithProfile extends Friendship {
  profiles: Profile;
}

// ============================================================
// Full Supabase Database interface
// ============================================================
export interface Database {
  public: {
    Tables: {
      mood_entries: {
        Row: MoodEntry;
        Insert: MoodEntryInsert & { user_id: string };
        Update: MoodEntryUpdate;
        Relationships: [
          {
            foreignKeyName: "fk_mood_entries_user";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      friendships: {
        Row: Friendship;
        Insert: Omit<
          Friendship,
          "id" | "created_at" | "updated_at" | "status"
        > & {
          id?: string;
          status?: FriendshipStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Pick<Friendship, "status">>;
        Relationships: [
          {
            foreignKeyName: "friendships_requester_id_fkey";
            columns: ["requester_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "friendships_addressee_id_fkey";
            columns: ["addressee_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      are_friends: {
        Args: { user_a: string; user_b: string };
        Returns: boolean;
      };
    };
    Enums: {
      emotion_category: EmotionCategory;
      visibility: Visibility;
      friendship_status: FriendshipStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}
