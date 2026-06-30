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
- key je originalni naziv polja, placeholder string, ili kratak slug`

const FLAT_EXTRA_PROMPT = `Ti si asistent koji analizira poslovne obrasce.

Biće ti dat tekst obrasca. Podaci o firmi (naziv, PIB, adresa itd.) su VEĆ uključeni odvojeno — ne dodavaj ih.
Identifikuj SAMO polja koja nisu podaci o firmi: datumi, iznosi, procenti, izbori (zaokruživanje), potpisi, specifični podaci za ovaj obrazac.
Vrati ISKLJUČIVO validan JSON niz — bez teksta, objašnjenja ili markdown oznaka.

Format:
[{"key":"slug","label":"Naziv na srpskom","value":null,"source":"manual"}]

Ako nema dodatnih polja, vrati prazan niz: []`

// Keyword matching za AcroForm polja — bez Claude API poziva
type CompanyRow = {
  naziv: string | null; pib: string | null; maticni_broj: string | null
  adresa: string | null; grad: string | null; zastupnik: string | null
  email: string | null; telefon: string | null; ziro_racun: string | null
  delatnost: string | null; pdv_obveznik: boolean | null; website: string | null
}

const FIELD_MATCHERS: Array<{ kw: string[]; field: keyof CompanyRow; label: string }> = [
  { kw: ['pib', 'poreski', 'tax_id', 'taxid', 'пиб'],                             field: 'pib',          label: 'PIB' },
  { kw: ['naziv', 'ime', 'name', 'firma', 'company', 'poslovno', 'назив', 'пун'], field: 'naziv',        label: 'Naziv / Poslovno ime' },
  { kw: ['maticni', 'mbs', 'mb_', '_mb', 'matični', 'matičan', 'матич'],          field: 'maticni_broj', label: 'Matični broj' },
  { kw: ['adresa', 'address', 'sedište', 'sediste', 'адреса', 'седиш'],            field: 'adresa',       label: 'Adresa sedišta' },
  { kw: ['grad', 'city', 'mesto', 'opština', 'opstina', 'место', 'град'],          field: 'grad',         label: 'Grad / Opština' },
  { kw: ['email', 'mail', 'eposta', 'е-пошта'],                                   field: 'email',        label: 'E-mail' },
  { kw: ['tel', 'phone', 'mobil', 'контакт', 'telefon'],                           field: 'telefon',      label: 'Telefon' },
  { kw: ['zastupnik', 'direktor', 'ovlascen', 'odgovor', 'потпис', 'одговор'],    field: 'zastupnik',    label: 'Odgovorno lice' },
  { kw: ['ziro', 'racun', 'racun', 'bank', 'account', 'жиро', 'рачун'],           field: 'ziro_racun',   label: 'Žiro račun' },
  { kw: ['delatnost', 'sifra', 'activity', 'делатн'],                              field: 'delatnost',    label: 'Pretežna delatnost' },
]

function mapAcroField(fieldName: string, company: CompanyRow): MappedField {
  const lower = fieldName.toLowerCase()
  for (const { kw, field, label } of FIELD_MATCHERS) {
    if (kw.some(k => lower.includes(k))) {
      const raw = company[field]
      const value = raw !== null && raw !== undefined ? String(raw) : null
      if (value) return { key: fieldName, label, value, source: 'profile' }
    }
  }
  // Nema match — čitljiv label iz naziva polja
  const label = fieldName.replace(/[_.\-/\\]/g, ' ').replace(/\s{2,}/g, ' ').trim().slice(0, 60)
  return { key: fieldName, label: label || fieldName, value: null, source: 'manual' }
}

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

function extractAcroFieldNames(buffer: Buffer): Promise<string[]> {
  return PDFDocument.load(buffer, { ignoreEncryption: true }).then(pdfDoc =>
    pdfDoc.getForm().getFields().map(f => f.getName()).filter(Boolean)
  )
}

async function extractDocxContent(buffer: Buffer): Promise<string> {
  const { value: rawText } = await mammoth.extractRawText({ buffer })
  const placeholders = extractPlaceholders(rawText)
  if (placeholders.length === 0) {
    return `Tekst DOCX dokumenta (pronađi mesta za popunjavanje):\n${rawText.slice(0, 3000)}`
  }
  return `Placeholder-i pronađeni u DOCX obrascu:\n${placeholders.join('\n')}`
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
    .from('obrasci-upload')
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

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  // Za flat PDF: profil uvek prikazujemo direktno, Claude traži samo dodatna polja
  if (type === 'flat') {
    const profileFields: MappedField[] = [
      company?.naziv        && { key: 'naziv',        label: 'Poslovno ime / Naziv',        value: company.naziv,        source: 'profile' as const },
      company?.pib          && { key: 'pib',          label: 'PIB',                          value: company.pib,          source: 'profile' as const },
      company?.maticni_broj && { key: 'maticni_broj', label: 'Matični broj',                 value: company.maticni_broj, source: 'profile' as const },
      company?.adresa       && { key: 'adresa',       label: 'Adresa sedišta',               value: company.adresa,       source: 'profile' as const },
      company?.grad         && { key: 'grad',         label: 'Grad',                         value: company.grad,         source: 'profile' as const },
      company?.zastupnik    && { key: 'zastupnik',    label: 'Odgovorno lice (ime i prezime)',value: company.zastupnik,    source: 'profile' as const },
      company?.email        && { key: 'email',        label: 'E-mail',                       value: company.email,        source: 'profile' as const },
      company?.telefon      && { key: 'telefon',      label: 'Telefon',                      value: company.telefon,      source: 'profile' as const },
      company?.ziro_racun   && { key: 'ziro_racun',   label: 'Žiro račun',                   value: company.ziro_racun,   source: 'profile' as const },
      company?.delatnost    && { key: 'delatnost',    label: 'Pretežna delatnost',           value: company.delatnost,    source: 'profile' as const },
    ].filter(Boolean) as MappedField[]

    // Claude traži SAMO dodatna polja specifična za ovaj obrazac
    let extraFields: MappedField[] = []
    try {
      let flatText = ''
      try { flatText = await parsePDF(buffer) } catch { /* ako ne uspe ekstrakcija, OK */ }

      if (flatText.trim().length > 20) {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 800,
          system: FLAT_EXTRA_PROMPT,
          messages: [{ role: 'user', content: flatText.slice(0, 3000) }],
        })
        const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
        const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed)) extraFields = parsed
      }
    } catch (err) {
      console.error('Flat extra fields error:', err)
      // Nije kritično — nastavljamo bez ekstra polja
    }

    return NextResponse.json({ fields: [...profileFields, ...extraFields] })
  }

  // AcroForm: deterministički keyword matching, bez Claude poziva
  if (type === 'acroform') {
    let fieldNames: string[]
    try {
      fieldNames = await extractAcroFieldNames(buffer)
    } catch (err) {
      console.error('AcroForm extract error:', err)
      return NextResponse.json({ error: 'Greška pri čitanju PDF obrasca.' }, { status: 500 })
    }

    const fields: MappedField[] = fieldNames.map(name => mapAcroField(name, company ?? {} as CompanyRow))
    return NextResponse.json({ fields })
  }

  // DOCX: Claude mapira placeholder-e na profil
  let docContent: string
  try {
    docContent = await extractDocxContent(buffer)
  } catch (err) {
    console.error('DOCX extract error:', err)
    return NextResponse.json({ error: 'Greška pri čitanju DOCX dokumenta.' }, { status: 500 })
  }

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

    const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    const match = cleaned.match(/\[[\s\S]*\]/)
    fields = match ? JSON.parse(match[0]) : []
    if (!Array.isArray(fields)) fields = []
  } catch (err) {
    console.error('Analyze Claude error:', err)
    return NextResponse.json({ error: 'Greška pri analizi DOCX dokumenta.' }, { status: 500 })
  }

  return NextResponse.json({ fields })
}
