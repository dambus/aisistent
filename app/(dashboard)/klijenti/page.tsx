import { redirect } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Company } from '@/types/database'

function getInitials(naziv: string) {
  const words = naziv.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return naziv.slice(0, 2).toUpperCase()
}

const QUICK_DOC_TYPES = [
  { label: 'Ugovor o radu',    href: 'ugovor-o-radu' },
  { label: 'Ugovor o delu',    href: 'ugovor-o-delu' },
  { label: 'Faktura',          href: 'faktura' },
  { label: 'Ponuda klijentu',  href: 'ponuda-klijentu' },
  { label: 'NDA',              href: 'nda' },
]

export default async function KlijentiPage() {
  noStore()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  if (profile?.plan !== 'agency') redirect('/profil')

  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
    .order('naziv', { ascending: true })

  // Broj dokumenata po klijentu
  const { data: docCounts } = await supabase
    .from('documents')
    .select('company_id')
    .eq('user_id', user.id)
    .not('company_id', 'is', null)

  const countMap: Record<string, number> = {}
  for (const row of docCounts ?? []) {
    if (row.company_id) countMap[row.company_id] = (countMap[row.company_id] ?? 0) + 1
  }

  // Signed URL-ovi za logoe
  const logoUrls: Record<string, string> = {}
  for (const company of companies ?? []) {
    if (company.logo_url) {
      const { data: signed } = await admin.storage
        .from('company-logos')
        .createSignedUrl(company.logo_url, 3600)
      if (signed?.signedUrl) logoUrls[company.id] = signed.signedUrl
    }
  }

  const clients = (companies ?? []) as Company[]
  const totalDocs = Object.values(countMap).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Klijenti</h1>
          <p className="mt-1 text-sm text-gray-500">
            {clients.length} {clients.length === 1 ? 'klijent' : 'klijenata'} · {totalDocs} {totalDocs === 1 ? 'dokument' : 'dokumenata'} ukupno
          </p>
        </div>
        <Link
          href="/profil"
          className="flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#1B6B4A' }}
        >
          + Dodaj klijenta
        </Link>
      </div>

      {/* Prazno stanje */}
      {clients.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-gray-900 font-semibold mb-1">Još nema klijenata</p>
          <p className="text-sm text-gray-500 mb-4">Dodajte prvog klijenta da biste pratili dokumente po klijentu.</p>
          <Link
            href="/profil"
            className="inline-flex text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#1B6B4A' }}
          >
            Dodaj klijenta →
          </Link>
        </div>
      )}

      {/* Grid klijenata */}
      {clients.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {clients.map(client => {
            const docCount = countMap[client.id] ?? 0
            const logoUrl = logoUrls[client.id]
            return (
              <div
                key={client.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col gap-4 transition-shadow hover:shadow-md ${
                  client.is_default ? 'border-[#1B6B4A]' : 'border-gray-200'
                }`}
              >
                {/* Kartica header */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-11 w-11 rounded-xl overflow-hidden bg-[#1B6B4A]/10 flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="" className="h-full w-full object-contain p-0.5" />
                    ) : (
                      <span className="text-sm font-bold text-[#1B6B4A]">{getInitials(client.naziv)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{client.naziv}</span>
                      {client.is_default && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                          Podrazumevana
                        </span>
                      )}
                      {client.pdv_obveznik && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                          PDV
                        </span>
                      )}
                    </div>
                    {client.delatnost && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{client.delatnost}</p>
                    )}
                  </div>
                </div>

                {/* Info red */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  {client.pib && (
                    <div><span className="text-gray-400">PIB</span><br /><span className="text-gray-700 font-medium">{client.pib}</span></div>
                  )}
                  {client.grad && (
                    <div><span className="text-gray-400">Grad</span><br /><span className="text-gray-700 font-medium">{client.grad}</span></div>
                  )}
                  {client.email && (
                    <div className="col-span-2 truncate"><span className="text-gray-400">Email</span><br /><span className="text-gray-700 font-medium">{client.email}</span></div>
                  )}
                </div>

                {/* Broj dokumenata */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {docCount === 0
                      ? 'Bez dokumenata'
                      : `${docCount} ${docCount === 1 ? 'dokument' : 'dokumenata'}`}
                  </span>
                  <Link
                    href={`/klijenti/${client.id}`}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: '#1B6B4A' }}
                  >
                    Pregled →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Brzi pristup tipovima dokumenata */}
      {clients.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Brzo kreiranje dokumenta</h2>
          <div className="flex flex-wrap gap-2">
            {QUICK_DOC_TYPES.map(doc => (
              <Link
                key={doc.href}
                href={`/dokumenti/${doc.href}`}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                {doc.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
