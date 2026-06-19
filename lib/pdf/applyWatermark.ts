import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

/**
 * Applies a diagonal "AIsistent — aisistent.rs" watermark across every page
 * of a PDF buffer. Used for free-tier documents only.
 */
export async function applyWatermark(pdfBytes: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const pages = pdfDoc.getPages()

  const text = 'AIsistent — aisistent.rs'
  const fontSize = 42

  for (const page of pages) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)

    page.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: fontSize,
      font,
      color: rgb(0.106, 0.420, 0.290), // #1B6B4A
      opacity: 0.12,
      rotate: degrees(45),
    })
  }

  const watermarkedBytes = await pdfDoc.save()
  return Buffer.from(watermarkedBytes)
}
