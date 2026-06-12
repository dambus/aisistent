import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProfileCard } from '@/components/dashboard/ProfileCard'
import { CompaniesTab } from '@/components/dashboard/CompaniesTab'
import type { Company } from '@/types/database'

const PLAN_INFO: Record<string, { label: string; desc: string; limit: number | null }> = {
  free:     { label: 'Besplatni plan',  desc: '1 dokument mesečno',          limit: 1    },
  starter:  { label: 'Starter plan',   desc: '20 dokumenata mesečno',        limit: 20   },
  pro:      { label: 'Pro plan',        desc: 'Neograničen broj dokumenata',  limit: null },
  business: { label: 'Business plan',  desc: 'Do 5 korisnika',               limit: null },
}

const SERBIAN_MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar']

function formatMemberSince(iso: string): string {
  const d = new Date(iso)
  return `${SERBIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}.`
}

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('display_name, plan, documents_this_month, created_at')
    .eq('id', user.id)
    .single()

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })

  const plan = profile?.plan ?? 'free'

  // Generiši signed URLs za prikaz logoa (1 sat)
  const logoDisplayUrls: Record<string, string> = {}
  for (const company of companies ?? []) {
    if (company.logo_url) {
      const { data: signed } = await admin.storage
        .from('company-logos')
        .createSignedUrl(company.logo_url, 3600)
      if (signed?.signedUrl) {
        logoDisplayUrls[company.id] = signed.signedUrl
      }
    }
  }
  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.free
  const docsThisMonth = profile?.documents_this_month ?? 0
  const memberSince = formatMemberSince(profile?.created_at ?? user.created_at)

  // Progress bar
  const hasLimit = planInfo.limit !== null
  const pct = hasLimit ? Math.min((docsThisMonth / planInfo.limit!) * 100, 100) : 0
  const barColor = !hasLimit ? '#1B6B4A' : pct >= 100 ? '#EF4444' : pct >= 80 ? '#F97316' : '#1B6B4A'

  const isUpgrade = plan === 'free' || plan === 'starter'

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profil</h1>

      {/* Kartica 1 — Lični podaci */}
      <ProfileCard
        displayName={profile?.display_name ?? null}
        email={user.email ?? ''}
        memberSince={memberSince}
      />

      {/* Kartica 3 — Moje firme */}
      <CompaniesTab
        initialCompanies={(companies ?? []) as Company[]}
        logoDisplayUrls={logoDisplayUrls}
        plan={plan}
      />

      {/* Kartica 2 — Pretplata */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-5">Vaša pretplata</h2>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">{planInfo.label}</span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-sm text-gray-500">{planInfo.desc}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          {hasLimit ? (
            <>
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{docsThisMonth} od {planInfo.limit} dokumenata iskorišćeno ovog meseca</span>
                <span>{Math.round(pct)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-500">
              Neograničeno · {docsThisMonth} {docsThisMonth === 1 ? 'dokument' : 'dokumenata'} generisano ovog meseca
            </p>
          )}
        </div>

        <Link
          href="/#cenovnik"
          className="inline-flex items-center text-sm font-semibold transition-colors rounded-lg px-4 py-2 border"
          style={isUpgrade
            ? { backgroundColor: '#1B6B4A', color: '#fff', borderColor: '#1B6B4A' }
            : { color: '#374151', borderColor: '#D1D5DB' }}
        >
          {isUpgrade ? 'Nadogradite plan →' : 'Upravljajte pretplatom'}
        </Link>
      </div>
    </div>
  )
}
