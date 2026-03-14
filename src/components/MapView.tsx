"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
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
  getEmotionAccentColor,
} from "@/utils/emotion-color";
import { EMOTION_CATEGORIES } from "@/utils/categories";

export interface MapEntry extends MoodEntryWithAuthor {
  is_own?: boolean;
}

interface MapViewProps {
  entries: MapEntry[];
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
  onClusterClick?: (entries: MapEntry[]) => void;
  flyTo?: { lat: number; lng: number } | null;
}

/**
 * Get bubble size based on emotion score.
 * Higher scores = larger bubbles.
 */
function getBubbleSizeFromScore(score: number): number {
  if (score >= 7) return 72;
  if (score >= 4) return 56;
  return 40;
}

/**
 * Create a circular bubble icon.
 * Friend entries get a dashed border to distinguish them.
 */
function createBubbleIcon(score: number, isOwn: boolean = true) {
  const size = getBubbleSizeFromScore(score);
  const bg = getEmotionBubbleBg(score);
  const border = getEmotionBubbleBorder(score);
  const strokeDash = isOwn ? "" : 'stroke-dasharray="4 3"';
  const opacity = isOwn ? "0.95" : "0.80";

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
        fill="${bg}" stroke="${border}" stroke-width="${isOwn ? 1 : 2}"
        opacity="${opacity}" ${strokeDash}
        style="filter: drop-shadow(0px 10px 30px rgba(0,0,0,0.08));"
      />
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

/**
 * Create a custom cluster icon showing entry count with dominant mood color.
 */
function createClusterIcon(cluster: L.MarkerCluster) {
  const childCount = cluster.getChildCount();
  const size = Math.min(48 + childCount * 3, 80);

  // Determine dominant mood from child markers
  const childMarkers = cluster.getAllChildMarkers();
  let totalScore = 0;
  childMarkers.forEach((marker) => {
    const score = (marker.options as { entryScore?: number }).entryScore ?? 5;
    totalScore += score;
  });
  const avgScore = Math.round(totalScore / childMarkers.length);

  const bg = getEmotionBubbleBg(avgScore);
  const border = getEmotionBubbleBorder(avgScore);

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}"
        fill="${bg}" stroke="${border}" stroke-width="2"
        opacity="0.9"
        style="filter: drop-shadow(0px 10px 30px rgba(0,0,0,0.12));"
      />
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central"
        font-size="${size > 60 ? 16 : 14}" font-weight="600" font-family="system-ui, sans-serif"
        fill="#364153"
      >${childCount}</text>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

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
  onMapClick,
  onClusterClick,
  flyTo,
}: MapViewProps) {
  // Build a lookup from entry id → entry object for cluster click
  const entryMap = useRef<Map<string, MapEntry>>(new Map());

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
        maxClusterRadius={60}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom={false}
        zoomToBoundsOnClick={false}
        iconCreateFunction={createClusterIcon}
        onClick={(e: L.LeafletEvent) => {
          const cluster = e.propagatedFrom as L.MarkerCluster;
          if (cluster && typeof cluster.getAllChildMarkers === "function") {
            handleClusterClick(cluster);
          }
        }}
      >
        {entries.map((entry) => {
          const cat = EMOTION_CATEGORIES[entry.category];
          const accentColor = getEmotionAccentColor(entry.emotion_score);
          const isOwn = entry.is_own !== false;
          const authorName = entry.profiles?.display_name;

          return (
            <Marker
              key={entry.id}
              position={[entry.latitude, entry.longitude]}
              icon={createBubbleIcon(entry.emotion_score, isOwn)}
              // @ts-expect-error — custom options for cluster access
              entryId={entry.id}
              entryScore={entry.emotion_score}
            >
              <Popup>
                <div className="text-sm leading-relaxed min-w-[160px]">
                  {!isOwn && authorName && (
                    <div className="text-[11px] text-[#9b72c0] font-medium mb-1">
                      {authorName}&apos;s mood
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-base">{cat.emoji}</span>
                    <strong style={{ color: accentColor }}>{cat.label}</strong>
                  </div>
                  <div className="text-[#6a7282] text-xs">
                    Score: {entry.emotion_score}/10
                  </div>
                  {entry.note && (
                    <p className="text-[#364153] text-xs mt-1 italic">
                      {entry.note}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
