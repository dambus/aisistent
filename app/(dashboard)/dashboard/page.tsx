import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GreetingHeader } from '@/components/dashboard/GreetingHeader'
import { TYPE_LABELS } from '@/lib/utils/documentTypes'

interface ToolItem {
  type: string
  title: string
  desc: string
  icon: string
  href: string
}

interface ToolCategory {
  label: string
  tools: ToolItem[]
}

const TOOL_CATEGORIES: ToolCategory[] = [
  {
    label: 'Ugovori i dokumenti',
    tools: [
      { type: 'ugovor-o-radu',     title: 'Ugovor o radu',      desc: 'Angažovanje zaposlenog na puno radno vreme',           icon: '👔', href: '/dokumenti/ugovor-o-radu' },
      { type: 'ugovor-o-delu',     title: 'Ugovor o delu',      desc: 'Jednokratni ili projektni angažman',                   icon: '📋', href: '/dokumenti/ugovor-o-delu' },
      { type: 'nda',               title: 'NDA / Poverljivost', desc: 'Zaštita poslovnih tajni i informacija',                icon: '🔒', href: '/dokumenti/nda' },
      { type: 'ugovor-o-zakupu',   title: 'Ugovor o zakupu',    desc: 'Stan, poslovni prostor ili kratkoročni zakup',        icon: '🏠', href: '/dokumenti/ugovor-o-zakupu' },
      { type: 'ugovor-o-saradnji', title: 'Saradnja / Zajam',   desc: 'Poslovna saradnja ili pozajmica novca',                icon: '🤝', href: '/dokumenti/ugovor-o-saradnji' },
      { type: 'punomocje',         title: 'Punomoćje',          desc: 'Opšte, specijalno ili sudsko punomoćje',               icon: '✍️', href: '/dokumenti/punomocje' },
      { type: 'opsti-uslovi',      title: 'Opšti uslovi i PP',  desc: 'Uslovi korišćenja i GDPR politika za vaš sajt',       icon: '📄', href: '/dokumenti/opsti-uslovi' },
    ],
  },
  {
    label: 'Poslovna komunikacija',
    tools: [
      { type: 'poslovni-mejl',   title: 'Poslovni mejl',    desc: 'B2B mejlovi: ponuda, opomena, zahvalnica i više',   icon: '✉️', href: '/dokumenti/poslovni-mejl' },
      { type: 'ponuda-klijentu', title: 'Ponuda klijentu',  desc: 'Strukturirana B2B ponuda sa cenom i rokovima',      icon: '💼', href: '/dokumenti/ponuda-klijentu' },
    ],
  },
  {
    label: 'HR i zapošljavanje',
    tools: [
      { type: 'oglas-za-posao', title: 'Oglas za posao', desc: 'Oglas za Infostud, LinkedIn i sajt firme', icon: '👥', href: '/dokumenti/oglas-za-posao' },
    ],
  },
  {
    label: '🧮 Alati',
    tools: [
      { type: 'kalkulator-zarade', title: 'Kalkulator zarade', desc: 'Bruto/neto preračun sa aktuelnim stopama za 2026.', icon: '🧮', href: '/alati/kalkulator-zarade' },
    ],
  },
]

function formatSerbianDate(iso: string): string {
  const MONTHS = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec']
  const d = new Date(iso)
  return `${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`
}

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) + '…' : s
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  // Profil
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, display_name')
    .eq('id', user!.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const displayName = profile?.display_name ?? undefined

  // Poslednja 3 dokumenta
  const { data: recentDocs } = await admin
    .from('documents')
    .select('id, title, type, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Broj dokumenata ovog meseca
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: docsThisMonth } = await admin
    .from('documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)
    .gte('created_at', startOfMonth)

  const documentsThisMonth = docsThisMonth ?? 0

  return (
    <div>
      {/* Pozdrav */}
      <GreetingHeader
        displayName={displayName}
        plan={plan}
        documentsThisMonth={documentsThisMonth}
      />

      {/* Nedavno */}
      <div className="mb-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Nedavno</h2>

        {!recentDocs || recentDocs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-6 text-sm text-gray-500">
            Još niste napravili nijedan dokument. Izaberite alat ispod i napravite prvi za 2 minuta.
          </div>
        ) : (
          <div className="space-y-2">
            {recentDocs.map(doc => (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {truncate(doc.title, 40)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {TYPE_LABELS[doc.type] ?? doc.type} · {formatSerbianDate(doc.created_at)}
                  </p>
                </div>
                <Link
                  href={`/arhiva`}
                  className="ml-4 shrink-0 text-xs font-semibold"
                  style={{ color: '#1B6B4A' }}
                >
                  Otvori PDF
                </Link>
              </div>
            ))}
            <div className="pt-1">
              <Link href="/arhiva" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Sva dokumenta →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Alati po kategorijama */}
      <div className="space-y-8">
        {TOOL_CATEGORIES.map(category => (
          <div key={category.label}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {category.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.tools.map(tool => (
                <Link
                  key={tool.type}
                  href={tool.href}
                  className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 transition-all duration-150 hover:border-l-2 hover:border-l-[#1B6B4A] hover:shadow-sm"
                >
                  <span className="mt-0.5 shrink-0 text-2xl">{tool.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-[#1B6B4A] transition-colors">
                      {tool.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{tool.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
