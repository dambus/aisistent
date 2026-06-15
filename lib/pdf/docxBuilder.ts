import sizeOf from 'image-size'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
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

interface CompanyData {
  naziv: string
  pib: string | null
  adresa: string | null
  grad: string | null
}

interface BuildDocxOptions {
  documentType?: string
  inputData?: Record<string, unknown>
  isFree?: boolean
  logoBuffer?: Buffer | null
  logoMimeType?: string
  companyData?: CompanyData | null
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
    if (/^#{0,3}\s*POTPISI\s*$/im.test(line)) break
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
        leftLabel: 'ZA POSLODAVCA',
        leftOrg: g('firma'),
        leftPerson: `${g('zastupnik')}${g('funkcija') ? `, ${g('funkcija')}` : ''}`,
        rightLabel: 'ZAPOSLENI',
        rightOrg: '',
        rightPerson: g('ime_prezime'),
        city: g('mesto_rada').split(',')[0].trim(),
      }
    case 'ugovor-o-delu':
      return {
        leftLabel: 'ZA NARUČIOCA',
        leftOrg: g('naziv_narucioca'),
        leftPerson: g('zastupnik_narucioca'),
        rightLabel: 'IZVOĐAČ',
        rightOrg: g('naziv_izvodjaca'),
        rightPerson: g('zastupnik_izvodjaca') || '',
        city: '',
      }
    case 'nda':
      return {
        leftLabel: 'PRVA STRANA',
        leftOrg: g('naziv_strane_1'),
        leftPerson: g('zastupnik_strane_1'),
        rightLabel: 'DRUGA STRANA',
        rightOrg: g('naziv_strane_2'),
        rightPerson: g('zastupnik_strane_2'),
        city: '',
      }
    case 'ugovor-o-zakupu':
      return {
        leftLabel: 'ZAKUPODAVAC',
        leftOrg: g('naziv_zakupodavca'),
        leftPerson: g('zastupnik_zakupodavca'),
        rightLabel: 'ZAKUPAC',
        rightOrg: g('naziv_zakupca'),
        rightPerson: g('zastupnik_zakupca'),
        city: '',
      }
    case 'ugovor-o-saradnji':
      if (String(d.tip_dokumenta) === 'Ugovor o zajmu') {
        return {
          leftLabel: 'ZAJMODAVAC',
          leftOrg: g('naziv_zajmodavca'),
          leftPerson: '',
          rightLabel: 'ZAJMOPRIMAC',
          rightOrg: g('naziv_zajmoprimca'),
          rightPerson: '',
          city: '',
        }
      }

      return {
        leftLabel: 'PRVA STRANA',
        leftOrg: g('naziv_1'),
        leftPerson: g('zastupnik_1'),
        rightLabel: 'DRUGA STRANA',
        rightOrg: g('naziv_2'),
        rightPerson: g('zastupnik_2'),
        city: '',
      }
    case 'punomocje':
      return {
        leftLabel: 'VLASTODAVAC', leftOrg: g('naziv_vlastodavca'),
        leftPerson: '',
        rightLabel: 'PUNOMOĆNIK', rightOrg: g('naziv_punomocnika'),
        rightPerson: '', city: '',
      }
    case 'poslovni-mejl':
    case 'oglas-za-posao':
    case 'opsti-uslovi':
    case 'odgovor-kandidatu':
    case 'opis-proizvoda':
    case 'bio-o-nama':
    case 'zapisnik-sastanak':
      return null
    case 'resenje-godisnji-odmor':
      return {
        leftLabel: 'ZA POSLODAVCA', leftOrg: g('naziv_firme'),
        leftPerson: `${g('zastupnik')}, ${g('funkcija')}`,
        rightLabel: 'ZAPOSLENI', rightOrg: '',
        rightPerson: g('ime_prezime'), city: '',
      }
    case 'pravilnik-o-radu':
      return {
        leftLabel: 'ZA POSLODAVCA', leftOrg: g('naziv_firme'),
        leftPerson: g('zastupnik'),
        rightLabel: '', rightOrg: '', rightPerson: '', city: '',
      }
    case 'preporuka':
      return {
        leftLabel: g('pozicija_preporucioca'), leftOrg: g('naziv_firme'),
        leftPerson: g('ime_preporucioca'),
        rightLabel: '', rightOrg: '', rightPerson: '', city: '',
      }
    case 'zapisnik-sastanak':
      return {
        leftLabel: 'PREDSEDAVAJUĆI', leftOrg: g('naziv_firme'),
        leftPerson: g('predsedavajuci'),
        rightLabel: '', rightOrg: '', rightPerson: '', city: '',
      }
    case 'ponuda-klijentu':
      return {
        leftLabel: 'ZA PONUĐAČA', leftOrg: g('ponudjac_naziv'),
        leftPerson: g('kontakt_osoba'),
        rightLabel: 'ZA KLIJENTA', rightOrg: g('klijent_naziv'),
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
        spacing: { before: 240, after: 120 },
        children: block.spans.map(span => new TextRun({
          text: span.text,
          font: FONT_FAMILY,
          size: TITLE_SIZE,
          bold: true,
          color: '000000',
        })),
      })
    case 'h2':
      return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: block.spans.map(span => new TextRun({
          text: span.text,
          font: FONT_FAMILY,
          size: SECTION_SIZE,
          bold: true,
          color: '000000',
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
        spacing: { after: 80, line: 240 },
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
        spacing: { after: 80, line: 240 },
        children: spansToRuns(block.spans),
      })
  }
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

  const singleColumn = sig.rightLabel === ''

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  }

  if (singleColumn) {
    const halfCell = (children: Paragraph[]) => new TableCell({
      width: { size: 50, type: WidthType.PERCENTAGE },
      borders: noBorders,
      children,
    })
    const emptyCell = () => new TableCell({
      width: { size: 50, type: WidthType.PERCENTAGE },
      borders: noBorders,
      children: [new Paragraph({})],
    })
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      borders: noBorders,
      rows: [
        new TableRow({ children: [halfCell([signatureText(sig.leftLabel, true)]), emptyCell()] }),
        new TableRow({ children: [halfCell([signatureText(sig.leftOrg)]), emptyCell()] }),
        new TableRow({ children: [halfCell([lineParagraph()]), emptyCell()] }),
        new TableRow({ children: [halfCell([signatureText(sig.leftPerson)]), emptyCell()] }),
        new TableRow({ children: [halfCell([signatureText('M.P.')]), emptyCell()] }),
      ],
    })
  }

  const leftCell = (children: Paragraph[]) => new TableCell({
    width: { size: 45, type: WidthType.PERCENTAGE },
    borders: noBorders,
    children,
  })
  const spacerCell = () => new TableCell({
    width: { size: 10, type: WidthType.PERCENTAGE },
    borders: noBorders,
    children: [new Paragraph({})],
  })
  const rightCell = (children: Paragraph[]) => new TableCell({
    width: { size: 45, type: WidthType.PERCENTAGE },
    borders: noBorders,
    children,
  })

  const UNDERSCORE = '_________________________________'
  const hasMP = ['ZA POSLODAVCA', 'NARUČILAC', 'ZA NARUČIOCA', 'VLASTODAVAC', 'ZAKUPODAVAC', 'PRVA STRANA']
    .some(label => (sig.leftLabel ?? '').toUpperCase().includes(label.replace('ZA ', '')))

  const rows = [
    new TableRow({ children: [leftCell([signatureText(sig.leftLabel, true)]), spacerCell(), rightCell([signatureText(sig.rightLabel, true)])] }),
    new TableRow({ children: [leftCell([signatureText(sig.leftOrg)]), spacerCell(), rightCell([signatureText(sig.rightOrg)])] }),
    new TableRow({ children: [leftCell([signatureText(UNDERSCORE)]), spacerCell(), rightCell([signatureText(UNDERSCORE)])] }),
    new TableRow({ children: [leftCell([signatureText(sig.leftPerson)]), spacerCell(), rightCell([signatureText(sig.rightPerson)])] }),
  ]

  if (hasMP) {
    rows.push(new TableRow({ children: [leftCell([signatureText('M.P.')]), spacerCell(), rightCell([new Paragraph({})])] }))
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: noBorders,
    rows,
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
  // Ukloni trailing spacere i heading-e bez sadržaja
  while (blocks.length > 0) {
    const last = blocks[blocks.length - 1]
    if (last.type === 'spacer' || last.type === 'separator') {
      blocks.pop()
    } else if (last.type === 'h1' || last.type === 'h2' || last.type === 'h3') {
      blocks.pop()
    } else {
      break
    }
  }
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
            text: 'Mesto i datum potpisivanja: _______________',
            font: FONT_FAMILY,
            size: BODY_SIZE,
          }),
        ],
      }),
      new Paragraph({ text: '', spacing: { after: 120 } }),
      new Paragraph({ text: '', spacing: { after: 120 } }),
      signatureTable,
    )
  }

  const footerChildren: Paragraph[] = []

  if (options.companyData) {
    const cd = options.companyData
    const parts: string[] = [cd.naziv]
    if (cd.pib) parts.push(`PIB: ${cd.pib}`)
    const location = [cd.adresa, cd.grad].filter(Boolean).join(', ')
    if (location) parts.push(location)
    footerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.SINGLE, size: 6, color: 'E5E7EB' },
        },
        spacing: { before: 120, after: 40 },
        children: [
          new TextRun({
            text: parts.join(' · '),
            font: FONT_FAMILY,
            size: 16,
            color: '6B7280',
          }),
        ],
      }),
    )
  }

  footerChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: options.companyData ? undefined : {
        top: { style: BorderStyle.SINGLE, size: 6, color: 'E5E7EB' },
      },
      spacing: options.companyData ? { after: 40 } : { before: 120, after: 40 },
      children: [
        new TextRun({
          text: DISCLAIMER,
          font: FONT_FAMILY,
          size: options.companyData ? 14 : FOOTER_SIZE,
          color: '9CA3AF',
        }),
      ],
    }),
  )

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
            spacing: { after: 80, line: 240 },
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
                alignment: (options.logoBuffer && options.logoMimeType !== 'image/svg+xml') ? AlignmentType.LEFT : AlignmentType.CENTER,
                spacing: { after: 120 },
                children: options.logoBuffer && options.logoMimeType !== 'image/svg+xml'
                  ? (() => {
                      const dims = sizeOf(options.logoBuffer!)
                      const srcW = dims.width ?? 120
                      const srcH = dims.height ?? 36
                      const scale = 36 / srcH
                      const finalWidth = Math.round(srcW * scale)
                      const imgType = (options.logoMimeType === 'image/png' ? 'png'
                        : options.logoMimeType === 'image/webp' ? 'png'
                        : 'jpg') as 'png' | 'jpg'
                      return [new ImageRun({
                        data: options.logoBuffer!,
                        transformation: { width: finalWidth, height: 36 },
                        type: imgType,
                      })]
                    })()

                  : [
                      new TextRun({
                        text: options.logoBuffer
                          ? dateStr
                          : `AIsistent  |  ${dateStr}  |  aisistent.rs`,
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
