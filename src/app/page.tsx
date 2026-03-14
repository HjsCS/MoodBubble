import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-8 px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight">🫧 MoodBubble</h1>
      <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Transform your emotions into a living map of memories. Record how you
        feel, where you are, and watch your emotional landscape grow.
      </p>

      <div className="flex gap-4">
        <Link
          href="/map"
          className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors"
        >
          Open Map
        </Link>
        <Link
          href="/insights"
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold shadow-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
        >
          View Insights
        </Link>
      </div>
    </div>
  );
}
