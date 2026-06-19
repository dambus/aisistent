/**
 * Removes Serbian diacritics and any non-ASCII characters from a string
 * so it's safe to use in HTTP Content-Disposition headers.
 */
export function sanitizeFilename(input: string): string {
  const map: Record<string, string> = {
    'š': 's', 'Š': 'S',
    'đ': 'dj', 'Đ': 'Dj',
    'č': 'c', 'Č': 'C',
    'ć': 'c', 'Ć': 'C',
    'ž': 'z', 'Ž': 'Z',
  }
  const replaced = input.replace(/[šŠđĐčČćĆžŽ]/g, (ch) => map[ch] ?? ch)
  // Strip any remaining non-ASCII characters as a safety net
  return replaced.replace(/[^\x00-\x7F]/g, '')
}
