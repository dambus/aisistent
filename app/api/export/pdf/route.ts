import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AisistentDocument } from '@/lib/pdf/AisistentDocument'
import { FakturaPDF } from '@/lib/pdf/fakturaRenderer'
import { PutniNalogPDF } from '@/lib/pdf/putniNalogRenderer'
import { OtpremnicaPDF } from '@/lib/pdf/otpremnicaRenderer'
import type { FakturaData, PutniNalogData } from '@/types/wizard'
import type { OtpremnicaData } from '@/lib/prompts/otpremnica'

export const maxDuration = 60

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
  let logoUrl: string | null = null
  let companyData: { naziv: string; pib: string | null; adresa: string | null; grad: string | null } | null = null
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile && LOGO_PLANS.includes(profile.plan)) {
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
      // Preuzmi kao base64 data URI za react-pdf renderer
      const { data: fileData } = await admin.storage
        .from('company-logos')
        .download(company.logo_url)

      if (fileData) {
        const arrayBuffer = await fileData.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const ext = company.logo_url.split('.').pop()?.toLowerCase()
        const mimeType = ext === 'svg' ? 'image/svg+xml'
          : ext === 'webp' ? 'image/webp'
          : ext === 'png' ? 'image/png'
          : 'image/jpeg'
        logoUrl = `data:${mimeType};base64,${base64}`
      }
    }
  }

  // Putni nalog — poseban renderer
  if (doc.type === 'putni-nalog') {
    let putniData: PutniNalogData
    try {
      putniData = JSON.parse(doc.generated_text) as PutniNalogData
    } catch {
      return NextResponse.json({ error: 'Neispravni podaci putnog naloga.' }, { status: 500 })
    }

    let putniPdfBuffer: Buffer
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      putniPdfBuffer = await renderToBuffer(
        createElement(PutniNalogPDF, { data: putniData }) as any
      )
    } catch (pdfErr) {
      console.error('Putni nalog PDF render error:', pdfErr)
      return NextResponse.json(
        { error: 'Greška pri generisanju PDF-a. Pokušajte ponovo.' },
        { status: 500 }
      )
    }

    const filename = `putni-nalog-${(putniData.ime_vozaca ?? 'vozac').replace(/\s+/g, '-').toLowerCase()}-${putniData.datum_polaska}.pdf`
    return new NextResponse(new Uint8Array(putniPdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(putniPdfBuffer.byteLength),
      },
    })
  }

  // Otpremnica — poseban renderer
  if (doc.type === 'otpremnica') {
    let otpremnicaData: OtpremnicaData
    try {
      otpremnicaData = JSON.parse(doc.generated_text) as OtpremnicaData
    } catch {
      return NextResponse.json({ error: 'Neispravni podaci otpremnice.' }, { status: 500 })
    }

    let otpremnicaPdfBuffer: Buffer
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      otpremnicaPdfBuffer = await renderToBuffer(
        createElement(OtpremnicaPDF, { data: otpremnicaData }) as any
      )
    } catch (pdfErr) {
      console.error('Otpremnica PDF render error:', pdfErr)
      return NextResponse.json(
        { error: 'Greška pri generisanju PDF-a. Pokušajte ponovo.' },
        { status: 500 }
      )
    }

    const filename = `otpremnica-${(otpremnicaData.primalac_naziv ?? 'dokument').replace(/\s+/g, '-').toLowerCase()}-${otpremnicaData.datum_izdavanja}.pdf`
    return new NextResponse(new Uint8Array(otpremnicaPdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(otpremnicaPdfBuffer.byteLength),
      },
    })
  }

  // Faktura — poseban renderer
  if (doc.type === 'faktura') {
    let fakturaData: FakturaData
    try {
      fakturaData = JSON.parse(doc.generated_text) as FakturaData
    } catch {
      return NextResponse.json({ error: 'Neispravni podaci fakture.' }, { status: 500 })
    }

    let fakturaKompanija: { naziv: string; pib: string; adresa: string; grad: string } | undefined
    if (profile && LOGO_PLANS.includes(profile.plan) && companyData) {
      fakturaKompanija = {
        naziv: companyData.naziv,
        pib: companyData.pib ?? '',
        adresa: companyData.adresa ?? '',
        grad: companyData.grad ?? '',
      }
    }

    let fakturaPdfBuffer: Buffer
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fakturaPdfBuffer = await renderToBuffer(
        createElement(FakturaPDF, {
          data: fakturaData,
          logoUrl: logoUrl ?? undefined,
          kompanija: fakturaKompanija,
        }) as any
      )
    } catch (pdfErr) {
      console.error('Faktura PDF render error:', pdfErr)
      return NextResponse.json(
        { error: 'Greška pri generisanju PDF-a. Pokušajte ponovo.' },
        { status: 500 }
      )
    }

    const filename = `faktura-${(fakturaData.primalac_naziv ?? 'dokument').replace(/\s+/g, '-').toLowerCase()}-${fakturaData.datum_izdavanja}.pdf`
    return new NextResponse(new Uint8Array(fakturaPdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(fakturaPdfBuffer.byteLength),
      },
    })
  }

  let pdfBuffer: Buffer
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfBuffer = await renderToBuffer(
      createElement(AisistentDocument, {
        generatedText: doc.generated_text,
        documentTitle: doc.title,
        createdAt: doc.created_at,
        isFree: doc.is_free,
        inputData: (doc.input_data as Record<string, unknown>) ?? undefined,
        documentType: doc.type,
        logoUrl,
        companyData,
      }) as any
    )
  } catch (pdfErr) {
    console.error('PDF render error:', pdfErr)
    return NextResponse.json(
      { error: 'Greška pri generisanju PDF-a. Pokušajte ponovo.' },
      { status: 500 }
    )
  }

  const slug = doc.type.replace('ugovor-o-', 'ugovor-')
  const date = new Date(doc.created_at).toISOString().split('T')[0]
  const filename = `${slug}-${date}.pdf`

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.byteLength),
    },
  })
}
