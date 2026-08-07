import type { DeklinacijaCase, Gender } from './types'

/**
 * Rečnik izuzetaka za lična imena koja ne prate osnovna pravila u names.ts.
 *
 * Dva razloga da ime bude ovde:
 * 1. `indeclinable: true` — strano ime koje se u srpskom kontekstu ne dekliniše
 *    (npr. Carmen, Isabel).
 * 2. `forms` — nepravilna promena koja se ne može izvesti iz nastavka reči
 *    (najčešće "nepostojano a": Petar → Petra, ne "Petara").
 *
 * Ključ je ime u nominativu, malim slovima. Dopunjuje se kako se otkrivaju
 * novi slučajevi u produkciji (svaka prijavljena greška iz regresionog testa
 * postaje novi red ovde) — vidi CLAUDE_CODE_BRIEF_gramatika.md, Zadatak 2.3.
 */
export interface NameException {
  gender: Gender
  indeclinable?: boolean
  forms?: Partial<Record<Exclude<DeklinacijaCase, 'nominativ'>, string>>
}

export const NAME_EXCEPTIONS: Record<string, NameException> = {
  petar: {
    gender: 'm',
    forms: {
      genitiv: 'Petra',
      dativ: 'Petru',
      akuzativ: 'Petra',
      instrumental: 'Petrom',
      lokativ: 'Petru',
    },
  },
  aleksandar: {
    gender: 'm',
    forms: {
      genitiv: 'Aleksandra',
      dativ: 'Aleksandru',
      akuzativ: 'Aleksandra',
      instrumental: 'Aleksandrom',
      lokativ: 'Aleksandru',
    },
  },
  carmen: { gender: 'f', indeclinable: true },
  isabel: { gender: 'f', indeclinable: true },
}
