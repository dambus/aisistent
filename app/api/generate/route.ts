import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { systemPrompt as ugovorORaduSystem, buildUserMessage as buildUgovorORaduMessage } from '@/lib/prompts/ugovor-o-radu'
import { systemPrompt as ugovorODeluSystem, buildUserMessage as buildUgovorODeluMessage } from '@/lib/prompts/ugovor-o-delu'
import { systemPrompt as ndaSystem, buildUserMessage as buildNdaMessage } from '@/lib/prompts/nda'
import { systemPrompt as ugovorOZakupuSystem, buildUserMessage as buildUgovorOZakupuMessage } from '@/lib/prompts/ugovor-o-zakupu'
import { systemPrompt as ugovorOSaradnjiSystem, buildUserMessage as buildUgovorOSaradnjiMessage } from '@/lib/prompts/ugovor-o-saradnji-zajmu'
import { systemPrompt as punomocjeSystem, buildUserMessage as buildPunomocjeMessage } from '@/lib/prompts/punomocje'
import { systemPrompt as opstiUsloviSystem, buildUserMessage as buildOpstiUsloviMessage } from '@/lib/prompts/opsti-uslovi'
import { systemPrompt as poslovniMejlSystem, buildUserMessage as buildPoslovniMejlMessage } from '@/lib/prompts/poslovni-mejl'
import { systemPrompt as oglasZaPosaoSystem, buildUserMessage as buildOglasZaPosaoMessage } from '@/lib/prompts/oglas-za-posao'
import { systemPrompt as ponudaKlijentuSystem, buildUserMessage as buildPonudaKlijentuMessage } from '@/lib/prompts/ponuda-klijentu'
import type { NdaData, UgovorODeluData, UgovorORaduData, UgovorOSaradnjiZajmuData, UgovorOZakupuData, PunomocjeData, OpstiUsloviData, PoslovniMejlData, OglasZaPosaoData, PonudaKlijentuData } from '@/types/wizard'

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
  broj_ugovora: z.string().optional(),
  datum_zakljucivanja: z.string().optional(),
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
  detaljna_prava_obaveze: z.boolean().optional(),
  cuvanje_poslovne_tajne: z.boolean().optional(),
  napomene: z.string().optional(),
})

const ugovorODeluSchema = z.object({
  tip_narucioca: z.string().min(1),
  naziv_narucioca: z.string().min(1),
  pib_narucioca: z.string().optional(),
  adresa_narucioca: z.string().min(1),
  zastupnik_narucioca: z.string().optional(),
  tip_izvodjaca: z.string().min(1),
  naziv_izvodjaca: z.string().min(1),
  jmbg_pib_izvodjaca: z.string().min(1),
  adresa_izvodjaca: z.string().min(1),
  racun_izvodjaca: z.string().optional(),
  naziv_dela: z.string().min(1),
  opis_dela: z.string().min(1),
  rezultat: z.string().min(1),
  specifikacije: z.string().optional(),
  datum_pocetka: z.string().min(1),
  datum_zavrsetka: z.string().min(1),
  fazno: z.boolean(),
  opis_faza: z.string().optional(),
  iznos: num.pipe(z.number().min(1)),
  bruto_neto: z.string().min(1),
  nacin_isplate: z.string().min(1),
  avans: optNum,
  rok_placanja: num.pipe(z.number().min(1)),
  vlasnistvo: z.string().min(1),
  nda: z.boolean(),
  trajanje_nda: optNum,
  zabrana: z.boolean(),
  napomene: z.string().optional(),
})

const ndaSchema = z.object({
  tip_nda: z.string().min(1),
  svrha: z.string().min(1),
  tip_strane_1: z.string().min(1),
  naziv_strane_1: z.string().min(1),
  pib_strane_1: z.string().optional(),
  adresa_strane_1: z.string().min(1),
  zastupnik_strane_1: z.string().optional(),
  tip_strane_2: z.string().min(1),
  naziv_strane_2: z.string().min(1),
  pib_strane_2: z.string().optional(),
  adresa_strane_2: z.string().min(1),
  zastupnik_strane_2: z.string().optional(),
  oblast_informacija: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
  opis_informacija: z.string().optional(),
  oznacavanje: z.boolean(),
  datum: z.string().min(1),
  trajanje_sporazuma: num.pipe(z.number().min(1)),
  trajanje_cuvanja: num.pipe(z.number().min(1)),
  kazna: optNum,
  zabrana: z.boolean(),
  trajanje_zabrane: optNum,
  napomene: z.string().optional(),
})

const ugovorOZakupuSchema = z.object({
  tip_zakupa: z.string().min(1),
  datum_zakljucivanja: z.string().optional(),
  uknjizena: z.boolean(),
  tip_zakupodavca: z.string().min(1),
  naziv_zakupodavca: z.string().min(1),
  jmbg_pib_zakupodavca: z.string().min(1),
  adresa_zakupodavca: z.string().min(1),
  zastupnik_zakupodavca: z.string().optional(),
  tip_zakupca: z.string().min(1),
  naziv_zakupca: z.string().min(1),
  jmbg_pib_zakupca: z.string().min(1),
  adresa_zakupca: z.string().min(1),
  zastupnik_zakupca: z.string().optional(),
  adresa_nepokretnosti: z.string().min(1),
  kvadratura: num.pipe(z.number().min(1)),
  sprat: z.string().min(1),
  struktura: z.string().min(1),
  list_nepokretnosti: z.string().optional(),
  stanje: z.string().optional(),
  datum_pocetka: z.string().min(1),
  tip_trajanja: z.string().min(1),
  datum_isteka: z.string().optional(),
  otkazni_rok: num.pipe(z.number().min(1)),
  iznos: num.pipe(z.number().min(1)),
  valuta: z.string().min(1),
  dan_placanja: num.pipe(z.number().min(1).max(31)),
  nacin_placanja: z.string().min(1),
  deponija: z.boolean(),
  iznos_deponije: optNum,
  komunalije: z.string().min(1),
  internet: z.string().min(1),
  komunalna_taksa: z.string().optional(),
  prijava_boravista: z.boolean().optional(),
  adaptacije: z.boolean().optional(),
  popis_namestaja: z.boolean().optional(),
  zabrana_zivotinja: z.boolean().optional(),
  zabrana_podzakupa: z.boolean().optional(),
  napomene: z.string().optional(),
})

const ugovorOSaradnjiZajmuSchema = z.object({
  tip_dokumenta: z.string().min(1),
  tip_1: z.string().optional(),
  naziv_1: z.string().optional(),
  id_1: z.string().optional(),
  adresa_1: z.string().optional(),
  zastupnik_1: z.string().optional(),
  tip_2: z.string().optional(),
  naziv_2: z.string().optional(),
  id_2: z.string().optional(),
  adresa_2: z.string().optional(),
  zastupnik_2: z.string().optional(),
  naziv_saradnje: z.string().optional(),
  opis_saradnje: z.string().optional(),
  doprinos_1: z.string().optional(),
  doprinos_2: z.string().optional(),
  podela: z.string().optional(),
  udeo_1: optNum,
  udeo_2: optNum,
  upravljanje: z.string().optional(),
  rok: optNum,
  datum_pocetka: z.string().optional(),
  trajanje: z.string().optional(),
  datum_zavrsetka: z.string().optional(),
  ekskluzivnost: z.boolean().optional(),
  opis_ekskl: z.string().optional(),
  nda: z.boolean().optional(),
  vlasnistvo_ip: z.string().optional(),
  tip_zajmodavca: z.string().optional(),
  naziv_zajmodavca: z.string().optional(),
  id_zajmodavca: z.string().optional(),
  adresa_zajmodavca: z.string().optional(),
  tip_zajmoprimca: z.string().optional(),
  naziv_zajmoprimca: z.string().optional(),
  id_zajmoprimca: z.string().optional(),
  adresa_zajmoprimca: z.string().optional(),
  racun: z.string().optional(),
  iznos: optNum,
  valuta: z.string().optional(),
  svrha: z.string().optional(),
  datum_isplate: z.string().optional(),
  nacin_isplate: z.string().optional(),
  tip_kamate: z.string().optional(),
  stopa: optNum,
  obracun: z.string().optional(),
  placanje_kamate: z.string().optional(),
  nacin_vracanja: z.string().optional(),
  rok_vracanja: z.string().optional(),
  prva_rata: z.string().optional(),
  prevremena: z.boolean().default(true),
  sredstvo: z.string().default('Bez'),
  zatezna: z.string().default('Zakonska'),
  napomene: z.string().optional(),
})

const punomocjeSchema = z.object({
  tip_vlastodavca: z.string().min(1),
  naziv_vlastodavca: z.string().min(1),
  jmbg_pib_vlastodavca: z.string().min(1),
  adresa_vlastodavca: z.string().min(1),
  tip_punomocnika: z.string().min(1),
  naziv_punomocnika: z.string().min(1),
  jmbg_pib_punomocnika: z.string().min(1),
  adresa_punomocnika: z.string().min(1),
  tip_punomocja: z.string().min(1),
  opis_ovlascenja: z.string().min(1),
  trajanje: z.string().min(1),
  datum_isteka: z.string().optional(),
})

const opstiUsloviSchema = z.object({
  naziv_firme: z.string().min(1),
  pib: z.string().min(1),
  adresa: z.string().min(1),
  email: z.string().min(1),
  url: z.string().min(1),
  tip_biznisa: z.string().min(1),
  opis_usluge: z.string().min(1),
  prikuplja_podatke: z.boolean(),
  vrste_podataka: z.union([z.string(), z.array(z.string())]),
  analitika: z.boolean(),
  deli_sa_trecim_stranama: z.boolean(),
})

const poslovniMejlSchema = z.object({
  posiljalac_ime: z.string().min(1),
  posiljalac_firma: z.string().min(1),
  posiljalac_pozicija: z.string().min(1),
  primalac_ime: z.string().min(1),
  primalac_firma: z.string().min(1),
  tip_mejla: z.string().min(1),
  kontekst: z.string().min(1),
  ton: z.string().min(1),
  hitno: z.boolean(),
  predmet: z.string().optional(),
})

const oglasZaPosaoSchema = z.object({
  naziv_firme: z.string().min(1),
  grad: z.string().min(1),
  delatnost: z.string().min(1),
  velicina: z.string().min(1),
  naziv_pozicije: z.string().min(1),
  tip_angazovanja: z.string().min(1),
  lokacija_rada: z.string().min(1),
  strucna_sprema: z.string().min(1),
  iskustvo: z.string().min(1),
  glavni_zadaci: z.string().min(1),
  potrebne_vestine: z.string().min(1),
  prednost: z.string().optional(),
  zarada_tip: z.string().min(1),
  iznos_zarade: z.string().optional(),
  benefiti: z.union([z.string(), z.array(z.string())]),
  rok_prijave: z.string().min(1),
  kako_aplicirati: z.string().min(1),
})

const ponudaKlijentuSchema = z.object({
  ponudjac_naziv: z.string().min(1),
  ponudjac_pib: z.string().min(1),
  ponudjac_adresa: z.string().min(1),
  kontakt_osoba: z.string().min(1),
  email: z.string().min(1),
  telefon: z.string().min(1),
  klijent_naziv: z.string().min(1),
  klijent_adresa: z.string().min(1),
  klijent_kontakt: z.string().min(1),
  broj_ponude: z.string().optional(),
  datum_ponude: z.string().min(1),
  predmet_ponude: z.string().min(1),
  opis: z.string().min(1),
  rok_isporuke: z.string().min(1),
  iznos_bez_pdv: num.pipe(z.number().min(0)),
  pdv: z.string().min(1),
  uslovi_placanja: z.string().min(1),
  validnost: num.pipe(z.number().min(1)),
  napomene: z.string().optional(),
})

const requestSchema = z.object({
  type: z.enum(['ugovor-o-radu', 'ugovor-o-delu', 'nda', 'ugovor-o-zakupu', 'ugovor-o-saradnji', 'punomocje', 'opsti-uslovi', 'poslovni-mejl', 'oglas-za-posao', 'ponuda-klijentu']),
  data: z.record(z.string(), z.unknown()),
})

const documentConfigs = {
  'ugovor-o-radu': {
    schema: ugovorORaduSchema,
    systemPrompt: ugovorORaduSystem,
    buildUserMessage: (data: UgovorORaduData) => buildUgovorORaduMessage(data),
    buildTitle: (data: UgovorORaduData) => `Ugovor o radu - ${data.ime_prezime ?? ''}`,
  },
  'ugovor-o-delu': {
    schema: ugovorODeluSchema,
    systemPrompt: ugovorODeluSystem,
    buildUserMessage: (data: UgovorODeluData) => buildUgovorODeluMessage(data),
    buildTitle: (data: UgovorODeluData) => `Ugovor o delu - ${data.naziv_izvodjaca ?? ''}`,
  },
  nda: {
    schema: ndaSchema,
    systemPrompt: ndaSystem,
    buildUserMessage: (data: NdaData) => buildNdaMessage(data),
    buildTitle: (data: NdaData) => `NDA - ${data.naziv_strane_1 ?? ''}`,
  },
  'ugovor-o-zakupu': {
    schema: ugovorOZakupuSchema,
    systemPrompt: ugovorOZakupuSystem,
    buildUserMessage: (data: UgovorOZakupuData) => buildUgovorOZakupuMessage(data),
    buildTitle: (data: UgovorOZakupuData) => `Ugovor o zakupu - ${data.adresa_nepokretnosti ?? ''}`,
  },
  'ugovor-o-saradnji': {
    schema: ugovorOSaradnjiZajmuSchema,
    systemPrompt: ugovorOSaradnjiSystem,
    buildUserMessage: (data: UgovorOSaradnjiZajmuData) => buildUgovorOSaradnjiMessage(data),
    buildTitle: (data: UgovorOSaradnjiZajmuData) =>
      data.tip_dokumenta === 'Ugovor o zajmu'
        ? `Ugovor o zajmu - ${data.naziv_zajmoprimca ?? ''}`
        : `Ugovor o saradnji - ${data.naziv_1 ?? ''}`,
  },
  'punomocje': {
    schema: punomocjeSchema,
    systemPrompt: punomocjeSystem,
    buildUserMessage: (data: PunomocjeData) => buildPunomocjeMessage(data),
    buildTitle: (data: PunomocjeData) => `Punomoćje - ${data.naziv_vlastodavca ?? ''}`,
  },
  'opsti-uslovi': {
    schema: opstiUsloviSchema,
    systemPrompt: opstiUsloviSystem,
    buildUserMessage: (data: OpstiUsloviData) => buildOpstiUsloviMessage(data),
    buildTitle: (data: OpstiUsloviData) => `Opšti uslovi - ${data.naziv_firme ?? ''}`,
  },
  'poslovni-mejl': {
    schema: poslovniMejlSchema,
    systemPrompt: poslovniMejlSystem,
    buildUserMessage: (data: PoslovniMejlData) => buildPoslovniMejlMessage(data),
    buildTitle: (data: PoslovniMejlData) => `Poslovni mejl - ${data.tip_mejla ?? ''}`,
  },
  'oglas-za-posao': {
    schema: oglasZaPosaoSchema,
    systemPrompt: oglasZaPosaoSystem,
    buildUserMessage: (data: OglasZaPosaoData) => buildOglasZaPosaoMessage(data),
    buildTitle: (data: OglasZaPosaoData) => `Oglas - ${data.naziv_pozicije ?? ''} (${data.naziv_firme ?? ''})`,
  },
  'ponuda-klijentu': {
    schema: ponudaKlijentuSchema,
    systemPrompt: ponudaKlijentuSystem,
    buildUserMessage: (data: PonudaKlijentuData) => buildPonudaKlijentuMessage(data),
    buildTitle: (data: PonudaKlijentuData) => `Ponuda - ${data.predmet_ponude ?? ''} (${data.ponudjac_naziv ?? ''})`,
  },
} as const

const rateLimitStore = new Map<string, number[]>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const max = 10

  const timestamps = (rateLimitStore.get(userId) ?? []).filter(t => now - t < windowMs)
  if (timestamps.length >= max) return false

  timestamps.push(now)
  rateLimitStore.set(userId, timestamps)
  return true
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  if (!checkRateLimit(user.id)) {
    return NextResponse.json(
      { error: 'Prekoračili ste limit od 10 zahteva po satu. Pokušajte ponovo za sat vremena.' },
      { status: 429 }
    )
  }

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
  const config = documentConfigs[type]

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, documents_this_month')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profil nije pronađen.' }, { status: 404 })
  }

  if (profile.plan === 'free' && profile.documents_this_month >= 3) {
    return NextResponse.json(
      { error: 'PLAN_LIMIT', message: 'Iskoristili ste sva 3 besplatna dokumenta za ovaj mesec.' },
      { status: 402 }
    )
  }

  const docData = config.schema.safeParse(data)
  if (!docData.success) {
    const fieldErrors = docData.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
    console.error('Validation errors:', fieldErrors)
    return NextResponse.json(
      { error: 'Nedostaju obavezna polja.', fields: fieldErrors },
      { status: 400 }
    )
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let generatedText: string
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 8000,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: config.buildUserMessage(docData.data as never) }],
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

  const { data: doc, error: insertError } = await admin
    .from('documents')
    .insert({
      user_id: user.id,
      type,
      title: config.buildTitle(docData.data as never),
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
