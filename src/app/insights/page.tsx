import EntryCard from "@/components/EntryCard";
import { isSupabaseConfigured } from "@/lib/supabase/check";
import type { MoodEntry } from "@/types/database";

/**
 * Insights page — Server Component.
 * Fetches mood entries on the server and renders stats + recent entries.
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

  // Basic stats
  const total = moods.length;
  const avgScore =
    total > 0
      ? (moods.reduce((sum, m) => sum + m.emotion_score, 0) / total).toFixed(1)
      : "—";

  const positive = moods.filter((m) => m.emotion_score >= 7).length;
  const neutral = moods.filter(
    (m) => m.emotion_score >= 4 && m.emotion_score < 7,
  ).length;
  const negative = moods.filter((m) => m.emotion_score < 4).length;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Insights</h1>

      {/* Supabase not configured warning */}
      {!isSupabaseConfigured() && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
          <strong>Supabase not configured.</strong> Fill in your credentials in{" "}
          <code className="rounded bg-amber-200/50 px-1 py-0.5 dark:bg-amber-800/50">
            .env.local
          </code>{" "}
          to connect to a database.
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <StatCard label="Total Entries" value={String(total)} />
        <StatCard label="Avg Score" value={avgScore} />
        <StatCard
          label="Positive"
          value={String(positive)}
          color="text-green-600"
        />
        <StatCard
          label="Negative"
          value={String(negative)}
          color="text-red-500"
        />
      </div>

      {/* Distribution */}
      {total > 0 && (
        <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold mb-3 text-zinc-500 uppercase tracking-wide">
            Distribution
          </h2>
          <div className="flex gap-1 h-4 rounded-full overflow-hidden">
            {positive > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${(positive / total) * 100}%` }}
              />
            )}
            {neutral > 0 && (
              <div
                className="bg-amber-400"
                style={{ width: `${(neutral / total) * 100}%` }}
              />
            )}
            {negative > 0 && (
              <div
                className="bg-red-500"
                style={{ width: `${(negative / total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1 text-xs text-zinc-400">
            <span>😊 {((positive / total) * 100).toFixed(0)}%</span>
            <span>😐 {((neutral / total) * 100).toFixed(0)}%</span>
            <span>😢 {((negative / total) * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      {/* Recent entries */}
      <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
      {moods.length === 0 ? (
        <p className="text-zinc-500">
          No entries yet. Go to the Map and start recording your moods!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {moods.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 ${color ?? ""}`}>{value}</p>
    </div>
  );
}
