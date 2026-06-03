import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Footer,
  Packer,
  BorderStyle,
} from 'docx'

const DISCLAIMER =
  'Napomena: Ovaj dokument je generisan uz pomoć AI alata i služi kao polazna osnova. Preporučuje se konsultacija sa pravnikom pre potpisivanja. aisistent.rs ne preuzima odgovornost za pravnu valjanost dokumenta.'

function parseLines(text: string): { isTitle: boolean; isHeading: boolean; text: string }[] {
  return text.split('\n').map(line => {
    const trimmed = line.trim()
    const isTitle = /^UGOVOR\s+O\s+/i.test(trimmed) || /^NDA/i.test(trimmed)
    const isHeading = !isTitle && /^[IVXLCDM]{1,6}\.\s/.test(trimmed)
    return { isTitle, isHeading, text: line }
  })
}

export async function buildDocx(
  generatedText: string,
  documentTitle: string,
  createdAt: string,
): Promise<Buffer> {
  const lines = parseLines(generatedText)
  const dateStr = new Date(createdAt).toLocaleDateString('sr-RS', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const children: Paragraph[] = [
    // Datum u header area
    new Paragraph({
      children: [new TextRun({ text: `Datum generisanja: ${dateStr} · aisistent.rs`, size: 18, color: '6B7280' })],
      alignment: AlignmentType.RIGHT,
      spacing: { after: 320 },
    }),
  ]

  for (const line of lines) {
    const trimmed = line.text.trim()

    if (trimmed === '' || trimmed === '---') {
      children.push(new Paragraph({ spacing: { after: 80 } }))
      continue
    }

    if (line.isTitle) {
      children.push(
        new Paragraph({
          text: trimmed,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 240 },
        }),
      )
      continue
    }

    if (line.isHeading) {
      children.push(
        new Paragraph({
          text: trimmed,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 },
        }),
      )
      continue
    }

    children.push(
      new Paragraph({
        children: [new TextRun({ text: line.text, size: 22 })],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 80, line: 360 },
      }),
    )
  }

  const doc = new Document({
    title: documentTitle,
    creator: 'aisistent.rs',
    description: 'Generisano na aisistent.rs',
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: DISCLAIMER,
                    size: 16,
                    color: '9CA3AF',
                    italics: true,
                  }),
                ],
                border: {
                  top: { style: BorderStyle.SINGLE, size: 6, color: 'E5E7EB' },
                },
                spacing: { before: 120 },
              }),
            ],
          }),
        },
        children,
      },
    ],
  })

  return Buffer.from(await Packer.toBuffer(doc))
}
