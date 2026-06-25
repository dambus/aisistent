import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SecurityCard } from '@/components/dashboard/SecurityCard'
import { DangerZone } from '@/components/dashboard/DangerZone'
import { TipsSettingsCard } from '@/components/dashboard/TipsSettingsCard'

export default async function PodesavanjaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Podešavanja</h1>

      {/* Kartica 1 — Bezbednost */}
      <SecurityCard email={user.email ?? ''} />

      {/* Kartica 2 — Saveti */}
      <div className="mt-6">
        <TipsSettingsCard />
      </div>

      {/* Kartica 3 — Opasna zona */}
      <div className="mt-6">
        <DangerZone />
      </div>
    </div>
  )
}
