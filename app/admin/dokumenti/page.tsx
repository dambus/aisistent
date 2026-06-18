import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TYPE_LABELS } from '@/lib/utils/documentTypes'

export default async function AdminDokumentiPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const { data: documents } = await admin
    .from('documents')
    .select('id, title, type, created_at, user_id, is_free')
    .order('created_at', { ascending: false })
    .limit(100)

  const typeCounts = (documents ?? []).reduce<Record<string, number>>((acc, doc) => {
    acc[doc.type] = (acc[doc.type] ?? 0) + 1
    return acc
  }, {})

  const sortedTypes = Object.entries(typeCounts).sort(([, a], [, b]) => b - a)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Dokumenti</p>
        <span className="text-sm text-zinc-500">
          Poslednjih {documents?.length ?? 0} dokumenata
        </span>
      </div>

      {/* Najpopularniji tipovi */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Najpopularniji tipovi</p>
        <div className="space-y-2">
          {sortedTypes.map(([type, count]) => {
            const total = documents?.length ?? 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm text-zinc-400 w-48 truncate">
                  {TYPE_LABELS[type] ?? type}
                </span>
                <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: '#1B6B4A' }}
                  />
                </div>
                <span className="text-sm font-semibold text-zinc-300 w-8 text-right tabular-nums">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabela dokumenata */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Naziv</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Tip</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Datum</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {(documents ?? []).map(doc => (
                <tr key={doc.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-200 truncate max-w-50">
                      {doc.title}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {TYPE_LABELS[doc.type] ?? doc.type}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell tabular-nums">
                    {new Date(doc.created_at).toLocaleDateString('sr-RS')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {doc.is_free ? (
                      <span className="text-xs text-zinc-600">free</span>
                    ) : (
                      <span className="text-xs text-green-500 font-medium">paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
