import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

const DISCLAIMER =
  'Napomena: Ovaj dokument je generisan uz pomoć AI alata i služi kao polazna osnova. Preporučuje se konsultacija sa pravnikom pre potpisivanja. aisistent.rs ne preuzima odgovornost za pravnu valjanost dokumenta.'

Font.registerHyphenationCallback(word => [word])

const s = StyleSheet.create({
  page: {
    paddingTop: 72,
    paddingBottom: 72,
    paddingHorizontal: 64,
    fontFamily: 'Times-Roman',
    fontSize: 10.5,
    lineHeight: 1.55,
    color: '#1a1a1a',
  },
  // Fixed header View — no absolute positioning on this one
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLogo: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: '#1d4ed8',
  },
  headerDate: {
    fontSize: 9,
    color: '#6b7280',
    fontFamily: 'Helvetica',
    marginTop: 3,
  },
  sectionHeading: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    marginTop: 16,
    marginBottom: 4,
    color: '#111827',
  },
  paragraph: {
    marginBottom: 5,
  },
  // Footer — absolute View (safe when inside View)
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 64,
    right: 64,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7.5,
    color: '#9ca3af',
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    textAlign: 'center',
  },
  pageNum: {
    fontSize: 7.5,
    color: '#9ca3af',
    fontFamily: 'Helvetica',
    textAlign: 'right',
    marginTop: 3,
  },
  // Watermark — absolute View, text inside
  watermarkView: {
    position: 'absolute',
    left: 64,
    right: 64,
  },
  watermarkText: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#000000',
    opacity: 0.07,
    textAlign: 'center',
  },
})

const WATERMARK_TOPS = [90, 175, 260, 345, 430, 515, 600, 685]

function parseLines(text: string): { isHeading: boolean; text: string }[] {
  return text.split('\n').map(line => {
    const t = line.trim()
    const isHeading =
      /^[IVXLCDM]{1,6}\.\s/.test(t) ||
      /^UGOVOR\s+O\s+/i.test(t)
    return { isHeading, text: line }
  })
}

interface Props {
  generatedText: string
  documentTitle: string
  createdAt: string
  isFree: boolean
}

export function AisistentDocument({ generatedText, documentTitle, createdAt, isFree }: Props) {
  const lines = parseLines(generatedText)
  const dateStr = new Date(createdAt).toLocaleDateString('sr-RS', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Document title={documentTitle} author="aisistent.rs" creator="aisistent.rs">
      <Page size="A4" style={s.page}>

        {/* Watermark — fixed Views with Text inside, no text-level absolute */}
        {isFree && WATERMARK_TOPS.map(top => (
          <View key={top} style={[s.watermarkView, { top }]} fixed>
            <Text style={s.watermarkText}>aisistent.rs — upgradeuj na Pro</Text>
          </View>
        ))}

        {/* Header — fixed View, no absolute positioning */}
        <View style={s.header} fixed>
          <Text style={s.headerLogo}>AIsistent</Text>
          <Text style={s.headerDate}>{dateStr} · aisistent.rs</Text>
        </View>

        {/* Content */}
        {lines.map((line, i) => {
          if (line.text.trim() === '' || line.text.trim() === '---') {
            return <Text key={i} style={{ marginBottom: 3 }}> </Text>
          }
          if (line.isHeading) {
            return <Text key={i} style={s.sectionHeading}>{line.text.trim()}</Text>
          }
          return <Text key={i} style={s.paragraph}>{line.text}</Text>
        })}

        {/* Footer — fixed absolute View (no render prop — causes yoga overflow) */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{DISCLAIMER}</Text>
        </View>

      </Page>
    </Document>
  )
}
