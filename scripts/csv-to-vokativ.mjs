import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const csv = readFileSync(join(root, 'vokativ.csv'), 'utf-8')
const lines = csv.split('\n').map(l => l.trim()).filter(Boolean)

// Skip header
const [header, ...rows] = lines

const map = {}
for (const row of rows) {
  const comma = row.indexOf(',')
  if (comma === -1) continue
  const ime = row.slice(0, comma).trim()
  const vokativ = row.slice(comma + 1).trim()
  if (!ime || !vokativ) continue
  // Keep first occurrence for duplicates
  if (!(ime in map)) {
    map[ime] = vokativ
  }
}

// Sort alphabetically by key
const sorted = Object.fromEntries(
  Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'sr'))
)

mkdirSync(join(root, 'lib', 'data'), { recursive: true })
writeFileSync(
  join(root, 'lib', 'data', 'vokativ.json'),
  JSON.stringify(sorted, null, 2),
  'utf-8'
)

// Validations
const checks = [
  ['Jovan', 'Jovane'],
  ['Jovana', 'Jovana'],
  ['Petar', 'Petre'],
]
let ok = true
for (const [ime, expected] of checks) {
  const got = sorted[ime]
  if (got !== expected) {
    console.error(`VALIDATION FAILED: "${ime}" → expected "${expected}", got "${got}"`)
    ok = false
  }
}

if (!ok) process.exit(1)

console.log(`Done. ${Object.keys(sorted).length} entries written to lib/data/vokativ.json`)
console.log('Validations passed: Jovan, Jovana, Petar ✓')
