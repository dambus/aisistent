import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ObraściClient } from '@/components/obrasci/ObraściClient'

const UPLOAD_PLANS = ['starter', 'pro', 'agency']

export default async function ObraściPage() {
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

  const plan = profile?.plan ?? 'free'

  if (!UPLOAD_PLANS.includes(plan)) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Popunjavanje obrazaca</h1>
        <p className="text-sm text-gray-500 mb-6">
          Uploadujte PDF ili DOCX obrazac — app ga automatski popunjava iz podataka vaše firme.
        </p>
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900 mb-1">Starter plan ili više</p>
          <p className="text-sm text-gray-500 mb-5">
            Popunjavanje obrazaca dostupno je za Starter, Pro i Agencija planove.
          </p>
          <Link
            href="/#cenovnik"
            className="inline-flex text-sm font-semibold px-5 py-2.5 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#1B6B4A' }}
          >
            Nadogradite plan →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Popunjavanje obrazaca</h1>
      <p className="text-sm text-gray-500 mb-6">
        Uploadujte PDF ili DOCX obrazac — app prepoznaje polja i popunjava ih iz podataka vaše firme.
      </p>
      <ObraściClient />
    </div>
  )
}
