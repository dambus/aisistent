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

      {/* Kartica 2 — Obaveštenja (placeholder) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 opacity-60">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Obaveštenja</h2>
        <p className="text-sm text-gray-500">Podešavanja obaveštavanja biće dostupna uskoro.</p>
      </div>

      {/* Kartica 3 — Opasna zona */}
      <DangerZone />
    </div>
  )
}
