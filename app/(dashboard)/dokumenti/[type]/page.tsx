import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WizardPageClient } from './WizardPageClient'
import { EMPLOYEE_SUPPORTED_TYPES } from '@/lib/utils/employeeFieldMap'
import type { Company, Contact, CatalogItem, Employee } from '@/types/database'

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
  'obavestenje-o-promeni-uslova',
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
  searchParams: Promise<{ from?: string; clientId?: string; copy?: string }>
}

export default async function WizardPage({ params, searchParams }: PageProps) {
  const { type } = await params
  const { from, clientId, copy } = await searchParams

  if (!SUPPORTED_TYPES.has(type)) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let companies: Company[] = []
  let contacts: Contact[] = []
  let catalogItems: CatalogItem[] = []
  let employees: Employee[] = []
  let plan = 'free'
  let initialValues: Record<string, string | number | boolean> | undefined
  let rootDocumentId: string | undefined

  if (user) {
    // Zaposleni se fetch-uju samo za HR tipove — osetljivi podaci (JMBG), data minimization
    const employeesQuery = EMPLOYEE_SUPPORTED_TYPES.has(type)
      ? supabase.from('employees').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
      : Promise.resolve({ data: [] as Employee[] })

    const [companiesRes, contactsRes, catalogRes, employeesRes, profileRes] = await Promise.all([
      supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true }),
      supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      supabase
        .from('catalog_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true }),
      employeesQuery,
      supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single(),
    ])

    companies = (companiesRes.data ?? []) as Company[]
    contacts = (contactsRes.data ?? []) as Contact[]
    catalogItems = (catalogRes.data ?? []) as CatalogItem[]
    employees = (employeesRes.data ?? []) as Employee[]
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
        // copy=1 → novi nezavisni dokument, bez veze sa verzionisanjem originala
        if (!copy) rootDocumentId = sourceDoc.root_document_id ?? sourceDoc.id
      }
    }
  }

  return (
    <WizardPageClient
      type={type}
      companies={companies}
      contacts={contacts}
      catalogItems={catalogItems}
      employees={employees}
      plan={plan}
      initialValues={initialValues}
      rootDocumentId={rootDocumentId}
      preselectedClientId={clientId}
    />
  )
}
