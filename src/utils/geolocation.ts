// ============================================================
// Browser Geolocation API — Promise-based wrapper
// ============================================================

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number; // metres
}

export type GeoErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "UNSUPPORTED";

export interface GeoError {
  code: GeoErrorCode;
  message: string;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 10_000,
  maximumAge: 60_000, // allow cached position up to 60s old
};

function mapError(err: GeolocationPositionError): GeoError {
  const codeMap: Record<number, GeoErrorCode> = {
    1: "PERMISSION_DENIED",
    2: "POSITION_UNAVAILABLE",
    3: "TIMEOUT",
  };
  return {
    code: codeMap[err.code] ?? "POSITION_UNAVAILABLE",
    message: err.message,
  };
}

function toGeoPosition(pos: GeolocationPosition): GeoPosition {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy,
  };
}

/**
 * Get the user's current position (one-shot).
 */
export function getCurrentPosition(): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: "UNSUPPORTED", message: "Geolocation is not supported" } as GeoError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(toGeoPosition(pos)),
      (err) => reject(mapError(err)),
      GEO_OPTIONS,
    );
  });
}

/**
 * Watch the user's position continuously.
 * Returns a cleanup function to stop watching (for useEffect return).
 */
export function watchPosition(
  onUpdate: (pos: GeoPosition) => void,
  onError: (err: GeoError) => void,
): () => void {
  if (!navigator.geolocation) {
    onError({ code: "UNSUPPORTED", message: "Geolocation is not supported" });
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => onUpdate(toGeoPosition(pos)),
    (err) => onError(mapError(err)),
    GEO_OPTIONS,
  );
  return () => navigator.geolocation.clearWatch(id);
}
