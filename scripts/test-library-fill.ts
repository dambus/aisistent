/**
 * Faza 4 Korak 1 — test fill engine-a biblioteke (fillLibraryForm), bez baze/auth.
 *
 * PPDG-1S sa ručno verifikovanim mapiranjima (iz Faza 1-3 pipeline validacije):
 *  1. fillLibraryForm → popunjen PDF BEZ flatten
 *  2. Verifikacija editabilnosti: reload output → AcroForm polja i dalje postoje,
 *     upisane vrednosti čitljive kroz form API (dokaz da nije flatten-ovano)
 *  3. Snima output za vizuelnu proveru (pymupdf render / otvaranje u Adobe-u)
 *
 * Usage: npx tsx --tsconfig tsconfig.json scripts/test-library-fill.ts <pdf-path>
 */
import fs from 'fs'
import path from 'path'
import { PDFDocument, PDFTextField } from 'pdf-lib'
import { fillLibraryForm, type LibraryField } from '../lib/documentIntelligence/fillLibraryForm'
import type { Company } from '../types/database'

const pdfPath = process.argv[2] ?? 'C:/Users/milan/Downloads/za claude/PPDG-1S-p.pdf'

const MOCK_COMPANY: Company = {
  id: 'mock',
  user_id: 'mock',
  naziv: 'Testna Firma d.o.o.',
  pib: '123456789',
  maticni_broj: '87654321',
  adresa: 'Kneza Miloša 42',
  grad: 'Beograd',
  zastupnik: 'Marko Marković',
  funkcija_zastupnika: 'Direktor',
  email: 'info@testnafirma.rs',
  telefon: '063 1234567',
  logo_url: null,
  delatnost: 'Razvoj softvera (62.01)',
  ziro_racun: '160-123456789-12',
  pdv_obveznik: true,
  website: 'www.testnafirma.rs',
  is_default: true,
  created_at: new Date().toISOString(),
}

// Ručno verifikovana zelena mapiranja za PPDG-1S (potvrđena u Faza 1-3 validaciji) —
// ovo je tačan sadržaj koji bi kurator upisao u library_forms.fields
const PPDG_FIELDS: LibraryField[] = [
  { kind: 'acroform', fieldName: 'T6',  profileKey: 'zastupnik' },
  { kind: 'acroform', fieldName: 'T8',  profileKey: 'grad' },
  { kind: 'acroform', fieldName: 'T17', profileKey: 'pib' },
  { kind: 'acroform', fieldName: 'T18', profileKey: 'maticni_broj' },
  { kind: 'acroform', fieldName: 'T19', profileKey: 'naziv' },
  { kind: 'acroform', fieldName: 'T22', profileKey: 'grad' },
  { kind: 'acroform', fieldName: 'T33', profileKey: 'email' },
  { kind: 'acroform', fieldName: 'T35', profileKey: 'delatnost' },
]

async function main() {
  const buffer = fs.readFileSync(pdfPath)
  console.log(`\n=== Library fill test: ${path.basename(pdfPath)} ===\n`)

  const t0 = Date.now()
  const result = await fillLibraryForm(buffer, PPDG_FIELDS, MOCK_COMPANY, 'cyrillic')
  console.log(`fillLibraryForm: ${Date.now() - t0}ms  filled=${result.filledCount}  noValue=${result.skippedNoValue}  notFound=${result.skippedNotFound}`)

  const outDir = path.join(process.cwd(), 'scripts/output')
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, 'library-fill-test.pdf')
  fs.writeFileSync(outPath, result.bytes)
  console.log(`Sačuvano: ${outPath}`)

  // ── Verifikacija editabilnosti (nema flatten) ──
  const reloaded = await PDFDocument.load(result.bytes)
  const form = reloaded.getForm()
  const allFields = form.getFields()
  console.log(`\nAcroForm polja u outputu: ${allFields.length} ${allFields.length > 0 ? '✅ (nije flatten-ovano)' : '❌ FLATTEN-OVANO!'}`)
  if (allFields.length === 0) process.exit(1)

  let ok = 0
  for (const lf of PPDG_FIELDS) {
    if (lf.kind !== 'acroform') continue
    const f = form.getField(lf.fieldName)
    const text = f instanceof PDFTextField ? f.getText() : undefined
    const status = text ? '✅' : '❌'
    if (text) ok++
    console.log(`  ${status} ${lf.fieldName} (${lf.profileKey}) = "${text ?? ''}"`)
  }
  console.log(`\n${ok}/${PPDG_FIELDS.length} polja čitljivo kroz form API — vrednosti žive, editabilne u Adobe-u`)
  if (ok !== PPDG_FIELDS.length) process.exit(1)

  console.log('\n=== ✅ Test prošao ===')
}

main().catch(err => {
  console.error('GREŠKA:', err)
  process.exit(1)
})
