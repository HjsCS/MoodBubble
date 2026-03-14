"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Crosshair,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import AddressSearch from "@/components/AddressSearch";
import { getCurrentPosition, type GeoError } from "@/utils/geolocation";
import { reverseGeocode } from "@/utils/geocoding";

interface LocationPickerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPickOnMap: () => void;
  onAddressSelect: (name: string, lat: number, lng: number) => void;
  onGpsSelect: (name: string, lat: number, lng: number) => void;
}

type Mode = "menu" | "address" | "gps";

export default function LocationPickerSheet({
  isOpen,
  onClose,
  onPickOnMap,
  onAddressSelect,
  onGpsSelect,
}: LocationPickerSheetProps) {
  const [mode, setMode] = useState<Mode>("menu");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Reset mode when sheet opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Small delay to let the close animation finish before resetting
      const timer = setTimeout(() => {
        setMode("menu");
        setGpsLoading(false);
        setGpsError(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle GPS mode — start getting position
  useEffect(() => {
    if (mode !== "gps" || !isOpen) return;

    let cancelled = false;
    setGpsLoading(true);
    setGpsError(null);

    (async () => {
      try {
        const pos = await getCurrentPosition();
        if (cancelled) return;
        const name = await reverseGeocode(pos.lat, pos.lng);
        if (cancelled) return;
        onGpsSelect(name, pos.lat, pos.lng);
      } catch (err) {
        if (cancelled) return;
        const geoErr = err as GeoError;
        if (geoErr.code === "PERMISSION_DENIED") {
          setGpsError(
            "Location access denied. Enable location in your browser settings.",
          );
        } else {
          setGpsError("Couldn't get your location. Please try again.");
        }
      } finally {
        if (!cancelled) setGpsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, isOpen, onGpsSelect]);

  const handleRetryGps = () => {
    setMode("menu");
    // Small delay then re-enter gps mode to re-trigger the effect
    setTimeout(() => setMode("gps"), 50);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/30 z-[10000] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[10001] bg-white rounded-t-[32px] shadow-[0px_-10px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="p-5 pb-8">
          {/* Handle bar */}
          <div className="w-10 h-1 bg-[#e5e7eb] rounded-full mx-auto mb-5" />

          {/* Menu mode */}
          {mode === "menu" && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[15px] font-medium text-[#101828] mb-1">
                Choose Location
              </h3>

              {/* Pick on Map */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPickOnMap();
                }}
                className="flex items-center gap-3 w-full p-3 rounded-[16px] hover:bg-[#f3f4f6] active:bg-[#e5e7eb] transition-colors"
              >
                <div className="w-[40px] h-[40px] bg-[#b8e6d5] rounded-full flex items-center justify-center shrink-0">
                  <MapPin size={20} className="text-[#6baa96]" />
                </div>
                <span className="flex-1 text-left text-[14px] font-medium text-[#364153]">
                  Pick on Map
                </span>
                <ChevronRight size={18} className="text-[#99a1af]" />
              </button>

              {/* Enter Address */}
              <button
                type="button"
                onClick={() => setMode("address")}
                className="flex items-center gap-3 w-full p-3 rounded-[16px] hover:bg-[#f3f4f6] active:bg-[#e5e7eb] transition-colors"
              >
                <div className="w-[40px] h-[40px] bg-[#d4e5f7] rounded-full flex items-center justify-center shrink-0">
                  <Search size={20} className="text-[#5b8db8]" />
                </div>
                <span className="flex-1 text-left text-[14px] font-medium text-[#364153]">
                  Enter Address
                </span>
                <ChevronRight size={18} className="text-[#99a1af]" />
              </button>

              {/* Use Current Location */}
              <button
                type="button"
                onClick={() => setMode("gps")}
                className="flex items-center gap-3 w-full p-3 rounded-[16px] hover:bg-[#f3f4f6] active:bg-[#e5e7eb] transition-colors"
              >
                <div className="w-[40px] h-[40px] bg-[#d4e5f7] rounded-full flex items-center justify-center shrink-0">
                  <Crosshair size={20} className="text-[#5b8db8]" />
                </div>
                <span className="flex-1 text-left text-[14px] font-medium text-[#364153]">
                  Use Current Location
                </span>
                <ChevronRight size={18} className="text-[#99a1af]" />
              </button>
            </div>
          )}

          {/* Address search mode */}
          {mode === "address" && (
            <AddressSearch
              onSelect={(result) => {
                onAddressSelect(result.name, result.lat, result.lng);
              }}
              onCancel={() => setMode("menu")}
            />
          )}

          {/* GPS mode */}
          {mode === "gps" && (
            <div className="flex flex-col items-center gap-4 py-6">
              {gpsLoading && (
                <>
                  <Loader2 size={32} className="text-[#4285F4] animate-spin" />
                  <p className="text-[14px] text-[#364153] font-medium">
                    Getting your location…
                  </p>
                </>
              )}

              {gpsError && (
                <>
                  <X size={32} className="text-[#e89b9b]" />
                  <p className="text-[14px] text-[#364153] text-center px-4">
                    {gpsError}
                  </p>
                  <div className="flex gap-3">
                    {!gpsError.includes("denied") && (
                      <button
                        type="button"
                        onClick={handleRetryGps}
                        className="px-5 py-2.5 bg-[#4285F4] text-white text-[13px] font-medium rounded-full"
                      >
                        Try Again
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setMode("menu")}
                      className="px-5 py-2.5 bg-[#f3f4f6] text-[#364153] text-[13px] font-medium rounded-full"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
