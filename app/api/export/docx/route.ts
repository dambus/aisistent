import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildDocx } from '@/lib/pdf/docxBuilder'
import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, ShadingType, BorderStyle,
} from 'docx'

export const maxDuration = 60

const DOCX_PLANS = ['starter', 'pro', 'business']
const LOGO_PLANS = ['pro', 'business']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  let body: { document_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  if (!body.document_id) {
    return NextResponse.json({ error: 'Nedostaje document_id.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Plan check
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (!profile || !DOCX_PLANS.includes(profile.plan)) {
    return NextResponse.json(
      { error: 'DOCX export je dostupan samo korisnicima Starter, Pro i Business plana. Pređite na plaćeni plan da biste preuzeli Word dokument bez watermark-a.' },
      { status: 403 }
    )
  }

  const { data: doc, error } = await admin
    .from('documents')
    .select('id, user_id, type, title, generated_text, input_data, is_free, created_at')
    .eq('id', body.document_id)
    .single()

  if (error || !doc) {
    return NextResponse.json({ error: 'Dokument nije pronađen.' }, { status: 404 })
  }

  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: 'Nemate pristup ovom dokumentu.' }, { status: 403 })
  }

  // Dohvati logo i podatke firme ako plan dozvoljava
  let logoBuffer: Buffer | null = null
  let logoMimeType: string | undefined
  let companyData: { naziv: string; pib: string | null; adresa: string | null; grad: string | null } | null = null

  if (LOGO_PLANS.includes(profile.plan)) {
    const { data: company } = await admin
      .from('companies')
      .select('logo_url, naziv, pib, adresa, grad')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .limit(1)
      .single()

    if (company) {
      companyData = {
        naziv: company.naziv,
        pib: company.pib,
        adresa: company.adresa,
        grad: company.grad,
      }
    }

    if (company?.logo_url) {
      const { data: fileData } = await admin.storage
        .from('company-logos')
        .download(company.logo_url)

      if (fileData) {
        const arrayBuffer = await fileData.arrayBuffer()
        logoBuffer = Buffer.from(arrayBuffer)
        const ext = company.logo_url.split('.').pop()?.toLowerCase()
        logoMimeType = ext === 'svg' ? 'image/svg+xml'
          : ext === 'webp' ? 'image/webp'
          : ext === 'png' ? 'image/png'
          : 'image/jpeg'
      }
    }
  }

  // Putni nalog — poseban DOCX renderer
  if (doc.type === 'putni-nalog') {
    let data: Record<string, unknown>
    try { data = JSON.parse(doc.generated_text) } catch {
      return NextResponse.json({ error: 'Neispravni podaci putnog naloga.' }, { status: 500 })
    }

    const troskovi = [
      data.dnevnica && 'Dnevnica',
      data.gorivo_na_teret_firme && 'Gorivo na teret firme',
      data.smestaj && 'Smestaj',
    ].filter(Boolean).join(', ')

    function fmtDate(iso: string) {
      if (!iso) return '___________'
      const d = new Date(iso)
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
    }

    const ZELENA = '1B6B4A'
    const SIVA = '6B7280'
    const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
    const NO_BORDERS = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER }

    const putniDoc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: 'PUTNI NALOG', bold: true, size: 36, color: ZELENA })],
            spacing: { after: 100 },
          }),
          ...(data.broj_naloga ? [new Paragraph({
            children: [new TextRun({ text: `Broj: ${data.broj_naloga}`, size: 18, color: SIVA })],
            spacing: { after: 60 },
          })] : []),
          new Paragraph({
            children: [new TextRun({
              text: `Datum izdavanja: ${fmtDate(data.datum_izdavanja as string)}`,
              size: 18, color: SIVA,
            })],
            spacing: { after: 300 },
          }),

          new Paragraph({ children: [new TextRun({ text: 'IZDAVALAC NALOGA', bold: true, size: 16, color: SIVA })] }),
          new Paragraph({ children: [new TextRun({ text: data.naziv_firme as string, bold: true, size: 20 })] }),
          ...(data.pib ? [new Paragraph({ children: [new TextRun({ text: `PIB: ${data.pib}`, size: 18, color: SIVA })] })] : []),
          ...(data.adresa_firme ? [new Paragraph({ children: [new TextRun({ text: data.adresa_firme as string, size: 18, color: SIVA })] })] : []),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          new Paragraph({ children: [new TextRun({ text: 'VOZAC', bold: true, size: 16, color: SIVA })] }),
          new Paragraph({ children: [new TextRun({ text: data.ime_vozaca as string, bold: true, size: 20 })] }),
          ...(data.pozicija_vozaca ? [new Paragraph({ children: [new TextRun({ text: data.pozicija_vozaca as string, size: 18, color: SIVA })] })] : []),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          new Paragraph({ children: [new TextRun({ text: 'VOZILO', bold: true, size: 16, color: SIVA })] }),
          new Paragraph({ children: [new TextRun({ text: `${data.marka_model} — ${data.registarski_broj}`, bold: true, size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: `Km-sat polazak: ${data.km_pocetak ?? '___________'}    Km-sat povratak: ___________`, size: 18 })] }),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          new Paragraph({ children: [new TextRun({ text: 'SVRHA PUTOVANJA', bold: true, size: 16, color: SIVA })] }),
          new Paragraph({ children: [new TextRun({ text: data.svrha_putovanja as string, size: 18 })] }),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          new Paragraph({ children: [new TextRun({ text: 'KRETANJE VOZILA', bold: true, size: 16, color: SIVA })] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['Datum', 'Mesto polaska', 'Mesto dolaska', 'Km'].map(h =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 16 })] })],
                    shading: { type: ShadingType.SOLID, color: ZELENA },
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  })
                ),
              }),
              new TableRow({
                children: [
                  fmtDate(data.datum_polaska as string),
                  data.polaziste as string,
                  data.odrediste as string,
                  '___',
                ].map(val =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: val, size: 18 })] })],
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  })
                ),
              }),
              new TableRow({
                children: [
                  data.datum_povratka ? fmtDate(data.datum_povratka as string) : '___________',
                  data.odrediste as string,
                  data.polaziste as string,
                  '___',
                ].map(val =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: val, size: 18 })] })],
                    shading: { type: ShadingType.SOLID, color: 'F9FAFB' },
                    width: { size: 25, type: WidthType.PERCENTAGE },
                  })
                ),
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          ...(troskovi ? [
            new Paragraph({ children: [new TextRun({ text: 'TROSKOVI NA TERET FIRME', bold: true, size: 16, color: SIVA })] }),
            new Paragraph({ children: [new TextRun({ text: troskovi, size: 18 })] }),
            ...(data.ostali_troskovi ? [new Paragraph({ children: [new TextRun({ text: `Ostalo: ${data.ostali_troskovi}`, size: 18 })] })] : []),
            new Paragraph({ text: '', spacing: { after: 200 } }),
          ] : []),

          new Paragraph({ children: [new TextRun({ text: 'POTPISI', bold: true, size: 16, color: SIVA })] }),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: { ...NO_BORDERS, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
            rows: [
              new TableRow({
                children: [
                  'Nalog izdalo ovlasceno lice:',
                  'Vozac — primio vozilo:',
                  'Kontrola po povratku:',
                ].map(label =>
                  new TableCell({
                    borders: NO_BORDERS,
                    children: [new Paragraph({ children: [new TextRun({ text: label, size: 16, color: SIVA })] })],
                  })
                ),
              }),
              new TableRow({
                children: [
                  data.ovlasceno_lice as string,
                  data.ime_vozaca as string,
                  ' ',
                ].map(ime =>
                  new TableCell({
                    borders: NO_BORDERS,
                    children: [
                      new Paragraph({ text: '' }),
                      new Paragraph({ children: [new TextRun({ text: '_________________________________', size: 18 })] }),
                      new Paragraph({ children: [new TextRun({ text: ime, size: 18 })] }),
                    ],
                  })
                ),
              }),
            ],
          }),
        ],
      }],
    })

    let putniBuffer: Buffer
    try {
      putniBuffer = await Packer.toBuffer(putniDoc)
    } catch (docxErr) {
      console.error('Putni nalog DOCX render error:', docxErr)
      return NextResponse.json(
        { error: 'Greška pri generisanju Word dokumenta. Pokušajte ponovo.' },
        { status: 500 }
      )
    }
    const filename = `putni-nalog-${(data.ime_vozaca as string ?? 'vozac').replace(/\s+/g, '-').toLowerCase()}.docx`
    return new NextResponse(new Uint8Array(putniBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(putniBuffer.byteLength),
      },
    })
  }

  // Faktura — poseban DOCX renderer
  if (doc.type === 'faktura') {
    let data: Record<string, unknown>
    try { data = JSON.parse(doc.generated_text) } catch {
      return NextResponse.json({ error: 'Neispravni podaci fakture.' }, { status: 500 })
    }

    let stavke: Array<{ rb: number; naziv: string; kolicina: number; jedinica: string; cena_bez_pdv: number }> = []
    try { stavke = JSON.parse(data.stavke as string) } catch {}

    const pdvStopa = data.izdavalac_pdv_obveznik ? (parseInt((data.pdv_stopa as string) ?? '0') || 0) : 0
    const ukupnoBezPdv = stavke.reduce((sum, s) => sum + s.kolicina * s.cena_bez_pdv, 0)
    const iznosPdv = ukupnoBezPdv * pdvStopa / 100
    const ukupnoSaPdv = ukupnoBezPdv + iznosPdv

    function fmtN(n: number) {
      return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    function fmtDate(iso: string) {
      if (!iso) return ''
      const d = new Date(iso)
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
    }

    const ZELENA = '1B6B4A'
    const SIVA = '6B7280'

    const fakturaDoc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun({ text: (data.tip_dokumenta as string).toUpperCase(), bold: true, size: 36, color: ZELENA })],
            spacing: { after: 100 },
          }),
          ...(data.broj_dokumenta ? [new Paragraph({
            children: [new TextRun({ text: `Broj: ${data.broj_dokumenta}`, size: 18, color: SIVA })],
            spacing: { after: 300 },
          })] : []),

          new Paragraph({ children: [new TextRun({ text: 'IZDAVALAC', bold: true, size: 16, color: SIVA })] }),
          new Paragraph({ children: [new TextRun({ text: data.izdavalac_naziv as string, bold: true, size: 20 })] }),
          new Paragraph({ children: [new TextRun({ text: `PIB: ${data.izdavalac_pib}`, size: 18, color: SIVA })] }),
          new Paragraph({ children: [new TextRun({ text: data.izdavalac_adresa as string, size: 18, color: SIVA })] }),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          new Paragraph({ children: [new TextRun({ text: 'PRIMALAC', bold: true, size: 16, color: SIVA })] }),
          new Paragraph({ children: [new TextRun({ text: data.primalac_naziv as string, bold: true, size: 20 })] }),
          ...(data.primalac_pib && (data.primalac_pib as string).trim() !== ''
            ? [new Paragraph({ children: [new TextRun({ text: `PIB: ${data.primalac_pib}`, size: 18, color: SIVA })] })]
            : []),
          new Paragraph({ children: [new TextRun({ text: data.primalac_adresa as string, size: 18, color: SIVA })] }),
          new Paragraph({ text: '', spacing: { after: 200 } }),

          new Paragraph({
            children: [new TextRun({ text: `Datum izdavanja: ${fmtDate(data.datum_izdavanja as string)}    Rok plaćanja: ${fmtDate(data.datum_valute as string)}`, size: 18 })],
            spacing: { after: 300 },
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: (['Rb.', 'Naziv', 'Kol.', 'Jed.', 'Cena (RSD)', 'Ukupno (RSD)'] as string[]).map((h, i) =>
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 16 })] })],
                    shading: { type: ShadingType.SOLID, color: ZELENA },
                    width: { size: [5, 40, 10, 8, 17, 20][i], type: WidthType.PERCENTAGE },
                  })
                ),
              }),
              ...stavke.map((s, i) =>
                new TableRow({
                  children: (
                    [String(s.rb) + '.', s.naziv, fmtN(s.kolicina), s.jedinica, fmtN(s.cena_bez_pdv), fmtN(s.kolicina * s.cena_bez_pdv)] as string[]
                  ).map((val, ci) =>
                    new TableCell({
                      children: [new Paragraph({
                        children: [new TextRun({ text: val, size: 18 })],
                        alignment: ci >= 4 ? AlignmentType.RIGHT : ci === 2 || ci === 3 ? AlignmentType.CENTER : AlignmentType.LEFT,
                      })],
                      shading: i % 2 === 1 ? { type: ShadingType.SOLID, color: 'F9FAFB' } : undefined,
                      width: { size: [5, 40, 10, 8, 17, 20][ci], type: WidthType.PERCENTAGE },
                    })
                  ),
                })
              ),
            ],
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),
          new Paragraph({ children: [new TextRun({ text: `Ukupno bez PDV: ${fmtN(ukupnoBezPdv)} RSD`, size: 18 })], alignment: AlignmentType.RIGHT }),
          ...(pdvStopa > 0 ? [new Paragraph({ children: [new TextRun({ text: `PDV (${pdvStopa}%): ${fmtN(iznosPdv)} RSD`, size: 18 })], alignment: AlignmentType.RIGHT })] : []),
          new Paragraph({ children: [new TextRun({ text: `Ukupno za uplatu: ${fmtN(ukupnoSaPdv)} RSD`, bold: true, size: 22, color: ZELENA })], alignment: AlignmentType.RIGHT }),

          new Paragraph({ text: '', spacing: { after: 300 } }),

          ...(data.izdavalac_tekuci_racun ? [
            new Paragraph({ children: [new TextRun({ text: 'Podaci za plaćanje', bold: true, size: 18 })] }),
            new Paragraph({ children: [new TextRun({ text: `Račun: ${data.izdavalac_tekuci_racun}`, size: 18 })] }),
            ...(data.poziv_na_broj ? [new Paragraph({ children: [new TextRun({ text: `Poziv na broj: ${data.poziv_na_broj}`, size: 18 })] })] : []),
          ] : []),

          ...(!data.izdavalac_pdv_obveznik ? [
            new Paragraph({ text: '', spacing: { after: 200 } }),
            new Paragraph({ children: [new TextRun({ text: 'Napomena: Izdavalac fakture nije u sistemu PDV-a u smislu Zakona o PDV Republike Srbije. PDV nije obračunat.', size: 16, color: '92400E' })] }),
          ] : []),

          ...(data.napomena ? [
            new Paragraph({ text: '', spacing: { after: 100 } }),
            new Paragraph({ children: [new TextRun({ text: `Napomena: ${data.napomena}`, size: 18, italics: true })] }),
          ] : []),
        ],
      }],
    })

    let fakturaBuffer: Buffer
    try {
      fakturaBuffer = await Packer.toBuffer(fakturaDoc)
    } catch (docxErr) {
      console.error('DOCX render error:', docxErr)
      return NextResponse.json(
        { error: 'Greška pri generisanju Word dokumenta. Pokušajte ponovo.' },
        { status: 500 }
      )
    }
    const filename = `faktura-${(data.primalac_naziv as string ?? 'dokument').replace(/\s+/g, '-').toLowerCase()}.docx`
    return new NextResponse(new Uint8Array(fakturaBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(fakturaBuffer.byteLength),
      },
    })
  }

  let docxBuffer: Buffer
  try {
    docxBuffer = await buildDocx(doc.generated_text, doc.title, doc.created_at, {
      documentType: doc.type,
      inputData: (doc.input_data as Record<string, unknown>) ?? undefined,
      isFree: doc.is_free ?? false,
      logoBuffer,
      logoMimeType,
      companyData,
    })
  } catch (docxErr) {
    console.error('DOCX render error:', docxErr)
    return NextResponse.json(
      { error: 'Greška pri generisanju Word dokumenta. Pokušajte ponovo.' },
      { status: 500 }
    )
  }

  const slug = doc.type.replace('ugovor-o-', 'ugovor-')
  const date = new Date(doc.created_at).toISOString().split('T')[0]
  const filename = `${slug}-${date}.docx`

  return new NextResponse(new Uint8Array(docxBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(docxBuffer.byteLength),
    },
  })
}
