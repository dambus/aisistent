/**
 * Test skripta za generisanje i pregled PDF dokumenata bez UI.
 *
 * Upotreba:
 *   npm run test:doc <tip-dokumenta>
 *   npm run test:doc ugovor-o-zakupu
 *   npm run test:doc ugovor-o-radu
 *   npm run test:doc nda
 *   npm run test:doc ugovor-o-delu
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import Anthropic from '@anthropic-ai/sdk'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
}

const SUPPORTED = ['ugovor-o-zakupu', 'ugovor-o-radu', 'nda', 'ugovor-o-delu', 'ugovor-o-saradnji'] as const
type SupportedType = typeof SUPPORTED[number]

async function main() {
  const docType = process.argv[2] as SupportedType

  if (!docType || !SUPPORTED.includes(docType)) {
    console.error(`\nUpotreba: npm run test:doc <tip>\n`)
    console.error(`Podržani tipovi:\n${SUPPORTED.map(t => `  - ${t}`).join('\n')}\n`)
    process.exit(1)
  }

  console.log(`\n📄 Generišem: ${docType}`)
  console.log('━'.repeat(50))

  // prompt file names don't always match document type slugs
  const promptFile: Record<string, string> = {
    'ugovor-o-saradnji': 'ugovor-o-saradnji-zajmu',
  }
  const promptSlug = promptFile[docType] ?? docType

  // Dynamically import fixture and prompt
  const [{ fixture }, promptModule] = await Promise.all([
    import(`./fixtures/${docType}.js`),
    import(`../lib/prompts/${promptSlug}.js`),
  ])

  const { systemPrompt, buildUserMessage } = promptModule

  // Call Claude API
  console.log('⏳ Pozivam Claude API...')
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8000,
    system: systemPrompt,
    messages: [{ role: 'user', content: buildUserMessage(fixture) }],
  })

  const { sanitizeText } = await import('../lib/pdf/markdownParser.js')
  const generatedText = sanitizeText((message.content[0] as { type: string; text: string }).text)
    .replace(/^```(?:markdown)?\r?\n?/, '')
    .replace(/\r?\n?```$/, '')

  console.log(`✅ Tekst generisan (${generatedText.length} karaktera)`)

  // Render PDF
  console.log('⏳ Renderujem PDF...')
  const { AisistentDocument } = await import('../lib/pdf/AisistentDocument.js')

  const buffer = await renderToBuffer(
    React.createElement(AisistentDocument, {
      generatedText,
      documentTitle: `TEST — ${docType}`,
      createdAt: new Date().toISOString(),
      isFree: false,
      inputData: fixture as Record<string, unknown>,
      documentType: docType,
      logoUrl: null,
      companyData: null,
    })
  )

  // Save output
  const outDir = path.resolve(process.cwd(), 'scripts', 'output')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outPath = path.join(outDir, `${docType}-${timestamp}.pdf`)
  fs.writeFileSync(outPath, buffer)

  console.log(`✅ PDF sačuvan: ${outPath}`)
  console.log('━'.repeat(50))

  // Open PDF
  try {
    if (process.platform === 'win32') {
      execSync(`start "" "${outPath}"`)
    } else if (process.platform === 'darwin') {
      execSync(`open "${outPath}"`)
    } else {
      execSync(`xdg-open "${outPath}"`)
    }
    console.log('📂 PDF otvoren u podrazumevanom pregledaču\n')
  } catch {
    console.log(`📂 Otvori ručno: ${outPath}\n`)
  }
}

main().catch(err => {
  console.error('\n❌ Greška:', err.message ?? err)
  process.exit(1)
})
