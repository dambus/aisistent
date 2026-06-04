import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PdfButton } from '@/components/dashboard/PdfButton'

const DOC_TYPES = [
  {
    type: 'ugovor-o-radu',
    title: 'Ugovor o radu',
    desc: 'Angažovanje zaposlenog na puno radno vreme',
    icon: '👔',
  },
  {
    type: 'ugovor-o-delu',
    title: 'Ugovor o delu',
    desc: 'Jednokratni ili projektni angažman',
    icon: '📋',
  },
  {
    type: 'nda',
    title: 'NDA / Poverljivost',
    desc: 'Zaštita poslovnih tajni i informacija',
    icon: '🔒',
  },
  {
    type: 'ugovor-o-zakupu',
    title: 'Ugovor o zakupu',
    desc: 'Stan, poslovni prostor ili kratkoročni zakup',
    icon: '🏠',
  },
  {
    type: 'ugovor-o-saradnji',
    title: 'Saradnja / Zajam',
    desc: 'Poslovna saradnja ili pozajmica novca',
    icon: '🤝',
  },
]

const TYPE_LABELS: Record<string, string> = {
  'ugovor-o-radu':     'Ugovor o radu',
  'ugovor-o-delu':     'Ugovor o delu',
  'nda':               'NDA',
  'ugovor-o-zakupu':   'Ugovor o zakupu',
  'ugovor-o-saradnji': 'Saradnja / Zajam',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { data: documents } = await admin
    .from('documents')
    .select('id, title, type, created_at')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div>
      {/* Novi dokument — kartice */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Novi dokument</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DOC_TYPES.map(doc => (
            <Link
              key={doc.type}
              href={`/dokumenti/${doc.type}`}
              className="flex items-start gap-3 bg-white border border-gray-200 hover:border-blue-400 hover:shadow-sm rounded-xl px-4 py-4 transition-all group"
            >
              <span className="text-2xl mt-0.5 shrink-0">{doc.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {doc.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{doc.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Arhiva */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Arhiva dokumenata</h2>
      </div>

      {!documents || documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-500">Još uvek nemate generisanih dokumenata.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <div
              key={doc.id}
              className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  <span className="mr-2">{TYPE_LABELS[doc.type] ?? doc.type}</span>·
                  <span className="ml-2">
                    {new Date(doc.created_at).toLocaleDateString('sr-RS', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </p>
              </div>
              <PdfButton documentId={doc.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
