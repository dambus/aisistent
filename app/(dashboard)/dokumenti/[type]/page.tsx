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
])

interface PageProps {
  params: Promise<{ type: string }>
}

export default async function WizardPage({ params }: PageProps) {
  const { type } = await params

  if (!SUPPORTED_TYPES.has(type)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let companies: Company[] = []

  if (user) {
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    companies = (data ?? []) as Company[]
  }

  return <WizardPageClient type={type} companies={companies} />
}
