import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  free:     { bg: '#F3F4F6', text: '#6B7280' },
  starter:  { bg: '#EFF6FF', text: '#2563EB' },
  pro:      { bg: '#F0FDF4', text: '#16A34A' },
  business: { bg: '#FEF3C7', text: '#D97706' },
}

export default async function AdminKorisniciPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from('profiles')
    .select('id, plan, documents_this_month, created_at, display_name, is_admin')
    .order('created_at', { ascending: false })

  const { data: authUsers } = await admin.auth.admin.listUsers()
  const emailMap = Object.fromEntries(
    (authUsers?.users ?? []).map(u => [u.id, u.email])
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Korisnici</h1>
        <span className="text-sm text-gray-500">{profiles?.length ?? 0} ukupno</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Korisnik</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dok. ovog mes.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Registrovan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(profiles ?? []).map(profile => {
              const email = emailMap[profile.id] ?? '—'
              const color = PLAN_COLORS[profile.plan] ?? PLAN_COLORS.free
              return (
                <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {profile.display_name ?? '—'}
                      {profile.is_admin && (
                        <span className="ml-2 text-xs text-red-600 font-semibold">admin</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {profile.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-gray-700">{profile.documents_this_month}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(profile.created_at).toLocaleDateString('sr-RS')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
