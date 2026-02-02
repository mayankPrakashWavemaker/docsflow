/**
 * Compares two version strings.
 * Supports any number of parts (e.g., "11.13.4" vs "11.13.4.1")
 * Uses numeric comparison for each part.
 * Returns:
 *  - 1 if v1 > v2
 *  - -1 if v1 < v2
 *  - 0 if v1 == v2
 */
export function compareVersions(v1: string, v2: string): number {
  // Normalize separators: handle both 'dot' and 'dash' just in case,
  // though user mentioned "11-13-4".
  const p1 = v1.replace(/-/g, '.').split('.').map(Number);
  const p2 = v2.replace(/-/g, '.').split('.').map(Number);

  const length = Math.max(p1.length, p2.length);

  for (let i = 0; i < length; i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0;
}

export function sortVersions(versions: string[], descending = true): string[] {
  return [...versions].sort((a, b) => {
    const result = compareVersions(a, b);
    return descending ? -result : result;
  });
}
