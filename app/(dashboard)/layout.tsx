import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { OnboardingModal } from '@/components/dashboard/OnboardingModal'

function getInitials(displayName: string | null, email: string): string {
  if (displayName && displayName.trim()) {
    const parts = displayName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return parts[0][0].toUpperCase()
  }
  return email[0].toUpperCase()
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, display_name, is_admin, onboarded')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan ?? 'free'
  const userInitials = getInitials(profile?.display_name ?? null, user.email ?? 'U')
  const onboarded = profile?.onboarded ?? false
  // WelcomeModal se suzbija dok onboarding nije završen — da ne bi dva modala istovremeno
  const showWelcomeModal = !profile?.display_name && onboarded

  return (
    <>
      {!onboarded && (
        <OnboardingModal userName={profile?.display_name ?? null} />
      )}
      <DashboardShell
        plan={plan}
        userInitials={userInitials}
        showWelcomeModal={showWelcomeModal}
        isAdmin={profile?.is_admin ?? false}
      >
        {children}
      </DashboardShell>
    </>
  )
}
