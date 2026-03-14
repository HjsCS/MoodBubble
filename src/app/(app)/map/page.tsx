"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Clock, Eye } from "lucide-react";
import AddMoodModal from "@/components/AddMoodModal";
import ClusterDetailPanel from "@/components/ClusterDetailPanel";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });
import type {
  MoodEntryWithAuthor,
  EmotionCategory,
  Visibility,
} from "@/types/database";
import type { MapEntry } from "@/components/MapView";

/** Extended entry with is_own flag from the API */
interface MapMoodEntry extends MoodEntryWithAuthor {
  is_own?: boolean;
}

function MapPageContent() {
  const searchParams = useSearchParams();
  const shouldAddMood = searchParams.get("addMood") === "true";

  const [entries, setEntries] = useState<MapMoodEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(shouldAddMood);

  const defaultLngLat = useMemo(
    () => (shouldAddMood ? { lng: 144.9631, lat: -37.8136 } : null),
    [shouldAddMood],
  );
  const [selectedLngLat, setSelectedLngLat] = useState<{
    lng: number;
    lat: number;
  } | null>(defaultLngLat);

  // Cluster detail panel state
  const [clusterEntries, setClusterEntries] = useState<MapEntry[]>([]);
  const [clusterPanelOpen, setClusterPanelOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);

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

  // Handle cluster click — open detail panel
  const handleClusterClick = useCallback((entries: MapEntry[]) => {
    setClusterEntries(entries);
    setClusterPanelOpen(true);
  }, []);

  // Handle entry click in cluster panel — fly to entry
  const handleEntryClick = useCallback((entry: MapEntry) => {
    setClusterPanelOpen(false);
    setFlyTo({ lat: entry.latitude, lng: entry.longitude });
  }, []);

  // Handle form submit — no user_id sent, server injects it
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
            latitude: selectedLngLat.lat,
            longitude: selectedLngLat.lng,
            ...data,
          }),
        });

        if (res.ok) {
          const newEntry = await res.json();
          setEntries((prev) => [{ ...newEntry, is_own: true }, ...prev]);
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
      <MapView
        entries={entries}
        onMapClick={handleMapClick}
        onClusterClick={handleClusterClick}
        flyTo={flyTo}
      />

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

      {/* Cluster Detail Panel */}
      <ClusterDetailPanel
        entries={clusterEntries}
        isOpen={clusterPanelOpen}
        onClose={() => setClusterPanelOpen(false)}
        onEntryLocate={handleEntryClick}
      />

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
