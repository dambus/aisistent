import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-900">AIsistent</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              ADMIN
            </span>
            <nav className="flex items-center gap-1 ml-4">
              {[
                { href: '/admin', label: 'Pregled' },
                { href: '/admin/korisnici', label: 'Korisnici' },
                { href: '/admin/dokumenti', label: 'Dokumenti' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Nazad na app
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
