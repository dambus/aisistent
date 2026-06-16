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
        <h1 className="text-2xl font-bold text-gray-900">Dokumenti</h1>
        <span className="text-sm text-gray-500">
          Poslednjih {documents?.length ?? 0} dokumenata
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Najpopularniji tipovi</h2>
        <div className="space-y-2">
          {sortedTypes.map(([type, count]) => {
            const total = documents?.length ?? 1
            const pct = Math.round((count / total) * 100)
            return (
              <div key={type} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-48 truncate">
                  {TYPE_LABELS[type] ?? type}
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: '#1B6B4A' }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-8 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Naziv</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tip</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Datum</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(documents ?? []).map(doc => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 truncate max-w-[200px]">
                    {doc.title}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {TYPE_LABELS[doc.type] ?? doc.type}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                  {new Date(doc.created_at).toLocaleDateString('sr-RS')}
                </td>
                <td className="px-4 py-3 text-center">
                  {doc.is_free ? (
                    <span className="text-xs text-gray-400">free</span>
                  ) : (
                    <span className="text-xs text-green-600 font-medium">paid</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
