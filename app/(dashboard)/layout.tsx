import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/dashboard/Sidebar'

function getInitials(email: string): string {
  const parts = email.split('@')[0].split(/[._-]/)
  return parts
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
    || email[0].toUpperCase()
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
  const userInitials = getInitials(user.email ?? 'U')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar plan={plan} userInitials={userInitials} />

      {/* Main content — top padding on mobile for fixed header, left margin on desktop for sidebar */}
      <div className="flex-1 pt-12 md:pt-0">
        <main className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
