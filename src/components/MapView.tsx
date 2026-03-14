"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { MoodEntryWithAuthor } from "@/types/database";
import {
  getEmotionBubbleBg,
  getEmotionBubbleBorder,
} from "@/utils/emotion-color";
import { getEmotionEmoji } from "@/utils/emotion-emoji";

export interface MapEntry extends MoodEntryWithAuthor {
  is_own?: boolean;
}

interface MapViewProps {
  entries: MapEntry[];
  notificationIds?: Set<string>;
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  onClusterClick?: (entries: MapEntry[]) => void;
  onMarkerClick?: (entry: MapEntry) => void;
  flyTo?: { lat: number; lng: number } | null;
  userLocation?: { lat: number; lng: number } | null;
}

/** Deterministic pseudo-random from a seed string (for consistent emoji positions) */
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (Math.imul(h ^ (h >>> 16), 0x45d9f3b) + 0x1234) | 0;
    return (h >>> 0) / 4294967296;
  };
}

/**
 * Get bubble size based on emotion score (0-100).
 */
function getBubbleSizeFromScore(score: number): number {
  if (score >= 70) return 72;
  if (score >= 40) return 56;
  return 40;
}

/**
 * Generate a floating emoji element string positioned inside a circle.
 * Uses collision avoidance — each emoji checks distance from previous ones.
 */
function floatingEmoji(
  emoji: string,
  size: number,
  index: number,
  rng: () => number,
  occupied: { x: number; y: number }[] = [],
): string {
  const emojiSize = Math.max(Math.round(size * 0.35), 14);
  const radius = size / 2 - emojiSize / 2 - 2;
  const minDist = emojiSize * 0.8; // collision radius

  // Try up to 20 positions, pick one that doesn't overlap
  let bestCx = size / 2 - emojiSize / 2;
  let bestCy = size / 2 - emojiSize / 2;
  for (let attempt = 0; attempt < 20; attempt++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * radius * 0.8;
    const cx = size / 2 + Math.cos(angle) * dist - emojiSize / 2;
    const cy = size / 2 + Math.sin(angle) * dist - emojiSize / 2;
    const centerX = cx + emojiSize / 2;
    const centerY = cy + emojiSize / 2;

    const collides = occupied.some((o) => {
      const dx = o.x - centerX;
      const dy = o.y - centerY;
      return Math.sqrt(dx * dx + dy * dy) < minDist;
    });

    bestCx = cx;
    bestCy = cy;
    if (!collides) break;
  }

  occupied.push({ x: bestCx + emojiSize / 2, y: bestCy + emojiSize / 2 });

  const duration = 4 + rng() * 3; // slower: 4-7 seconds
  const delay = rng() * -duration;
  const animName = `float${index}`;

  return `<span style="
    position:absolute;
    left:${bestCx}px;top:${bestCy}px;
    font-size:${emojiSize}px;
    line-height:1;
    animation:${animName} ${duration}s ease-in-out ${delay}s infinite;
    pointer-events:none;
  ">${emoji}</span>`;
}

/**
 * Generate CSS keyframes for floating animations.
 * Each emoji gets a unique keyframe with slightly different motion.
 */
function floatKeyframes(count: number, size: number = 56): string {
  const range = Math.max(Math.round(size * 0.3), 8);
  let css = "";
  for (let i = 0; i < count; i++) {
    const dx1 = i % 3 === 0 ? range : -range;
    const dy1 = i % 2 === 0 ? -range : Math.round(range * 0.8);
    const dx2 =
      i % 3 === 1 ? -Math.round(range * 0.7) : Math.round(range * 0.6);
    const dy2 =
      i % 2 === 1 ? Math.round(range * 0.9) : -Math.round(range * 0.7);
    css += `@keyframes float${i}{0%,100%{transform:translate(0,0)}33%{transform:translate(${dx1}px,${dy1}px)}66%{transform:translate(${dx2}px,${dy2}px)}}`;
  }
  return css;
}

/**
 * Create a circular bubble icon with floating emoji.
 */
function createBubbleIcon(
  score: number,
  isOwn: boolean = true,
  hasNotification: boolean = false,
  entryId: string = "",
) {
  const size = getBubbleSizeFromScore(score);
  const bg = getEmotionBubbleBg(score);
  const border = getEmotionBubbleBorder(score);
  const borderStyle = isOwn ? `2px solid ${border}` : `2px dashed ${border}`;
  const opacity = isOwn ? 0.95 : 0.8;
  const emoji = getEmotionEmoji(score);

  const rng = seededRandom(entryId || String(score));
  const emojiHtml = floatingEmoji(emoji, size, 0, rng);

  const notifDot = hasNotification
    ? `<span style="position:absolute;top:-2px;right:-2px;width:10px;height:10px;border-radius:50%;background:#EF4444;border:2px solid white;"></span>`
    : "";

  const html = `
    <div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${bg};
      border:${borderStyle};
      opacity:${opacity};
      position:relative;
      overflow:hidden;
      filter:drop-shadow(0px 6px 20px rgba(0,0,0,0.1));
    ">
      <style>${floatKeyframes(1, size)}</style>
      ${emojiHtml}
    </div>
    ${notifDot}`;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

/**
 * Create a cluster icon with multiple floating emojis.
 * Shows emojis proportional to the mood distribution inside.
 */
function createClusterIcon(cluster: L.MarkerCluster, notifIds?: Set<string>) {
  const childCount = cluster.getChildCount();
  const size = Math.min(48 + childCount * 3, 80);

  const childMarkers = cluster.getAllChildMarkers();
  let totalScore = 0;
  let hasNotif = false;
  const scores: number[] = [];

  childMarkers.forEach((marker) => {
    const score = (marker.options as { entryScore?: number }).entryScore ?? 50;
    totalScore += score;
    scores.push(score);
    if (notifIds) {
      const entryId = (marker.options as { entryId?: string }).entryId;
      if (entryId && notifIds.has(entryId)) hasNotif = true;
    }
  });

  const avgScore = Math.round(totalScore / childMarkers.length);
  const bg = getEmotionBubbleBg(avgScore);
  const border = getEmotionBubbleBorder(avgScore);

  // Determine how many emojis to show (max 3)
  const maxEmojis = Math.min(scores.length, 3);
  // Sample proportionally if > 3
  const step = scores.length / maxEmojis;
  const sampledScores = Array.from(
    { length: maxEmojis },
    (_, i) => scores[Math.floor(i * step)],
  );

  const rng = seededRandom(`cluster-${avgScore}-${childCount}`);
  const occupied: { x: number; y: number }[] = [];
  const emojis = sampledScores
    .map((s, i) => floatingEmoji(getEmotionEmoji(s), size, i, rng, occupied))
    .join("");

  const notifDot = hasNotif
    ? `<span style="position:absolute;top:-3px;right:-3px;width:12px;height:12px;border-radius:50%;background:#EF4444;border:2px solid white;z-index:1;"></span>`
    : "";

  const html = `
    <div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${bg};
      border:2px solid ${border};
      opacity:0.9;
      position:relative;
      overflow:hidden;
      filter:drop-shadow(0px 6px 20px rgba(0,0,0,0.12));
    ">
      <style>${floatKeyframes(maxEmojis, size)}</style>
      ${emojis}
      <span style="
        position:absolute;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:${size > 60 ? 16 : 14}px;
        font-weight:700;
        color:#364153;
        text-shadow:0 1px 2px rgba(255,255,255,0.8);
        pointer-events:none;
      ">${childCount}</span>
    </div>
    ${notifDot}`;

  return L.divIcon({
    html,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * Blue dot icon showing user's current GPS position.
 */
const userLocationIcon = L.divIcon({
  html: `<div style="width:20px;height:20px;background:rgba(66,133,244,0.25);border-radius:50%;display:flex;align-items:center;justify-content:center">
    <div style="width:12px;height:12px;background:#4285F4;border:2px solid white;border-radius:50%;box-shadow:0 0 0 2px rgba(66,133,244,0.4)"></div>
  </div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

/**
 * Inner component to handle map click events.
 */
function MapClickHandler({
  onClick,
}: {
  onClick?: (lngLat: { lng: number; lat: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onClick?.({ lng: e.latlng.lng, lat: e.latlng.lat });
    },
  });
  return null;
}

/**
 * Inner component to handle flyTo requests.
 */
function FlyToHandler({
  flyTo,
}: {
  flyTo: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  const prevFlyTo = useRef(flyTo);

  useEffect(() => {
    if (flyTo && flyTo !== prevFlyTo.current) {
      map.flyTo([flyTo.lat, flyTo.lng], 16, { duration: 0.8 });
      prevFlyTo.current = flyTo;
    }
  }, [flyTo, map]);

  return null;
}

/**
 * Full-screen Leaflet map with clustered bubble markers.
 */
export default function MapView({
  entries,
  notificationIds,
  onMapClick,
  onClusterClick,
  onMarkerClick,
  flyTo,
  userLocation,
}: MapViewProps) {
  // Build a lookup from entry id → entry object for cluster click
  const entryMap = useRef<Map<string, MapEntry>>(new Map());
  const notifRef = useRef<Set<string> | undefined>(notificationIds);
  notifRef.current = notificationIds;

  useEffect(() => {
    const map = new Map<string, MapEntry>();
    entries.forEach((e) => map.set(e.id, e));
    entryMap.current = map;
  }, [entries]);

  const handleClusterClick = (cluster: L.MarkerCluster) => {
    if (!onClusterClick) return;

    const childMarkers = cluster.getAllChildMarkers();
    const clusterEntries: MapEntry[] = [];

    childMarkers.forEach((marker) => {
      const entryId = (marker.options as { entryId?: string }).entryId;
      if (entryId) {
        const entry = entryMap.current.get(entryId);
        if (entry) clusterEntries.push(entry);
      }
    });

    if (clusterEntries.length > 0) {
      onClusterClick(clusterEntries);
    }
  };

  return (
    <MapContainer
      center={[-37.8136, 144.9631]}
      zoom={13}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      <MapClickHandler onClick={onMapClick} />
      <FlyToHandler flyTo={flyTo ?? null} />

      <MarkerClusterGroup
        maxClusterRadius={50}
        disableClusteringAtZoom={19}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={true}
        spiderfyDistanceMultiplier={2}
        zoomToBoundsOnClick={false}
        iconCreateFunction={(cluster: L.MarkerCluster) =>
          createClusterIcon(cluster, notifRef.current)
        }
        onClick={(e: L.LeafletEvent) => {
          const cluster = e.propagatedFrom as L.MarkerCluster;
          if (cluster && typeof cluster.getAllChildMarkers === "function") {
            handleClusterClick(cluster);
          }
        }}
      >
        {entries.map((entry) => {
          const isOwn = entry.is_own !== false;
          const hasNotif = notificationIds?.has(entry.id) ?? false;

          return (
            <Marker
              key={entry.id}
              position={[entry.latitude, entry.longitude]}
              icon={createBubbleIcon(
                entry.emotion_score,
                isOwn,
                hasNotif,
                entry.id,
              )}
              // @ts-expect-error — custom options for cluster access
              entryId={entry.id}
              entryScore={entry.emotion_score}
              eventHandlers={{
                click: (e) => {
                  // Prevent default popup behavior, fire custom handler instead
                  e.originalEvent.stopPropagation();
                  onMarkerClick?.(entry);
                },
              }}
            />
          );
        })}
      </MarkerClusterGroup>

      {/* Blue dot: user's current GPS position */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userLocationIcon}
          zIndexOffset={1000}
          eventHandlers={{ click: (e) => e.originalEvent.stopPropagation() }}
        />
      )}
    </MapContainer>
  );
}
