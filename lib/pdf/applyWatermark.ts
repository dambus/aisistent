import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

/**
 * Applies a diagonal "AIsistent — aisistent.rs" watermark across every page
 * of a PDF buffer, centered on the page. Used for free-tier documents only.
 */
export async function applyWatermark(pdfBytes: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const pages = pdfDoc.getPages()

  const text = 'AIsistent — aisistent.rs'
  const fontSize = 42
  const angleDeg = 45
  const angleRad = (angleDeg * Math.PI) / 180

  for (const page of pages) {
    const { width, height } = page.getSize()
    const textWidth = font.widthOfTextAtSize(text, fontSize)
    const textHeight = fontSize // approximation, good enough for centering

    // Center of the page
    const cx = width / 2
    const cy = height / 2

    // We want the CENTER of the (unrotated) text box to land on (cx, cy)
    // after rotation around the text's own bottom-left origin.
    // Compute the offset from the bottom-left origin to the text center,
    // then rotate that offset vector by angleRad, and subtract it from
    // the target center to find where to place the origin.
    const halfW = textWidth / 2
    const halfH = textHeight / 2

    const rotatedOffsetX = halfW * Math.cos(angleRad) - halfH * Math.sin(angleRad)
    const rotatedOffsetY = halfW * Math.sin(angleRad) + halfH * Math.cos(angleRad)

    const x = cx - rotatedOffsetX
    const y = cy - rotatedOffsetY

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.106, 0.420, 0.290), // #1B6B4A
      opacity: 0.12,
      rotate: degrees(angleDeg),
    })
  }

  const watermarkedBytes = await pdfDoc.save()
  return Buffer.from(watermarkedBytes)
}
