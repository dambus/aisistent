import { describe, it, expect, beforeAll } from 'vitest'
import Anthropic from '@anthropic-ai/sdk'
import { systemPrompt as ugovorSystemPrompt } from '@/lib/prompts/ugovor-o-radu'
import { declensionFixture, type DeklinacijaRow } from './fixtures/declension-fixture'

/**
 * Zadatak 1 (CLAUDE_CODE_BRIEF_gramatika.md): regresioni test set za deklinaciju.
 *
 * Pipeline trenutno nema izolovanu tačku "generiši samo ovu frazu" — deklinacija
 * se radi kroz LLM slobodnom generacijom unutar celog dokumenta. Ovaj test zato
 * poziva pravi Claude API sa ISTIM pravilima deklinacije koja koristi produkcioni
 * prompt (lib/prompts/ugovor-o-radu.ts), ali izolovano — traži samo deklinovani
 * oblik za dati (tekst, padež) par, ne ceo dokument. Kad Zadatak 2 uvede
 * deterministički decline() modul, ovaj isti fixture treba iskoristiti da
 * validira taj modul umesto LLM-a.
 *
 * Zahteva ANTHROPIC_API_KEY (učitava se iz .env.local, vidi tests/setup-env.ts).
 * Poziva pravi API — sporo je i ima trošak; ne pokreće se na svaki commit,
 * nego ručno / periodično (npm run test:declension).
 */

const TASK_INSTRUCTION = `
---

IGNORIŠI gornje instrukcije o pisanju celog ugovora, i IGNORIŠI instrukciju o pozivanju
alata "decline" — ovde nema dostupnih alata, ionako. Tvoj JEDINI zadatak sada je primena
pravila iz sekcije "SRPSKI JEZIK I DEKLINACIJA" na listu pojedinačnih unosa.

Dobićeš JSON niz objekata oblika {"id": string, "tekst": string, "padez": string}.
"padez" je jedan od: nominativ, genitiv, dativ, akuzativ, instrumental, lokativ.
"tekst" je uvek dat u nominativu (lično ime, naziv firme, ili novčani iznos).

Za svaki objekat primeni pravila deklinacije i vrati odgovarajući oblik u traženom padežu.
Novčani iznosi (broj + valuta, npr. "50.000,00 dinara") se NE menjaju kroz padeže — vrati ih
identične kao u ulazu, bez obzira na padez.

Vrati ISKLJUČIVO JSON niz objekata {"id": string, "oblik": string} — bez markdown code fence-a,
bez objašnjenja, bez ikakvog teksta pre ili posle JSON niza.
`.trim()

const FULL_SYSTEM_PROMPT = `${ugovorSystemPrompt}\n\n${TASK_INSTRUCTION}`

const CHUNK_SIZE = 16

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function declineChunk(
  anthropic: Anthropic,
  rows: DeklinacijaRow[]
): Promise<Map<string, string>> {
  const input = rows.map((r) => ({ id: r.id, tekst: r.tekst, padez: r.padez }))

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4000,
    system: FULL_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: JSON.stringify(input) }],
  })

  const raw = (message.content[0] as { type: string; text: string }).text
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\r?\n?/, '')
    .replace(/\r?\n?```$/, '')

  let parsed: Array<{ id: string; oblik: string }>
  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    throw new Error(`Neparsiran JSON odgovor za chunk [${rows.map((r) => r.id).join(', ')}]: ${(err as Error).message}\n${cleaned}`)
  }

  const map = new Map<string, string>()
  for (const item of parsed) map.set(item.id, item.oblik)
  return map
}

describe('Deklinacija — regresioni test set (Zadatak 1)', () => {
  const results = new Map<string, string>()

  beforeAll(async () => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY nije postavljen (.env.local)')
    }
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const chunks = chunk(declensionFixture, CHUNK_SIZE)

    const chunkResults = await Promise.all(chunks.map((c) => declineChunk(anthropic, c)))
    for (const map of chunkResults) {
      for (const [id, oblik] of map) results.set(id, oblik)
    }
  }, 120_000)

  it.each(declensionFixture)(
    '$tekst → $padez = "$ocekivano"',
    ({ id, ocekivano, napomena }) => {
      const dobijeno = results.get(id)
      expect(dobijeno, `nedostaje odgovor za id="${id}"${napomena ? ` (${napomena})` : ''}`).toBeDefined()
      expect(dobijeno?.trim()).toBe(ocekivano)
    }
  )
})
