import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ContractReviewClient } from '@/components/dashboard/ContractReviewClient'

const REVIEW_PLANS = ['pro', 'agency']

export default async function PregledUgovoraPage() {
  noStore()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const canReview = !!profile && REVIEW_PLANS.includes(profile.plan)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pregled ugovora</h1>
        <p className="text-sm text-gray-500 mt-1">
          Uploadujte ugovor koji ste dobili od druge strane — AI ukazuje na rizične klauzule i šta bi trebalo proveriti pre potpisa.
        </p>
      </div>

      {canReview ? (
        <ContractReviewClient />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white py-14 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <span className="text-lg">🔒</span>
          </div>
          <p className="text-sm text-gray-500 mb-1">Pregled ugovora dostupan je za Pro i Agency plan.</p>
          <a href="/#cenovnik" className="text-sm font-medium underline text-gray-500 hover:text-gray-700">
            Pogledajte planove →
          </a>
        </div>
      )}
    </div>
  )
}
