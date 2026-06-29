'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Contact } from '@/types/database'

interface Props {
  documentId: string
  documentTitle: string
  isOpen: boolean
  onClose: () => void
  prefilledClient?: { email: string; name: string }
}

export function SendEmailModal({ documentId, documentTitle, isOpen, onClose, prefilledClient }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContactId, setSelectedContactId] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [message, setMessage] = useState('')
  const [saveContact, setSaveContact] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactFirma, setContactFirma] = useState('')
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Dohvati kontakte kada se modal otvori
  useEffect(() => {
    if (!isOpen) return
    fetch('/api/contacts')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setContacts(data) })
      .catch(() => {})
  }, [isOpen])

  // Escape za zatvaranje
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  // Pre-popuni ili resetuj pri promeni isOpen
  useEffect(() => {
    if (isOpen) {
      setRecipientEmail(prefilledClient?.email ?? '')
      setRecipientName(prefilledClient?.name ?? '')
    } else {
      setSelectedContactId('')
      setRecipientEmail('')
      setRecipientName('')
      setMessage('')
      setSaveContact(false)
      setContactName('')
      setContactFirma('')
      setSending(false)
      setSuccess(false)
      setError('')
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleContactSelect(contactId: string) {
    setSelectedContactId(contactId)
    if (!contactId) {
      setRecipientEmail('')
      setRecipientName('')
      return
    }
    const c = contacts.find(x => x.id === contactId)
    if (c) {
      setRecipientEmail(c.email ?? '')
      setRecipientName(c.zastupnik ?? c.naziv)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!recipientEmail.trim()) {
      setError('Email adresa je obavezna.')
      return
    }
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/send-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: documentId,
          recipient_email: recipientEmail.trim(),
          recipient_name: recipientName.trim() || undefined,
          message: message.trim() || undefined,
          save_contact: saveContact,
          contact_name: contactName.trim() || undefined,
          contact_firma: contactFirma.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError((json as { error?: string }).error ?? 'Greška pri slanju mejla.')
        return
      }
      setSuccess(true)
      setTimeout(onClose, 2500)
    } catch {
      setError('Greška pri slanju. Proverite internet vezu i pokušajte ponovo.')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {prefilledClient ? 'Pošalji klijentu' : 'Pošaljite dokument emailom'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Zatvori"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success state */}
        {success ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-base font-semibold text-gray-900">Dokument je poslat!</p>
            <p className="mt-1 text-sm text-gray-500">{recipientEmail}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            {/* Sekcija 1 — Primalac */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Primalac</p>

              {contacts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Izaberite kontakt
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={e => handleContactSelect(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/10"
                  >
                    <option value="">— Unesite ručno —</option>
                    {contacts.map(c => (
                      <option key={c.id} value={c.id}>
                        {[c.naziv, c.email].filter(Boolean).join(' — ')}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email primaoca <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="npr. klijent@firma.rs"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ime primaoca
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="npr. Ana Marković"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/10"
                />
                <p className="mt-1 text-xs text-gray-400">Koristi se za oslovljavanje u mejlu</p>
              </div>
            </div>

            {/* Sekcija 2 — Poruka */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Poruka (opciono)</p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="npr. U prilogu je ugovor koji smo dogovorili..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/10 resize-none"
              />
              <p className="text-xs text-gray-400">Opciono — dodaje se u telo mejla</p>
            </div>

            {/* Sekcija 3 — Sačuvaj kontakt */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Sačuvaj kao kontakt</p>
                  <p className="text-xs text-gray-400">Sledeći put izaberite iz liste</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={saveContact}
                  onClick={() => setSaveContact(v => !v)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${saveContact ? 'bg-[#1B6B4A]' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${saveContact ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {saveContact && (
                <div className="space-y-3 border-l-2 border-[#1B6B4A]/20 pl-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ime kontakta</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      placeholder="npr. Ana Marković"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Firma kontakta <span className="text-gray-400 font-normal">(opciono)</span>
                    </label>
                    <input
                      type="text"
                      value={contactFirma}
                      onChange={e => setContactFirma(e.target.value)}
                      placeholder="npr. ABC Company doo"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#1B6B4A] focus:ring-2 focus:ring-[#1B6B4A]/10"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Sekcija 4 — Dugmad */}
            <div className="flex gap-3 pt-1 pb-1">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white bg-[#1B6B4A] hover:bg-[#155C3E] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending ? 'Šalje se...' : 'Pošalji'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Otkaži
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  )
}
