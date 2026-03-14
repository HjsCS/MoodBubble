// ============================================================
// Client-side image compression using Canvas API
// No external dependencies — runs entirely in the browser
//
// Optimized for Supabase Free Plan — keeps every upload under
// MAX_BYTES (default 200 KB) by progressively lowering quality.
// ============================================================

/** Absolute ceiling for a compressed image (bytes). */
const MAX_BYTES = 200 * 1024; // 200 KB

/** Lowest quality we'll try before giving up on further shrinking. */
const MIN_QUALITY = 0.3;

/** Quality decrement per retry round. */
const QUALITY_STEP = 0.1;

/**
 * Compress an image file to JPEG with reduced dimensions and quality.
 *
 * The function first scales the image down to `maxWidth` (default 600 px),
 * then iteratively lowers JPEG quality until the result is under
 * `MAX_BYTES` or `MIN_QUALITY` is reached.
 *
 * @param file     - The original image File from `<input type="file">`
 * @param maxWidth - Maximum width in pixels (height scales proportionally). Default 600.
 * @param quality  - Initial JPEG quality 0–1. Default 0.6.
 * @returns A compressed JPEG Blob, typically well under 200 KB.
 */
export async function compressImage(
  file: File,
  maxWidth = 600,
  quality = 0.6,
): Promise<Blob> {
  // Decode the image
  const bitmap = await createImageBitmap(file);

  // Calculate new dimensions (only shrink, never enlarge)
  let width = bitmap.width;
  let height = bitmap.height;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  // Draw onto a canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Progressive compression — keep lowering quality until under MAX_BYTES
  let currentQuality = quality;
  let blob = await canvasToBlob(canvas, currentQuality);

  while (blob.size > MAX_BYTES && currentQuality > MIN_QUALITY) {
    currentQuality = Math.max(currentQuality - QUALITY_STEP, MIN_QUALITY);
    blob = await canvasToBlob(canvas, currentQuality);
  }

  return blob;
}

/** Helper — promisified `canvas.toBlob` */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob returned null"));
      },
      "image/jpeg",
      quality,
    );
  });
}
