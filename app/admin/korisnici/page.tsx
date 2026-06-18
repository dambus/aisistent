import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PlanSelector } from '@/components/admin/PlanSelector'
import { ResetDocsButton } from '@/components/admin/ResetDocsButton'

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
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Korisnici</p>
        <span className="text-sm text-zinc-500">{profiles?.length ?? 0} ukupno</span>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Korisnik</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Plan</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Dok. ovog mes.</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Registrovan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Akcije</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {(profiles ?? []).map(profile => {
                const email = emailMap[profile.id] ?? '—'
                return (
                  <tr key={profile.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-zinc-200">
                        {profile.display_name ?? '—'}
                        {profile.is_admin && (
                          <span className="ml-2 text-xs text-violet-400 font-semibold">admin</span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-500">{email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <PlanSelector userId={profile.id} currentPlan={profile.plan} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-zinc-300 tabular-nums">{profile.documents_this_month}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell tabular-nums">
                      {new Date(profile.created_at).toLocaleDateString('sr-RS')}
                    </td>
                    <td className="px-4 py-3">
                      <ResetDocsButton userId={profile.id} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
