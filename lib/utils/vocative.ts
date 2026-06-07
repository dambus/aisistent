const MUSKA_NA_SUGLASNIK_IZUZECI = new Set([
  // Muska na -o (ne menjaju se)
  'Marko', 'Branko', 'Stanko', 'Zdravko', 'Drago',
  'Ivo', 'Pero', 'Đorđo', 'Mirko', 'Darko',
  // Muska na -a (ne menjaju se)
  'Luka', 'Nikola', 'Ilija', 'Sava', 'Stepa',
  'Đura', 'Pera', 'Mića', 'Laza', 'Draža',
])

const POSEBNI_VOKATIVI = new Map([
  ['Petar', 'Petre'],
])

export function toVocative(name: string): string {
  if (!name || name.length < 2) return name

  const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()

  const special = POSEBNI_VOKATIVI.get(normalized)
  if (special) return special

  if (MUSKA_NA_SUGLASNIK_IZUZECI.has(normalized)) {
    return normalized
  }

  const lastChar = normalized.slice(-1).toLowerCase()

  if (lastChar === 'a') return normalized
  if (lastChar === 'o' || lastChar === 'e') return normalized

  const samoglasnici = new Set(['a', 'e', 'i', 'o', 'u'])
  if (!samoglasnici.has(lastChar)) {
    return normalized + 'e'
  }

  return normalized
}

// toVocative('Milan') === 'Milane' ✓
// toVocative('Petar') === 'Petre' ✓
// toVocative('Stefan') === 'Stefane' ✓
// toVocative('Marko') === 'Marko' ✓
// toVocative('Luka') === 'Luka' ✓
// toVocative('Nikola') === 'Nikola' ✓
// toVocative('Ana') === 'Ana' ✓
// toVocative('Jelena') === 'Jelena' ✓
// toVocative('milan') === 'Milane' ✓
