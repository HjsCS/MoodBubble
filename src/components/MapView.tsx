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
import type { MoodEntry } from "@/types/database";
import {
  getEmotionBubbleBg,
  getEmotionBubbleBorder,
  getEmotionAccentColor,
} from "@/utils/emotion-color";
import { EMOTION_CATEGORIES } from "@/utils/categories";

interface MapViewProps {
  entries: MoodEntry[];
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
 */
function createBubbleIcon(score: number) {
  const size = getBubbleSizeFromScore(score);
  const bg = getEmotionBubbleBg(score);
  const border = getEmotionBubbleBorder(score);

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}"
        fill="${bg}" stroke="${border}" stroke-width="1" opacity="0.95"
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
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onClick={onMapClick} />

      {entries.map((entry) => {
        const cat = EMOTION_CATEGORIES[entry.category];
        const accentColor = getEmotionAccentColor(entry.emotion_score);

        return (
          <Marker
            key={entry.id}
            position={[entry.latitude, entry.longitude]}
            icon={createBubbleIcon(entry.emotion_score)}
          >
            <Popup>
              <div className="text-sm leading-relaxed min-w-[160px]">
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
