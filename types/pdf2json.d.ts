declare module 'pdf2json' {
  import { EventEmitter } from 'events'

  interface PDFText {
    R: { T: string }[]
  }

  interface PDFPage {
    Texts: PDFText[]
  }

  interface PDFData {
    Pages: PDFPage[]
  }

  class PDFParser extends EventEmitter {
    constructor(context?: null, verbosity?: number)
    loadPDF(path: string): void
    parseBuffer(buffer: Buffer): void
    on(event: 'pdfParser_dataReady', listener: (data: PDFData) => void): this
    on(event: 'pdfParser_dataError', listener: (err: { parserError: Error }) => void): this
  }

  export = PDFParser
}
