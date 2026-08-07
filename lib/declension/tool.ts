import Anthropic from '@anthropic-ai/sdk'
import { decline } from './index'
import type { DeklinacijaCase, DeclineEntityType, Gender } from './types'

/**
 * Function-calling / tool-use integracija za decline() modul
 * (CLAUDE_CODE_BRIEF_gramatika.md, Zadatak 2, tačka 5).
 *
 * LLM više ne generiše deklinovani oblik direktno — poziva ovaj alat za
 * svako ime, firmu i iznos koji zahteva padež različit od nominativa, mi
 * izvršavamo deterministički decline() i vraćamo rezultat, model sastavlja
 * finalni tekst oko već ispravnih oblika.
 *
 * Pilot: koristi se samo za tip 'ugovor-o-radu' (vidi app/api/generate/route.ts).
 * Širenje na ostale tipove dokumenta je sledeći korak — ovaj helper je već
 * generički (prima system prompt i user message), pa dodavanje novog tipa
 * znači samo pozvati generateWithDeclensionTool umesto direktnog
 * anthropic.messages.create.
 */

export const DECLINE_TOOL: Anthropic.Tool = {
  name: 'decline',
  description:
    'Vrati ispravan padežni oblik za lično ime, naziv firme ili novčani iznos. ' +
    'Pozovi ovaj alat SVAKI PUT kada ti u tekstu treba padež različit od nominativa ' +
    'za ime i prezime, naziv firme, ili novčani iznos — ne generiši deklinovani oblik sam.',
  input_schema: {
    type: 'object',
    properties: {
      tekst: {
        type: 'string',
        description: 'Podatak u nominativu, npr. "Petar Nikolić", "Sigma Solutions doo", "50.000,00 dinara".',
      },
      tip: {
        type: 'string',
        enum: ['ime', 'firma', 'iznos'],
        description: 'Vrsta podatka.',
      },
      rod: {
        type: 'string',
        enum: ['m', 'f'],
        description: 'Rod osobe. Obavezan za tip "ime" (ignoriše se za "firma"/"iznos", ali se i dalje mora poslati bilo koja vrednost).',
      },
      padez: {
        type: 'string',
        enum: ['nominativ', 'genitiv', 'dativ', 'akuzativ', 'instrumental', 'lokativ'],
        description: 'Traženi padež.',
      },
    },
    required: ['tekst', 'tip', 'rod', 'padez'],
  },
}

interface DeclineToolInput {
  tekst: string
  tip: DeclineEntityType
  rod: Gender
  padez: DeklinacijaCase
}

function isDeclineToolInput(input: unknown): input is DeclineToolInput {
  if (typeof input !== 'object' || input === null) return false
  const i = input as Record<string, unknown>
  return typeof i.tekst === 'string' && typeof i.tip === 'string' && typeof i.rod === 'string' && typeof i.padez === 'string'
}

const MAX_TOOL_ROUNDS = 15

/**
 * Pokreće messages.create u petlji: kad model zatraži tool_use, izvršava
 * decline() lokalno i vraća rezultat kao tool_result, dok model ne završi
 * (stop_reason !== 'tool_use') ili dok se ne dostigne MAX_TOOL_ROUNDS
 * (sigurnosna kočnica protiv beskonačne petlje).
 */
export async function generateWithDeclensionTool(
  anthropic: Anthropic,
  params: { systemPrompt: string; userMessage: string; maxTokens: number }
): Promise<string> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: params.userMessage }]

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: params.maxTokens,
      system: params.systemPrompt,
      tools: [DECLINE_TOOL],
      messages,
    })

    if (response.stop_reason !== 'tool_use') {
      const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
      if (!textBlock) throw new Error('Model nije vratio tekstualni odgovor.')
      return textBlock.text
    }

    messages.push({ role: 'assistant', content: response.content })

    const toolResults: Anthropic.ToolResultBlockParam[] = []
    for (const block of response.content) {
      if (block.type !== 'tool_use') continue
      let result: string
      if (block.name === 'decline' && isDeclineToolInput(block.input)) {
        try {
          result = decline(block.input.tekst, block.input.rod, block.input.padez, { type: block.input.tip })
          if (process.env.DECLINE_TOOL_DEBUG) {
            console.error(`[decline] ${JSON.stringify(block.input)} -> "${result}"`)
          }
        } catch (err) {
          result = `GREŠKA: ${(err as Error).message}`
        }
      } else {
        result = `GREŠKA: nepoznat alat ili neispravan unos`
      }
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result })
    }
    messages.push({ role: 'user', content: toolResults })
  }

  throw new Error(`Prekoračen maksimalan broj tool-use rundi (${MAX_TOOL_ROUNDS}).`)
}
