"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MoodEntryWithAuthor } from "@/types/database";
import {
  getEmotionBubbleBg,
  getEmotionBubbleBorder,
  getEmotionAccentColor,
} from "@/utils/emotion-color";
import { EMOTION_CATEGORIES } from "@/utils/categories";

interface MapEntry extends MoodEntryWithAuthor {
  is_own?: boolean;
}

interface MapViewProps {
  entries: MapEntry[];
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

/**
 * Get bubble size based on emotion score (Figma style).
 * Higher scores = larger bubbles.
 */
function getBubbleSizeFromScore(score: number): number {
  if (score >= 7) return 72;
  if (score >= 4) return 56;
  return 40;
}

/**
 * Create a circular bubble icon matching the Figma design.
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
 * Full-screen Leaflet map with Figma-styled bubble markers.
 * Supports friend entries with dashed borders and author names.
 */
export default function MapView({ entries, onMapClick }: MapViewProps) {
  return (
    <MapContainer
      center={[-37.8136, 144.9631]}
      zoom={13}
      className="h-full w-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />

      <MapClickHandler onClick={onMapClick} />

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
          >
            <Popup>
              <div className="text-sm leading-relaxed min-w-[160px]">
                {/* Show author name for friend entries */}
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
    </MapContainer>
  );
}
