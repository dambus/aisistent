// Jedinstven izvor pravnog/poslovnog znanja, organizovan po TEMI (ne po tipu
// dokumenta) — jedan zakon/pravilo se referencira odasvud gde je relevantan,
// umesto da se duplira po prompt modulu. Koriste ga i generisanje (lib/prompts/*.ts)
// i pregled ugovora (app/api/review-contract/route.ts) — isti standard na oba mesta.
//
// Ažuriranje: kad se zakon promeni, menja se JEDAN fajl ovde. `poslednjaProvera`
// polje svakog topic-a je trag kad je ručno potvrđeno naspram zakona.

import type { KnowledgeTopic } from './types'
import { radniOdnosi } from './radni-odnosi'
import { autorskoPravo } from './autorsko-pravo'
import { ugovornaKazna } from './ugovorna-kazna'
import { poverljivost } from './poverljivost'
import { zakup } from './zakup'
import { zajam } from './zajam'
import { punomocje } from './punomocje'
import { obligacijeOpste } from './obligacije-opste'
import { saradnja } from './saradnja'
import { testSamostalnosti } from './test-samostalnosti'

export const KNOWLEDGE_TOPICS: Record<string, KnowledgeTopic> = {
  'radni-odnosi': radniOdnosi,
  'autorsko-pravo': autorskoPravo,
  'ugovorna-kazna': ugovornaKazna,
  poverljivost,
  zakup,
  zajam,
  punomocje,
  'obligacije-opste': obligacijeOpste,
  saradnja,
}

/** Koji topic-i su relevantni za koji tip ugovora — koristi se i za generisanje i za review. */
export const CONTRACT_TYPE_TOPICS: Record<string, string[]> = {
  nda: ['poverljivost', 'ugovorna-kazna', 'obligacije-opste'],
  'ugovor-o-delu': ['autorsko-pravo', 'ugovorna-kazna', 'obligacije-opste'],
  'ugovor-o-zakupu': ['zakup', 'obligacije-opste'],
  'ugovor-o-saradnji': ['saradnja', 'poverljivost', 'obligacije-opste'],
  'ugovor-o-zajmu': ['zajam', 'obligacije-opste'],
  punomocje: ['punomocje'],
  'ugovor-o-radu': ['radni-odnosi'],
  other: ['obligacije-opste'],
}

/** Vraća spojen tekst svih topic-a relevantnih za dati tip — za ubacivanje u system prompt. */
export function getKnowledgeForType(type: string): string {
  const topicIds = CONTRACT_TYPE_TOPICS[type] ?? CONTRACT_TYPE_TOPICS.other
  return topicIds
    .map(id => KNOWLEDGE_TOPICS[id])
    .filter(Boolean)
    .map(t => `${t.naslov} (${t.pravniOsnov}):\n${t.sadrzaj}`)
    .join('\n\n')
}

/** Sav sadržaj — koristi se kad review treba da radi klasifikaciju + analizu u jednom pozivu. */
export function getAllKnowledgeText(): string {
  return Object.values(KNOWLEDGE_TOPICS)
    .map(t => `${t.naslov} (${t.pravniOsnov}):\n${t.sadrzaj}`)
    .join('\n\n')
}

/** Tekst za "test samostalnosti" (9 zakonskih kriterijuma) — koristi ga review-contract
 *  posebno, samo za ugovor-o-delu/ugovor-o-saradnji, van getAllKnowledgeText/KNOWLEDGE_TOPICS
 *  jer je druga vrsta provere (odnos strana) od "obavezni elementi ugovora" reference. */
export function getIndependenceTestKnowledge(): string {
  return `${testSamostalnosti.naslov} (${testSamostalnosti.pravniOsnov}):\n${testSamostalnosti.sadrzaj}`
}
