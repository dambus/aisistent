import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'
import PDFParser from 'pdf2json'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const REVIEW_PLANS = ['pro', 'agency']
const REVIEW_LIMITS: Record<string, number> = {
  pro: 20,
  agency: 20,
}

const MAX_FILE_BYTES = 8 * 1024 * 1024 // 8MB
const MAX_TEXT_CHARS = 60000

const SYSTEM_PROMPT = `Ti si asistent koji pomaže korisniku da PROČITA i RAZUME ugovor koji mu je poslala druga strana, pre nego što ga potpiše.

Dobićeš tekst ugovora. Tvoj zadatak je da vratiš ISKLJUČIVO validan JSON objekat, bez teksta, objašnjenja ili markdown oznaka, u formatu:

{
  "rizicne_klauzule": [{"naslov": "kratak naslov", "opis": "zašto je rizično, jednostavnim jezikom", "citat": "kratak citat iz ugovora ili prazan string ako nema doslovnog citata"}],
  "sta_nedostaje": [{"naslov": "kratak naslov", "opis": "šta bi trebalo da postoji u ovakvom ugovoru a ne postoji"}],
  "na_sta_paziti": [{"naslov": "kratak naslov", "opis": "praktičan savet, ne pravni zaključak"}],
  "sazetak": "1-2 rečenice, opšti utisak, neutralno"
}

Strogo poštuj:
- NIKAD ne tvrdi da je ugovor "bezbedan", "u redu za potpis" ili "pravno validan" — samo ukazuješ na stvari koje vredi proveriti sa advokatom.
- Ne izmišljaj klauzule koje ne postoje u tekstu.
- Ako ugovor deluje uobičajeno i bez očiglednih problema, to i reci u sazetku — ne izmišljaj rizike da bi lista bila duža.
- Jezik: srpski, jednostavan, bez pravnog žargona gde je moguće.
- Ako dati tekst uopšte ne liči na ugovor (npr. slučajno uploadovan drugi dokument), vrati prazne nizove i u sazetku napiši da tekst ne izgleda kao ugovor.
- Maksimalno 8 stavki po sekciji.`

const rateLimitStore = new Map<string, number[]>()

function checkRateLimit(userId: string, limit: number): boolean {
  const now = Date.now()
  const window = 30 * 24 * 60 * 60 * 1000
  const timestamps = (rateLimitStore.get(userId) ?? []).filter(t => now - t < window)
  if (timestamps.length >= limit) return false
  timestamps.push(now)
  rateLimitStore.set(userId, timestamps)
  return true
}

function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1)
    parser.on('pdfParser_dataReady', () => resolve(parser.getRawTextContent()))
    parser.on('pdfParser_dataError', err => reject(err.parserError))
    parser.parseBuffer(buffer)
  })
}

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    return parsePDF(buffer)
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { value } = await mammoth.extractRawText({ buffer })
    return value
  }
  throw new Error('UNSUPPORTED_TYPE')
}

interface ReviewReport {
  rizicne_klauzule: { naslov: string; opis: string; citat?: string }[]
  sta_nedostaje: { naslov: string; opis: string }[]
  na_sta_paziti: { naslov: string; opis: string }[]
  sazetak: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile || !REVIEW_PLANS.includes(profile.plan)) {
    return NextResponse.json(
      { error: 'Pregled ugovora dostupan je za Pro i Agency plan.' },
      { status: 403 },
    )
  }

  if (!checkRateLimit(user.id, REVIEW_LIMITS[profile.plan])) {
    return NextResponse.json(
      { error: 'Mesečni limit pregleda ugovora je dostignut.' },
      { status: 429 },
    )
  }

  const formData = await req.formData().catch(() => null)
  const file = formData?.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Nedostaje fajl.' }, { status: 400 })
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'Fajl je prevelik (maksimalno 8MB).' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let rawText: string
  try {
    rawText = await extractText(buffer, file.type)
  } catch (err) {
    if (err instanceof Error && err.message === 'UNSUPPORTED_TYPE') {
      return NextResponse.json(
        { error: 'Podržani formati su PDF i DOCX.' },
        { status: 400 },
      )
    }
    console.error('Contract review extract error:', err)
    return NextResponse.json({ error: 'Greška pri čitanju fajla.' }, { status: 500 })
  }

  const trimmedText = rawText.trim()
  if (trimmedText.length < 50) {
    return NextResponse.json(
      { error: 'Nije pronađen čitljiv tekst u fajlu — proverite da li je skeniran dokument (slika) umesto teksta.' },
      { status: 400 },
    )
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: trimmedText.slice(0, MAX_TEXT_CHARS) }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const cleaned = content.text.trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
    const report = JSON.parse(cleaned) as ReviewReport

    return NextResponse.json({ report })
  } catch (err) {
    console.error('Contract review Claude error:', err)
    return NextResponse.json({ error: 'Greška pri analizi. Pokušajte ponovo.' }, { status: 500 })
  }
}
