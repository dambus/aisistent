import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ObraściClient } from '@/components/obrasci/ObraściClient'

export default async function ObraściPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Popunjavanje obrazaca</h1>
      <p className="text-sm text-gray-500 mb-6">
        Učitajte PDF ili DOCX obrazac — sistem će predložiti vrednosti iz profila vaše firme.
      </p>
      <ObraściClient />
    </div>
  )
}
