import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AisistentDocument } from '@/lib/pdf/AisistentDocument'
import { FakturaPDF } from '@/lib/pdf/fakturaRenderer'
import { PutniNalogPDF } from '@/lib/pdf/putniNalogRenderer'
import { OtpremnicaPDF } from '@/lib/pdf/otpremnicaRenderer'
import { PonudaZaRadovePDF } from '@/lib/pdf/ponudaZaRadoveRenderer'
import { applyWatermark } from '@/lib/pdf/applyWatermark'
import type { FakturaData, PutniNalogData } from '@/types/wizard'
import type { OtpremnicaData } from '@/lib/prompts/otpremnica'
import type { PonudaZaRadoveData } from '@/lib/prompts/ponuda-za-radove'
import { sanitizeFilename } from '@/lib/sanitizeFilename'

export const maxDuration = 60

const LOGO_PLANS = ['pro', 'agency']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  let body: { document_id?: string; override_text?: string }
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

    let finalPutniBuffer: Buffer = putniPdfBuffer
    if (profile?.plan === 'free') {
      finalPutniBuffer = await applyWatermark(putniPdfBuffer)
    }

    const filename = `putni-nalog-${sanitizeFilename(putniData.ime_vozaca ?? 'vozac').replace(/\s+/g, '-').toLowerCase()}-${putniData.datum_polaska}.pdf`
    return new NextResponse(new Uint8Array(finalPutniBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(finalPutniBuffer.byteLength),
      },
    })
  }

  // Ponuda za radove — poseban renderer
  if (doc.type === 'ponuda-za-radove') {
    let ponudaData: PonudaZaRadoveData
    try {
      ponudaData = JSON.parse(doc.generated_text) as PonudaZaRadoveData
    } catch {
      return NextResponse.json({ error: 'Neispravni podaci ponude za radove.' }, { status: 500 })
    }

    let ponudaPdfBuffer: Buffer
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ponudaPdfBuffer = await renderToBuffer(
        createElement(PonudaZaRadovePDF, { data: ponudaData }) as any
      )
    } catch (pdfErr) {
      console.error('Ponuda za radove PDF render error:', pdfErr)
      return NextResponse.json(
        { error: 'Greška pri generisanju PDF-a. Pokušajte ponovo.' },
        { status: 500 }
      )
    }

    let finalPonudaBuffer: Buffer = ponudaPdfBuffer
    if (profile?.plan === 'free') {
      finalPonudaBuffer = await applyWatermark(ponudaPdfBuffer)
    }

    const filename = `ponuda-za-radove-${sanitizeFilename(ponudaData.narucilac_naziv ?? 'dokument').replace(/\s+/g, '-').toLowerCase()}-${ponudaData.datum_izdavanja}.pdf`
    return new NextResponse(new Uint8Array(finalPonudaBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(finalPonudaBuffer.byteLength),
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

    let finalOtpremnicaBuffer: Buffer = otpremnicaPdfBuffer
    if (profile?.plan === 'free') {
      finalOtpremnicaBuffer = await applyWatermark(otpremnicaPdfBuffer)
    }

    const filename = `otpremnica-${sanitizeFilename(otpremnicaData.primalac_naziv ?? 'dokument').replace(/\s+/g, '-').toLowerCase()}-${otpremnicaData.datum_izdavanja}.pdf`
    return new NextResponse(new Uint8Array(finalOtpremnicaBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(finalOtpremnicaBuffer.byteLength),
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

    let finalFakturaBuffer: Buffer = fakturaPdfBuffer
    if (profile?.plan === 'free') {
      finalFakturaBuffer = await applyWatermark(fakturaPdfBuffer)
    }

    const filename = `faktura-${sanitizeFilename(fakturaData.primalac_naziv ?? 'dokument').replace(/\s+/g, '-').toLowerCase()}-${fakturaData.datum_izdavanja}.pdf`
    return new NextResponse(new Uint8Array(finalFakturaBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(finalFakturaBuffer.byteLength),
      },
    })
  }

  let pdfBuffer: Buffer
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfBuffer = await renderToBuffer(
      createElement(AisistentDocument, {
        generatedText: body.override_text ?? doc.generated_text,
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

  let finalPdfBuffer: Buffer = pdfBuffer
  if (profile?.plan === 'free') {
    finalPdfBuffer = await applyWatermark(pdfBuffer)
  }

  return new NextResponse(new Uint8Array(finalPdfBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(finalPdfBuffer.byteLength),
    },
  })
}
