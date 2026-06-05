import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArchiveList, type ArchiveDocument } from '@/components/dashboard/ArchiveList'

export default async function ArhivaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('documents')
    .select('id, type, title, created_at, is_free')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const documents: ArchiveDocument[] = data ?? []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Arhiva dokumenata</h1>
        <p className="mt-2 text-sm text-gray-500">
          Svi dokumenti koje ste generisali, spremni za ponovno preuzimanje.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Greška pri učitavanju arhive. Pokušajte ponovo.
        </div>
      ) : (
        <ArchiveList documents={documents} />
      )}
    </div>
  )
}
