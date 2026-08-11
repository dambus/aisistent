import Anthropic from '@anthropic-ai/sdk'

export type QaMode = 'full' | 'light'

export interface QaResult {
  correctedText: string
  fixed: string[]
  needsReview: { issue: string; detail: string }[]
}

const DOCUMENT_MARKER = '<<<DOKUMENT>>>'

const FORMAT_FALLBACK_ISSUE = {
  issue: 'QA format',
  detail: 'Model nije vratio marker format — ručno proveriti dokument.',
}

function buildSystemPrompt(mode: QaMode, referenceSystemPrompt: string): string {
  const base = `Ti si nezavisan urednik/lektor za srpske poslovne dokumente. Dobijaš već generisan dokument${mode === 'full' ? ' i ORIGINALNU referencu (system prompt kojim je dokument generisan, sadrži obavezne elemente i zakonska pravila) — koristi je kao osnovu za proveru, ne opšte znanje.' : '.'}

${mode === 'full' ? `<REFERENCA>\n${referenceSystemPrompt}\n</REFERENCA>\n\n` : ''}Zadatak:
1. Ispravi gramatiku, pravopis, padeže, interpunkciju, homoglife (ćirilična slova usred latiničnog teksta — čest, težak za uočiti bug).
${mode === 'full' ? '2. Proveri da li dokument sadrži sve OBAVEZNE ELEMENTE iz reference iznad. Ako nešto nedostaje ili je nekompletno, DOPUNI dokument.\n' : ''}3. NE DIRAJ već ispravne padežne oblike ličnih imena, naziva firmi i iznosa osim ako si POTPUNO SIGURAN da je pogrešno — neki od njih su već determinstički generisani i garantovano tačni, ne nagađaj ispravku bez razloga.
4. NE MENJAJ sadržaj/značenje, brojeve, iznose, datume, imena strana — samo jezik, formatiranje i kompletnost.
5. POZNATA PRAVILA — ne nagađaj suprotno od ovoga:
   - Posle formule oslovljavanja u poslovnom pismu/mejlu ("Poštovani", "Poštovani gospodine/gospođo" i sl.) ide ZAREZ, nikad tačka. Ne menjaj zarez u tačku posle oslovljavanja.

Ako nisi 100% siguran u pravopisno pravilo, NE MENJAJ — netačna "ispravka" je gora od propuštene greške.

Napravi razliku između:
- "fixed" — stvari koje si SAM pouzdano ispravio (sitna gramatika, pravopis, padež, homoglif, formatiranje). Kratak opis svake, npr. "ispravljen padež: 'Ana Marković' -> 'Ani Marković'".
- "needs_review" — stvari koje NE MOŽEŠ sam pouzdano da rešiš (nejasan unos, sukob sa referencom, nedostaje ključna informacija koju ne možeš izmisliti). Ovo se NIKAD ne sme tiho progutati.

FORMAT ODGOVORA (obavezno, tačno ovako):
Prva linija(e): kratak JSON objekat {"fixed": ["..."], "needs_review": [{"issue": "...", "detail": "..."}]}
Zatim tačno ovaj marker na sopstvenoj liniji: ${DOCUMENT_MARKER}
Zatim ceo ispravljen tekst dokumenta, kao običan tekst, BEZ JSON escaping-a, BEZ code fence-ova.

Ne stavljaj ceo dokument u JSON string — to pravi parse greške na dugom tekstu. Dokument ide kao sirov tekst posle markera.`

  return base
}

function extractJsonObject(text: string): unknown {
  try {
    return JSON.parse(text.trim())
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no JSON object found')
    return JSON.parse(match[0])
  }
}

export function parseQaResponse(raw: string): QaResult {
  const markerIndex = raw.indexOf(DOCUMENT_MARKER)
  if (markerIndex === -1) {
    return { correctedText: raw.trim(), fixed: [], needsReview: [FORMAT_FALLBACK_ISSUE] }
  }

  const header = raw.slice(0, markerIndex)
  const correctedText = raw.slice(markerIndex + DOCUMENT_MARKER.length).trim()

  try {
    const parsed = extractJsonObject(header) as { fixed?: unknown; needs_review?: unknown }
    const fixed = Array.isArray(parsed.fixed) ? parsed.fixed.filter((f): f is string => typeof f === 'string') : []
    const needsReview = Array.isArray(parsed.needs_review)
      ? parsed.needs_review.filter(
          (r): r is { issue: string; detail: string } =>
            typeof r === 'object' && r !== null && typeof (r as { issue?: unknown }).issue === 'string'
        )
      : []
    return { correctedText, fixed, needsReview }
  } catch {
    return { correctedText, fixed: [], needsReview: [FORMAT_FALLBACK_ISSUE] }
  }
}

export async function runQaReview(
  anthropic: Anthropic,
  params: { documentText: string; referenceSystemPrompt: string; maxTokens: number; mode: QaMode }
): Promise<QaResult> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: params.maxTokens,
    system: buildSystemPrompt(params.mode, params.referenceSystemPrompt),
    messages: [{ role: 'user', content: params.documentText }],
  })

  const content = response.content[0]
  if (content.type !== 'text') {
    throw new Error('Unexpected QA response type')
  }

  return parseQaResponse(content.text)
}
