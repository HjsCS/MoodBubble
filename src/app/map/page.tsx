"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Clock, Eye } from "lucide-react";
import AddMoodModal from "@/components/AddMoodModal";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
import type { MoodEntry, EmotionCategory, Visibility } from "@/types/database";

function MapPageContent() {
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLngLat, setSelectedLngLat] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  // Open modal if addMood query param is present
  useEffect(() => {
    if (searchParams.get("addMood") === "true") {
      setSelectedLngLat((prev) => prev ?? { lng: 144.9631, lat: -37.8136 });
      setModalOpen(true);
    }
  }, [searchParams]);

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
            user_id: "anonymous",
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
    <div className="relative h-screen w-full">
      {/* Map */}
      <MapView entries={entries} onMapClick={handleMapClick} />

      {/* Title overlay */}
      <h1 className="absolute top-[40px] left-[40px] z-10 text-[24px] font-semibold tracking-[-0.4px] text-[#364153]">
        MoodBubble
      </h1>

      {/* Top-right action buttons */}
      <div className="absolute top-[32px] right-[32px] z-10 flex flex-col gap-3">
        <button
          type="button"
          className="flex items-center justify-center w-[64px] h-[64px] rounded-[20px] bg-white shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
          aria-label="Filter by time"
        >
          <Clock size={24} className="text-[#364153]" />
        </button>
        <button
          type="button"
          className="flex items-center justify-center w-[64px] h-[64px] rounded-[20px] bg-white shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-transform hover:scale-105"
          aria-label="Toggle visibility"
        >
          <Eye size={24} className="text-[#364153]" />
        </button>
      </div>

      {/* Add Mood Modal */}
      <AddMoodModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#fefbf6]" />}>
      <MapPageContent />
    </Suspense>
  );
}
