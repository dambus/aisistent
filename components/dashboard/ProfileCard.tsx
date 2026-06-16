'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PRIMARY = '#1B6B4A'

interface ProfileCardProps {
  displayName: string | null
  email: string
  memberSince: string
}

export function ProfileCard({ displayName, email, memberSince }: ProfileCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [nameValue, setNameValue] = useState(displayName ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    const trimmed = nameValue.trim()
    if (trimmed.includes(' ')) {
      setError('Unesite samo ime, bez prezimena.')
      return
    }
    if (trimmed.length < 2 || trimmed.length > 50) {
      setError('Ime mora imati između 2 i 50 karaktera.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/profile/set-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: trimmed }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Greška pri čuvanju.')
        return
      }
      setEditing(false)
      router.refresh()
    } catch {
      setError('Greška pri slanju. Proverite vezu.')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setNameValue(displayName ?? '')
    setEditing(false)
    setError('')
  }

  const fieldCls = 'block w-full border-0 border-b border-gray-300 focus:border-[#1B6B4A] px-0 py-1 text-sm text-gray-900 bg-transparent outline-none transition-colors'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-5">Lični podaci</h2>

      {/* Ime */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <label className="block text-xs font-medium text-gray-500 mb-1">Ime (bez prezimena)</label>
        {editing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={nameValue}
              onChange={e => { setNameValue(e.target.value); setError('') }}
              maxLength={30}
              placeholder="npr. Milan"
              autoFocus
              className={fieldCls}
              style={{ fontSize: '16px' }}
            />
            <p className="mt-1 text-xs text-gray-400">
              Unesite samo ime — prikazuje se u pozdravu i avataru.
            </p>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving || nameValue.trim().length < 2}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                style={{ backgroundColor: PRIMARY }}
              >
                {saving ? 'Čuvam...' : 'Sačuvaj'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Otkaži
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">{displayName ?? '—'}</span>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-semibold transition-colors hover:opacity-70"
              style={{ color: PRIMARY }}
            >
              Izmeni
            </button>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="mb-5 pb-5 border-b border-gray-100">
        <label className="block text-xs font-medium text-gray-500 mb-1">Email adresa</label>
        <p className="text-sm text-gray-900">{email}</p>
        <p className="mt-1 text-xs text-gray-400">Za promenu emaila kontaktirajte podršku na info@aisistent.rs</p>
      </div>

      {/* Član od */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Član od</label>
        <p className="text-sm text-gray-900">{memberSince}</p>
      </div>
    </div>
  )
}
