import type { EmotionCategory } from "@/types/database";

interface CategoryMeta {
  label: string;
  emoji: string;
}

export const EMOTION_CATEGORIES: Record<EmotionCategory, CategoryMeta> = {
  food_dining:      { label: "Food & Dining",      emoji: "🍽️" },
  nature:           { label: "Nature / Scenery",    emoji: "🌿" },
  social:           { label: "Social / Friends",    emoji: "👥" },
  work_study:       { label: "Work / Study",        emoji: "💼" },
  relaxation:       { label: "Relaxation",          emoji: "🧘" },
  travel:           { label: "Travel / Exploration",emoji: "✈️" },
  health_exercise:  { label: "Health & Exercise",   emoji: "🏃" },
  environment:      { label: "Environment",         emoji: "🌍" },
  entertainment:    { label: "Entertainment",       emoji: "🎮" },
  other:            { label: "Other",               emoji: "📝" },
};
