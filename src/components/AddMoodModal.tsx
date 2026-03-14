"use client";

import { useState } from "react";
import type { EmotionCategory, Visibility } from "@/types/database";
import { EMOTION_CATEGORIES } from "@/utils/categories";

interface AddMoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    emotion_score: number;
    category: EmotionCategory;
    note: string;
    visibility: Visibility;
  }) => void;
}

export default function AddMoodModal({ isOpen, onClose, onSubmit }: AddMoodModalProps) {
  const [score, setScore] = useState(5);
  const [category, setCategory] = useState<EmotionCategory>("other");
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      emotion_score: score,
      category,
      note,
      visibility,
    });
    // Reset form
    setScore(5);
    setCategory("other");
    setNote("");
    setVisibility("private");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          Add Mood Entry
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Emotion Score */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Emotion Score: {score}
            </span>
            <input
              type="range"
              min={1}
              max={10}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-400">
              <span>😢 1</span>
              <span>😐 5</span>
              <span>😊 10</span>
            </div>
          </label>

          {/* Category */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Category
            </span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EmotionCategory)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {Object.entries(EMOTION_CATEGORIES).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.emoji} {meta.label}
                </option>
              ))}
            </select>
          </label>

          {/* Note */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Note (optional)
            </span>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How are you feeling?"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </label>

          {/* Visibility */}
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Visibility
            </span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="private">🔒 Private</option>
              <option value="friends">👥 Friends</option>
            </select>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
