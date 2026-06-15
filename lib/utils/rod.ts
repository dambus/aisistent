const MUSKI_NA_A = new Set([
  'Luka', 'Nikola', 'Ilija', 'Danila', 'Saša', 'Sava', 'Steša', 'Đorđa', 'Draga',
])

export function getZastupnikRod(ime: string): 'muski' | 'zenski' {
  if (!ime) return 'muski'
  const firstName = ime.trim().split(/\s+/)[0]
  const normalized = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
  const lastChar = normalized.slice(-1).toLowerCase()
  if (lastChar === 'a' && !MUSKI_NA_A.has(normalized)) return 'zenski'
  return 'muski'
}
