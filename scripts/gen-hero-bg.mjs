import { fal } from '@fal-ai/client'
import fs from 'fs'
import path from 'path'

fal.config({ credentials: process.env.FAL_AI_API_KEY })

const prompt = process.argv[2]
const outPath = process.argv[3]

if (!prompt || !outPath) {
  console.error('Usage: node gen-hero-bg.mjs "<prompt>" <output-path>')
  process.exit(1)
}

// recraft-v3 is purpose-built for flat vector/illustration styles — steers
// away from the photorealistic 3D-render bias flux/dev has by default.
const result = await fal.subscribe('fal-ai/recraft-v3', {
  input: {
    prompt,
    style: 'vector_illustration',
    image_size: { width: 1024, height: 1365 },
    colors: [
      { r: 5, g: 46, b: 22 },    // #052e16 dark green
      { r: 15, g: 81, b: 50 },   // #0f5132 emerald
      { r: 27, g: 107, b: 74 },  // #1B6B4A brand primary
      { r: 110, g: 231, b: 183 }, // #6ee7b7 mint
      { r: 255, g: 255, b: 255 },
    ],
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === 'IN_PROGRESS') {
      update.logs?.forEach(l => console.log(l.message))
    }
  },
})

const imageUrl = result.data.images[0].url
console.log('Generated:', imageUrl)

const res = await fetch(imageUrl)
const buf = Buffer.from(await res.arrayBuffer())
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, buf)
console.log('Saved to', outPath)
