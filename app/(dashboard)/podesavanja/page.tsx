import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SecurityCard } from '@/components/dashboard/SecurityCard'
import { DangerZone } from '@/components/dashboard/DangerZone'

export default async function PodesavanjaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Podešavanja</h1>

      {/* Kartica 1 — Bezbednost */}
      <SecurityCard email={user.email ?? ''} />

      {/* Kartica 2 — Opasna zona */}
      <DangerZone />
    </div>
  )
}
