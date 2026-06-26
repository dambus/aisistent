'use client'

import { useRef, useState } from 'react'
import type { Company } from '@/types/database'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PencilIcon, Trash2Icon, StarIcon, SearchIcon, BuildingIcon } from 'lucide-react'
import { TipCard } from '@/components/ui/TipCard'

interface CompaniesTabProps {
  initialCompanies: Company[]
  logoDisplayUrls: Record<string, string>
  plan: string
}

const PLAN_LIMITS: Record<string, number | null> = {
  free:    0,
  starter: 1,
  pro:     3,
  agency:  null,
}

const LOGO_PLANS = ['pro', 'agency']

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
  delatnost: '',
  ziro_racun: '',
  pdv_obveznik: false,
  website: '',
  is_default: false,
}

type FormState = typeof emptyForm

function getInitials(naziv: string) {
  const words = naziv.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return naziv.slice(0, 2).toUpperCase()
}

export function CompaniesTab({ initialCompanies, logoDisplayUrls, plan }: CompaniesTabProps) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [displayUrls, setDisplayUrls] = useState<Record<string, string>>(logoDisplayUrls)
  const [showForm, setShowForm] = useState(false)
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<Record<string, string>>({})
  const [searchQuery, setSearchQuery] = useState('')
  const editLogoRef = useRef<HTMLInputElement | null>(null)

  const limit = PLAN_LIMITS[plan] ?? null
  const canUseLogo = LOGO_PLANS.includes(plan)
  const isAgency = plan === 'agency'
  const showSearch = isAgency || companies.length > 4
  const filteredCompanies = searchQuery.trim()
    ? companies.filter(c => c.naziv.toLowerCase().includes(searchQuery.toLowerCase()))
    : companies

  const editingCompany = editingId ? companies.find(c => c.id === editingId) : null

  const labels = {
    tabTitle:      isAgency ? 'Klijenti'                : 'Firme',
    addButton:     isAgency ? 'Dodaj klijenta'          : 'Dodaj firmu',
    emptyState:    isAgency ? 'Još nema klijenata.'     : 'Još niste dodali nijednu firmu.',
    editLabel:     isAgency ? 'Izmeni klijenta'         : 'Izmeni firmu',
    addLabel:      isAgency ? 'Dodaj klijenta'          : 'Dodaj firmu',
    deleteConfirm: isAgency ? 'Obrisati ovog klijenta?' : 'Obrisati ovu firmu?',
    saveName:      isAgency ? 'Naziv klijenta'          : 'Naziv firme',
    saveError:     isAgency ? 'Naziv klijenta je obavezan.' : 'Naziv firme je obavezan.',
    emailPlaceholder: isAgency ? 'kontakt@klijent.rs'  : 'npr. kontakt@firma.rs',
    deleteEntity:  isAgency ? 'klijentu'               : 'firmi',
  }

  const limitText = () => {
    if (isAgency) return `${companies.length} ${companies.length === 1 ? 'klijent' : 'klijenata'} — neograničeno`
    if (limit === null) return `${companies.length} ${companies.length === 1 ? 'firma' : 'firmi'} — neograničeno`
    return `${companies.length} od ${limit} ${limit === 1 ? 'firme' : 'firmi'} iskorišćeno`
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
      delatnost: company.delatnost ?? '',
      ziro_racun: company.ziro_racun ?? '',
      pdv_obveznik: company.pdv_obveznik ?? false,
      website: company.website ?? '',
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
        if (json.is_default) {
          setCompanies(prev => prev.map(c =>
            c.id === editingId ? { ...json, logo_url: c.logo_url } : { ...c, is_default: false }
          ))
        } else {
          setCompanies(prev => prev.map(c =>
            c.id === editingId ? { ...json, logo_url: c.logo_url } : c
          ))
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

  async function confirmDelete() {
    if (!deleteTarget) return
    const id = deleteTarget
    setDeleteTarget(null)
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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Moje {labels.tabTitle.toLowerCase()}
        </h2>
        {showSearch && (
          <div className="flex-1 min-w-[160px] max-w-xs relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={`Pretraži ${labels.tabTitle.toLowerCase()}...`}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
            />
          </div>
        )}
        <button
          onClick={openAdd}
          className="ml-auto text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors"
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

      {/* Lista */}
      {filteredCompanies.length === 0 && (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <BuildingIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            {searchQuery.trim() ? 'Nema rezultata za ovu pretragu.' : labels.emptyState}
          </p>
        </div>
      )}

      <TooltipProvider delay={400}>
        <div className="space-y-2 mb-4">
          {filteredCompanies.map(company => (
            <div
              key={company.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                company.is_default
                  ? 'border-[#1B6B4A] bg-green-50'
                  : 'border-gray-200 hover:bg-gray-50'
              } ${deletingId === company.id ? 'opacity-40 pointer-events-none' : ''}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-[#1B6B4A]/10 flex items-center justify-center">
                {displayUrls[company.id] ? (
                  <img
                    src={displayUrls[company.id]}
                    alt=""
                    className="h-full w-full object-contain p-0.5"
                  />
                ) : (
                  <span className="text-sm font-bold text-[#1B6B4A]">{getInitials(company.naziv)}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{company.naziv}</span>
                  {company.is_default && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                      Podrazumevana
                    </span>
                  )}
                  {company.pdv_obveznik && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-blue-50 text-blue-600">
                      PDV
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {company.delatnost ||
                    [company.pib && `PIB: ${company.pib}`, company.grad].filter(Boolean).join(' · ') ||
                    '—'}
                </p>
              </div>

              {/* Akcije */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {!company.is_default && (
                  <Tooltip>
                    <TooltipTrigger
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                      onClick={() => handleSetDefault(company.id)}
                    >
                      <StarIcon className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>Postavi kao podrazumevanu</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => openEdit(company)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Uredi</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={() => setDeleteTarget(company.id)}
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Obriši</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>

      {/* Plan limit info */}
      {!isAgency && limit !== 0 && (
        <p className="text-sm text-gray-500 mb-4">{limitText()}</p>
      )}

      {/* Sheet: forma za dodavanje/uređivanje */}
      <Sheet open={showForm} onOpenChange={(open) => { if (!open) cancelForm() }}>
        <SheetContent style={{ maxWidth: 520 }} className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{editingId ? labels.editLabel : labels.addLabel}</SheetTitle>
          </SheetHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">

            <SectionLabel>Osnovno</SectionLabel>
            <div className="space-y-3">
              <FormField
                label={labels.saveName}
                required
                value={form.naziv}
                placeholder="npr. Sigma Solutions doo"
                onChange={v => setForm(f => ({ ...f, naziv: v }))}
              />
              <FormField
                label="Delatnost"
                value={form.delatnost}
                placeholder="npr. Softverski razvoj i IT konsalting"
                onChange={v => setForm(f => ({ ...f, delatnost: v }))}
              />
            </div>

            <SectionLabel>Registracija</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <SectionLabel>Zastupnik</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Ime i prezime"
                value={form.zastupnik}
                placeholder="npr. Petar Nikolić"
                onChange={v => setForm(f => ({ ...f, zastupnik: v }))}
              />
              <FormField
                label="Funkcija"
                value={form.funkcija_zastupnika}
                placeholder="npr. direktor"
                onChange={v => setForm(f => ({ ...f, funkcija_zastupnika: v }))}
              />
            </div>

            <SectionLabel>Kontakt</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
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
              <div className="col-span-2">
                <FormField
                  label="Website"
                  value={form.website}
                  placeholder="npr. https://sigma.rs"
                  onChange={v => setForm(f => ({ ...f, website: v }))}
                />
              </div>
            </div>

            <SectionLabel>Finansije</SectionLabel>
            <div className="space-y-3">
              <FormField
                label="Žiro račun"
                value={form.ziro_racun}
                placeholder="npr. 160-123456789-12"
                onChange={v => setForm(f => ({ ...f, ziro_racun: v }))}
              />
              <SwitchRow
                label="PDV obveznik"
                description="Firma je u sistemu PDV-a"
                checked={form.pdv_obveznik}
                onCheckedChange={(v: boolean) => setForm(f => ({ ...f, pdv_obveznik: v }))}
              />
            </div>

            {/* Logo — samo za edit i planove sa logom */}
            {editingId && canUseLogo && (
              <>
                <SectionLabel>Logo</SectionLabel>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {displayUrls[editingId] ? (
                      <img
                        src={displayUrls[editingId]}
                        alt="Logo"
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">
                        {editingCompany?.logo_url ? 'Logo ✓' : 'Nema loga'}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      ref={editLogoRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file && editingId) handleLogoUpload(editingId, file)
                        e.target.value = ''
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => editLogoRef.current?.click()}
                      disabled={uploadingId === editingId}
                      className="text-xs border border-gray-300 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      {uploadingId === editingId
                        ? 'Uploadujem...'
                        : editingCompany?.logo_url ? 'Promeni logo' : 'Dodaj logo'}
                    </button>
                    {editingCompany?.logo_url && (
                      <button
                        type="button"
                        onClick={() => handleLogoRemove(editingId)}
                        disabled={uploadingId === editingId}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 text-left"
                      >
                        Ukloni logo
                      </button>
                    )}
                    {uploadError[editingId] && (
                      <p className="text-xs text-red-600">{uploadError[editingId]}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <SectionLabel>Podešavanja</SectionLabel>
            <SwitchRow
              label="Podrazumevana"
              description="Automatski se bira u wizardima"
              checked={form.is_default}
              onCheckedChange={(v: boolean) => setForm(f => ({ ...f, is_default: v }))}
            />

            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <SheetFooter className="border-t border-gray-100 flex-row justify-end gap-2">
            <button
              onClick={cancelForm}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors"
            >
              Otkaži
            </button>
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
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* AlertDialog: potvrda brisanja */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{labels.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              Svi podaci o {labels.deleteEntity} će biti trajno obrisani.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: limit plan */}
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

      {canUseLogo && (
        <TipCard
          tipId="profile-logo"
          title="Brendirani dokumenti"
          content="Dodajte logo firme u podešavanjima — automatski se pojavljuje na svim generisanim PDF dokumentima."
        />
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{children}</p>
      <div className="mt-1.5 h-px bg-gray-100" />
    </div>
  )
}

function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 border border-gray-100">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
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
