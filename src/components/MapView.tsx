"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MoodEntry } from "@/types/database";
import { getEmotionColor } from "@/utils/emotion-color";

interface MapViewProps {
  entries: MoodEntry[];
  onMapClick?: (lngLat: { lng: number; lat: number }) => void;
}

/**
 * Full-screen Mapbox GL map that renders mood entries as circle markers.
 * Uses vanilla mapbox-gl for better performance than react-map-gl wrapper.
 */
export default function MapView({ entries, onMapClick }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialise map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [144.9631, -37.8136], // Melbourne CBD
      zoom: 12,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    if (onMapClick) {
      map.on("click", (e) => {
        onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
      });
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync markers with entries
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    entries.forEach((entry) => {
      const el = document.createElement("div");
      const color = getEmotionColor(entry.emotion_score);
      Object.assign(el.style, {
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: color,
        border: "2px solid rgba(255,255,255,0.7)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([entry.longitude, entry.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 12 }).setHTML(
            `<div style="font-family:sans-serif;font-size:13px;">
              <strong>${entry.category}</strong><br/>
              Score: ${entry.emotion_score}/10<br/>
              ${entry.note ? `<em>${entry.note}</em>` : ""}
            </div>`,
          ),
        )
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [entries]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}
