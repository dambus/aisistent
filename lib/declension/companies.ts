import type { DeklinacijaCase } from './types'

/**
 * Deklinacija naziva firme sa pravnim oblikom (doo, ad, sp) na kraju —
 * pravilo je eksplicitno definisano u lib/prompts/ugovor-o-radu.ts
 * ("## SRPSKI JEZIK I DEKLINACIJA" → "Pravila za deklinaciju firmi"):
 * skraćenica se dekliniše sa crticom (doo-a, doo-u), naziv ispred ostaje
 * nepromenjen.
 *
 * Instrumental i lokativ NISU definisani tim pravilom (nema ustaljene
 * konvencije u srpskoj pravnoj praksi ni u postojećem promptu) — dok se ne
 * potvrdi konkretan oblik, vraćamo nominativ radije nego da nagađamo.
 */
const LEGAL_FORM_SUFFIX = /^(.*\S)\s+(d\.o\.o\.|doo|a\.d\.|ad|s\.p\.|sp)$/i

export function declineCompany(name: string, kase: DeklinacijaCase): string {
  const match = name.match(LEGAL_FORM_SUFFIX)
  if (!match) return name

  const [, base, suffix] = match
  // Kad se na skraćenicu koja se završava tačkom (d.o.o., a.d., s.p.) dodaje
  // crtica i padežni nastavak, tačka se izostavlja (d.o.o-a, ne d.o.o.-a) —
  // ustaljena konvencija, potvrđena i nezavisnim izlazom LLM-a u regresionom testu.
  const suffixBeforeHyphen = suffix.endsWith('.') ? suffix.slice(0, -1) : suffix
  switch (kase) {
    case 'nominativ':
    case 'akuzativ':
    case 'instrumental':
    case 'lokativ':
      return `${base} ${suffix}`
    case 'genitiv':
      return `${base} ${suffixBeforeHyphen}-a`
    case 'dativ':
      return `${base} ${suffixBeforeHyphen}-u`
  }
}
