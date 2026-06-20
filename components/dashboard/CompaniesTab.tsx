'use client'

import { useRef, useState } from 'react'
import type { Company } from '@/types/database'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CompaniesTabProps {
  initialCompanies: Company[]
  logoDisplayUrls: Record<string, string>
  plan: string
}

const PLAN_LIMITS: Record<string, number | null> = {
  free:     0,
  starter:  1,
  pro:      3,
  business: null,
  agency:   null,
}

const LOGO_PLANS = ['pro', 'business', 'agency']

const emptyForm = {
  naziv: '',
  pib: '',
  maticni_broj: '',
  adresa: '',
  grad: '',
  zastupnik: '',
  funkcija_zastupnika: '',
  email: '',
  telefon: '',
  is_default: false,
}

type FormState = typeof emptyForm

export function CompaniesTab({ initialCompanies, logoDisplayUrls, plan }: CompaniesTabProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [displayUrls, setDisplayUrls] = useState<Record<string, string>>(logoDisplayUrls)
  const [showForm, setShowForm] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const limit = PLAN_LIMITS[plan] ?? null
  const canUseLogo = LOGO_PLANS.includes(plan)

  const isAgency = plan === 'agency'
  const labels = {
    tabTitle:      isAgency ? 'Klijenti'             : 'Firme',
    addButton:     isAgency ? 'Dodaj klijenta'       : 'Dodaj firmu',
    emptyState:    isAgency ? 'Još nema klijenata.'  : 'Još niste dodali nijednu firmu.',
    editLabel:     isAgency ? 'Izmeni klijenta'      : 'Izmeni firmu',
    addLabel:      isAgency ? 'Dodaj klijenta'       : 'Dodaj firmu',
    deleteConfirm: isAgency ? 'Obrisati ovog klijenta?' : 'Obrisati ovu firmu?',
    saveName:      isAgency ? 'Naziv klijenta'       : 'Naziv firme',
    saveError:     isAgency ? 'Naziv klijenta je obavezan.' : 'Naziv firme je obavezan.',
    emailPlaceholder: isAgency ? 'kontakt@klijent.rs' : 'npr. kontakt@firma.rs',
  }

  function openAdd() {
    if (limit !== null && companies.length >= limit) {
      setShowLimitModal(true)
      return
    }
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  function openEdit(company: Company) {
    setEditingId(company.id)
    setForm({
      naziv: company.naziv,
      pib: company.pib ?? '',
      maticni_broj: company.maticni_broj ?? '',
      adresa: company.adresa ?? '',
      grad: company.grad ?? '',
      zastupnik: company.zastupnik ?? '',
      funkcija_zastupnika: company.funkcija_zastupnika ?? '',
      email: company.email ?? '',
      telefon: company.telefon ?? '',
      is_default: company.is_default,
    })
    setError('')
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  async function handleSave() {
    if (!form.naziv.trim()) {
      setError(labels.saveError)
      return
    }
    setSaving(true)
    setError('')

    try {
      const url = editingId ? `/api/companies/${editingId}` : '/api/companies'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? (isAgency ? 'Greška pri čuvanju klijenta.' : 'Greška pri čuvanju firme.'))
        return
      }

      if (editingId) {
        setCompanies(prev => prev.map(c => c.id === editingId ? { ...json, logo_url: c.logo_url } : c))
        if (json.is_default) {
          setCompanies(prev => prev.map(c => c.id === editingId ? { ...json, logo_url: c.logo_url } : { ...c, is_default: false }))
        }
      } else {
        const newCompany = json as Company
        if (newCompany.is_default) {
          setCompanies(prev => [...prev.map(c => ({ ...c, is_default: false })), newCompany])
        } else {
          setCompanies(prev => [...prev, newCompany])
        }
      }

      cancelForm()
    } catch {
      setError('Greška pri slanju zahteva.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(labels.deleteConfirm)) return
    setDeletingId(id)

    try {
      const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== id))
        setDisplayUrls(prev => { const n = { ...prev }; delete n[id]; return n })
      }
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetDefault(id: string) {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_default: true }),
    })
    if (res.ok) {
      setCompanies(prev => prev.map(c => ({ ...c, is_default: c.id === id })))
    }
  }

  async function handleLogoUpload(companyId: string, file: File) {
    setUploadingId(companyId)
    setUploadError(prev => ({ ...prev, [companyId]: '' }))

    if (file.size > 2 * 1024 * 1024) {
      setUploadError(prev => ({ ...prev, [companyId]: 'Maksimalna veličina je 2MB.' }))
      setUploadingId(null)
      return
    }

    const fd = new FormData()
    fd.append('logo', file)

    try {
      const res = await fetch(`/api/companies/${companyId}/logo`, { method: 'POST', body: fd })
      const json = await res.json()

      if (!res.ok) {
        setUploadError(prev => ({ ...prev, [companyId]: json.error ?? 'Greška pri uploadu.' }))
        return
      }

      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, logo_url: json.logo_url } : c))
      if (json.logo_display_url) {
        setDisplayUrls(prev => ({ ...prev, [companyId]: json.logo_display_url }))
      }
    } catch {
      setUploadError(prev => ({ ...prev, [companyId]: 'Greška pri slanju fajla.' }))
    } finally {
      setUploadingId(null)
    }
  }

  async function handleLogoRemove(companyId: string) {
    setUploadingId(companyId)
    try {
      const res = await fetch(`/api/companies/${companyId}/logo`, { method: 'DELETE' })
      if (res.ok) {
        setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, logo_url: null } : c))
        setDisplayUrls(prev => { const n = { ...prev }; delete n[companyId]; return n })
      }
    } finally {
      setUploadingId(null)
    }
  }

  const limitText = () => {
    if (isAgency) return `${companies.length} ${companies.length === 1 ? 'klijent' : 'klijenata'} — neograničeno`
    if (limit === null) return `${companies.length} ${companies.length === 1 ? 'firma' : 'firmi'} — neograničeno`
    return `${companies.length} od ${limit} ${limit === 1 ? 'firme' : 'firmi'} iskorišćeno`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Moje {labels.tabTitle.toLowerCase()}</h2>
        <button
          onClick={openAdd}
          className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#1B6B4A' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#155C3E' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1B6B4A' }}
        >
          + {labels.addButton}
        </button>
      </div>

      {/* Logo plan info */}
      {!canUseLogo && companies.length > 0 && (
        <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          Logo na dokumentima dostupan je za Pro i Business plan.
        </div>
      )}

      {/* Lista firmi */}
      {companies.length === 0 && !showForm && (
        <p className="text-sm text-gray-500 mb-4">{labels.emptyState}</p>
      )}

      <div className="space-y-3 mb-4">
        {companies.map(company => (
          <div
            key={company.id}
            className={`border rounded-xl p-4 transition-colors ${
              company.is_default ? 'border-[#1B6B4A] bg-green-50' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Logo preview */}
                  {displayUrls[company.id] ? (
                    <img
                      src={displayUrls[company.id]}
                      alt={`Logo ${company.naziv}`}
                      style={{ height: 36, maxWidth: 120, objectFit: 'contain' }}
                      className="rounded border border-gray-100 bg-white p-0.5"
                    />
                  ) : (
                    company.logo_url && (
                      <div className="h-9 w-16 flex items-center justify-center bg-gray-100 rounded border border-gray-200 text-xs text-gray-400">
                        Logo ✓
                      </div>
                    )
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{company.naziv}</span>
                      {company.is_default && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}>
                          Podrazumevana
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 space-x-2">
                      {company.pib && <span>PIB: {company.pib}</span>}
                      {company.grad && <span>{company.grad}</span>}
                      {company.zastupnik && <span>Zastupnik: {company.zastupnik}</span>}
                    </div>
                  </div>
                </div>

                {/* Logo upload sekcija */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <input
                    ref={el => { fileInputRefs.current[company.id] = el }}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(company.id, file)
                      e.target.value = ''
                    }}
                  />
                  <button
                    onClick={() => canUseLogo && fileInputRefs.current[company.id]?.click()}
                    disabled={!canUseLogo || uploadingId === company.id}
                    className={`text-xs border rounded-lg px-2.5 py-1 transition-colors ${
                      canUseLogo
                        ? 'text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-800'
                        : 'text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                    } disabled:opacity-50`}
                  >
                    {uploadingId === company.id
                      ? 'Uploadujem...'
                      : company.logo_url
                        ? 'Promeni logo'
                        : 'Dodaj logo'}
                  </button>
                  {company.logo_url && canUseLogo && (
                    <button
                      onClick={() => handleLogoRemove(company.id)}
                      disabled={uploadingId === company.id}
                      className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2.5 py-1 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      Ukloni logo
                    </button>
                  )}
                  {uploadError[company.id] && (
                    <span className="text-xs text-red-600">{uploadError[company.id]}</span>
                  )}
                </div>
              </div>

              {/* Akciona dugmad */}
              <div className="flex gap-2 flex-shrink-0">
                {!company.is_default && (
                  <button
                    onClick={() => handleSetDefault(company.id)}
                    className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg px-2.5 py-1 transition-colors hover:bg-gray-50"
                  >
                    Postavi kao podrazumevanu
                  </button>
                )}
                <button
                  onClick={() => openEdit(company)}
                  className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 rounded-lg px-2.5 py-1 transition-colors hover:bg-gray-50"
                >
                  Uredi
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  disabled={deletingId === company.id}
                  className="text-xs text-red-500 hover:text-red-700 border border-red-200 rounded-lg px-2.5 py-1 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === company.id ? '...' : 'Obriši'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan limit info — sakriveno za agency (neograničeno, bez poruke o nadogradnji) */}
      {!isAgency && limit !== 0 && <p className="text-sm text-gray-500 mb-4">{limitText()}</p>}

      {/* Forma za dodavanje/uređivanje — Dialog modal */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false)
          setEditingId(null)
          setForm(emptyForm)
          setError('')
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? labels.editLabel : labels.addLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormField
                label={labels.saveName}
                required
                value={form.naziv}
                placeholder="npr. Sigma Solutions doo"
                onChange={v => setForm(f => ({ ...f, naziv: v }))}
              />
            </div>
            <FormField
              label="PIB"
              value={form.pib}
              placeholder="123456789"
              helperText="9 cifara"
              onChange={v => setForm(f => ({ ...f, pib: v }))}
            />
            <FormField
              label="Matični broj"
              value={form.maticni_broj}
              placeholder="12345678"
              onChange={v => setForm(f => ({ ...f, maticni_broj: v }))}
            />
            <FormField
              label="Adresa"
              value={form.adresa}
              placeholder="npr. Bulevar Mihajla Pupina 10"
              onChange={v => setForm(f => ({ ...f, adresa: v }))}
            />
            <FormField
              label="Grad"
              value={form.grad}
              placeholder="npr. Novi Sad"
              onChange={v => setForm(f => ({ ...f, grad: v }))}
            />
            <FormField
              label="Zastupnik"
              value={form.zastupnik}
              placeholder="npr. Petar Nikolić"
              onChange={v => setForm(f => ({ ...f, zastupnik: v }))}
            />
            <FormField
              label="Funkcija zastupnika"
              value={form.funkcija_zastupnika}
              placeholder="npr. direktor"
              onChange={v => setForm(f => ({ ...f, funkcija_zastupnika: v }))}
            />
            <FormField
              label="Email"
              value={form.email}
              placeholder={labels.emailPlaceholder}
              onChange={v => setForm(f => ({ ...f, email: v }))}
            />
            <FormField
              label="Telefon"
              value={form.telefon}
              placeholder="npr. 021 123 456"
              onChange={v => setForm(f => ({ ...f, telefon: v }))}
            />
          </div>

          {/* Toggle: podrazumevana */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                form.is_default ? 'bg-[#1B6B4A]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                  form.is_default ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className="text-sm text-gray-700">Postavi kao podrazumevanu</span>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60 transition-colors"
              style={{ backgroundColor: '#1B6B4A' }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = '#155C3E' }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = '#1B6B4A' }}
            >
              {saving ? 'Čuvam...' : 'Sačuvaj'}
            </button>
            <button
              onClick={cancelForm}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              Otkaži
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="max-w-sm text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
            <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <DialogHeader>
            <DialogTitle className="text-center">
              {limit === 0
                ? 'Dodavanje firme dostupno je od Starter plana'
                : 'Dostigli ste limit firmi za vaš plan'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 -mt-2 mb-4">
            {limit === 0
              ? 'Besplatni plan ne uključuje čuvanje podataka o firmi. Pređite na Starter da dodate svoju prvu firmu.'
              : `Vaš plan dozvoljava maksimalno ${limit} ${limit === 1 ? 'firmu' : 'firme'}. Nadogradite plan za više.`}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowLimitModal(false)}
              className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Zatvori
            </button>
            <a
              href="/#cenovnik"
              className="px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors"
              style={{ backgroundColor: '#1B6B4A' }}
            >
              Pogledajte planove
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FormField({
  label,
  value,
  placeholder,
  helperText,
  required,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  helperText?: string
  required?: boolean
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
        style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
      />
      {helperText && <p className="mt-0.5 text-xs text-gray-400 italic">{helperText}</p>}
    </div>
  )
}
