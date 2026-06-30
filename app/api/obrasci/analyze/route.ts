import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PDFDocument } from 'pdf-lib'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'
import PDFParser from 'pdf2json'

export interface MappedField {
  key: string
  label: string
  value: string | null
  source: 'profile' | 'manual'
}

const UPLOAD_PLANS = ['starter', 'pro', 'agency']

const SYSTEM_PROMPT = `Ti si asistent koji analizira polja poslovnih obrazaca i mapira ih na podatke firme.

Biće ti dat sadržaj obrasca i podaci firme korisnika.
Vrati ISKLJUČIVO validan JSON niz — bez teksta, objašnjenja, komentara ili markdown oznaka.

Format:
[{"key":"originalni_kljuc","label":"Naziv na srpskom","value":"vrednost ili null","source":"profile ili manual"}]

Pravila:
- Ako polje odgovara podatku iz profila firme: source=profile, value=taj podatak
- Ako ne odgovara ili nema podatka: source=manual, value=null
- label mora biti kratak i jasan na srpskom (npr. "Naziv firme", "PIB", "Datum ugovora")
- key je originalni naziv polja, placeholder string, ili kratak slug
- Za flat PDF: analiziraj tekst, prepoznaj prazna mesta za unos — vrati SAMO polja koja stvarno treba popuniti, bez poznatog sadržaja`

function extractPlaceholders(text: string): string[] {
  const found = new Set<string>()

  // {{NAZIV}}, {{ naziv firme }}
  for (const m of text.matchAll(/\{\{([^}]{1,80})\}\}/g)) found.add(`{{${m[1].trim()}}}`)
  // [NAZIV], [naziv firme] — isključi kratke npr. [1], [a]
  for (const m of text.matchAll(/\[([^\]]{2,80})\]/g)) found.add(`[${m[1].trim()}]`)
  // <NAZIV> — isključi HTML tagove
  for (const m of text.matchAll(/<([A-Za-zÀ-žčćšđžČĆŠĐŽ][^>]{1,60})>/g)) found.add(`<${m[1].trim()}>`)

  return [...found]
}

function parsePDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1)
    parser.on('pdfParser_dataReady', () => {
      resolve(parser.getRawTextContent())
    })
    parser.on('pdfParser_dataError', (err) => {
      reject(err.parserError)
    })
    parser.parseBuffer(buffer)
  })
}

async function extractFields(
  buffer: Buffer,
  type: 'acroform' | 'docx' | 'flat',
): Promise<string> {
  if (type === 'acroform') {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
    const fields = pdfDoc.getForm().getFields()
    const names = fields.map(f => f.getName()).filter(Boolean)
    return `Polja AcroForm obrasca:\n${names.join('\n')}`
  }

  if (type === 'docx') {
    const { value: rawText } = await mammoth.extractRawText({ buffer })
    const placeholders = extractPlaceholders(rawText)
    if (placeholders.length === 0) {
      // Nema prepoznatih placeholder-a — šalji tekst Claudeu da sam proceni
      return `Tekst DOCX dokumenta (pronađi mesta za popunjavanje):\n${rawText.slice(0, 3000)}`
    }
    return `Placeholder-i pronađeni u DOCX obrascu:\n${placeholders.join('\n')}`
  }

  // flat PDF
  const rawText = await parsePDF(buffer)
  return `Tekst PDF dokumenta (flat, identifikuj mesta za popunjavanje):\n${rawText.slice(0, 3000)}`
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

  if (!profile || !UPLOAD_PLANS.includes(profile.plan)) {
    return NextResponse.json(
      { error: 'Popunjavanje obrazaca dostupno je za Starter plan i više.' },
      { status: 403 },
    )
  }

  let body: { fileRef?: string; type?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { fileRef, type } = body
  if (!fileRef || !type || !['acroform', 'docx', 'flat'].includes(type)) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 })
  }

  // Preuzmi fajl iz Storage
  const { data: fileData, error: downloadError } = await admin.storage
    .from('obrasci-uploads')
    .download(fileRef)

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Fajl nije pronađen.' }, { status: 404 })
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())

  // Uzmi default firmu korisnika
  const { data: company } = await supabase
    .from('companies')
    .select('naziv, pib, maticni_broj, adresa, grad, email, telefon, zastupnik, delatnost, ziro_racun, pdv_obveznik, website')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .single()

  const companyProfile = company
    ? [
        company.naziv      && `Naziv firme: ${company.naziv}`,
        company.pib        && `PIB: ${company.pib}`,
        company.maticni_broj && `Matični broj: ${company.maticni_broj}`,
        company.adresa     && `Adresa: ${company.adresa}`,
        company.grad       && `Grad: ${company.grad}`,
        company.zastupnik  && `Zastupnik: ${company.zastupnik}`,
        company.email      && `Email: ${company.email}`,
        company.telefon    && `Telefon: ${company.telefon}`,
        company.ziro_racun && `Žiro račun: ${company.ziro_racun}`,
        company.website    && `Website: ${company.website}`,
        company.delatnost  && `Delatnost: ${company.delatnost}`,
        company.pdv_obveznik !== null && `PDV obveznik: ${company.pdv_obveznik ? 'Da' : 'Ne'}`,
      ].filter(Boolean).join('\n')
    : 'Nema podataka o firmi.'

  // Ekstraktuj polja/tekst iz dokumenta
  let docContent: string
  try {
    docContent = await extractFields(buffer, type as 'acroform' | 'docx' | 'flat')
  } catch (err) {
    console.error('Analyze extract error:', err)
    return NextResponse.json({ error: 'Greška pri čitanju dokumenta.' }, { status: 500 })
  }

  // Claude mapiranje
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let fields: MappedField[]
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Podaci firme:\n${companyProfile}\n\n${docContent}`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    fields = JSON.parse(cleaned)

    if (!Array.isArray(fields)) throw new Error('Nije niz')
  } catch (err) {
    console.error('Analyze Claude error:', err)
    return NextResponse.json({ error: 'Greška pri analizi dokumenta.' }, { status: 500 })
  }

  return NextResponse.json({ fields })
}
