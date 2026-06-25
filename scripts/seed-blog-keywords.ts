import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

for (const f of ['.env.local', '.env.production.local']) {
  const p = path.resolve(process.cwd(), f)
  if (fs.existsSync(p)) {
    for (const line of fs.readFileSync(p, 'utf-8').split(/\r?\n/)) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) process.env[m[1].trim()] = m[2].trim()
    }
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) as any

const rows = [
  { keyword: 'faktura bez pdv paušalac srbija',  naslov: 'Faktura bez PDV-a za paušalce — šta mora da piše',                      alat: 'faktura',        format: 'long-form' },
  { keyword: 'poslovni mejl primer srpski',       naslov: '5 poslovnih mejlova koje svaki freelancer treba da ima spremne',         alat: 'poslovni-mejl',  format: 'listicle'  },
  { keyword: 'profaktura vs faktura razlika',     naslov: 'Profaktura ili faktura — kada se šta šalje',                             alat: 'faktura',        format: 'kratki'    },
  { keyword: 'kako naplatiti neplaćenu fakturu',  naslov: 'Klijent ne plaća — kako ga profesionalno naterati',                      alat: 'poslovni-mejl',  format: 'long-form' },
  { keyword: 'ugovor o delu paušalac 2025',       naslov: 'Ugovor o delu za paušalca — kompletni vodič 2025',                       alat: 'ugovor-o-delu',  format: 'long-form' },
  { keyword: 'kako opisati uslugu klijentu',      naslov: 'Kako opisati svoje usluge da klijent odmah shvati vrednost',              alat: 'opis-proizvoda', format: 'long-form' },
  { keyword: 'follow up mejl bez odgovora',       naslov: 'Follow-up mejl bez odgovora — 3 pristupa koja funkcionišu',              alat: 'poslovni-mejl',  format: 'kratki'    },
  { keyword: 'faktura za inostranstvo paušalac',  naslov: 'Faktura za inostranstvo — šta paušalac mora da zna',                     alat: 'faktura',        format: 'long-form' },
  { keyword: 'razlika ugovor o delu i radu',      naslov: 'Razlika između ugovora o radu i ugovora o delu',                         alat: 'ugovor-o-delu',  format: 'kratki'    },
  { keyword: 'kako napisati opis firme',           naslov: 'Kako napisati opis firme koji prodaje',                                  alat: 'bio-o-nama',     format: 'long-form' },
  { keyword: 'rok plaćanja na fakturi zakon',     naslov: 'Rok plaćanja na fakturi — šta kaže zakon u Srbiji',                      alat: 'faktura',        format: 'kratki'    },
]

async function main() {
  console.log(`\n📋 Upisujem ${rows.length} keyword redova\n${'─'.repeat(55)}`)
  const { data, error } = await supabase.from('blog_keywords').insert(rows).select('id, keyword')
  if (error) { console.error('❌', error.message); process.exit(1) }
  for (const row of data ?? []) console.log(`✅ ${row.keyword}`)
  console.log(`\n${'─'.repeat(55)}\nZavršeno: ${data?.length ?? 0} upisano\n`)
}

main()
