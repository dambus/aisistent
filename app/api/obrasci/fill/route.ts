import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFRadioGroup } from 'pdf-lib'
import PizZip from 'pizzip'
import { sanitizeFilename } from '@/lib/sanitizeFilename'
import type { MappedField } from '../analyze/route'

const UPLOAD_PLANS = ['starter', 'pro', 'agency']

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function fillAcroForm(buffer: Buffer, fields: MappedField[]): Promise<Buffer> {
  return PDFDocument.load(buffer, { ignoreEncryption: true }).then(async pdfDoc => {
    const form = pdfDoc.getForm()
    for (const field of fields) {
      if (!field.value) continue
      try {
        const pdfField = form.getField(field.key)
        if (pdfField instanceof PDFTextField) {
          pdfField.setText(field.value)
        } else if (pdfField instanceof PDFCheckBox) {
          const yes = ['da', 'yes', 'true', '1'].includes(field.value.toLowerCase())
          yes ? pdfField.check() : pdfField.uncheck()
        } else if (pdfField instanceof PDFDropdown || pdfField instanceof PDFRadioGroup) {
          pdfField.select(field.value)
        }
      } catch {
        // Polje ne postoji ili ne odgovara tipu — preskačemo
      }
    }
    const bytes = await pdfDoc.save()
    return Buffer.from(bytes)
  })
}

function fillDocx(buffer: Buffer, fields: MappedField[]): Buffer {
  const zip = new PizZip(buffer)
  const xmlFile = zip.file('word/document.xml')
  if (!xmlFile) throw new Error('Neispravan DOCX fajl.')

  let xml = xmlFile.asText()

  for (const field of fields) {
    if (!field.value) continue
    const escapedValue = xmlEscape(field.value)
    // Pokušaj direktnu zamenu i XML-enkodiranu verziju ključa
    xml = xml.replaceAll(field.key, escapedValue)
    xml = xml.replaceAll(xmlEscape(field.key), escapedValue)
  }

  zip.file('word/document.xml', xml)
  return zip.generate({ type: 'nodebuffer', compression: 'DEFLATE' })
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

  let body: { fileRef?: string; type?: string; filename?: string; fields?: MappedField[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtev.' }, { status: 400 })
  }

  const { fileRef, type, filename, fields } = body

  if (!fileRef || !type || !filename || !Array.isArray(fields)) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 })
  }

  if (type === 'flat') {
    return NextResponse.json({ error: 'Flat PDF se ne može automatski popuniti.' }, { status: 400 })
  }

  // Preuzmi original iz Storage
  const { data: fileData, error: downloadError } = await admin.storage
    .from('obrasci-uploads')
    .download(fileRef)

  if (downloadError || !fileData) {
    return NextResponse.json({ error: 'Fajl nije pronađen.' }, { status: 404 })
  }

  const buffer = Buffer.from(await fileData.arrayBuffer())

  // Popuni dokument
  let resultBuffer: Buffer
  let contentType: string
  let ext: string

  try {
    if (type === 'acroform') {
      resultBuffer = await fillAcroForm(buffer, fields)
      contentType = 'application/pdf'
      ext = 'pdf'
    } else {
      resultBuffer = fillDocx(buffer, fields)
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ext = 'docx'
    }
  } catch (err) {
    console.error('Fill error:', err)
    return NextResponse.json({ error: 'Greška pri popunjavanju dokumenta.' }, { status: 500 })
  }

  // Cleanup — obriši original iz Storage
  await admin.storage.from('obrasci-uploads').remove([fileRef])

  const baseName = sanitizeFilename(filename.replace(/\.(pdf|docx)$/i, ''))
  const outputFilename = `popunjen-${baseName}.${ext}`

  return new NextResponse(new Uint8Array(resultBuffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Length': String(resultBuffer.byteLength),
    },
  })
}
