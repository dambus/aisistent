import { redirect, notFound } from 'next/navigation'
import { unstable_noStore as noStore } from 'next/cache'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DocumentPreview } from '@/components/wizard/DocumentPreview'
import { TYPE_LABELS } from '@/lib/utils/documentTypes'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ArhivaDokumentPage({ params }: PageProps) {
  noStore()
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const [{ data: profileRaw }, { data: docRaw, error }] = await Promise.all([
    admin.from('profiles').select('plan').eq('id', user.id).single(),
    supabase
      .from('documents')
      .select('id, type, title, generated_text, is_free, version, user_id')
      .eq('id', id)
      .maybeSingle(),
  ])

  if (error || !docRaw || docRaw.user_id !== user.id) notFound()

  const plan = (profileRaw as { plan?: string } | null)?.plan ?? 'free'

  if (plan === 'free') redirect('/arhiva')

  const doc = docRaw as {
    id: string
    type: string
    title: string
    generated_text: string
    is_free: boolean
    version: number
    user_id: string
  }

  const typeLabel = TYPE_LABELS[doc.type] ?? doc.type

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/arhiva" className="hover:text-gray-600 transition-colors">
          Arhiva
        </Link>
        <span>›</span>
        <span className="text-gray-600 truncate max-w-xs">{doc.title || typeLabel}</span>
        {doc.version > 1 && (
          <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-600">
            v{doc.version}
          </span>
        )}
      </div>

      <DocumentPreview
        text={doc.generated_text}
        documentId={doc.id}
        documentTitle={doc.title || typeLabel}
        documentType={doc.type}
        isFree={doc.is_free}
        plan={plan}
      />
    </div>
  )
}
