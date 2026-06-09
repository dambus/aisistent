// Muška srpska imena koja završavaju na -a
const MUSKA_NA_A = new Set([
  'Nikola', 'Luka', 'Ilija', 'Sava', 'Stepa',
  'Đura', 'Pera', 'Mića', 'Laza', 'Draža',
  'Miša', 'Saša', 'Koša', 'Goga', 'Boba',
  'Žika', 'Vasa', 'Gvozda', 'Draga', 'Rada',
  'Srba', 'Ljuba', 'Bora', 'Đoka', 'Toma',
  'Steva', 'Dača', 'Maša', 'Paša', 'Raša',
  'Sima', 'Jova', 'Kosta', 'Vlada', 'Nića',
])

// Ženska srpska imena koja završavaju na suglasnik (retka)
const ZENSKA_NA_SUGLASNIK = new Set([
  'Ines', 'Carmen', 'Leonor', 'Merjem',
])

const SAMOGLASNICI = new Set(['a', 'e', 'i', 'o', 'u'])

export function detectGender(firstName: string): 'M' | 'F' | 'N' {
  if (!firstName) return 'N'

  const name = firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1).toLowerCase()
  const lastChar = name.slice(-1).toLowerCase()

  if (lastChar === 'a') {
    return MUSKA_NA_A.has(name) ? 'M' : 'F'
  }

  if (!SAMOGLASNICI.has(lastChar)) {
    return ZENSKA_NA_SUGLASNIK.has(name) ? 'F' : 'M'
  }

  if (lastChar === 'o') return 'M'  // Marko, Branko, Zdravko
  if (lastChar === 'e') return 'N'  // može biti i jedno i drugo
  // i, u — retko kao završetak srpskog imena
  return 'N'
}

// Testovi:
// detectGender('Ana')     → 'F'
// detectGender('Branka')  → 'F'
// detectGender('Jelena')  → 'F'
// detectGender('Milan')   → 'M'
// detectGender('Nikola')  → 'M'  (izuzetak)
// detectGender('Luka')    → 'M'  (izuzetak)
// detectGender('Marko')   → 'M'
// detectGender('Stefan')  → 'M'
// detectGender('Branko')  → 'M'
// detectGender('Ines')    → 'F'  (izuzetak)
