import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sanitizeText } from '@/lib/pdf/markdownParser'

const IMPROVE_LIMITS: Record<string, number> = {
  starter: 15, // 5 docs × 3 iterations/day
  pro:     50,
  agency:  50,
}

// in-memory rate limit: userId → timestamps[]
const rateLimitStore = new Map<string, number[]>()

function checkRateLimit(userId: string, limit: number): boolean {
  const now = Date.now()
  const window = 24 * 60 * 60 * 1000
  const timestamps = (rateLimitStore.get(userId) ?? []).filter(t => now - t < window)
  if (timestamps.length >= limit) return false
  timestamps.push(now)
  rateLimitStore.set(userId, timestamps)
  return true
}

const SYSTEM_PROMPT = `Ti si asistent koji uređuje srpske pravne i poslovne dokumente.
Tvoj jedini zadatak je da primenjiš traženu izmenu na dokument koji ti se daje.

Pravila koja moraš strogo poštovati:
- Vratiš SAMO izmenjeni dokument — bez komentara, objašnjenja, uvoda ili zaključka
- Ne menjaj stilski format, strukturu ni ostale klauzule sem tražene izmene
- Ako izmena nije moguća ili je van opsega dokumenta, vrati dokument nepromenjen
- Ne odgovaraš na pitanja, ne daješ pravne savete, ne dodaješ sadržaj van teme dokumenta
- Čuvaj identičan Markdown format kao originalni dokument
- Ne dodaješ novi sadržaj koji nije direktno povezan sa zahtevom`

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profileRaw } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const plan = (profileRaw as { plan?: string } | null)?.plan ?? 'free'

  if (plan === 'free') {
    return NextResponse.json(
      { error: 'Poboljšanje dokumenta nije dostupno na besplatnom planu.' },
      { status: 403 }
    )
  }

  const dailyLimit = IMPROVE_LIMITS[plan]
  if (!checkRateLimit(user.id, dailyLimit)) {
    return NextResponse.json(
      { error: 'Dnevni limit poboljšanja je dostignut. Pokušajte sutra.' },
      { status: 429 }
    )
  }

  let body: { generated_text?: string; instruction?: string; doc_type?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { generated_text, instruction, doc_type } = body

  if (!generated_text || !instruction || !doc_type) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 })
  }

  if (instruction.length > 500) {
    return NextResponse.json(
      { error: 'Instrukcija ne sme biti duža od 500 karaktera.' },
      { status: 400 }
    )
  }

  if (generated_text.length > 40000) {
    return NextResponse.json({ error: 'Dokument je predugačak za obradu.' }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Tip dokumenta: ${doc_type}\n\nTražena izmena: ${instruction}\n\nDokument:\n\n${generated_text}`,
      }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    const improvedText = sanitizeText(content.text)
      .replace(/^```(?:markdown)?\r?\n?/, '')
      .replace(/\r?\n?```$/, '')

    return NextResponse.json({ improved_text: improvedText })
  } catch (err) {
    console.error('Improve API error:', err)
    return NextResponse.json(
      { error: 'Greška pri obradi. Pokušajte ponovo.' },
      { status: 500 }
    )
  }
}
