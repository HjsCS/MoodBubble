// ============================================================
// Nominatim (OpenStreetMap) — Free geocoding utilities
// https://nominatim.org/release-docs/latest/api/Overview/
// ============================================================

const BASE_URL = "https://nominatim.openstreetmap.org";

const HEADERS: HeadersInit = {
  "User-Agent": "MoodBubble/1.0 (unihack)",
  Accept: "application/json",
  "Accept-Language": "en",
};

// ── Reverse geocoding cache (keyed on rounded lat,lng) ──────
const reverseCache = new Map<string, string>();

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

/**
 * Convert lat/lng → human-readable place name.
 * Never throws — returns "Unknown location" on error.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  const key = cacheKey(lat, lng);
  const cached = reverseCache.get(key);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return "Unknown location";

    const data = await res.json();
    const addr = data.address ?? {};

    // Prefer: suburb → city → town → village → state → display_name
    const name =
      addr.suburb ??
      addr.city ??
      addr.town ??
      addr.village ??
      addr.state ??
      data.display_name ??
      "Unknown location";

    // Make it slightly more descriptive: "Suburb, City" when both exist
    let display = name;
    if (addr.suburb && (addr.city || addr.town)) {
      display = `${addr.suburb}, ${addr.city ?? addr.town}`;
    }

    reverseCache.set(key, display);
    return display;
  } catch {
    return "Unknown location";
  }
}

// ── Forward geocoding (address search) ──────────────────────

export interface AddressResult {
  name: string; // Short label (first 2 comma-parts of display_name)
  fullName: string; // Full display_name
  lat: number;
  lng: number;
}

/**
 * Search for addresses matching the query string.
 * Returns up to 5 results. Never throws — returns [] on error.
 */
export async function searchAddress(
  query: string,
): Promise<AddressResult[]> {
  if (!query.trim()) return [];

  try {
    const url = `${BASE_URL}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return [];

    const data: Array<{
      display_name: string;
      lat: string;
      lon: string;
    }> = await res.json();

    return data.map((item) => {
      const parts = item.display_name.split(", ");
      return {
        name: parts.slice(0, 2).join(", "),
        fullName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      };
    });
  } catch {
    return [];
  }
}
