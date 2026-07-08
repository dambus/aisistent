import { fal } from '@fal-ai/client'
import fs from 'fs'
import path from 'path'

fal.config({ credentials: process.env.FAL_AI_API_KEY })

const prompt = process.argv[2]
const outPath = process.argv[3]

if (!prompt || !outPath) {
  console.error('Usage: node gen-hero-image.mjs "<prompt>" <output-path>')
  process.exit(1)
}

const result = await fal.subscribe('fal-ai/flux/dev', {
  input: {
    prompt,
    image_size: { width: 1200, height: 1400 },
    num_inference_steps: 30,
    num_images: 1,
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
