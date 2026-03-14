// ============================================================
// Client-side image compression using Canvas API
// No external dependencies — runs entirely in the browser
// ============================================================

/**
 * Compress an image file to JPEG with reduced dimensions and quality.
 *
 * @param file     - The original image File from <input type="file">
 * @param maxWidth - Maximum width in pixels (height scales proportionally). Default 800.
 * @param quality  - JPEG quality 0–1. Default 0.7 (~200KB for a typical photo).
 * @returns A compressed JPEG Blob, typically 5–20× smaller than the original.
 */
export async function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.7,
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

  // Draw onto an OffscreenCanvas (or regular canvas as fallback)
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Export as JPEG blob
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
