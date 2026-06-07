import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

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
    .select('plan, display_name')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const userInitials = getInitials(user.email ?? 'U')
  const showWelcomeModal = !profile?.display_name

  return (
    <DashboardShell
      plan={plan}
      userInitials={userInitials}
      showWelcomeModal={showWelcomeModal}
    >
      {children}
    </DashboardShell>
  )
}
