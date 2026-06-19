import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AisistentDocument } from '@/lib/pdf/AisistentDocument'
import { FakturaPDF } from '@/lib/pdf/fakturaRenderer'
import { PutniNalogPDF } from '@/lib/pdf/putniNalogRenderer'
import { applyWatermark } from '@/lib/pdf/applyWatermark'
import { resend } from '@/lib/resend'
import type { FakturaData, PutniNalogData } from '@/types/wizard'

export const maxDuration = 60

const LOGO_PLANS = ['pro', 'business']
const FROM_EMAIL = 'AIsistent <noreply@aisistent.rs>'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildEmailHtml(opts: {
  documentTitle: string
  recipientName: string | undefined
  senderName: string | undefined
  senderFirma: string | undefined
  message: string | undefined
}): string {
  const { documentTitle, recipientName, senderName, senderFirma, message } = opts

  const escapedTitle = escapeHtml(documentTitle)
  const greeting = recipientName
    ? `Poštovani/a <strong>${escapeHtml(recipientName)}</strong>,`
    : 'Poštovani/a,'

  const senderParts: string[] = []
  if (senderName) senderParts.push(`<strong>${escapeHtml(senderName)}</strong>`)
  if (senderFirma) senderParts.push(`iz firme <strong>${escapeHtml(senderFirma)}</strong>`)
  const senderLine = senderParts.length > 0 ? senderParts.join(' ') : 'Korisnik AIsistenta'

  const messageBlock = message
    ? `<div style="border-left:3px solid #1B6B4A;padding:10px 14px;margin:0 0 18px;background:#f0fdf4;">
         <p style="margin:0;font-size:14px;color:#374151;font-style:italic;">
           <strong>Poruka:</strong> ${escapeHtml(message)}
         </p>
       </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${escapedTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#ffffff;border-radius:12px;overflow:hidden;
                  box-shadow:0 2px 8px rgba(0,0,0,.08);max-width:560px;width:100%;">
      <tr>
        <td style="background:#1B6B4A;padding:18px 28px;">
          <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-.5px;">
            AIsistent
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 28px 20px;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.55;color:#111827;">
            ${greeting}
          </p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#374151;">
            ${senderLine} vam je poslao/la dokument putem AIsistenta:
          </p>
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:14px 18px;
                      margin:0 0 18px;background:#f9fafb;">
            <span style="font-size:16px;font-weight:700;color:#111827;">${escapedTitle}</span>
          </div>
          ${messageBlock}
          <p style="margin:0 0 22px;font-size:15px;line-height:1.55;color:#374151;">
            Dokument je priložen uz ovaj mejl u PDF formatu.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 18px;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">
            Ovaj dokument je generisan uz pomoć
            <a href="https://aisistent.rs"
               style="color:#1B6B4A;text-decoration:none;font-weight:600;">AIsistent.rs</a>
            &mdash; poslovnog asistenta za srpske preduzetnike.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb;border-top:1px solid #e5e7eb;
                   padding:12px 28px;text-align:center;">
          <span style="font-size:12px;color:#9ca3af;">
            <a href="https://aisistent.rs"
               style="color:#1B6B4A;text-decoration:none;">aisistent.rs</a>
            &nbsp;&bull;&nbsp; Automatski mejl, ne odgovarajte.
          </span>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

interface RequestBody {
  document_id?: string
  recipient_email?: string
  recipient_name?: string
  message?: string
  save_contact?: boolean
  contact_name?: string
  contact_firma?: string
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Niste prijavljeni.' }, { status: 401 })
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  if (!body.document_id) {
    return NextResponse.json({ error: 'Nedostaje document_id.' }, { status: 400 })
  }
  if (!body.recipient_email?.trim()) {
    return NextResponse.json({ error: 'Email primaoca je obavezan.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: doc, error: docError } = await admin
    .from('documents')
    .select('id, user_id, type, title, generated_text, input_data, is_free, created_at')
    .eq('id', body.document_id)
    .single()

  if (docError || !doc) {
    return NextResponse.json({ error: 'Dokument nije pronađen.' }, { status: 404 })
  }

  if (doc.user_id !== user.id) {
    return NextResponse.json({ error: 'Nemate pristup ovom dokumentu.' }, { status: 403 })
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('plan, display_name')
    .eq('id', user.id)
    .single()

  const { data: company } = await admin
    .from('companies')
    .select('logo_url, naziv, pib, adresa, grad')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .limit(1)
    .single()

  let logoUrl: string | null = null
  let companyData: { naziv: string; pib: string | null; adresa: string | null; grad: string | null } | null = null

  if (profile && LOGO_PLANS.includes(profile.plan) && company) {
    companyData = {
      naziv: company.naziv,
      pib: company.pib,
      adresa: company.adresa,
      grad: company.grad,
    }

    if (company.logo_url) {
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

  let pdfBuffer: Buffer
  let filename: string
  try {
    if (doc.type === 'putni-nalog') {
      let putniData: PutniNalogData
      try {
        putniData = JSON.parse(doc.generated_text) as PutniNalogData
      } catch {
        return NextResponse.json({ error: 'Neispravni podaci putnog naloga.' }, { status: 500 })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfBuffer = await renderToBuffer(
        createElement(PutniNalogPDF, { data: putniData }) as any
      )
      filename = `putni-nalog-${(putniData.ime_vozaca ?? 'vozac').replace(/\s+/g, '-').toLowerCase()}.pdf`
    } else if (doc.type === 'faktura') {
      let fakturaData: FakturaData
      try {
        fakturaData = JSON.parse(doc.generated_text) as FakturaData
      } catch {
        return NextResponse.json({ error: 'Neispravni podaci fakture.' }, { status: 500 })
      }

      let kompanija: { naziv: string; pib: string; adresa: string; grad: string } | undefined
      if (profile && LOGO_PLANS.includes(profile.plan) && companyData) {
        kompanija = {
          naziv: companyData.naziv,
          pib: companyData.pib ?? '',
          adresa: companyData.adresa ?? '',
          grad: companyData.grad ?? '',
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pdfBuffer = await renderToBuffer(
        createElement(FakturaPDF, {
          data: fakturaData,
          logoUrl: logoUrl ?? undefined,
          kompanija,
        }) as any
      )

      filename = `faktura-${(fakturaData.primalac_naziv ?? 'dokument').replace(/\s+/g, '-').toLowerCase()}.pdf`
    } else {
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

      const slug = doc.type.replace('ugovor-o-', 'ugovor-')
      const date = new Date(doc.created_at).toISOString().split('T')[0]
      filename = `${slug}-${date}.pdf`
    }
  } catch (pdfErr) {
    console.error('PDF render error in send-document:', pdfErr)
    const detail = pdfErr instanceof Error ? pdfErr.message : String(pdfErr)
    return NextResponse.json({ error: 'Greška pri generisanju PDF-a.', detail }, { status: 500 })
  }

  const senderName = profile?.display_name ?? undefined
  const senderFirma = company?.naziv ?? undefined
  const subject = `${doc.title}${senderFirma ? ` — ${senderFirma}` : ''}`

  const html = buildEmailHtml({
    documentTitle: doc.title,
    recipientName: body.recipient_name,
    senderName,
    senderFirma,
    message: body.message,
  })

  if (profile?.plan === 'free') {
    pdfBuffer = await applyWatermark(pdfBuffer)
  }

  const { error: sendError } = await resend.emails.send({
    from: FROM_EMAIL,
    to: body.recipient_email.trim(),
    subject,
    html,
    attachments: [{ filename, content: pdfBuffer }],
  })

  if (sendError) {
    console.error('Resend error:', sendError)
    return NextResponse.json(
      { error: 'Greška pri slanju emaila. Proverite adresu i pokušajte ponovo.' },
      { status: 500 }
    )
  }

  if (body.save_contact) {
    await admin
      .from('contacts')
      .upsert(
        {
          user_id: user.id,
          ime: body.contact_name?.trim() || null,
          email: body.recipient_email.trim().toLowerCase(),
          firma: body.contact_firma?.trim() || null,
        },
        { onConflict: 'user_id,email' }
      )
  }

  return NextResponse.json({ success: true })
}
