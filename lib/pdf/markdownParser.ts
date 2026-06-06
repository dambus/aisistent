export type InlineType = 'text' | 'bold' | 'italic' | 'bold-italic'

export interface InlineSpan {
  type: InlineType
  text: string
}

export type BlockType = 'h1' | 'h2' | 'paragraph' | 'bullet' | 'separator' | 'spacer' | 'table'
export type TextBlockType = Exclude<BlockType, 'table'>

export interface TextBlock {
  type: TextBlockType
  spans: InlineSpan[]
}

export interface TableBlock {
  type: 'table'
  headers: string[]
  rows: string[][]
}

export type Block = TextBlock | TableBlock

// Roman numeral section headings emitted without ## prefix (e.g. "I. Podaci o stranama")
const ROMAN_RE = /^[IVXLCDM]{1,6}\.\s/

function parseInline(text: string): InlineSpan[] {
  // U+2060 Word Joiner between f+i and f+l — invisible, prevents OpenType ligatures
  const WJ = '⁠'
  const t = text.replace(/fi/g, `f${WJ}i`).replace(/fl/g, `f${WJ}l`)

  const spans: InlineSpan[] = []
  const re = /\*{3}([^*]+)\*{3}|\*{2}([^*]+)\*{2}|\*([^*]+)\*/g
  let last = 0
  let m: RegExpExecArray | null

  while ((m = re.exec(t)) !== null) {
    if (m.index > last) {
      spans.push({ type: 'text', text: t.slice(last, m.index) })
    }
    if (m[1] !== undefined) {
      spans.push({ type: 'bold-italic', text: m[1] })
    } else if (m[2] !== undefined) {
      spans.push({ type: 'bold', text: m[2] })
    } else {
      spans.push({ type: 'italic', text: m[3] })
    }
    last = re.lastIndex
  }

  if (last < t.length) {
    spans.push({ type: 'text', text: t.slice(last) })
  }

  return spans.length > 0 ? spans : [{ type: 'text', text: t }]
}

function isTableRow(line: string): boolean {
  return line.startsWith('|') && line.endsWith('|')
}

function isTableSeparator(line: string): boolean {
  return /^\|\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|$/.test(line)
}

function parseTableCells(line: string): string[] {
  return line
    .split('|')
    .map(cell => cell.trim())
    .filter(Boolean)
}

export function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = []
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()

    // Stop before signature section - rendered as a hardcoded component
    if (/POTPISI/i.test(line)) break

    if (isTableRow(line) && !isTableSeparator(line)) {
      const tableLines: string[] = []

      while (i < lines.length) {
        const tableLine = lines[i].trim()
        if (!isTableRow(tableLine)) break
        if (!isTableSeparator(tableLine)) {
          tableLines.push(tableLine)
        }
        i++
      }
      i--

      if (tableLines.length > 0) {
        const [headerLine, ...rowLines] = tableLines
        blocks.push({
          type: 'table',
          headers: parseTableCells(headerLine),
          rows: rowLines.map(parseTableCells),
        })
      }
      continue
    }

    if (line === '') {
      blocks.push({ type: 'spacer', spans: [] })
      continue
    }

    if (line === '---') {
      blocks.push({ type: 'spacer', spans: [] })
      continue
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', spans: parseInline(line.slice(2)) })
      continue
    }

    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', spans: parseInline(line.slice(3)) })
      continue
    }

    if (line.startsWith('- ')) {
      blocks.push({ type: 'bullet', spans: parseInline(line.slice(2)) })
      continue
    }

    if (ROMAN_RE.test(line)) {
      blocks.push({ type: 'h2', spans: parseInline(line) })
      continue
    }

    blocks.push({ type: 'paragraph', spans: parseInline(line) })
  }

  return blocks
}
