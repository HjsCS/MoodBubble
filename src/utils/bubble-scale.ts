/**
 * Return a pixel size for a mood bubble based on the number of
 * entries at that location cluster.
 */
export function getBubbleSize(entryCount: number): number {
  if (entryCount < 3) return 20;
  if (entryCount < 10) return 40;
  return 70;
}
