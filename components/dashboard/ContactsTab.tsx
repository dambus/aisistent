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
import { PencilIcon, Trash2Icon, UserIcon } from 'lucide-react'

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

export function ContactsTab({ initialContacts, plan }: ContactsTabProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const limit = PLAN_LIMITS[plan] !== undefined ? PLAN_LIMITS[plan] : null
  const atLimit = limit !== null && contacts.length >= limit
  const canAdd = limit !== 0

  const filtered = contacts.filter(c =>
    c.naziv.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.zastupnik ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  function openNew() {
    setEditingContact(null)
    setForm(emptyForm)
    setError('')
    setSheetOpen(true)
  }

  function openEdit(contact: Contact) {
    setEditingContact(contact)
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
    setSheetOpen(true)
  }

  async function handleSave() {
    if (!form.naziv.trim()) {
      setError('Naziv je obavezan.')
      return
    }
    setSaving(true)
    setError('')

    const method = editingContact ? 'PUT' : 'POST'
    const url = editingContact ? `/api/contacts/${editingContact.id}` : '/api/contacts'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const json = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(json.error ?? 'Greška pri čuvanju.')
      return
    }

    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact.id ? json : c))
    } else {
      setContacts(prev => [...prev, json])
    }
    setSheetOpen(false)
  }

  async function handleDelete(contact: Contact) {
    const res = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' })
    if (res.ok) {
      setContacts(prev => prev.filter(c => c.id !== contact.id))
    }
    setDeleteTarget(null)
  }

  const tipLabels: Record<string, string> = {
    firma: 'Firma',
    preduzetnik: 'Preduzetnik',
    fizicko_lice: 'Fizičko lice',
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Sačuvani kontakti
          </h2>
          {canAdd && (
            <button
              type="button"
              onClick={openNew}
              disabled={atLimit}
              title={atLimit ? `Dostigli ste limit od ${limit} kontakata` : 'Dodaj kontakt'}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1B6B4A', color: '#fff' }}
            >
              + Dodaj kontakt
            </button>
          )}
        </div>

        {!canAdd && (
          <p className="text-sm text-gray-500">
            Čuvanje kontakata dostupno je od{' '}
            <a href="/#cenovnik" className="underline font-medium">Starter plana</a>.
          </p>
        )}

        {canAdd && contacts.length > 3 && (
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Pretraži kontakte..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        )}

        {canAdd && contacts.length === 0 && (
          <div className="text-center py-6">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Još niste dodali kontakte.</p>
            <p className="text-xs text-gray-400">Dodajte kupce, klijente ili poslovne partnere — automatski će se upisivati u dokumente.</p>
          </div>
        )}

        {canAdd && contacts.length > 0 && (
          <div className="space-y-2">
            {filtered.map(contact => (
              <div
                key={contact.id}
                className="flex items-center gap-3 border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                >
                  {getInitials(contact.naziv)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm truncate">{contact.naziv}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                      {tipLabels[contact.tip] ?? contact.tip}
                    </span>
                  </div>
                  {(contact.pib || contact.grad) && (
                    <p className="text-xs text-gray-400 mt-0.5 space-x-2">
                      {contact.pib && <span>PIB/JMBG: {contact.pib}</span>}
                      {contact.grad && <span>{contact.grad}</span>}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEdit(contact)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(contact)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {limit !== null && (
              <p className="text-xs text-gray-400 text-right pt-1">
                {contacts.length} / {limit} kontakata
              </p>
            )}
          </div>
        )}
      </div>

      {/* Sheet — forma za dodavanje/izmenu */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingContact ? 'Izmeni kontakt' : 'Novi kontakt'}</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tip kontakta</label>
              <select
                value={form.tip}
                onChange={e => setForm(f => ({ ...f, tip: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              >
                <option value="firma">Firma (d.o.o., a.d.)</option>
                <option value="preduzetnik">Preduzetnik</option>
                <option value="fizicko_lice">Fizičko lice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {form.tip === 'fizicko_lice' ? 'Ime i prezime' : 'Naziv firme'} *
              </label>
              <input
                type="text"
                value={form.naziv}
                onChange={e => setForm(f => ({ ...f, naziv: e.target.value }))}
                placeholder={form.tip === 'fizicko_lice' ? 'npr. Marko Marković' : 'npr. ABC Solutions d.o.o.'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {form.tip === 'fizicko_lice' ? 'JMBG' : 'PIB'}
              </label>
              <input
                type="text"
                value={form.pib}
                onChange={e => setForm(f => ({ ...f, pib: e.target.value }))}
                placeholder={form.tip === 'fizicko_lice' ? '1234567890123' : '123456789'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Adresa</label>
              <input
                type="text"
                value={form.adresa}
                onChange={e => setForm(f => ({ ...f, adresa: e.target.value }))}
                placeholder="npr. Knez Mihailova 1"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Grad</label>
              <input
                type="text"
                value={form.grad}
                onChange={e => setForm(f => ({ ...f, grad: e.target.value }))}
                placeholder="npr. Beograd"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {form.tip === 'fizicko_lice' ? 'Ime i prezime (kontakt)' : 'Zastupnik / Kontakt osoba'}
              </label>
              <input
                type="text"
                value={form.zastupnik}
                onChange={e => setForm(f => ({ ...f, zastupnik: e.target.value }))}
                placeholder="npr. Ana Nikolić, direktor"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="npr. kontakt@firma.rs"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="text"
                value={form.telefon}
                onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))}
                placeholder="npr. +381 11 123 4567"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Žiro račun</label>
              <input
                type="text"
                value={form.ziro_racun}
                onChange={e => setForm(f => ({ ...f, ziro_racun: e.target.value }))}
                placeholder="npr. 160-123456-33"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <SheetFooter>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#1B6B4A' }}
            >
              {saving ? 'Čuvanje...' : editingContact ? 'Sačuvaj izmene' : 'Dodaj kontakt'}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* AlertDialog — brisanje */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obriši kontakt</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite da obrišete <strong>{deleteTarget?.naziv}</strong>?
              Ova akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
