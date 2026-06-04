export type InlineType = 'text' | 'bold' | 'italic' | 'bold-italic'

export interface InlineSpan {
  type: InlineType
  text: string
}

export type BlockType = 'h1' | 'h2' | 'paragraph' | 'bullet' | 'separator' | 'spacer'

export interface Block {
  type: BlockType
  spans: InlineSpan[]
}

// Roman numeral section headings emitted without ## prefix (e.g. "I. Podaci o stranama")
const ROMAN_RE = /^[IVXLCDM]{1,6}\.\s/

function parseInline(text: string): InlineSpan[] {
  // ZWNJ (U+200C) between f+i and f+l as fallback ligature prevention
  const t = text.replace(/fi/g, 'f‌i').replace(/fl/g, 'f‌l')

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

export function parseMarkdown(text: string): Block[] {
  const blocks: Block[] = []

  for (const raw of text.split('\n')) {
    const line = raw.trim()

    // Stop before signature section — rendered as a hardcoded component
    if (/POTPISI/i.test(line)) break

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
