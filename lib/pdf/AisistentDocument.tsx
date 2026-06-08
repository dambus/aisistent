import React from 'react'
import fs from 'fs'
import path from 'path'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { parseMarkdown, Block, InlineSpan, InlineType } from './markdownParser'

const DISCLAIMER =
  'Napomena: Ovaj dokument je generisan uz pomoć AI alata i služi kao polazna osnova. Preporučuje se konsultacija sa pravnikom pre potpisivanja. aisistent.rs ne preuzima odgovornost za pravnu valjanost dokumenta.'

const FONTS_DIR = path.resolve(process.cwd(), 'public/fonts')
const PDF_LOGO_SRC = path.resolve(process.cwd(), 'public/logo/AIsistent-Logo_6003x180.png')
Font.register({ family: 'Roboto', src: `${FONTS_DIR}/Roboto-Regular.ttf` })
Font.register({ family: 'Roboto-Bold', src: `${FONTS_DIR}/Roboto-Bold.ttf` })
Font.register({ family: 'Roboto-Italic', src: `${FONTS_DIR}/Roboto-Italic.ttf` })
Font.register({ family: 'Roboto-BoldItalic', src: `${FONTS_DIR}/Roboto-BoldItalic.ttf` })

Font.registerHyphenationCallback(word => [word])

const MARGIN_H = 72
const PAGE_PAD_TOP = 60   // reserves space for fixed header (~30pt) + gap
const PAGE_PAD_BOT = 80   // reserves space for fixed footer (~40pt) + gap
const HEADER_TOP = 16
const FOOTER_BOTTOM = 18

const s = StyleSheet.create({
  page: {
    paddingTop: PAGE_PAD_TOP,
    paddingBottom: PAGE_PAD_BOT,
    paddingHorizontal: MARGIN_H,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.55,
    color: '#1a1a1a',
  },
  // ── Header: absolutely positioned so it doesn't push body content ──
  header: {
    position: 'absolute',
    top: HEADER_TOP,
    left: MARGIN_H,
    right: MARGIN_H,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLogo: { height: 16, width: 88, objectFit: 'contain' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerDate: { fontSize: 8, color: '#6b7280', fontFamily: 'Roboto' },
  headerConfidential: { fontFamily: 'Roboto-Bold', fontSize: 8, color: '#DC2626' },
  h1: {
    fontFamily: 'Roboto-Bold', fontSize: 16, textAlign: 'center',
    marginTop: 4, marginBottom: 12, color: '#111827',
  },
  h2: {
    fontFamily: 'Roboto-Bold', fontSize: 12,
    marginTop: 12, marginBottom: 4, color: '#111827',
  },
  h3: {
    fontFamily: 'Roboto-Bold', fontSize: 11,
    marginTop: 8, marginBottom: 3, color: '#111827',
  },
  paragraph: { fontFamily: 'Roboto', fontSize: 11, marginBottom: 5 },
  bullet: { fontFamily: 'Roboto', fontSize: 11, marginBottom: 3, paddingLeft: 12 },
  spacer: { marginBottom: 6 },
  table: { marginTop: 6, marginBottom: 10 },
  tableRow: { flexDirection: 'row' },
  tableHeaderCell: {
    backgroundColor: '#F3F4F6',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  tableCell: {
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 5,
  },
  tableCellText: { fontFamily: 'Roboto', fontSize: 10, lineHeight: 1.35 },
  tableCellTextBold: { fontFamily: 'Roboto-Bold', fontSize: 10, lineHeight: 1.35 },
  sigSection: { marginTop: 24 },
  sigIntro: { fontFamily: 'Roboto', fontSize: 11, marginBottom: 16, color: '#374151' },
  sigDateLine: { fontFamily: 'Roboto', fontSize: 11, marginTop: 8, marginBottom: 28 },
  sigRow: { flexDirection: 'row', marginBottom: 4 },
  sigCell: { flex: 1, fontFamily: 'Roboto', fontSize: 11 },
  sigCellBold: { flex: 1, fontFamily: 'Roboto-Bold', fontSize: 11 },
  sigLine: {
    borderBottomWidth: 0.5, borderBottomColor: '#1a1a1a',
    marginTop: 26, marginBottom: 4, marginRight: 24,
  },
  sigPechat: { fontFamily: 'Roboto', fontSize: 11, marginTop: 10 },
  // ── Footer: absolutely positioned so it doesn't overlap body content ──
  footer: {
    position: 'absolute',
    bottom: FOOTER_BOTTOM,
    left: MARGIN_H,
    right: MARGIN_H,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 5,
  },
  footerText: {
    fontSize: 9, color: '#9ca3af', fontFamily: 'Roboto', lineHeight: 1.4, textAlign: 'center',
  },
  footerWatermark: {
    fontSize: 8, color: '#CCCCCC', fontFamily: 'Roboto', textAlign: 'center', marginTop: 3,
  },
})

const INLINE_FONT: Record<InlineType, string> = {
  text: 'Roboto', bold: 'Roboto-Bold',
  italic: 'Roboto-Italic', 'bold-italic': 'Roboto-BoldItalic',
}

const SERBIAN_MONTHS = [
  'januara', 'februara', 'marta', 'aprila', 'maja', 'juna',
  'jula', 'avgusta', 'septembra', 'oktobra', 'novembra', 'decembra',
]

function serbianDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}. ${SERBIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}.`
}

function Spans({ spans }: { spans: InlineSpan[] }) {
  return (
    <>
      {spans.map((span, i) => (
        <Text key={i} style={{ fontFamily: INLINE_FONT[span.type] }}>{span.text}</Text>
      ))}
    </>
  )
}

function columnWidths(columnCount: number): string[] {
  if (columnCount === 2) return ['60%', '40%']
  return Array.from({ length: columnCount }, () => `${100 / columnCount}%`)
}

function cleanTableCell(cell: string): string {
  return cell.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
}

function isBoldTotalRow(row: string[], rowIndex: number, rows: string[][]): boolean {
  if (rowIndex !== rows.length - 1) return false
  return row.some(cell => /\*\*[^*]+\*\*/.test(cell) && /UKUPNO/i.test(cell))
}

function renderTable(block: Extract<Block, { type: 'table' }>, key: number) {
  const widths = columnWidths(block.headers.length)

  return (
    <View key={key} style={s.table} wrap={false}>
      <View style={s.tableRow}>
        {block.headers.map((header, i) => (
          <View key={i} style={[s.tableHeaderCell, { width: widths[i] }]}>
            <Text style={s.tableCellTextBold}>{cleanTableCell(header)}</Text>
          </View>
        ))}
      </View>
      {block.rows.map((row, rowIndex) => {
        const isTotal = isBoldTotalRow(row, rowIndex, block.rows)
        return (
          <View key={rowIndex} style={s.tableRow}>
            {block.headers.map((_, cellIndex) => (
              <View
                key={cellIndex}
                style={[
                  s.tableCell,
                  {
                    width: widths[cellIndex],
                    backgroundColor: isTotal ? '#F3F4F6' : rowIndex % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                  },
                ]}
              >
                <Text style={isTotal ? s.tableCellTextBold : s.tableCellText}>
                  {cleanTableCell(row[cellIndex] ?? '')}
                </Text>
              </View>
            ))}
          </View>
        )
      })}
    </View>
  )
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case 'h1': return <Text key={i} style={s.h1}><Spans spans={block.spans} /></Text>
    case 'h2': return <Text key={i} style={s.h2}><Spans spans={block.spans} /></Text>
    case 'h3': return <Text key={i} style={s.h3}><Spans spans={block.spans} /></Text>
    case 'bullet':
      return (
        <Text key={i} style={s.bullet}>
          <Text>{'• '}</Text><Spans spans={block.spans} />
        </Text>
      )
    case 'table': return renderTable(block, i)
    case 'separator': return <View key={i} style={{ marginBottom: 8 }} />
    case 'spacer': return <View key={i} style={s.spacer} />
    default: return <Text key={i} style={s.paragraph}><Spans spans={block.spans} /></Text>
  }
}

function renderBlocks(blocks: Block[]): React.ReactNode[] {
  const result: React.ReactNode[] = []
  let i = 0
  while (i < blocks.length) {
    const block = blocks[i]
    if (block.type === 'h2') {
      let j = i + 1
      while (j < blocks.length && blocks[j].type === 'spacer') j++
      if (j < blocks.length && blocks[j].type !== 'h1' && blocks[j].type !== 'h2') {
        result.push(
          <View key={`g${i}`} wrap={false}>
            {renderBlock(block, 0)}
            {blocks.slice(i + 1, j + 1).map((b, bi) => renderBlock(b, bi + 1))}
          </View>
        )
        i = j + 1
        continue
      }
    }
    result.push(renderBlock(block, i))
    i++
  }
  return result
}

// ---- Signature section ----

interface SigData {
  leftLabel: string
  leftOrg: string
  leftPerson: string
  rightLabel: string
  rightOrg: string
  rightPerson: string
  city: string
}

function buildSigData(documentType: string, d: Record<string, unknown>): SigData | null {
  const g = (k: string) => String(d[k] ?? '')
  switch (documentType) {
    case 'ugovor-o-radu':
      return {
        leftLabel: 'ZA POSLODAVCA', leftOrg: g('firma'),
        leftPerson: `${g('zastupnik')}, ${g('funkcija')}`,
        rightLabel: 'ZAPOSLENI', rightOrg: '',
        rightPerson: g('ime_prezime'),
        city: g('mesto_rada').split(',')[0].trim(),
      }
    case 'ugovor-o-delu':
      return {
        leftLabel: 'ZA NARUČIOCA', leftOrg: g('naziv_narucioca'),
        leftPerson: g('zastupnik_narucioca'),
        rightLabel: 'IZVOĐAČ', rightOrg: '',
        rightPerson: g('naziv_izvodjaca'), city: '',
      }
    case 'nda':
      return {
        leftLabel: 'PRVA STRANA', leftOrg: g('naziv_strane_1'),
        leftPerson: g('zastupnik_strane_1'),
        rightLabel: 'DRUGA STRANA', rightOrg: g('naziv_strane_2'),
        rightPerson: g('zastupnik_strane_2'), city: '',
      }
    case 'ugovor-o-zakupu':
      return {
        leftLabel: 'ZAKUPODAVAC', leftOrg: g('naziv_zakupodavca'),
        leftPerson: g('zastupnik_zakupodavca'),
        rightLabel: 'ZAKUPAC', rightOrg: g('naziv_zakupca'),
        rightPerson: g('zastupnik_zakupca'), city: '',
      }
    case 'ugovor-o-saradnji':
      if (String(d.tip_dokumenta) === 'Ugovor o zajmu') {
        return {
          leftLabel: 'ZAJMODAVAC', leftOrg: g('naziv_zajmodavca'), leftPerson: '',
          rightLabel: 'ZAJMOPRIMAC', rightOrg: g('naziv_zajmoprimca'), rightPerson: '', city: '',
        }
      }
      return {
        leftLabel: 'PRVA STRANA', leftOrg: g('naziv_1'), leftPerson: g('zastupnik_1'),
        rightLabel: 'DRUGA STRANA', rightOrg: g('naziv_2'), rightPerson: g('zastupnik_2'), city: '',
      }
    case 'punomocje':
      return {
        leftLabel: 'VLASTODAVAC', leftOrg: g('naziv_vlastodavca'),
        leftPerson: g('jmbg_pib_vlastodavca'),
        rightLabel: 'PUNOMOĆNIK', rightOrg: g('naziv_punomocnika'),
        rightPerson: g('jmbg_pib_punomocnika'), city: '',
      }
    case 'poslovni-mejl':
    case 'oglas-za-posao':
    case 'opsti-uslovi':
      return null
    case 'ponuda-klijentu':
      return {
        leftLabel: 'ZA PONUĐAČA', leftOrg: g('ponudjac_naziv'),
        leftPerson: g('kontakt_osoba'),
        rightLabel: 'ZA KLIJENTA', rightOrg: g('klijent_naziv'),
        rightPerson: '', city: '',
      }
    default:
      return {
        leftLabel: 'STRANA 1:', leftOrg: '', leftPerson: '',
        rightLabel: 'STRANA 2:', rightOrg: '', rightPerson: '', city: '',
      }
  }
}

function SignatureSection({ sig }: { sig: SigData }) {
  return (
    <View style={s.sigSection}>
      <Text style={s.sigIntro}>Ugovor potpisuju:</Text>
      <Text style={s.sigDateLine}>
        Mesto i datum potpisivanja: _______________
      </Text>
      <View style={s.sigRow}>
        <Text style={s.sigCellBold}>{sig.leftLabel}</Text>
        <Text style={s.sigCellBold}>{sig.rightLabel}</Text>
      </View>
      <View style={s.sigRow}>
        <Text style={s.sigCell}>{sig.leftOrg}</Text>
        <Text style={s.sigCell}>{sig.rightOrg}</Text>
      </View>
      <View style={s.sigRow}>
        <View style={[s.sigCell, s.sigLine]} />
        <View style={[s.sigCell, s.sigLine]} />
      </View>
      <View style={s.sigRow}>
        <Text style={s.sigCell}>{sig.leftPerson}</Text>
        <Text style={s.sigCell}>{sig.rightPerson}</Text>
      </View>
      <Text style={s.sigPechat}>M.P.</Text>
    </View>
  )
}

// ---- Main component ----

interface Props {
  generatedText: string
  documentTitle: string
  createdAt: string
  isFree: boolean
  inputData?: Record<string, unknown>
  documentType?: string
}

export function AisistentDocument({
  generatedText, documentTitle, createdAt, isFree, inputData, documentType,
}: Props) {
  const blocks = parseMarkdown(generatedText)
  const dateStr = serbianDate(createdAt)
  const blockNodes = renderBlocks(blocks)

  const sig = inputData && documentType ? buildSigData(documentType, inputData) : null
  const bodyNodes = sig && blockNodes.length > 0 ? blockNodes.slice(0, -1) : blockNodes
  const lastNode = sig && blockNodes.length > 0 ? blockNodes[blockNodes.length - 1] : null

  // POVERLJIVO stamp — NDA with oznacavanje === true
  const showConfidential =
    documentType === 'nda' &&
    (inputData?.oznacavanje === true || inputData?.oznacavanje === 'Da')
  const showPdfLogo = fs.existsSync(PDF_LOGO_SRC)

  return (
    <Document title={documentTitle} author="aisistent.rs" creator="aisistent.rs">
      <Page size="A4" style={s.page}>

        {/* Header — absolutely positioned, repeats on every page */}
        <View fixed style={s.header}>
          {showPdfLogo ? (
            <Image src={PDF_LOGO_SRC} style={s.headerLogo} />
          ) : (
            <Text style={{ fontFamily: 'Roboto-Bold', fontSize: 12, color: '#1d4ed8' }}>AIsistent</Text>
          )}
          <View style={s.headerRight}>
            {showConfidential && (
              <Text style={s.headerConfidential}>POVERLJIVO</Text>
            )}
            <Text style={s.headerDate}>{dateStr} · aisistent.rs</Text>
          </View>
        </View>

        {/* Body content */}
        {bodyNodes}

        {sig ? (
          <View wrap={false}>
            {lastNode}
            <SignatureSection sig={sig} />
          </View>
        ) : lastNode}

        {/* Footer — absolutely positioned, repeats on every page */}
        <View fixed style={s.footer}>
          <Text style={s.footerText}>{DISCLAIMER}</Text>
          {isFree && <Text style={s.footerWatermark}>BESPLATNA VERZIJA</Text>}
        </View>

      </Page>
    </Document>
  )
}
