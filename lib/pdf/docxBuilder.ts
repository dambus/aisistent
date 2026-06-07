import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import { type Block, type InlineSpan, parseMarkdown } from './markdownParser'

const DISCLAIMER =
  'Napomena: Ovaj dokument je generisan uz pomoć AI alata i služi kao polazna osnova. Preporučuje se konsultacija sa pravnikom pre potpisivanja. aisistent.rs ne preuzima odgovornost za pravnu valjanost dokumenta.'

const FONT_FAMILY = 'Times New Roman'
const BODY_SIZE = 22
const SECTION_SIZE = 24
const TITLE_SIZE = 32
const FOOTER_SIZE = 18
const HEADER_SIZE = 18
const MARGIN_TWIPS = 1417

interface BuildDocxOptions {
  documentType?: string
  inputData?: Record<string, unknown>
  isFree?: boolean
}

interface SigData {
  leftLabel: string
  leftOrg: string
  leftPerson: string
  rightLabel: string
  rightOrg: string
  rightPerson: string
  city: string
}

function serbianDate(iso: string): string {
  const d = new Date(iso)
  const months = [
    'januara', 'februara', 'marta', 'aprila', 'maja', 'juna',
    'jula', 'avgusta', 'septembra', 'oktobra', 'novembra', 'decembra',
  ]
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`
}

function sanitizeGeneratedText(text: string): string {
  const lines: string[] = []

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (/POTPISI/i.test(line)) break
    if (/VAŽNE NAPOMENE ZA POSLODAVCA/i.test(line) || /NAPOMENE ZA POSLODAVCA/i.test(line)) break
    lines.push(raw)
  }

  return lines.join('\n')
}

function buildSigData(documentType: string, d: Record<string, unknown>): SigData | null {
  const g = (k: string) => String(d[k] ?? '')

  switch (documentType) {
    case 'ugovor-o-radu':
      return {
        leftLabel: 'Za POSLODAVCA:',
        leftOrg: g('firma'),
        leftPerson: `${g('zastupnik')}${g('funkcija') ? `, ${g('funkcija')}` : ''}`,
        rightLabel: 'ZAPOSLENI:',
        rightOrg: '',
        rightPerson: g('ime_prezime'),
        city: g('mesto_rada').split(',')[0].trim(),
      }
    case 'ugovor-o-delu':
      return {
        leftLabel: 'Za NARUČIOCA:',
        leftOrg: g('naziv_narucioca'),
        leftPerson: g('zastupnik_narucioca'),
        rightLabel: 'IZVOĐAČ:',
        rightOrg: '',
        rightPerson: g('naziv_izvodjaca'),
        city: '',
      }
    case 'nda':
      return {
        leftLabel: 'PRVA STRANA:',
        leftOrg: g('naziv_strane_1'),
        leftPerson: g('zastupnik_strane_1'),
        rightLabel: 'DRUGA STRANA:',
        rightOrg: g('naziv_strane_2'),
        rightPerson: g('zastupnik_strane_2'),
        city: '',
      }
    case 'ugovor-o-zakupu':
      return {
        leftLabel: 'ZAKUPODAVAC:',
        leftOrg: g('naziv_zakupodavca'),
        leftPerson: g('zastupnik_zakupodavca'),
        rightLabel: 'ZAKUPAC:',
        rightOrg: g('naziv_zakupca'),
        rightPerson: g('zastupnik_zakupca'),
        city: '',
      }
    case 'ugovor-o-saradnji':
      if (String(d.tip_dokumenta) === 'Ugovor o zajmu') {
        return {
          leftLabel: 'ZAJMODAVAC:',
          leftOrg: g('naziv_zajmodavca'),
          leftPerson: '',
          rightLabel: 'ZAJMOPRIMAC:',
          rightOrg: g('naziv_zajmoprimca'),
          rightPerson: '',
          city: '',
        }
      }

      return {
        leftLabel: 'PRVA STRANA:',
        leftOrg: g('naziv_1'),
        leftPerson: g('zastupnik_1'),
        rightLabel: 'DRUGA STRANA:',
        rightOrg: g('naziv_2'),
        rightPerson: g('zastupnik_2'),
        city: '',
      }
    case 'punomocje':
      return {
        leftLabel: 'VLASTODAVAC:', leftOrg: g('naziv_vlastodavca'),
        leftPerson: g('jmbg_pib_vlastodavca'),
        rightLabel: 'PUNOMOĆNIK:', rightOrg: g('naziv_punomocnika'),
        rightPerson: g('jmbg_pib_punomocnika'), city: '',
      }
    case 'poslovni-mejl':
    case 'oglas-za-posao':
    case 'opsti-uslovi':
      return null
    case 'ponuda-klijentu':
      return {
        leftLabel: 'PONUĐAČ:', leftOrg: g('ponudjac_naziv'),
        leftPerson: g('kontakt_osoba'),
        rightLabel: 'Za klijenta:', rightOrg: g('klijent_naziv'),
        rightPerson: '', city: '',
      }
    default:
      return {
        leftLabel: 'STRANA 1:',
        leftOrg: '',
        leftPerson: '',
        rightLabel: 'STRANA 2:',
        rightOrg: '',
        rightPerson: '',
        city: '',
      }
  }
}

function spanToRun(span: InlineSpan): TextRun {
  return new TextRun({
    text: span.text,
    font: FONT_FAMILY,
    size: BODY_SIZE,
    bold: span.type === 'bold' || span.type === 'bold-italic',
    italics: span.type === 'italic' || span.type === 'bold-italic',
  })
}

function spansToRuns(spans: InlineSpan[]): TextRun[] {
  return spans.map(spanToRun)
}

function markdownTableColumnWidths(columnCount: number): number[] {
  if (columnCount === 2) return [60, 40]
  return Array.from({ length: columnCount }, () => 100 / columnCount)
}

function cleanMarkdownTableCell(cell: string): string {
  return cell.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
}

function isBoldTotalRow(row: string[], rowIndex: number, rows: string[][]): boolean {
  if (rowIndex !== rows.length - 1) return false
  return row.some(cell => /\*\*[^*]+\*\*/.test(cell) && /UKUPNO/i.test(cell))
}

function markdownTableBorders() {
  return {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'E5E7EB' },
  }
}

function markdownTableCell(text: string, width: number, options: { bold?: boolean; fill?: string } = {}): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: options.fill ? { fill: options.fill } : undefined,
    borders: markdownTableBorders(),
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: cleanMarkdownTableCell(text),
            font: FONT_FAMILY,
            size: 20,
            bold: options.bold,
          }),
        ],
      }),
    ],
  })
}

function markdownTableToTable(block: Extract<Block, { type: 'table' }>): Table {
  const widths = markdownTableColumnWidths(block.headers.length)

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: block.headers.map((header, i) =>
          markdownTableCell(header, widths[i], { bold: true, fill: 'F3F4F6' })
        ),
      }),
      ...block.rows.map((row, rowIndex) => {
        const isTotal = isBoldTotalRow(row, rowIndex, block.rows)
        return new TableRow({
          children: block.headers.map((_, cellIndex) =>
            markdownTableCell(row[cellIndex] ?? '', widths[cellIndex], {
              bold: isTotal,
              fill: isTotal ? 'F3F4F6' : rowIndex % 2 === 0 ? 'FFFFFF' : 'FAFAFA',
            })
          ),
        })
      }),
    ],
  })
}

function blockToDocxChild(block: Block): Paragraph | Table {
  switch (block.type) {
    case 'h1':
      return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 220 },
        children: block.spans.map(span => new TextRun({
          text: span.text,
          font: FONT_FAMILY,
          size: TITLE_SIZE,
          bold: true,
        })),
      })
    case 'h2':
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        children: block.spans.map(span => new TextRun({
          text: span.text,
          font: FONT_FAMILY,
          size: SECTION_SIZE,
          bold: true,
        })),
      })
    case 'h3':
      return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 60 },
        children: block.spans.map(span => new TextRun({
          text: span.text,
          font: FONT_FAMILY,
          size: BODY_SIZE,
          bold: true,
        })),
      })
    case 'bullet':
      return new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 80, line: 360 },
        children: spansToRuns(block.spans),
      })
    case 'spacer':
    case 'separator':
      return new Paragraph({ spacing: { after: 80 } })
    case 'table':
      return markdownTableToTable(block)
    default:
      return new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 80, line: 360 },
        children: spansToRuns(block.spans),
      })
  }
}

function signatureCell(children: Paragraph[]): TableCell {
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    children,
  })
}

function lineParagraph(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1A1A1A' } },
    spacing: { before: 240, after: 40 },
    children: [new TextRun({ text: ' ', font: FONT_FAMILY, size: BODY_SIZE })],
  })
}

function signatureText(text: string, bold = false, color?: string): Paragraph {
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({
        text,
        font: FONT_FAMILY,
        size: BODY_SIZE,
        bold,
        color,
      }),
    ],
  })
}

function buildSignatureTable(documentType?: string, inputData?: Record<string, unknown>): Table | null {
  if (!documentType || !inputData) return null

  const sig = buildSigData(documentType, inputData)
  if (!sig) return null

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    },
    rows: [
      new TableRow({
        children: [
          signatureCell([signatureText(sig.leftLabel, true)]),
          signatureCell([signatureText(sig.rightLabel, true)]),
        ],
      }),
      new TableRow({
        children: [
          signatureCell([signatureText(sig.leftOrg)]),
          signatureCell([signatureText(sig.rightOrg)]),
        ],
      }),
      new TableRow({
        children: [
          signatureCell([lineParagraph()]),
          signatureCell([lineParagraph()]),
        ],
      }),
      new TableRow({
        children: [
          signatureCell([signatureText(sig.leftPerson)]),
          signatureCell([signatureText(sig.rightPerson)]),
        ],
      }),
      new TableRow({
        children: [
          signatureCell([signatureText('M.P.')]),
          signatureCell([new Paragraph({})]),
        ],
      }),
    ],
  })
}

export async function buildDocx(
  generatedText: string,
  documentTitle: string,
  createdAt: string,
  options: BuildDocxOptions = {},
): Promise<Buffer> {
  const dateStr = serbianDate(createdAt)
  const safeText = sanitizeGeneratedText(generatedText)
  const blocks = parseMarkdown(safeText)
  const bodyChildren = blocks.map(blockToDocxChild)

  const signatureTable = buildSignatureTable(options.documentType, options.inputData)

  const children: (Paragraph | Table)[] = [
    ...bodyChildren,
  ]

  if (signatureTable) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sig = buildSigData(options.documentType ?? '', options.inputData ?? {})!
    children.push(
      new Paragraph({
        spacing: { before: 260, after: 80 },
        children: [new TextRun({ text: 'Ugovor potpisuju:', font: FONT_FAMILY, size: BODY_SIZE, color: '6B7280' })],
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: `Mesto i datum potpisivanja: ${sig.city ? `${sig.city}, ` : ''}_______________`,
            font: FONT_FAMILY,
            size: BODY_SIZE,
          }),
        ],
      }),
      signatureTable,
    )
  }

  const footerChildren = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: 'E5E7EB' },
      },
      spacing: { before: 120, after: 40 },
      children: [
        new TextRun({
          text: DISCLAIMER,
          font: FONT_FAMILY,
          size: FOOTER_SIZE,
          color: '9CA3AF',
        }),
      ],
    }),
  ]

  if (options.isFree) {
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'BESPLATNA VERZIJA',
            font: FONT_FAMILY,
            size: FOOTER_SIZE,
            color: 'CCCCCC',
          }),
        ],
      }),
    )
  }

  const doc = new Document({
    title: documentTitle,
    creator: 'aisistent.rs',
    description: 'Generisano na aisistent.rs',
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: {
            font: FONT_FAMILY,
            size: BODY_SIZE,
          },
          paragraph: {
            spacing: { after: 80, line: 360 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_TWIPS,
              right: MARGIN_TWIPS,
              bottom: MARGIN_TWIPS,
              left: MARGIN_TWIPS,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: `AIsistent  |  ${dateStr}  |  aisistent.rs`,
                    font: FONT_FAMILY,
                    size: HEADER_SIZE,
                    color: '6B7280',
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: footerChildren,
          }),
        },
        children,
      },
    ],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
