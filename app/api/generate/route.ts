import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { systemPrompt as ugovorORaduSystem, buildUserMessage } from '@/lib/prompts/ugovor-o-radu'
import type { UgovorORaduData } from '@/types/wizard'

const num = z.coerce.number()
const optNum = z.preprocess(
  v => (v === '' || v === null || (typeof v === 'number' && isNaN(v)) ? undefined : v),
  z.coerce.number().optional()
)

const ugovorORaduSchema = z.object({
  firma: z.string().min(1),
  pib: z.string().min(1),
  mb: z.string().min(1),
  adresa_firme: z.string().min(1),
  zastupnik: z.string().min(1),
  funkcija: z.string().min(1),
  ime_prezime: z.string().min(1),
  jmbg: z.string().min(1),
  adresa_zaposlenog: z.string().min(1),
  broj_lk: z.string().optional(),
  sprema: z.string().min(1),
  pozicija: z.string().min(1),
  opis: z.string().min(1),
  mesto_rada: z.string().min(1),
  rad_od_kuce: z.string().min(1),
  vrsta_radnog_odnosa: z.string().min(1),
  datum_pocetka: z.string().min(1),
  datum_isteka: z.string().optional(),
  osnov: z.string().optional(),
  probni_rad: z.boolean(),
  probni_rad_meseci: optNum,
  bruto: num.pipe(z.number().min(1)),
  nacin_isplate: z.string().min(1),
  dan_isplate: num.pipe(z.number().min(1).max(31)),
  topli_obrok: optNum,
  prevoz: z.string().optional(),
  fond_sati: num.pipe(z.number().min(1).max(48)),
  raspored: z.string().min(1),
  godisnji_odmor: num.pipe(z.number().min(20)),
  zabrana_konkurencije: z.boolean(),
  trajanje_zabrane: optNum,
  napomene: z.string().optional(),
})

const requestSchema = z.object({
  type: z.enum(['ugovor-o-radu', 'ugovor-o-delu', 'nda', 'ugovor-o-zakupu', 'ugovor-o-saradnji']),
  data: z.record(z.string(), z.unknown()),
})

// In-memory rate limit store — reset on cold start (acceptable for MVP)
const rateLimitStore = new Map<string, number[]>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000 // 1 sat
  const max = 10

  const timestamps = (rateLimitStore.get(userId) ?? []).filter(t => now - t < windowMs)
  if (timestamps.length >= max) return false

  timestamps.push(now)
  rateLimitStore.set(userId, timestamps)
  return true
}

export async function POST(request: NextRequest) {
  // Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  // Rate limit
  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'Prekoračili ste limit od 10 zahteva po satu. Pokušajte ponovo za sat vremena.' },
      { status: 429 }
    )
  }

  // Parse & validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 })
  }

  const { type, data } = parsed.data

  // Plan limit check
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, documents_this_month')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profil nije pronađen.' }, { status: 404 })
  }

  if (profile.plan === 'free' && profile.documents_this_month >= 1) {
    return NextResponse.json(
      { error: 'PLAN_LIMIT', message: 'Iskoristili ste besplatni mesečni dokument.' },
      { status: 402 }
    )
  }

  // Validate document-specific data
  let systemPromptText: string
  let userMessage: string

  if (type === 'ugovor-o-radu') {
    const docData = ugovorORaduSchema.safeParse(data)
    if (!docData.success) {
      const fieldErrors = docData.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
      console.error('Validation errors:', fieldErrors)
      return NextResponse.json(
        { error: 'Nedostaju obavezna polja.', fields: fieldErrors },
        { status: 400 }
      )
    }
    systemPromptText = ugovorORaduSystem
    userMessage = buildUserMessage(docData.data as UgovorORaduData)
  } else {
    return NextResponse.json({ error: 'Ovaj tip dokumenta još nije dostupan.' }, { status: 400 })
  }

  // Claude API
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let generatedText: string
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: systemPromptText,
      messages: [{ role: 'user', content: userMessage }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }
    generatedText = content.text
  } catch (err) {
    console.error('Anthropic API error:', err)
    return NextResponse.json(
      { error: 'Greška pri generisanju dokumenta. Pokušajte ponovo.' },
      { status: 500 }
    )
  }

  // Save document
  const title = type === 'ugovor-o-radu'
    ? `Ugovor o radu — ${(data as unknown as UgovorORaduData).ime_prezime ?? ''}`
    : type

  const { data: doc, error: insertError } = await admin
    .from('documents')
    .insert({
      user_id: user.id,
      type,
      title,
      input_data: data as Record<string, unknown>,
      generated_text: generatedText,
      is_free: profile.plan === 'free',
    })
    .select('id')
    .single()

  if (insertError || !doc) {
    console.error('Supabase insert error:', insertError)
    return NextResponse.json({ error: 'Greška pri čuvanju dokumenta.' }, { status: 500 })
  }

  // Increment monthly counter
  await admin
    .from('profiles')
    .update({ documents_this_month: profile.documents_this_month + 1 })
    .eq('id', user.id)

  return NextResponse.json({
    success: true,
    document_id: doc.id,
    generated_text: generatedText,
  })
}
