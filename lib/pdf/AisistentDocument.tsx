import React from 'react'
import path from 'path'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { parseMarkdown, Block, InlineSpan, InlineType } from './markdownParser'

const DISCLAIMER =
  'Napomena: Ovaj dokument je generisan uz pomoć AI alata i služi kao polazna osnova. Preporučuje se konsultacija sa pravnikom pre potpisivanja. aisistent.rs ne preuzima odgovornost za pravnu valjanost dokumenta.'

const FONTS_DIR = path.resolve(process.cwd(), 'public/fonts')
Font.register({ family: 'Roboto', src: `${FONTS_DIR}/Roboto-Regular.ttf` })
Font.register({ family: 'Roboto-Bold', src: `${FONTS_DIR}/Roboto-Bold.ttf` })
Font.register({ family: 'Roboto-Italic', src: `${FONTS_DIR}/Roboto-Italic.ttf` })
Font.register({ family: 'Roboto-BoldItalic', src: `${FONTS_DIR}/Roboto-BoldItalic.ttf` })

Font.registerHyphenationCallback(word => [word])

const MARGIN_H = 71   // 2.5cm horizontal
const MARGIN_V_TOP = 43  // 1.5cm top
const MARGIN_V_BOT = 71  // 2.5cm bottom

const s = StyleSheet.create({
  page: {
    paddingTop: MARGIN_V_TOP,
    paddingBottom: MARGIN_V_BOT,
    paddingHorizontal: MARGIN_H,
    fontFamily: 'Roboto',
    fontSize: 11,
    lineHeight: 1.55,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLogo: {
    fontFamily: 'Roboto-Bold',
    fontSize: 12,
    color: '#1d4ed8',
  },
  headerDate: {
    fontSize: 8,
    color: '#6b7280',
    fontFamily: 'Roboto',
  },
  h1: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
    color: '#111827',
  },
  h2: {
    fontFamily: 'Roboto-Bold',
    fontSize: 12,
    marginTop: 12,
    marginBottom: 4,
    color: '#111827',
  },
  paragraph: {
    fontFamily: 'Roboto',
    fontSize: 11,
    marginBottom: 5,
  },
  bullet: {
    fontFamily: 'Roboto',
    fontSize: 11,
    marginBottom: 3,
    paddingLeft: 12,
  },
  spacer: {
    marginBottom: 6,
  },
  // Signature section
  sigSection: {
    marginTop: 24,
  },
  sigDateLine: {
    fontFamily: 'Roboto',
    fontSize: 11,
    marginTop: 8,
    marginBottom: 28,
  },
  sigRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  sigCell: {
    flex: 1,
    fontFamily: 'Roboto',
    fontSize: 11,
  },
  sigCellBold: {
    flex: 1,
    fontFamily: 'Roboto-Bold',
    fontSize: 11,
  },
  sigLine: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#1a1a1a',
    marginTop: 26,
    marginBottom: 4,
    marginRight: 24,
  },
  sigPechat: {
    fontFamily: 'Roboto',
    fontSize: 11,
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: MARGIN_H,
    right: MARGIN_H,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 5,
  },
  footerText: {
    fontSize: 9,
    color: '#9ca3af',
    fontFamily: 'Roboto',
    lineHeight: 1.4,
    textAlign: 'center',
  },
  footerWatermark: {
    fontSize: 8,
    color: '#CCCCCC',
    fontFamily: 'Roboto',
    textAlign: 'center',
    marginTop: 3,
  },
})

const INLINE_FONT: Record<InlineType, string> = {
  text: 'Roboto',
  bold: 'Roboto-Bold',
  italic: 'Roboto-Italic',
  'bold-italic': 'Roboto-BoldItalic',
}

const SERBIAN_MONTHS = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar',
]

function serbianDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}. ${SERBIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}.`
}

function Spans({ spans }: { spans: InlineSpan[] }) {
  return (
    <>
      {spans.map((span, i) => (
        <Text key={i} style={{ fontFamily: INLINE_FONT[span.type] }}>
          {span.text}
        </Text>
      ))}
    </>
  )
}

function renderBlock(block: Block, i: number) {
  switch (block.type) {
    case 'h1':
      return <Text key={i} style={s.h1}><Spans spans={block.spans} /></Text>
    case 'h2':
      return <Text key={i} style={s.h2}><Spans spans={block.spans} /></Text>
    case 'bullet':
      return (
        <Text key={i} style={s.bullet}>
          <Text>{'• '}</Text>
          <Spans spans={block.spans} />
        </Text>
      )
    case 'separator':
      return <View key={i} style={{ marginBottom: 8 }} />
    case 'spacer':
      return <View key={i} style={s.spacer} />
    default:
      return <Text key={i} style={s.paragraph}><Spans spans={block.spans} /></Text>
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

// Hardcoded signature section built from form input_data — never from AI text
function SignatureSection({ inputData, createdAt }: {
  inputData: Record<string, unknown>
  createdAt: string
}) {
  const firma = String(inputData.firma ?? '')
  const zastupnik = String(inputData.zastupnik ?? '')
  const funkcija = String(inputData.funkcija ?? '')
  const imePrezime = String(inputData.ime_prezime ?? '')
  const city = String(inputData.mesto_rada ?? '').split(',')[0].trim()

  return (
    <View style={s.sigSection} wrap={false}>
      <Text style={s.h2}>POTPISI I PEČATI</Text>

      <Text style={s.sigDateLine}>
        Mesto i datum potpisivanja: {city}, _______________
      </Text>

      {/* Labels */}
      <View style={s.sigRow}>
        <Text style={s.sigCellBold}>Za POSLODAVCA:</Text>
        <Text style={s.sigCellBold}>ZAPOSLENI/ZAPOSLENA:</Text>
      </View>

      {/* Firma name (left only) */}
      <View style={s.sigRow}>
        <Text style={s.sigCell}>{firma}</Text>
        <Text style={s.sigCell}> </Text>
      </View>

      {/* Signature lines */}
      <View style={s.sigRow}>
        <View style={[s.sigCell, s.sigLine]} />
        <View style={[s.sigCell, s.sigLine]} />
      </View>

      {/* Names */}
      <View style={s.sigRow}>
        <Text style={s.sigCell}>{zastupnik}, {funkcija}</Text>
        <Text style={s.sigCell}>{imePrezime}</Text>
      </View>

      {/* M.P. */}
      <Text style={s.sigPechat}>M.P.</Text>
    </View>
  )
}

interface Props {
  generatedText: string
  documentTitle: string
  createdAt: string
  isFree: boolean
  inputData?: Record<string, unknown>
}

export function AisistentDocument({ generatedText, documentTitle, createdAt, isFree, inputData }: Props) {
  const blocks = parseMarkdown(generatedText)
  const dateStr = serbianDate(createdAt)

  return (
    <Document title={documentTitle} author="aisistent.rs" creator="aisistent.rs">
      <Page size="A4" style={s.page}>

        <View style={s.header} fixed>
          <Text style={s.headerLogo}>AIsistent</Text>
          <Text style={s.headerDate}>{dateStr} · aisistent.rs</Text>
        </View>

        {renderBlocks(blocks)}

        {inputData && (
          <SignatureSection inputData={inputData} createdAt={createdAt} />
        )}

        <View
          fixed
          style={s.footer}
          render={() => (
            <>
              <Text style={s.footerText}>{DISCLAIMER}</Text>
              {isFree && <Text style={s.footerWatermark}>BESPLATNA VERZIJA</Text>}
            </>
          )}
        />

      </Page>
    </Document>
  )
}
