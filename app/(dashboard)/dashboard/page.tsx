import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GreetingHeader } from '@/components/dashboard/GreetingHeader'
import { RecentDocuments } from '@/components/dashboard/RecentDocuments'
import { getFeaturedTools, type Industry } from '@/lib/industryConfig'
import { TipCard, TipSequence } from '@/components/ui/TipCard'
import { LimitsCard } from '@/components/dashboard/LimitsCard'
import { getAllLibraryForms } from '@/lib/libraryForms'
import { TOOL_CONFIG, DASHBOARD_CATEGORIES, CALCULATOR_SLUGS } from '@/lib/config/tools'

interface ToolItem {
  type: string
  title: string
  desc: string
  icon: string
  href: string
  ctaLabel: string
}

interface ToolCategory {
  label: string
  tools: ToolItem[]
}

function toToolItem(slug: string): ToolItem {
  const config = TOOL_CONFIG[slug]
  return { type: config.slug, title: config.label, desc: config.desc, icon: config.icon, href: config.dashboardHref, ctaLabel: config.ctaLabel }
}

const TOOL_CATEGORIES: ToolCategory[] = [
  ...DASHBOARD_CATEGORIES.map(category => ({ label: category.title, tools: category.slugs.map(toToolItem) })),
  { label: '🧮 Alati', tools: CALCULATOR_SLUGS.map(toToolItem) },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()

  const { data: profileRaw } = await admin
    .from('profiles')
    .select('plan, display_name, industry')
    .eq('id', user!.id)
    .single()

  const profile = profileRaw as unknown as { plan?: string; display_name?: string | null; industry?: string | null } | null
  const libraryForms = await getAllLibraryForms()

  const plan = profile?.plan ?? 'free'
  const displayName = profile?.display_name ?? undefined
  const industry = (profile?.industry ?? 'general') as Industry
  const featuredSlugs = getFeaturedTools(industry)
  const allTools = TOOL_CATEGORIES.flatMap(c => c.tools)
  const featuredTools = featuredSlugs
    .map(slug => allTools.find(t => t.type === slug))
    .filter((t): t is ToolItem => t !== undefined)

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

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Nedavno</h2>
          <RecentDocuments documents={recentDocs ?? []} />
        </div>
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Limiti</h2>
          <LimitsCard plan={plan} documentsThisMonth={documentsThisMonth} />
        </div>
      </div>

      <TipSequence tips={[
        ...(featuredTools.length > 0 ? [{
          id: 'dashboard-recommended',
          title: 'Prilagođeno vašoj delatnosti',
          content: 'Preporučeni alati su odabrani na osnovu vaše delatnosti. Promenite ih u podešavanjima profila.',
        }] : []),
        {
          id: 'dashboard-kalkulatori',
          title: 'Besplatni kalkulatori',
          content: 'Izračunajte neto zaradu, paušalni porez ili troškove ugovora o delu — bez registracije, u sekundi.',
          href: '/kalkulator-zarade',
          ctaLabel: 'Probajte kalkulator →',
        },
        {
          id: 'dashboard-obrasci',
          title: 'Biblioteka zvaničnih obrazaca',
          content: `${libraryForms.length} zvaničnih obrazaca (APR, Poreska uprava, CROSO, PIO) na jednom mestu — preuzmite popunjene vašim podacima.`,
          href: '/obrasci',
          ctaLabel: 'Otvorite biblioteku →',
        },
      ]} />

      {featuredTools.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Preporučeno za vas
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map(tool => (
              <Link
                key={tool.type}
                href={tool.href}
                className="flex h-full items-stretch gap-3 rounded-xl border-2 p-4 transition-all duration-150 hover:shadow-md"
                style={{ borderColor: '#1B6B4A20', backgroundColor: '#F0F7F4' }}
              >
                <span className="mt-0.5 shrink-0 text-2xl">{tool.icon}</span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="text-sm font-semibold text-gray-900">{tool.title}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{tool.desc}</div>
                  <div className="mt-auto pt-1.5 text-xs font-semibold text-[#1B6B4A]">{tool.ctaLabel} →</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

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
                  className="group flex h-full items-stretch gap-3 rounded-xl border border-l-2 border-gray-200 border-l-transparent bg-white px-4 py-4 transition-all duration-150 hover:border-l-[#1B6B4A] hover:shadow-sm"
                >
                  <span className="mt-0.5 shrink-0 text-2xl">{tool.icon}</span>
                  <div className="flex flex-1 flex-col">
                    <p className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#1B6B4A]">
                      {tool.title}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">{tool.desc}</p>
                    <p className="mt-auto pt-1.5 text-xs font-semibold text-gray-400 transition-colors group-hover:text-[#1B6B4A]">
                      {tool.ctaLabel} →
                    </p>
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
