import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WizardPageClient } from './WizardPageClient'
import type { Company } from '@/types/database'

const SUPPORTED_TYPES = new Set([
  'ugovor-o-radu',
  'ugovor-o-delu',
  'nda',
  'ugovor-o-zakupu',
  'ugovor-o-saradnji',
  'punomocje',
  'opsti-uslovi',
  'poslovni-mejl',
  'oglas-za-posao',
  'ponuda-klijentu',
  'odgovor-kandidatu',
  'preporuka',
  'resenje-godisnji-odmor',
  'pravilnik-o-radu',
  'opis-proizvoda',
  'bio-o-nama',
  'zapisnik-sastanak',
  'faktura',
  'putni-nalog',
  'otpremnica',
  'ponuda-za-radove',
])

interface PageProps {
  params: Promise<{ type: string }>
  searchParams: Promise<{ from?: string; clientId?: string }>
}

export default async function WizardPage({ params, searchParams }: PageProps) {
  const { type } = await params
  const { from, clientId } = await searchParams

  if (!SUPPORTED_TYPES.has(type)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let companies: Company[] = []
  let plan = 'free'
  let initialValues: Record<string, string | number | boolean> | undefined
  let rootDocumentId: string | undefined

  if (user) {
    const [companiesRes, profileRes] = await Promise.all([
      supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true }),
      supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single(),
    ])

    companies = (companiesRes.data ?? []) as Company[]
    plan = profileRes.data?.plan ?? 'free'

    if (from) {
      const { data: sourceDoc } = await supabase
        .from('documents')
        .select('id, type, input_data, root_document_id')
        .eq('id', from)
        .eq('user_id', user.id)
        .maybeSingle()

      if (sourceDoc && sourceDoc.type === type) {
        initialValues = sourceDoc.input_data as Record<string, string | number | boolean>
        rootDocumentId = sourceDoc.root_document_id ?? sourceDoc.id
      }
    }
  }

  return (
    <WizardPageClient
      type={type}
      companies={companies}
      plan={plan}
      initialValues={initialValues}
      rootDocumentId={rootDocumentId}
      preselectedClientId={clientId}
    />
  )
}
