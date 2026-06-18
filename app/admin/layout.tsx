import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 h-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between relative">
          <div className="flex items-center">
            <span className="text-sm font-semibold text-zinc-100">AIsistent</span>
            <span className="ml-2 text-[10px] font-bold tracking-widest bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded px-2 py-0.5">
              ADMIN
            </span>
            <AdminNav />
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            ← App
          </Link>
        </div>
      </header>

      <main className="pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
