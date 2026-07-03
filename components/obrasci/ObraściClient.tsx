'use client'

import { useState, useRef, useCallback } from 'react'
import { WizardView } from './WizardView'
import { GuideView } from './GuideView'
import { PreviewView } from './PreviewView'
import { SectionWizardView } from './SectionWizardView'
import type { MappedField } from '@/app/api/obrasci/analyze/route'
import type { GuideField, FormSection } from '@/types/obrasci'

type DocType = 'acroform' | 'docx' | 'flat'

// Struktura sekcija (naslov, strana, redosled id-jeva polja) — bez vrednosti. Vrednosti
// uvek žive u fields; sections za SectionWizardView se grade spajanjem shape + fields
// (buildSections niže). Ovo sprečava da dva "izvora istine" (fields vs sections.fields)
// odu iz sinhronizacije kad korisnik ide guide → wizard → nazad → wizard ponovo.
interface SectionShape {
  title: string
  page: number
  fieldIds: string[]
}

function buildSections(fields: GuideField[], shapes: SectionShape[]): FormSection[] {
  const byId = new Map(fields.map(f => [f.id, f]))
  return shapes.map(s => ({
    title: s.title,
    page: s.page,
    fields: s.fieldIds.map(id => byId.get(id)).filter((f): f is GuideField => !!f),
  }))
}

type Stage =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'analyzing'; fileRef: string; type: DocType; filename: string }
  | { status: 'wizard'; fileRef: string; type: 'docx'; filename: string; fields: MappedField[] }
  | { status: 'di-guide'; fileRef: string; type: 'acroform' | 'flat'; filename: string; fields: GuideField[]; sectionShapes: SectionShape[]; fingerprint: string | null }
  | { status: 'di-wizard'; fileRef: string; type: 'acroform' | 'flat'; filename: string; fields: GuideField[]; sectionShapes: SectionShape[]; fingerprint: string | null }
  | { status: 'di-preview'; fileRef: string; type: 'acroform' | 'flat'; filename: string; confirmedFields: GuideField[]; sectionShapes: SectionShape[]; fingerprint: string | null }
  | { status: 'error'; message: string }

const ACCEPTED = '.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export function ObraściClient() {
  const [stage, setStage] = useState<Stage>({ status: 'idle' })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = useCallback(() => setStage({ status: 'idle' }), [])

  async function processFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setStage({ status: 'error', message: 'Fajl je veći od 10MB.' })
      return
    }

    // Korak 1: upload + detekcija tipa
    setStage({ status: 'uploading' })
    const formData = new FormData()
    formData.append('file', file)

    let uploadRes: { fileRef: string; type: DocType; filename: string }
    try {
      const res = await fetch('/api/obrasci/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Greška pri uploadu.')
      uploadRes = data
    } catch (err) {
      setStage({ status: 'error', message: err instanceof Error ? err.message : 'Greška pri uploadu.' })
      return
    }

    const { fileRef, type, filename } = uploadRes
    setStage({ status: 'analyzing', fileRef, type, filename })

    // Korak 2: analiza
    // PDF (acroform/flat) → DI pipeline → guide sa 3 stanja
    // DOCX → stari Claude pipeline → wizard za auto-popunjavanje
    if (type === 'docx') {
      let fields: MappedField[]
      try {
        const res = await fetch('/api/obrasci/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileRef, type }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Greška pri analizi.')
        fields = data.fields
      } catch (err) {
        setStage({ status: 'error', message: err instanceof Error ? err.message : 'Greška pri analizi.' })
        return
      }
      setStage({ status: 'wizard', fileRef, type: 'docx', filename, fields })
      return
    }

    // PDF: DI pipeline (acroform i flat)
    let fields: GuideField[]
    let sectionShapes: SectionShape[]
    let fingerprint: string | null
    try {
      const res = await fetch('/api/obrasci/di-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileRef, type, filename }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Greška pri DI analizi.')
      fields = data.fields
      fingerprint = data.fingerprint ?? null
      sectionShapes = (data.sections as FormSection[] ?? []).map(s => ({
        title: s.title,
        page: s.page,
        fieldIds: s.fields.map(f => f.id),
      }))
    } catch (err) {
      setStage({ status: 'error', message: err instanceof Error ? err.message : 'Greška pri analizi PDF-a.' })
      return
    }

    setStage({ status: 'di-guide', fileRef, type: type as 'acroform' | 'flat', filename, fields, sectionShapes, fingerprint })
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  if (stage.status === 'wizard') {
    return (
      <WizardView
        fields={stage.fields}
        fileRef={stage.fileRef}
        type={stage.type}
        filename={stage.filename}
        onReset={reset}
      />
    )
  }

  if (stage.status === 'di-guide') {
    return (
      <GuideView
        fields={stage.fields}
        filename={stage.filename}
        onReset={reset}
        onAutoFill={(confirmedFields) =>
          setStage({
            status: 'di-preview',
            fileRef: stage.fileRef,
            type: stage.type,
            filename: stage.filename,
            confirmedFields,
            sectionShapes: stage.sectionShapes,
            fingerprint: stage.fingerprint,
          })
        }
        onWizard={() =>
          setStage({
            status: 'di-wizard',
            fileRef: stage.fileRef,
            type: stage.type,
            filename: stage.filename,
            fields: stage.fields,
            sectionShapes: stage.sectionShapes,
            fingerprint: stage.fingerprint,
          })
        }
      />
    )
  }

  if (stage.status === 'di-wizard') {
    return (
      <SectionWizardView
        sections={buildSections(stage.fields, stage.sectionShapes)}
        filename={stage.filename}
        onComplete={(confirmedFields) =>
          setStage({
            status: 'di-preview',
            fileRef: stage.fileRef,
            type: stage.type,
            filename: stage.filename,
            confirmedFields,
            sectionShapes: stage.sectionShapes,
            fingerprint: stage.fingerprint,
          })
        }
        onBack={(fields) =>
          setStage({
            status: 'di-guide',
            fileRef: stage.fileRef,
            type: stage.type,
            filename: stage.filename,
            fields,
            sectionShapes: stage.sectionShapes,
            fingerprint: stage.fingerprint,
          })
        }
      />
    )
  }

  if (stage.status === 'di-preview') {
    return (
      <PreviewView
        fileRef={stage.fileRef}
        pdfType={stage.type}
        filename={stage.filename}
        confirmedFields={stage.confirmedFields}
        fingerprint={stage.fingerprint}
        onBack={(fields) =>
          setStage({
            status: 'di-guide',
            fileRef: stage.fileRef,
            type: stage.type,
            filename: stage.filename,
            fields,
            sectionShapes: stage.sectionShapes,
            fingerprint: stage.fingerprint,
          })
        }
        onReset={reset}
      />
    )
  }

  const isLoading = stage.status === 'uploading' || stage.status === 'analyzing'

  return (
    <div className="space-y-4">
      {/* Upload zona */}
      <div
        onClick={() => !isLoading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); if (!isLoading) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors
          ${isLoading ? 'cursor-default border-gray-200 bg-gray-50' : 'cursor-pointer border-gray-300 bg-white hover:border-[#1B6B4A] hover:bg-green-50/30'}
          ${dragging ? 'border-[#1B6B4A] bg-green-50/40' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={onFileInput}
          disabled={isLoading}
        />

        {isLoading ? (
          <>
            <div className="mb-4 h-10 w-10 rounded-xl bg-[#1B6B4A]/10 flex items-center justify-center">
              <svg className="h-5 w-5 text-[#1B6B4A] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">
              {stage.status === 'uploading' ? 'Učitavanje...' : 'Analiza dokumenta...'}
            </p>
            {stage.status === 'analyzing' && (
              <>
                <p className="mt-1 text-xs text-gray-400">{stage.filename}</p>
                {(stage.type === 'acroform' || stage.type === 'flat') && (
                  <p className="mt-1 text-xs text-gray-400">Ovo može potrajati do 30 sekundi.</p>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              {dragging ? 'Otpustite fajl' : 'Prevucite obrazac ovde'}
            </p>
            <p className="mt-1 text-xs text-gray-400">ili kliknite da odaberete</p>
            <p className="mt-3 text-xs text-gray-400">PDF · DOCX · max 10MB</p>
          </>
        )}
      </div>

      {/* Greška */}
      {stage.status === 'error' && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-3">
          <svg className="h-4 w-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div className="flex-1">
            <p className="text-sm text-red-700">{stage.message}</p>
            <button onClick={reset} className="mt-1 text-xs text-red-500 hover:text-red-700">
              Pokušajte ponovo
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      {stage.status === 'idle' && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-medium text-gray-700">Podržani tipovi: </span>
            PDF obrasci se analiziraju i sistem predlaže vrednosti iz profila firme.
            DOCX dokumenti sa placeholderima se automatski popunjavaju.
          </p>
        </div>
      )}
    </div>
  )
}
