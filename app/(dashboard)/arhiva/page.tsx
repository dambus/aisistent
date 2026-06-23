import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArchiveList, type ArchiveDocument } from '@/components/dashboard/ArchiveList'

export default async function ArhivaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan === 'free') {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Arhiva nije dostupna na besplatnom planu</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Pređite na Starter plan da automatski čuvate sve generisane dokumente i preuzimate ih kad god zatrebaju.
        </p>
        <a
          href="/#cenovnik"
          className="mt-5 inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
          style={{ backgroundColor: '#1B6B4A' }}
        >
          Pogledajte planove
        </a>
      </div>
    )
  }

  const { data, error } = await supabase
    .from('documents')
    .select('id, type, title, created_at, is_free, version, root_document_id')
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
