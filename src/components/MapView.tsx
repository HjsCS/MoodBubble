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
import { getEmotionColor } from "@/utils/emotion-color";
import { EMOTION_CATEGORIES } from "@/utils/categories";

interface MapViewProps {
  entries: MoodEntry[];
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

/**
 * Create a circular SVG icon for a mood marker.
 */
function createBubbleIcon(color: string) {
  const svg = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2" opacity="0.85"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: "", // remove default leaflet styles
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
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
 * Full-screen Leaflet map that renders mood entries as circle markers.
 * Uses OpenStreetMap tiles (free, no API key required).
 */
export default function MapView({ entries, onMapClick }: MapViewProps) {
  return (
    <MapContainer
      center={[-37.8136, 144.9631]} // Melbourne CBD
      zoom={13}
      className="h-full w-full z-0"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onClick={onMapClick} />

      {entries.map((entry) => {
        const color = getEmotionColor(entry.emotion_score);
        const cat = EMOTION_CATEGORIES[entry.category];

        return (
          <Marker
            key={entry.id}
            position={[entry.latitude, entry.longitude]}
            icon={createBubbleIcon(color)}
          >
            <Popup>
              <div className="text-sm leading-relaxed">
                <strong>
                  {cat.emoji} {cat.label}
                </strong>
                <br />
                Score: {entry.emotion_score}/10
                {entry.note && (
                  <>
                    <br />
                    <em className="text-zinc-500">{entry.note}</em>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
