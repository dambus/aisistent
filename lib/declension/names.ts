import type { DeklinacijaCase, Gender } from './types'
import { NAME_EXCEPTIONS } from './exceptions'

/**
 * Meki suglasnici — određuju nastavak instrumentala u tvrdoj (suglasničkoj)
 * promeni: -em posle mekih, -om posle tvrdih. A-promena (imena na -a/-o) uvek
 * uzima -om bez obzira na osnovu, pa se ta provera ne primenjuje tamo.
 */
const SOFT_MULTI = ['dž', 'lj', 'nj']
const SOFT_SINGLE = new Set(['c', 'č', 'ć', 'đ', 'j', 'š', 'ž'])

function endsWithSoftConsonant(word: string): boolean {
  const lower = word.toLowerCase()
  if (SOFT_MULTI.some((s) => lower.endsWith(s))) return true
  return SOFT_SINGLE.has(lower.slice(-1))
}

/** Suglasnička promena (Petar, Nikolić, Vukašin, Miloš...). */
function declineConsonantClass(word: string, kase: DeklinacijaCase): string {
  switch (kase) {
    case 'nominativ':
      return word
    case 'genitiv':
    case 'akuzativ':
      return word + 'a'
    case 'dativ':
    case 'lokativ':
      return word + 'u'
    case 'instrumental':
      return word + (endsWithSoftConsonant(word) ? 'em' : 'om')
  }
}

/** A-promena — imena na -a (Nikola, Ana, Milica...). Instrumental je uvek -om. */
function declineAClass(word: string, kase: DeklinacijaCase): string {
  const stem = word.slice(0, -1)
  switch (kase) {
    case 'nominativ':
      return word
    case 'genitiv':
      return stem + 'e'
    case 'dativ':
    case 'lokativ':
      return stem + 'i'
    case 'akuzativ':
      return stem + 'u'
    case 'instrumental':
      return stem + 'om'
  }
}

/**
 * O-promena — muška imena na -o (Žarko, Marko, Darko...). Za razliku od
 * A-promene, koristi iste nastavke kao suglasnička promena, samo na osnovu
 * bez završnog -o (Žarko → Žark- → Žarka, ne "Žarke").
 */
function declineOClass(word: string, kase: DeklinacijaCase): string {
  const stem = word.slice(0, -1)
  switch (kase) {
    case 'nominativ':
      return word
    case 'genitiv':
    case 'akuzativ':
      return stem + 'a'
    case 'dativ':
    case 'lokativ':
      return stem + 'u'
    case 'instrumental':
      return stem + 'om'
  }
}

/** E-promena — imena na -e (Đorđe, Rade, Vlade...). */
function declineEClass(word: string, kase: DeklinacijaCase): string {
  const stem = word.slice(0, -1)
  switch (kase) {
    case 'nominativ':
      return word
    case 'genitiv':
    case 'akuzativ':
      return stem + 'a'
    case 'dativ':
    case 'lokativ':
      return stem + 'u'
    case 'instrumental':
      return stem + 'em'
  }
}

function applyException(word: string, kase: DeklinacijaCase): string | null {
  if (kase === 'nominativ') return word
  const exception = NAME_EXCEPTIONS[word.toLowerCase()]
  if (!exception) return null
  if (exception.indeclinable) return word
  return exception.forms?.[kase] ?? null
}

/**
 * Dekliniše lično ime (bez prezimena) — ime, srednje ime, ili prezime muškog
 * nosioca (koje se menja isto kao ime).
 */
export function declineGivenName(word: string, gender: Gender, kase: DeklinacijaCase): string {
  if (kase === 'nominativ') return word

  const exceptionForm = applyException(word, kase)
  if (exceptionForm !== null) return exceptionForm

  const last = word.slice(-1).toLowerCase()
  if (last === 'e') return declineEClass(word, kase)
  if (last === 'a') return declineAClass(word, kase)
  if (last === 'o') return declineOClass(word, kase)

  if (gender === 'f') {
    // žensko ime na suglasnik van rečnika izuzetaka — najčešće strano ime;
    // bez potvrde u rečniku, bezbednije je vratiti nepromenjeno nego pogađati
    return word
  }
  return declineConsonantClass(word, kase)
}

/**
 * Dekliniše prezime. Standardna praksa u srpskom: žensko prezime na suglasnik
 * (npr. -ić) ostaje nepromenjeno kroz padeže; mušku promenu prati puna
 * suglasnička/A-promena.
 */
export function declineSurname(word: string, gender: Gender, kase: DeklinacijaCase): string {
  if (kase === 'nominativ') return word

  const exceptionForm = applyException(word, kase)
  if (exceptionForm !== null) return exceptionForm

  const last = word.slice(-1).toLowerCase()

  if (gender === 'f') {
    if (last === 'a') return declineAClass(word, kase)
    // prezime na suglasnik (ili retko na -e/-o) kod žene — nepromenjeno
    return word
  }

  if (last === 'e') return declineEClass(word, kase)
  if (last === 'a') return declineAClass(word, kase)
  if (last === 'o') return declineOClass(word, kase)
  return declineConsonantClass(word, kase)
}

/**
 * Dekliniše puno ime — poslednja reč se tretira kao prezime (declineSurname),
 * sve prethodne kao ime/srednja imena (declineGivenName). Za jednu reč,
 * tretira se kao ime.
 */
export function declineFullName(fullName: string, gender: Gender, kase: DeklinacijaCase): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return fullName
  if (parts.length === 1) return declineGivenName(parts[0], gender, kase)

  const surname = parts[parts.length - 1]
  const givenParts = parts.slice(0, -1).map((p) => declineGivenName(p, gender, kase))
  return [...givenParts, declineSurname(surname, gender, kase)].join(' ')
}
