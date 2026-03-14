"use client";

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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

type TimeFilter = "all" | "today" | "week" | "month";
type AccessFilter = "all" | "private" | "friends";

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

  // Filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);

  // Refs for click-outside
  const timeRef = useRef<HTMLDivElement>(null);
  const accessRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) {
        setShowTimeDropdown(false);
      }
      if (accessRef.current && !accessRef.current.contains(e.target as Node)) {
        setShowAccessDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // Filter entries based on time and access filters
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Time filter
    if (timeFilter !== "all") {
      const now = Date.now();
      const cutoff =
        timeFilter === "today"
          ? now - 24 * 60 * 60 * 1000
          : timeFilter === "week"
            ? now - 7 * 24 * 60 * 60 * 1000
            : now - 30 * 24 * 60 * 60 * 1000;

      result = result.filter((e) => new Date(e.created_at).getTime() >= cutoff);
    }

    // Access filter
    if (accessFilter === "private") {
      result = result.filter((e) => e.is_own !== false);
    } else if (accessFilter === "friends") {
      result = result.filter((e) => e.is_own === false);
    }

    return result;
  }, [entries, timeFilter, accessFilter]);

  // Handle map click — open modal with location
  const handleMapClick = useCallback((lngLat: { lng: number; lat: number }) => {
    setSelectedLngLat(lngLat);
    setModalOpen(true);
  }, []);

  // Handle cluster click — open detail panel
  const handleClusterClick = useCallback((clusterEntries: MapEntry[]) => {
    setClusterEntries(clusterEntries);
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
    <div className="relative w-full" style={{ height: "100dvh" }}>
      {/* Map */}
      <MapView
        entries={filteredEntries}
        onMapClick={handleMapClick}
        onClusterClick={handleClusterClick}
        flyTo={flyTo}
      />

      {/* Title overlay */}
      <h1 className="absolute top-[40px] left-[40px] z-10 text-[24px] font-semibold tracking-[-0.4px] text-[#364153]">
        MoodBubble
      </h1>

      {/* Top-right action buttons with dropdowns */}
      <div className="absolute top-[32px] right-[32px] z-10 flex flex-col gap-3">
        {/* Time Filter */}
        <div ref={timeRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowTimeDropdown(!showTimeDropdown);
              setShowAccessDropdown(false);
            }}
            className={`flex items-center justify-center w-[64px] h-[64px] rounded-[20px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-all hover:scale-105 ${
              timeFilter !== "all" ? "bg-[#fff8c8]" : "bg-white"
            }`}
            aria-label="Filter by time"
          >
            <Clock
              size={24}
              className={
                timeFilter !== "all" ? "text-[#1e2939]" : "text-[#364153]"
              }
            />
          </button>

          {/* Time Dropdown — Figma style */}
          {showTimeDropdown && (
            <div className="absolute top-0 right-[76px] w-[208px] rounded-[28px] bg-white shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] p-4 flex flex-col gap-3">
              {(
                [
                  { key: "all", label: "All Time" },
                  { key: "today", label: "Today" },
                  { key: "week", label: "Last 7 days" },
                  { key: "month", label: "Last month" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setTimeFilter(opt.key);
                    setShowTimeDropdown(false);
                  }}
                  className={`h-[53px] w-full rounded-[20px] text-[14px] font-medium transition-all ${
                    timeFilter === opt.key
                      ? "bg-[#fff8c8] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)] text-[#1e2939]"
                      : "text-[#4a5565] hover:bg-[#f9fafb]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Access Filter */}
        <div ref={accessRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowAccessDropdown(!showAccessDropdown);
              setShowTimeDropdown(false);
            }}
            className={`flex items-center justify-center w-[64px] h-[64px] rounded-[20px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-all hover:scale-105 ${
              accessFilter !== "all" ? "bg-[#c8f0c8]" : "bg-white"
            }`}
            aria-label="Filter by visibility"
          >
            <Eye
              size={24}
              className={
                accessFilter !== "all" ? "text-[#1e2939]" : "text-[#364153]"
              }
            />
          </button>

          {/* Access Dropdown — Figma style */}
          {showAccessDropdown && (
            <div className="absolute top-0 right-[76px] w-[208px] rounded-[28px] bg-white shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] p-4 flex flex-col gap-3">
              {(
                [
                  { key: "all", label: "All Map" },
                  { key: "private", label: "Private Map" },
                  { key: "friends", label: "Friend's Map" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setAccessFilter(opt.key);
                    setShowAccessDropdown(false);
                  }}
                  className={`h-[53px] w-full rounded-[20px] text-[14px] font-medium transition-all ${
                    accessFilter === opt.key
                      ? "bg-[#c8f0c8] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)] text-[#1e2939]"
                      : "text-[#4a5565] hover:bg-[#f9fafb]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
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
    <Suspense
      fallback={
        <div className="w-full bg-[#fefbf6]" style={{ height: "100dvh" }} />
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
