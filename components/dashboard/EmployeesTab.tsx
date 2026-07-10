'use client'

import { useState } from 'react'
import type { Employee } from '@/types/database'
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
import { PencilIcon, Trash2Icon, UserRoundIcon, SearchIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { TipCard } from '@/components/ui/TipCard'

interface EmployeesTabProps {
  initialEmployees: Employee[]
  plan: string
}

const PLAN_LIMITS: Record<string, number | null> = {
  free:    0,
  starter: 0,
  pro:     50,
  agency:  null,
}

const emptyForm = {
  ime: '',
  jmbg: '',
  pozicija: '',
  datum_zaposlenja: '',
  email: '',
  plata_osnova: '',
}

type FormState = typeof emptyForm

function getInitials(ime: string) {
  const words = ime.trim().split(/\s+/)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return ime.slice(0, 2).toUpperCase()
}

export function EmployeesTab({ initialEmployees, plan }: EmployeesTabProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showJmbg, setShowJmbg] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const limit = PLAN_LIMITS[plan] !== undefined ? PLAN_LIMITS[plan] : null
  const canAdd = limit !== 0
  const showSearch = employees.length > 4

  const filtered = searchQuery.trim()
    ? employees.filter(e =>
        e.ime.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.pozicija ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : employees

  const limitText = () => {
    if (limit === null) return `${employees.length} ${employees.length === 1 ? 'zaposleni' : 'zaposlenih'} — neograničeno`
    return `${employees.length} od ${limit} zaposlenih iskorišćeno`
  }

  function openAdd() {
    if (limit !== null && employees.length >= limit) return
    setEditingId(null)
    setForm(emptyForm)
    setShowJmbg(false)
    setError('')
    setShowForm(true)
  }

  function openEdit(employee: Employee) {
    setEditingId(employee.id)
    setForm({
      ime: employee.ime,
      jmbg: employee.jmbg ?? '',
      pozicija: employee.pozicija ?? '',
      datum_zaposlenja: employee.datum_zaposlenja ?? '',
      email: employee.email ?? '',
      plata_osnova: employee.plata_osnova !== null ? String(employee.plata_osnova) : '',
    })
    setShowJmbg(false)
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
    if (!form.ime.trim()) {
      setError('Ime zaposlenog je obavezno.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editingId ? `/api/employees/${editingId}` : '/api/employees'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ime: form.ime,
          jmbg: form.jmbg,
          pozicija: form.pozicija,
          datum_zaposlenja: form.datum_zaposlenja || null,
          email: form.email,
          plata_osnova: form.plata_osnova ? parseFloat(form.plata_osnova) : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Greška pri čuvanju zaposlenog.')
        return
      }
      if (editingId) {
        setEmployees(prev => prev.map(e => e.id === editingId ? json : e))
      } else {
        setEmployees(prev => [...prev, json])
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
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
      if (res.ok) setEmployees(prev => prev.filter(e => e.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Sačuvani zaposleni
        </h2>
        {canAdd && showSearch && (
          <div className="flex-1 min-w-[160px] max-w-xs relative">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Pretraži zaposlene..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
            />
          </div>
        )}
        {canAdd && (
          <button
            onClick={openAdd}
            disabled={limit !== null && employees.length >= limit}
            className="ml-auto text-sm font-semibold px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#1B6B4A' }}
            onMouseEnter={e => { if (!(limit !== null && employees.length >= limit)) e.currentTarget.style.backgroundColor = '#155C3E' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1B6B4A' }}
          >
            + Dodaj zaposlenog
          </button>
        )}
      </div>

      {/* Free/Starter poruka */}
      {!canAdd && (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <UserRoundIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mb-1">Sačuvani zaposleni dostupni su od Pro plana.</p>
          <a href="/#cenovnik" className="text-sm font-medium underline text-gray-500 hover:text-gray-700">
            Pogledajte planove →
          </a>
        </div>
      )}

      {/* Prazno stanje */}
      {canAdd && employees.length === 0 && (
        <div className="py-10 flex flex-col items-center text-center">
          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
            <UserRoundIcon className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">Još niste dodali zaposlene.</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">Dodajte zaposlene — automatski će se upisivati u ugovor o radu, rešenje o godišnjem odmoru i putni nalog.</p>
        </div>
      )}

      {/* Lista — bez JMBG-a */}
      {canAdd && employees.length > 0 && (
        <div className="space-y-2 mb-4">
          {filtered.map(employee => (
            <div
              key={employee.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors border-gray-200 hover:bg-gray-50 ${
                deletingId === employee.id ? 'opacity-40 pointer-events-none' : ''
              }`}
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-[#1B6B4A]/10 flex items-center justify-center">
                <span className="text-sm font-bold text-[#1B6B4A]">{getInitials(employee.ime)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-semibold text-gray-900 text-sm">{employee.ime}</span>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  {employee.pozicija || '—'}
                </p>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(employee)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(employee.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2Icon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {canAdd && employees.length > 0 && (
        <p className="text-sm text-gray-500">{limitText()}</p>
      )}

      {/* Sheet — forma */}
      <Sheet open={showForm} onOpenChange={open => { if (!open) cancelForm() }}>
        <SheetContent style={{ maxWidth: 520 }} className="flex flex-col">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Izmeni zaposlenog' : 'Dodaj zaposlenog'}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">

            <SectionLabel>Osnovno</SectionLabel>
            <div className="space-y-3">
              <FormField
                label="Ime i prezime"
                required
                value={form.ime}
                placeholder="npr. Marko Marković"
                onChange={v => setForm(f => ({ ...f, ime: v }))}
              />
              <FormField
                label="Pozicija"
                value={form.pozicija}
                placeholder="npr. Softverski inženjer"
                onChange={v => setForm(f => ({ ...f, pozicija: v }))}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Datum zaposlenja</label>
                <input
                  type="date"
                  value={form.datum_zaposlenja}
                  onChange={e => setForm(f => ({ ...f, datum_zaposlenja: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                  style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
                />
              </div>
            </div>

            <SectionLabel>Osetljivi podaci</SectionLabel>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">JMBG</label>
                <div className="relative">
                  <input
                    type={showJmbg ? 'text' : 'password'}
                    value={form.jmbg}
                    placeholder="1234567890123"
                    maxLength={13}
                    onChange={e => setForm(f => ({ ...f, jmbg: e.target.value }))}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
                    style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => setShowJmbg(v => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showJmbg ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">Opciono. 13 cifara.</p>
              </div>
              <FormField
                label="Osnovna plata (RSD, opciono)"
                value={form.plata_osnova}
                placeholder="npr. 90000"
                type="number"
                onChange={v => setForm(f => ({ ...f, plata_osnova: v }))}
              />
            </div>

            <SectionLabel>Kontakt</SectionLabel>
            <FormField
              label="Email"
              value={form.email}
              placeholder="npr. marko@firma.rs"
              onChange={v => setForm(f => ({ ...f, email: v }))}
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
            <AlertDialogTitle>Obrisati ovog zaposlenog?</AlertDialogTitle>
            <AlertDialogDescription>
              Svi podaci o zaposlenom (uključujući JMBG) biće trajno obrisani.
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
        tipId="profile-employees-new"
        title="Novo — Sačuvani zaposleni"
        content="Sačuvajte zaposlene sa svim podacima. Kada sledeći put pravite ugovor o radu, rešenje o godišnjem odmoru ili putni nalog — jedan klik ih popunjava automatski."
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
  type = 'text',
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  required?: boolean
  type?: 'text' | 'number'
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent bg-white"
        style={{ '--tw-ring-color': '#1B6B4A' } as React.CSSProperties}
      />
    </div>
  )
}
