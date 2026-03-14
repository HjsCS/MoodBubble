"use client";

import {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Clock, Eye, LocateFixed } from "lucide-react";
import AddMoodModal from "@/components/AddMoodModal";
import ClusterDetailPanel from "@/components/ClusterDetailPanel";
import MoodDetailCard from "@/components/MoodDetailCard";
import MoodDetailModal from "@/components/MoodDetailModal";
import FriendMoodBanner from "@/components/FriendMoodBanner";
import { getCurrentPosition, watchPosition } from "@/utils/geolocation";
import { reverseGeocode } from "@/utils/geocoding";

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
  const router = useRouter();
  const shouldAddMood = searchParams.get("addMood") === "true";

  const [entries, setEntries] = useState<MapMoodEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedLngLat, setSelectedLngLat] = useState<{
    lng: number;
    lat: number;
  } | null>(null);

  // Cluster detail panel state
  const [clusterEntries, setClusterEntries] = useState<MapEntry[]>([]);
  const [clusterPanelOpen, setClusterPanelOpen] = useState(false);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null);

  // Single marker detail state
  const [selectedEntry, setSelectedEntry] = useState<MapEntry | null>(null);
  const [selectedEntryLocationName, setSelectedEntryLocationName] = useState<
    string | null
  >(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [entryAlreadyLocated, setEntryAlreadyLocated] = useState(false);

  // GPS / location state
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [pickingOnMap, setPickingOnMap] = useState(false);

  // Filter state
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showAccessDropdown, setShowAccessDropdown] = useState(false);

  // Refs for click-outside
  const timeRef = useRef<HTMLDivElement>(null);
  const accessRef = useRef<HTMLDivElement>(null);

  // Notification state — tracks unread friend entries
  const seenEntryIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const [newFriendEntryIds, setNewFriendEntryIds] = useState<Set<string>>(
    new Set(),
  );
  const [bannerEntries, setBannerEntries] = useState<MapEntry[]>([]);

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

  // Fetch entries on mount + poll every 30s for new friend moods
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/moods");
        if (res.ok) {
          const data: MapMoodEntry[] = await res.json();
          setEntries(data);

          // Detect new friend entries (skip on first load)
          if (isFirstLoad.current) {
            // Mark all existing entries as seen
            data.forEach((e) => seenEntryIds.current.add(e.id));
            isFirstLoad.current = false;
          } else {
            const brandNew: string[] = [];
            data.forEach((e) => {
              if (!seenEntryIds.current.has(e.id)) {
                seenEntryIds.current.add(e.id);
                if (e.is_own === false) {
                  brandNew.push(e.id);
                }
              }
            });
            if (brandNew.length > 0) {
              setNewFriendEntryIds((prev) => {
                const next = new Set(prev);
                brandNew.forEach((id) => next.add(id));
                return next;
              });
              // Show banner for all new friend entries
              const newEntries = data.filter((e: MapMoodEntry) =>
                brandNew.includes(e.id),
              );
              if (newEntries.length > 0) {
                setBannerEntries((prev) => [...newEntries, ...prev]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch moods:", err);
      }
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  // GPS: get initial position + watch for updates (blue dot)
  useEffect(() => {
    getCurrentPosition()
      .then((pos) => {
        setUserLocation({ lat: pos.lat, lng: pos.lng });
        setFlyTo({ lat: pos.lat, lng: pos.lng });
      })
      .catch(() => {
        // Permission denied or unavailable — stay on Melbourne CBD default
      });

    const stopWatch = watchPosition(
      (pos) => setUserLocation({ lat: pos.lat, lng: pos.lng }),
      () => {}, // watch errors are silent
    );

    return stopWatch;
  }, []);

  // Open modal when navigated with ?addMood=true (from other pages)
  useEffect(() => {
    if (!shouldAddMood) return;

    // Clear the query param so it doesn't re-trigger on re-render
    router.replace("/map", { scroll: false });

    const openModal = async () => {
      try {
        const pos = await getCurrentPosition();
        setSelectedLngLat({ lat: pos.lat, lng: pos.lng });
        const name = await reverseGeocode(pos.lat, pos.lng);
        setLocationName(name);
      } catch {
        setSelectedLngLat(null);
        setLocationName(null);
      }
      setModalOpen(true);
    };

    openModal();
  }, [shouldAddMood, router]);

  // Listen for custom event from BottomNav when already on map page
  useEffect(() => {
    const handleOpenAddMood = async () => {
      try {
        const pos = await getCurrentPosition();
        setSelectedLngLat({ lat: pos.lat, lng: pos.lng });
        const name = await reverseGeocode(pos.lat, pos.lng);
        setLocationName(name);
      } catch {
        setSelectedLngLat(null);
        setLocationName(null);
      }
      setModalOpen(true);
    };

    window.addEventListener("openAddMood", handleOpenAddMood);
    return () => window.removeEventListener("openAddMood", handleOpenAddMood);
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

  // Handle map click — only responds when in "pick on map" mode
  const handleMapClick = useCallback(
    async (lngLat: { lng: number; lat: number }) => {
      if (!pickingOnMap) return; // ignore map clicks when not picking

      setSelectedLngLat(lngLat);
      setLocationName(null);
      setPickingOnMap(false);
      setModalOpen(true);

      // Reverse geocode in background
      const name = await reverseGeocode(lngLat.lat, lngLat.lng);
      setLocationName(name);
    },
    [pickingOnMap],
  );

  // Handle "Pick on Map" from modal — close modal, enter pin-drop mode
  const handlePickOnMap = useCallback(() => {
    setModalOpen(false);
    setPickingOnMap(true);
  }, []);

  // Handle location change from address search or GPS in modal
  const handleLocationChange = useCallback(
    (loc: { lat: number; lng: number; name: string }) => {
      setSelectedLngLat({ lat: loc.lat, lng: loc.lng });
      setLocationName(loc.name);
      setFlyTo({ lat: loc.lat, lng: loc.lng });
    },
    [],
  );

  // Mark an entry as read (remove notification)
  const markRead = useCallback((id: string) => {
    setNewFriendEntryIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Handle single marker click — show MoodDetailCard overlay
  const handleMarkerClick = useCallback(
    async (entry: MapEntry) => {
      markRead(entry.id);
      setSelectedEntry(entry);
      setEntryAlreadyLocated(false);
      setSelectedEntryLocationName(null);
      const name = await reverseGeocode(entry.latitude, entry.longitude);
      setSelectedEntryLocationName(name);
    },
    [markRead],
  );

  // Handle cluster click — open detail panel
  const handleClusterClick = useCallback((clusterEntries: MapEntry[]) => {
    setClusterEntries(clusterEntries);
    setClusterPanelOpen(true);
  }, []);

  // Handle entry click in cluster panel — fly to entry and show detail card
  const handleEntryClick = useCallback(async (entry: MapEntry) => {
    setClusterPanelOpen(false);
    setSelectedEntry(entry);
    setEntryAlreadyLocated(true);
    setSelectedEntryLocationName(null);
    setFlyTo({ lat: entry.latitude, lng: entry.longitude });
    const name = await reverseGeocode(entry.latitude, entry.longitude);
    setSelectedEntryLocationName(name);
  }, []);

  // Handle form submit — no user_id sent, server injects it
  const handleSubmit = useCallback(
    async (data: {
      emotion_score: number;
      category: EmotionCategory;
      note: string;
      visibility: Visibility;
      media_url: string | null;
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
        notificationIds={newFriendEntryIds}
        onMapClick={handleMapClick}
        onClusterClick={handleClusterClick}
        onMarkerClick={handleMarkerClick}
        flyTo={flyTo}
        userLocation={userLocation}
      />

      {/* Friend mood notification banner */}
      {bannerEntries.length > 0 && (
        <FriendMoodBanner
          entries={bannerEntries}
          onViewEntry={async (entry) => {
            setSelectedEntry(entry);
            setEntryAlreadyLocated(true);
            setFlyTo({ lat: entry.latitude, lng: entry.longitude });
            setSelectedEntryLocationName(null);
            setBannerEntries([]);
            const name = await reverseGeocode(entry.latitude, entry.longitude);
            setSelectedEntryLocationName(name);
          }}
          onDismiss={() => setBannerEntries([])}
          onMarkRead={markRead}
        />
      )}

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

        {/* Locate Me Button */}
        <button
          type="button"
          onClick={() => {
            if (userLocation) {
              setFlyTo({ lat: userLocation.lat, lng: userLocation.lng });
            } else {
              getCurrentPosition()
                .then((pos) => {
                  setUserLocation({ lat: pos.lat, lng: pos.lng });
                  setFlyTo({ lat: pos.lat, lng: pos.lng });
                })
                .catch(() => {});
            }
          }}
          className="flex items-center justify-center w-[64px] h-[64px] rounded-[20px] bg-white shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)] transition-all hover:scale-105 active:bg-[#e8f4ff]"
          aria-label="Go to my location"
        >
          <LocateFixed size={24} className="text-[#4285F4]" />
        </button>
      </div>

      {/* "Tap to drop a pin" banner when picking location */}
      {pickingOnMap && (
        <div className="absolute bottom-[120px] left-1/2 -translate-x-1/2 z-20 bg-[#364153] text-white text-[13px] font-medium px-5 py-3 rounded-full shadow-[0px_8px_24px_rgba(0,0,0,0.2)] pointer-events-none select-none">
          Tap the map to drop a pin
        </div>
      )}

      {/* Single Marker MoodDetailCard overlay */}
      {selectedEntry && !detailModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9997] bg-black/10"
            onClick={() => setSelectedEntry(null)}
          />
          {/* Card positioned at screen center */}
          <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4 pointer-events-none animate-fade-in">
            <div className="w-[80%] max-w-[400px] pointer-events-auto">
              <MoodDetailCard
                entry={selectedEntry}
                authorName={
                  selectedEntry.is_own === false
                    ? selectedEntry.profiles?.display_name
                    : null
                }
                authorAvatarUrl={
                  selectedEntry.is_own === false
                    ? selectedEntry.profiles?.avatar_url
                    : null
                }
                onClick={() => setDetailModalOpen(true)}
              />
            </div>
          </div>
          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: translateY(16px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.25s ease-out;
            }
          `}</style>
        </>
      )}

      {/* Single Marker MoodDetailModal (full detail) */}
      {selectedEntry && (
        <MoodDetailModal
          entry={selectedEntry}
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedEntry(null);
          }}
          onLocate={
            entryAlreadyLocated
              ? undefined
              : () => {
                  setDetailModalOpen(false);
                  setSelectedEntry(null);
                  setFlyTo({
                    lat: selectedEntry.latitude,
                    lng: selectedEntry.longitude,
                  });
                }
          }
          authorName={
            selectedEntry.is_own === false
              ? selectedEntry.profiles?.display_name
              : null
          }
          authorAvatarUrl={
            selectedEntry.is_own === false
              ? selectedEntry.profiles?.avatar_url
              : null
          }
          locationName={selectedEntryLocationName}
        />
      )}

      {/* Cluster Detail Panel */}
      <ClusterDetailPanel
        entries={clusterEntries}
        isOpen={clusterPanelOpen}
        onClose={() => setClusterPanelOpen(false)}
        onEntryLocate={handleEntryClick}
        notificationIds={newFriendEntryIds}
        onMarkRead={markRead}
      />

      {/* Add Mood Modal */}
      <AddMoodModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setPickingOnMap(false);
        }}
        onSubmit={handleSubmit}
        coordinates={selectedLngLat}
        locationName={locationName}
        onLocationChange={handleLocationChange}
        onPickOnMap={handlePickOnMap}
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
