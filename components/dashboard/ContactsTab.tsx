'use client'

import { useState } from 'react'
import type { Contact } from '@/types/database'
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
import { PencilIcon, Trash2Icon, UsersIcon, SearchIcon } from 'lucide-react'
import { TipCard } from '@/components/ui/TipCard'

interface ContactsTabProps {
  initialContacts: Contact[]
  plan: string
}

const PLAN_LIMITS: Record<string, number | null> = {
  free:    0,
  starter: 5,
  pro:     null,
  agency:  null,
}

const emptyForm = {
  naziv: '',
  pib: '',
  adresa: '',
  grad: '',
  zastupnik: '',
  email: '',
  telefon: '',
  ziro_racun: '',
  tip: 'firma',
}

type FormState = typeof emptyForm

function getInitials(naziv: string) {
  const words = naziv.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return naziv.slice(0, 2).toUpperCase()
}

const TIP_LABELS: Record<string, string> = {
  firma: 'Firma',
  preduzetnik: 'Preduzetnik',
  fizicko_lice: 'Fizičko lice',
}

export function ContactsTab({ initialContacts, plan }: ContactsTabProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const limit = PLAN_LIMITS[plan] !== undefined ? PLAN_LIMITS[plan] : null
  const canAdd = limit !== 0
  const showSearch = contacts.length > 4

  const filtered = searchQuery.trim()
    ? contacts.filter(c =>
        c.naziv.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.zastupnik ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contacts

  const limitText = () => {
    if (limit === null) return `${contacts.length} ${contacts.length === 1 ? 'kontakt' : 'kontakata'} — neograničeno`
    return `${contacts.length} od ${limit} kontakata iskorišćeno`
  }

  function openAdd() {
    if (limit !== null && contacts.length >= limit) return
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  function openEdit(contact: Contact) {
    setEditingId(contact.id)
    setForm({
      naziv: contact.naziv,
      pib: contact.pib ?? '',
      adresa: contact.adresa ?? '',
      grad: contact.grad ?? '',
      zastupnik: contact.zastupnik ?? '',
      email: contact.email ?? '',
      telefon: contact.telefon ?? '',
      ziro_racun: contact.ziro_racun ?? '',
      tip: contact.tip,
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
      setError('Naziv kontakta je obavezan.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editingId ? `/api/contacts/${editingId}` : '/api/contacts'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Greška pri čuvanju kontakta.')
        return
      }
      if (editingId) {
        setContacts(prev => prev.map(c => c.id === editingId ? json : c))
      } else {
        setContacts(prev => [...prev, json])
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
      const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
      if (res.ok) setContacts(prev => prev.filter(c => c.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Sačuvani kontakti
        </h2>
        {canAdd && showSearch && (
          <div className="flex-1 min-w-[160px] max-w-xs relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pretraži kontakte..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
            />
          </div>
        )}
        {canAdd && (
          <button
            onClick={openAdd}
            disabled={limit !== null && contacts.length >= limit}
            className="ml-auto text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1B6B4A' }}
            onMouseEnter={e => { if (!(limit !== null && contacts.length >= limit)) e.currentTarget.style.backgroundColor = '#155C3E' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1B6B4A' }}
          >
            + Dodaj kontakt
          </button>
        )}
      </div>

      {/* Free plan poruka */}
      {!canAdd && (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <UsersIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Sačuvani kontakti dostupni su od Starter plana.</p>
          <a href="/#cenovnik" className="text-sm font-medium underline text-gray-500 hover:text-gray-700">
            Pogledajte planove →
          </a>
        </div>
      )}

      {/* Prazno stanje */}
      {canAdd && contacts.length === 0 && (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <UsersIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Još niste dodali kontakte.</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">Dodajte kupce, klijente i partnere — automatski će se upisivati u dokumente.</p>
        </div>
      )}

      {/* Lista */}
      {canAdd && contacts.length > 0 && (
        <div className="space-y-2 mb-4">
          {filtered.map(contact => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors border-gray-200 hover:bg-gray-50 ${
                deletingId === contact.id ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#1B6B4A]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#1B6B4A]">{getInitials(contact.naziv)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-gray-900 text-sm">{contact.naziv}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">
                    {TIP_LABELS[contact.tip] ?? contact.tip}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {[contact.pib && `PIB/JMBG: ${contact.pib}`, contact.grad].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(contact)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(contact.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAdd && contacts.length > 0 && (
        <p className="text-sm text-gray-500">{limitText()}</p>
      )}

      {/* Sheet — forma */}
      <Sheet open={showForm} onOpenChange={open => { if (!open) cancelForm() }}>
        <SheetContent style={{ maxWidth: 520 }} className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Izmeni kontakt' : 'Dodaj kontakt'}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">

            <SectionLabel>Osnovno</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip kontakta</label>
                <select
                  value={form.tip}
                  onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
                >
                  <option value="firma">Firma (d.o.o., a.d.)</option>
                  <option value="preduzetnik">Preduzetnik</option>
                  <option value="fizicko_lice">Fizičko lice</option>
                </select>
              </div>
              <FormField
                label={form.tip === 'fizicko_lice' ? 'Ime i prezime' : 'Naziv firme'}
                required
                value={form.naziv}
                placeholder={form.tip === 'fizicko_lice' ? 'npr. Marko Marković' : 'npr. ABC Solutions d.o.o.'}
                onChange={v => setForm(f => ({ ...f, naziv: v }))}
              />
            </div>

            <SectionLabel>Identifikacija</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label={form.tip === 'fizicko_lice' ? 'JMBG' : 'PIB'}
                value={form.pib}
                placeholder={form.tip === 'fizicko_lice' ? '1234567890123' : '123456789'}
                onChange={v => setForm(f => ({ ...f, pib: v }))}
              />
              <FormField
                label="Grad"
                value={form.grad}
                placeholder="npr. Beograd"
                onChange={v => setForm(f => ({ ...f, grad: v }))}
              />
              <div className="col-span-2">
                <FormField
                  label="Adresa"
                  value={form.adresa}
                  placeholder="npr. Knez Mihailova 1"
                  onChange={v => setForm(f => ({ ...f, adresa: v }))}
                />
              </div>
            </div>

            <SectionLabel>Kontakt osoba</SectionLabel>
            <div className="space-y-3">
              <FormField
                label={form.tip === 'fizicko_lice' ? 'Kontakt (ako se razlikuje)' : 'Zastupnik / Kontakt osoba'}
                value={form.zastupnik}
                placeholder="npr. Ana Nikolić, direktor"
                onChange={v => setForm(f => ({ ...f, zastupnik: v }))}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  label="Email"
                  value={form.email}
                  placeholder="npr. kontakt@firma.rs"
                  onChange={v => setForm(f => ({ ...f, email: v }))}
                />
                <FormField
                  label="Telefon"
                  value={form.telefon}
                  placeholder="npr. 011 123 456"
                  onChange={v => setForm(f => ({ ...f, telefon: v }))}
                />
              </div>
            </div>

            <SectionLabel>Finansije</SectionLabel>
            <FormField
              label="Žiro račun"
              value={form.ziro_racun}
              placeholder="npr. 160-123456789-12"
              onChange={v => setForm(f => ({ ...f, ziro_racun: v }))}
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

      {/* AlertDialog — brisanje */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati ovaj kontakt?</AlertDialogTitle>
            <AlertDialogDescription>
              Svi podaci o kontaktu će biti trajno obrisani.
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

      <TipCard
        tipId="profile-contacts-new"
        title="Novo — Sačuvani kontakti"
        content="Sačuvajte kupce, klijente i partnere. Kada sledeći put pravite fakturu, ugovor ili ponudu — jedan klik ih popunjava automatski."
      />
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
