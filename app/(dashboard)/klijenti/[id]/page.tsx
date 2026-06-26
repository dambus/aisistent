import { redirect, notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Company } from '@/types/database'

const DOC_TYPE_LABELS: Record<string, string> = {
  'ugovor-o-radu':          'Ugovor o radu',
  'ugovor-o-delu':          'Ugovor o delu',
  'nda':                    'NDA / Sporazum',
  'ugovor-o-zakupu':        'Ugovor o zakupu',
  'ugovor-o-saradnji':      'Ugovor o saradnji',
  'punomocje':              'Punomoćje',
  'opsti-uslovi':           'Opšti uslovi',
  'poslovni-mejl':          'Poslovni mejl',
  'oglas-za-posao':         'Oglas za posao',
  'ponuda-klijentu':        'Ponuda klijentu',
  'odgovor-kandidatu':      'Odgovor kandidatu',
  'preporuka':              'Preporuka',
  'resenje-godisnji-odmor': 'Rešenje o godišnjem',
  'pravilnik-o-radu':       'Pravilnik o radu',
  'opis-proizvoda':         'Opis proizvoda',
  'bio-o-nama':             'Bio / O nama',
  'zapisnik-sastanak':      'Zapisnik sa sastanka',
  'faktura':                'Faktura / Profaktura',
  'putni-nalog':            'Putni nalog',
  'otpremnica':             'Otpremnica',
  'ponuda-za-radove':       'Ponuda za radove',
}

const QUICK_DOC_TYPES = [
  { label: 'Ugovor o radu',   href: 'ugovor-o-radu' },
  { label: 'Ugovor o delu',   href: 'ugovor-o-delu' },
  { label: 'Faktura',         href: 'faktura' },
  { label: 'Ponuda klijentu', href: 'ponuda-klijentu' },
  { label: 'NDA',             href: 'nda' },
]

function getInitials(naziv: string) {
  const words = naziv.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return naziv.slice(0, 2).toUpperCase()
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function KlijentDetailPage({ params }: PageProps) {
  noStore()
  const { id } = await params

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

  // Učitaj klijenta (proveri vlasništvo)
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!company) notFound()

  const client = company as Company

  // Logo
  let logoUrl: string | null = null
  if (client.logo_url) {
    const { data: signed } = await admin.storage
      .from('company-logos')
      .createSignedUrl(client.logo_url, 3600)
    if (signed?.signedUrl) logoUrl = signed.signedUrl
  }

  // Dokumenti za ovog klijenta
  const { data: documents } = await supabase
    .from('documents')
    .select('id, type, title, created_at, version, root_document_id')
    .eq('user_id', user.id)
    .eq('company_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  const docs = documents ?? []

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link href="/klijenti" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Klijenti
        </Link>
      </div>

      {/* Profil klijenta */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 h-14 w-14 rounded-xl overflow-hidden bg-[#1B6B4A]/10 flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
            ) : (
              <span className="text-lg font-bold text-[#1B6B4A]">{getInitials(client.naziv)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-gray-900">{client.naziv}</h1>
              {client.is_default && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                  Podrazumevana
                </span>
              )}
              {client.pdv_obveznik && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                  PDV obveznik
                </span>
              )}
            </div>
            {client.delatnost && (
              <p className="text-sm text-gray-500">{client.delatnost}</p>
            )}
          </div>
          <Link
            href="/profil"
            className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Uredi profil
          </Link>
        </div>

        {/* Info grid */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          {client.pib && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">PIB</p>
              <p className="font-medium text-gray-800">{client.pib}</p>
            </div>
          )}
          {client.maticni_broj && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Matični broj</p>
              <p className="font-medium text-gray-800">{client.maticni_broj}</p>
            </div>
          )}
          {client.grad && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Grad</p>
              <p className="font-medium text-gray-800">{client.grad}</p>
            </div>
          )}
          {client.adresa && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-0.5">Adresa</p>
              <p className="font-medium text-gray-800">{client.adresa}</p>
            </div>
          )}
          {client.zastupnik && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Zastupnik</p>
              <p className="font-medium text-gray-800">
                {client.zastupnik}
                {client.funkcija_zastupnika && <span className="text-gray-500 font-normal"> · {client.funkcija_zastupnika}</span>}
              </p>
            </div>
          )}
          {client.email && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="font-medium text-gray-800 truncate">{client.email}</p>
            </div>
          )}
          {client.telefon && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Telefon</p>
              <p className="font-medium text-gray-800">{client.telefon}</p>
            </div>
          )}
          {client.website && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Website</p>
              <a href={client.website} target="_blank" rel="noopener noreferrer" className="font-medium text-[#1B6B4A] hover:underline truncate block">
                {client.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {client.ziro_racun && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-0.5">Žiro račun</p>
              <p className="font-medium text-gray-800">{client.ziro_racun}</p>
            </div>
          )}
        </div>
      </div>

      {/* Kreiraj dokument */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
          Kreiraj dokument za {client.naziv}
        </h2>
        <div className="flex flex-wrap gap-2">
          {QUICK_DOC_TYPES.map(doc => (
            <Link
              key={doc.href}
              href={`/dokumenti/${doc.href}?clientId=${client.id}`}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              {doc.label}
            </Link>
          ))}
          <Link
            href={`/dokumenti/ugovor-o-radu?clientId=${client.id}`}
            className="text-sm px-3 py-1.5 rounded-lg text-white transition-colors"
            style={{ backgroundColor: '#1B6B4A' }}
          >
            + Svi tipovi
          </Link>
        </div>
      </div>

      {/* Dokumenti ovog klijenta */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          Dokumenti ({docs.length})
        </h2>

        {docs.length === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">
            Još nema dokumenata za ovog klijenta.
          </p>
        )}

        <div className="space-y-2">
          {docs.map(doc => (
            <Link
              key={doc.id}
              href={`/arhiva/${doc.id}`}
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 truncate">{doc.title}</span>
                  {doc.version > 1 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-600">
                      v{doc.version}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {DOC_TYPE_LABELS[doc.type] ?? doc.type} · {formatDate(doc.created_at)}
                </p>
              </div>
              <span className="text-xs text-gray-400 group-hover:text-[#1B6B4A] transition-colors flex-shrink-0">
                Otvori →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
