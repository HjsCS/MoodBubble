"use client";

import { useEffect, useState, useCallback } from "react";
import MapView from "@/components/MapView";
import AddMoodModal from "@/components/AddMoodModal";
import type { MoodEntry, EmotionCategory, Visibility } from "@/types/database";

export default function MapPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLngLat, setSelectedLngLat] = useState<{ lng: number; lat: number } | null>(null);

  // Fetch entries on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/moods");
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch (err) {
        console.error("Failed to fetch moods:", err);
      }
    }
    load();
  }, []);

  // Handle map click — open modal with location
  const handleMapClick = useCallback((lngLat: { lng: number; lat: number }) => {
    setSelectedLngLat(lngLat);
    setModalOpen(true);
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(
    async (data: {
      emotion_score: number;
      category: EmotionCategory;
      note: string;
      visibility: Visibility;
    }) => {
      if (!selectedLngLat) return;

      try {
        const res = await fetch("/api/moods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: "anonymous", // TODO: replace with real auth user id
            latitude: selectedLngLat.lat,
            longitude: selectedLngLat.lng,
            ...data,
          }),
        });

        if (res.ok) {
          const newEntry = await res.json();
          setEntries((prev) => [newEntry, ...prev]);
        }
      } catch (err) {
        console.error("Failed to create mood:", err);
      }
    },
    [selectedLngLat],
  );

  return (
    <div className="relative h-[calc(100vh-57px)] w-full">
      <MapView entries={entries} onMapClick={handleMapClick} />

      {/* Floating action button */}
      <button
        type="button"
        onClick={() => {
          // Default to Melbourne CBD if no location selected
          setSelectedLngLat((prev) => prev ?? { lng: 144.9631, lat: -37.8136 });
          setModalOpen(true);
        }}
        className="absolute bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-2xl text-white shadow-xl hover:bg-indigo-700 transition-colors"
        aria-label="Add mood entry"
      >
        +
      </button>

      <AddMoodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
