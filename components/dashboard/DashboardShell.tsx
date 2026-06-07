'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { WelcomeModal } from '@/components/dashboard/WelcomeModal'

interface DashboardShellProps {
  children: React.ReactNode
  plan: string
  userInitials: string
  showWelcomeModal: boolean
}

export function DashboardShell({ children, plan, userInitials, showWelcomeModal }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {showWelcomeModal && <WelcomeModal />}
      <Sidebar plan={plan} userInitials={userInitials} />
      <div className="flex-1 pt-12 md:pt-0">
        <main className="mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
