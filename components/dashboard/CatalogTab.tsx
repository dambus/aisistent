'use client'

import { useState } from 'react'
import type { CatalogItem } from '@/types/database'
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
import { PencilIcon, Trash2Icon, TagIcon, SearchIcon } from 'lucide-react'
import { TipCard } from '@/components/ui/TipCard'

interface CatalogTabProps {
  initialItems: CatalogItem[]
  plan: string
}

const PLAN_LIMITS: Record<string, number | null> = {
  free:    0,
  starter: 0,
  pro:     50,
  agency:  null,
}

const emptyForm = {
  naziv: '',
  opis: '',
  jedinica: 'kom',
  cena_bez_pdv: '0',
  pdv_stopa: '20',
}

type FormState = typeof emptyForm

export function CatalogTab({ initialItems, plan }: CatalogTabProps) {
  const [items, setItems] = useState<CatalogItem[]>(initialItems)
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
  const showSearch = items.length > 4

  const filtered = searchQuery.trim()
    ? items.filter(i => i.naziv.toLowerCase().includes(searchQuery.toLowerCase()))
    : items

  const limitText = () => {
    if (limit === null) return `${items.length} ${items.length === 1 ? 'stavka' : 'stavki'} — neograničeno`
    return `${items.length} od ${limit} stavki iskorišćeno`
  }

  function fmt(n: number) {
    return n.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  function openAdd() {
    if (limit !== null && items.length >= limit) return
    setEditingId(null)
    setForm(emptyForm)
    setError('')
    setShowForm(true)
  }

  function openEdit(item: CatalogItem) {
    setEditingId(item.id)
    setForm({
      naziv: item.naziv,
      opis: item.opis ?? '',
      jedinica: item.jedinica,
      cena_bez_pdv: String(item.cena_bez_pdv),
      pdv_stopa: String(item.pdv_stopa),
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
      setError('Naziv stavke je obavezan.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editingId ? `/api/catalog/${editingId}` : '/api/catalog'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naziv: form.naziv,
          opis: form.opis,
          jedinica: form.jedinica,
          cena_bez_pdv: parseFloat(form.cena_bez_pdv) || 0,
          pdv_stopa: parseFloat(form.pdv_stopa) || 0,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Greška pri čuvanju stavke.')
        return
      }
      if (editingId) {
        setItems(prev => prev.map(i => i.id === editingId ? json : i))
      } else {
        setItems(prev => [...prev, json])
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
      const res = await fetch(`/api/catalog/${id}`, { method: 'DELETE' })
      if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Katalog usluga
        </h2>
        {canAdd && showSearch && (
          <div className="flex-1 min-w-[160px] max-w-xs relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pretraži stavke..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
            />
          </div>
        )}
        {canAdd && (
          <button
            onClick={openAdd}
            disabled={limit !== null && items.length >= limit}
            className="ml-auto text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1B6B4A' }}
            onMouseEnter={e => { if (!(limit !== null && items.length >= limit)) e.currentTarget.style.backgroundColor = '#155C3E' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1B6B4A' }}
          >
            + Dodaj stavku
          </button>
        )}
      </div>

      {/* Free/Starter poruka */}
      {!canAdd && (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <TagIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Katalog usluga dostupan je od Pro plana.</p>
          <a href="/#cenovnik" className="text-sm font-medium underline text-gray-500 hover:text-gray-700">
            Pogledajte planove →
          </a>
        </div>
      )}

      {/* Prazno stanje */}
      {canAdd && items.length === 0 && (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <TagIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Još niste dodali stavke u katalog.</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">Dodajte usluge i artikle — birate ih iz kataloga pri kreiranju fakture, ponude ili otpremnice.</p>
        </div>
      )}

      {/* Lista */}
      {canAdd && items.length > 0 && (
        <div className="space-y-2 mb-4">
          {filtered.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors border-gray-200 hover:bg-gray-50 ${
                deletingId === item.id ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#1B6B4A]/10 flex items-center justify-center">
                <TagIcon className="h-4 w-4 text-[#1B6B4A]" />
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-semibold text-gray-900 text-sm">{item.naziv}</span>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {fmt(item.cena_bez_pdv)} RSD / {item.jedinica} · PDV {item.pdv_stopa}%
                </p>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAdd && items.length > 0 && (
        <p className="text-sm text-gray-500">{limitText()}</p>
      )}

      {/* Sheet — forma */}
      <Sheet open={showForm} onOpenChange={open => { if (!open) cancelForm() }}>
        <SheetContent style={{ maxWidth: 520 }} className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Izmeni stavku' : 'Dodaj stavku'}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">

            <SectionLabel>Osnovno</SectionLabel>
            <div className="space-y-3">
              <FormField
                label="Naziv usluge / artikla"
                required
                value={form.naziv}
                placeholder="npr. Izrada web sajta"
                onChange={v => setForm(f => ({ ...f, naziv: v }))}
              />
              <FormField
                label="Opis (opciono)"
                value={form.opis}
                placeholder="npr. Uključuje hosting prvu godinu"
                onChange={v => setForm(f => ({ ...f, opis: v }))}
              />
            </div>

            <SectionLabel>Cena i PDV</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Jedinica mere"
                value={form.jedinica}
                placeholder="kom"
                onChange={v => setForm(f => ({ ...f, jedinica: v }))}
              />
              <NumberField
                label="Cena bez PDV (RSD)"
                value={form.cena_bez_pdv}
                onChange={v => setForm(f => ({ ...f, cena_bez_pdv: v }))}
              />
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">PDV stopa</label>
                <select
                  value={form.pdv_stopa}
                  onChange={e => setForm(f => ({ ...f, pdv_stopa: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
                >
                  <option value="20">20%</option>
                  <option value="10">10%</option>
                  <option value="0">Oslobođeno / Nije u sistemu PDV</option>
                </select>
              </div>
            </div>

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
            <AlertDialogTitle>Obrisati ovu stavku?</AlertDialogTitle>
            <AlertDialogDescription>
              Stavka će biti trajno obrisana iz kataloga.
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
        tipId="profile-catalog-new"
        title="Novo — Katalog usluga"
        content="Sačuvajte usluge i artikle sa cenom i PDV stopom. Kada sledeći put pravite fakturu, ponudu ili otpremnicu — birate stavku iz kataloga umesto da je kucate."
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
  required,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
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
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="number"
        min={0}
        step={0.01}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 text-right focus:outline-none focus:ring-2 focus:border-transparent bg-white"
        style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
      />
    </div>
  )
}
