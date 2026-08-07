import type { DeclineEntityType, DeklinacijaCase, Gender } from './types'
import { declineFullName } from './names'
import { declineCompany } from './companies'
import { declineAmount } from './amounts'

export type { Gender, DeklinacijaCase, DeclineEntityType }
export { declineFullName, declineGivenName, declineSurname } from './names'
export { declineCompany } from './companies'
export { declineAmount } from './amounts'
export { NAME_EXCEPTIONS } from './exceptions'

export interface DeclineOptions {
  /** Vrsta podatka koji se dekliniše. Podrazumevano 'ime'. */
  type?: DeclineEntityType
}

/**
 * Jedinstvena ulazna tačka za deklinaciju — signatura iz
 * CLAUDE_CODE_BRIEF_gramatika.md, Zadatak 2. Namenjena pozivu kroz
 * function calling / tool use iz LLM-a tokom generisanja dokumenta
 * (vidi Zadatak 2, tačka 5): LLM više ne generiše deklinovani oblik sam,
 * nego poziva ovu funkciju za svako ime, firmu i iznos.
 *
 * `gender` se ignoriše za type='firma' i type='iznos' (prosledi bilo koju
 * vrednost — zadrži parametar radi jednoobrazne signature/tool sheme).
 */
export function decline(
  word: string,
  gender: Gender,
  kase: DeklinacijaCase,
  options: DeclineOptions = {}
): string {
  const type = options.type ?? 'ime'
  switch (type) {
    case 'firma':
      return declineCompany(word, kase)
    case 'iznos':
      return declineAmount(word)
    case 'ime':
    default:
      return declineFullName(word, gender, kase)
  }
}
