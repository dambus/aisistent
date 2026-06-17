import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PLAN_LABELS: Record<string, string> = {
  free: 'Besplatni', starter: 'Starter', pro: 'Pro', business: 'Business', agency: 'Agencija'
}
const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  free:     { bg: '#F3F4F6', text: '#6B7280' },
  starter:  { bg: '#EFF6FF', text: '#2563EB' },
  pro:      { bg: '#F0FDF4', text: '#16A34A' },
  business: { bg: '#FEF3C7', text: '#D97706' },
  agency:   { bg: '#EEF2FF', text: '#4338CA' },
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
    { label: 'Novi (7 dana)', value: newUsers ?? 0 },
    { label: 'Ukupno dokumenata', value: totalDocs ?? 0 },
    { label: 'Danas', value: docsToday ?? 0 },
    { label: 'Ovog meseca', value: docsThisMonth ?? 0 },
  ]

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Pregled</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Korisnici po planu</h2>
        <div className="flex flex-wrap gap-3">
          {['free', 'starter', 'pro', 'business', 'agency'].map(plan => {
            const count = planCounts[plan] ?? 0
            const color = PLAN_COLORS[plan]
            return (
              <div
                key={plan}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border"
                style={{ borderColor: color.text + '30', backgroundColor: color.bg }}
              >
                <span className="text-xs font-semibold" style={{ color: color.text }}>
                  {PLAN_LABELS[plan]}
                </span>
                <span className="text-lg font-bold" style={{ color: color.text }}>
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Poslednjih 10 dokumenata</h2>
        <div className="space-y-2">
          {(recentDocs ?? []).map(doc => (
            <div key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                <p className="text-xs text-gray-500">{doc.type}</p>
              </div>
              <p className="text-xs text-gray-400 ml-4 shrink-0">
                {new Date(doc.created_at).toLocaleDateString('sr-RS')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
