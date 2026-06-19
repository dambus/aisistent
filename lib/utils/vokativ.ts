import vokativData from '@/lib/data/vokativ.json'

const VOKATIV_MAP: Record<string, string> = vokativData as Record<string, string>

/**
 * Returns the vocative form of a Serbian first name, or null if not found.
 * Input should be just the first name (nominative).
 */
export function getVokativ(firstName: string): string | null {
  if (!firstName) return null
  const normalized = firstName.trim()
  return VOKATIV_MAP[normalized] ?? null
}

/**
 * Returns a hint string to inject into AI prompts for proper vocative use,
 * or empty string if name is not in the lookup table.
 *
 * Example: getVokativHint("Marko") → ' [vokativ: "Marko"]'
 */
export function getVokativHint(fullName: string): string {
  if (!fullName) return ''
  const firstName = fullName.trim().split(/\s+/)[0]
  const vokativ = getVokativ(firstName)
  if (!vokativ) return ''
  return ` [vokativ od "${firstName}" je "${vokativ}"]`
}
