# 001 — PDF rendering biblioteka

**Datum:** jun 2026.
**Status:** Implementirano

## Odluka
Koristimo `@react-pdf/renderer` za generisanje PDF dokumenata.

## Alternativa koja je razmatrana
- `puppeteer` / `playwright` — HTML → PDF
- `pdfkit` — low-level PDF builder
- `jsPDF` — client-side

## Zašto @react-pdf/renderer
- React komponente — prirodno za Next.js projekat
- Server-side rendering — nema problema sa Vercel serverless
- Dovoljna kontrola tipografije za pravne dokumente
- Aktivno održavana biblioteka

## Poznata ograničenja
- Ne podržava ćirilicu bez posebnih fontova → koristimo `sanitizeText()`
- Nema native support za HTML → koristimo `markdownParser.ts`
- `wrap={false}` za sprečavanje page break-a unutar bloka

## Kada preispitati
Ako bude potreban kompleksniji layout (tabele, višekolonski tekst)
ili ako Vercel promeni serverless ograničenja.
