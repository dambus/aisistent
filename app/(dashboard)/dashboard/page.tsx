import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GreetingHeader } from '@/components/dashboard/GreetingHeader'
import { RecentDocuments } from '@/components/dashboard/RecentDocuments'

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
      { type: 'ugovor-o-radu', title: 'Ugovor o radu', desc: 'Angažovanje zaposlenog na puno radno vreme', icon: '👔', href: '/dokumenti/ugovor-o-radu' },
      { type: 'ugovor-o-delu', title: 'Ugovor o delu', desc: 'Jednokratni ili projektni angažman', icon: '📋', href: '/dokumenti/ugovor-o-delu' },
      { type: 'nda', title: 'NDA / Poverljivost', desc: 'Zaštita poslovnih tajni i informacija', icon: '🔒', href: '/dokumenti/nda' },
      { type: 'ugovor-o-zakupu', title: 'Ugovor o zakupu', desc: 'Stan, poslovni prostor ili kratkoročni zakup', icon: '🏠', href: '/dokumenti/ugovor-o-zakupu' },
      { type: 'ugovor-o-saradnji', title: 'Saradnja / Zajam', desc: 'Poslovna saradnja ili pozajmica novca', icon: '🤝', href: '/dokumenti/ugovor-o-saradnji' },
      { type: 'punomocje', title: 'Punomoćje', desc: 'Opšte, specijalno ili sudsko punomoćje', icon: '✍️', href: '/dokumenti/punomocje' },
      { type: 'opsti-uslovi', title: 'Opšti uslovi i PP', desc: 'Uslovi korišćenja i GDPR politika za vaš sajt', icon: '📄', href: '/dokumenti/opsti-uslovi' },
      { type: 'faktura', title: 'Faktura / Profaktura', desc: 'Izdajte fakturu ili predračun za usluge i robu', icon: '🧾', href: '/dokumenti/faktura' },
    ],
  },
  {
    label: 'Poslovna komunikacija',
    tools: [
      { type: 'poslovni-mejl', title: 'Poslovni mejl', desc: 'B2B mejlovi: ponuda, opomena, zahvalnica i više', icon: '✉️', href: '/dokumenti/poslovni-mejl' },
      { type: 'ponuda-klijentu', title: 'Ponuda klijentu', desc: 'Strukturirana B2B ponuda sa cenom i rokovima', icon: '💼', href: '/dokumenti/ponuda-klijentu' },
    ],
  },
  {
    label: 'HR i zapošljavanje',
    tools: [
      { type: 'oglas-za-posao',           title: 'Oglas za posao',            desc: 'Oglas za Infostud, LinkedIn i sajt firme',           icon: '👥', href: '/dokumenti/oglas-za-posao' },
      { type: 'odgovor-kandidatu',         title: 'Odgovor kandidatu',         desc: 'Poziv na intervju, prihvatanje ili odbijanje',        icon: '📨', href: '/dokumenti/odgovor-kandidatu' },
      { type: 'preporuka',                 title: 'Preporuka/Referenca',       desc: 'Profesionalna preporuka za zaposlenog ili saradnika', icon: '⭐', href: '/dokumenti/preporuka' },
      { type: 'resenje-godisnji-odmor',    title: 'Rešenje o godišnjem odmoru',desc: 'Formalno rešenje u skladu sa Zakonom o radu',         icon: '🌴', href: '/dokumenti/resenje-godisnji-odmor' },
      { type: 'pravilnik-o-radu',          title: 'Pravilnik o radu',          desc: 'Interni akt o radnom vremenu, zaradama i disciplini', icon: '📌', href: '/dokumenti/pravilnik-o-radu' },
    ],
  },
  {
    label: 'Marketing i prodaja',
    tools: [
      { type: 'opis-proizvoda',   title: 'Opis proizvoda/usluge', desc: 'Prodajni opis za sajt, katalog ili kampanju',        icon: '🛍️', href: '/dokumenti/opis-proizvoda' },
      { type: 'bio-o-nama',       title: 'Bio / O nama',          desc: 'Tekst o firmi, preduzetnik bio ili LinkedIn profil', icon: '🏢', href: '/dokumenti/bio-o-nama' },
      { type: 'zapisnik-sastanak',title: 'Zapisnik sa sastanka',  desc: 'Zaključci, akcije i odluke sa poslovnih sastanaka',  icon: '📝', href: '/dokumenti/zapisnik-sastanak' },
    ],
  },
  {
    label: '🧮 Alati',
    tools: [
      { type: 'kalkulator-zarade', title: 'Kalkulator zarade', desc: 'Bruto/neto preračun sa aktuelnim stopama za 2026.', icon: '🧮', href: '/alati/kalkulator-zarade' },
      { type: 'kalkulator-pausala', title: 'Paušalno oporezivanje', desc: 'Informacije o paušalnom porezu i zvanični kalkulator', icon: '🧾', href: '/alati/kalkulator-pausala' },
      { type: 'kalkulator-ugovora-o-delu', title: 'Kalkulator ugovora o delu', desc: 'Obračun poreza i troškova za ugovor o delu', icon: '📑', href: '/alati/kalkulator-ugovora-o-delu' },
    ],
  },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('plan, display_name')
    .eq('id', user!.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const displayName = profile?.display_name ?? undefined

  const { data: recentDocs } = await admin
    .from('documents')
    .select('id, title, type, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(3)

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
      <GreetingHeader
        displayName={displayName}
        plan={plan}
        documentsThisMonth={documentsThisMonth}
      />

      <div className="mb-10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Nedavno</h2>
        <RecentDocuments documents={recentDocs ?? []} />
      </div>

      <div className="space-y-8">
        {TOOL_CATEGORIES.map(category => (
          <div key={category.label}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {category.label}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {category.tools.map(tool => (
                <Link
                  key={tool.type}
                  href={tool.href}
                  className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 transition-all duration-150 hover:border-l-2 hover:border-l-[#1B6B4A] hover:shadow-sm"
                >
                  <span className="mt-0.5 shrink-0 text-2xl">{tool.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#1B6B4A]">
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
