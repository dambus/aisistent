import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PLAN_LABELS: Record<string, string> = {
  free: 'Besplatni', starter: 'Starter', pro: 'Pro', business: 'Business', agency: 'Agencija'
}

const PLAN_COLORS_DARK: Record<string, { border: string; text: string; badge: string }> = {
  free:     { border: 'border-zinc-700',    text: 'text-zinc-300',    badge: 'text-zinc-400' },
  starter:  { border: 'border-blue-500/30', text: 'text-blue-400',    badge: 'text-blue-400' },
  pro:      { border: 'border-green-500/30',text: 'text-green-400',   badge: 'text-green-400' },
  business: { border: 'border-amber-500/30',text: 'text-amber-400',   badge: 'text-amber-400' },
  agency:   { border: 'border-violet-500/30',text: 'text-violet-400', badge: 'text-violet-400' },
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { count: totalUsers } = await admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: planData } = await admin
    .from('profiles')
    .select('plan')

  const planCounts = (planData ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.plan] = (acc[p.plan] ?? 0) + 1
    return acc
  }, {})

  const { count: totalDocs } = await admin
    .from('documents')
    .select('*', { count: 'exact', head: true })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: docsToday } = await admin
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const { count: docsThisMonth } = await admin
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  const { data: recentDocs } = await admin
    .from('documents')
    .select('id, title, type, created_at, user_id')
    .order('created_at', { ascending: false })
    .limit(10)

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const { count: newUsers } = await admin
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  const stats = [
    { label: 'Ukupno korisnika', value: totalUsers ?? 0 },
    { label: 'Novi (7 dana)',     value: newUsers ?? 0 },
    { label: 'Ukupno dok.',       value: totalDocs ?? 0 },
    { label: 'Danas',             value: docsToday ?? 0 },
    { label: 'Ovog meseca',       value: docsThisMonth ?? 0 },
  ]

  return (
    <div className="space-y-6">
      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Pregled</p>

      {/* Stat kartice */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-colors"
          >
            <p className="text-xs text-zinc-500 mb-2 font-medium tracking-wide uppercase">{label}</p>
            <p className="text-3xl font-bold text-zinc-100 tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Plan distribucija */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Korisnici po planu</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['free', 'starter', 'pro', 'business', 'agency'].map(plan => {
            const count = planCounts[plan] ?? 0
            const c = PLAN_COLORS_DARK[plan]
            return (
              <div
                key={plan}
                className={`bg-zinc-900 border ${c.border} rounded-xl p-4 hover:border-zinc-600 transition-colors`}
              >
                <p className={`text-xs font-semibold ${c.badge} mb-2 uppercase tracking-wide`}>
                  {PLAN_LABELS[plan]}
                </p>
                <p className={`text-2xl font-bold tabular-nums ${c.text}`}>{count}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Poslednjih 10 dokumenata */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Poslednji dokumenti</p>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-zinc-300">Poslednjih 10 generisanih</span>
            <span className="text-xs text-zinc-600 tabular-nums">{recentDocs?.length ?? 0} prikazano</span>
          </div>
          <div>
            {(recentDocs ?? []).map(doc => (
              <div
                key={doc.id}
                className="px-5 py-3 flex items-center justify-between border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/40 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200 truncate">{doc.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{doc.type}</p>
                </div>
                <p className="text-xs text-zinc-500 tabular-nums shrink-0 ml-4">
                  {new Date(doc.created_at).toLocaleDateString('sr-RS')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
