'use client'

import { useState, useCallback } from 'react'
import type { WizardStep, WizardField } from '@/types/wizard'
import type { Company } from '@/types/database'
import { UpgradeModal } from './UpgradeModal'
import { TooltipIcon, HelperText } from './FieldHelper'
import { CompanySelectModal } from './CompanySelectModal'
import { buildCompanyFields } from '@/lib/utils/companyFieldMap'
import { FakturaStavkeField } from './FakturaStavkeField'
import { Switch } from '@/components/ui/switch'

interface WizardFormProps {
  steps: WizardStep[]
  documentType: string
  companies?: Company[]
  onComplete: (documentId: string, generatedText: string, documentTitle: string, isFree: boolean) => void
}

type FormValues = Record<string, string | number | boolean>

function resolveField(field: WizardField, formValues: FormValues): WizardField {
  if (!field.dynamicConfig) return field
  const watchValue = String(formValues[field.dynamicConfig.watchField] ?? '')
  const override = field.dynamicConfig.values[watchValue]
  if (!override) return field
  return { ...field, ...override }
}

function getVisibleFields(fields: WizardField[], values: FormValues): WizardField[] {
  return fields.filter(f => {
    if (!f.conditional) return true
    return values[f.conditional.field] === f.conditional.value
  })
}

function getVisibleSteps(steps: WizardStep[], values: FormValues): WizardStep[] {
  return steps.filter(step => {
    if (!step.showIf) return true
    return values[step.showIf.field] === step.showIf.value
  })
}

function getDefaultValue(field: WizardField): string | number | boolean {
  if (field.type === 'toggle') return field.defaultValue ?? false
  return field.defaultValue ?? ''
}

function buildInitialValues(steps: WizardStep[]): FormValues {
  const values: FormValues = {}
  for (const step of steps) {
    for (const field of step.fields) {
      values[field.id] = getDefaultValue(field)
    }
  }
  return values
}

export function WizardForm({ steps, documentType, companies = [], onComplete }: WizardFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [values, setValues] = useState<FormValues>(buildInitialValues(steps))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showCompanyModal, setShowCompanyModal] = useState(companies.length > 0)

  const visibleSteps = getVisibleSteps(steps, values)
  const step = visibleSteps[currentStep] ?? visibleSteps[0]
  const visibleFields = getVisibleFields(step.fields, values)
  const isLast = currentStep === visibleSteps.length - 1
  const primaryButtonStyle = { backgroundColor: '#1B6B4A' }

  const setValue = useCallback((id: string, value: string | number | boolean) => {
    setValues(prev => ({ ...prev, [id]: value }))
    setErrors(prev => ({ ...prev, [id]: '' }))
  }, [])

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    for (const field of visibleFields) {
      if (!field.required) continue
      const val = values[field.id]
      if (val === undefined || val === '' || val === null) {
        newErrors[field.id] = 'Ovo polje je obavezno.'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleNext() {
    if (!validate()) return
    setCurrentStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleBack() {
    setCurrentStep(s => s - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    setApiError('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: documentType, data: values }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.error === 'PLAN_LIMIT') {
          setShowUpgrade(true)
          return
        }
        const detail = json.fields?.length
          ? `\nProblematična polja: ${json.fields.join(', ')}`
          : ''
        setApiError((json.error ?? 'Greška pri generisanju. Pokušajte ponovo.') + detail)
        return
      }

      onComplete(json.document_id, json.generated_text, json.title ?? 'Dokument', json.is_free ?? false)
    } catch {
      setApiError('Greška pri slanju zahteva. Proverite vezu i pokušajte ponovo.')
    } finally {
      setLoading(false)
    }
  }

  function handleCompanySelect(company: Company) {
    const fields = buildCompanyFields(company, documentType)
    setValues(prev => ({ ...prev, ...fields }))
    setShowCompanyModal(false)
  }

  return (
    <>
      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}

      <CompanySelectModal
        companies={companies}
        isOpen={showCompanyModal}
        onSelect={handleCompanySelect}
        onSkip={() => setShowCompanyModal(false)}
      />

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            Korak {currentStep + 1} od {visibleSteps.length}
          </span>
          <span className="text-sm font-medium text-gray-700">{step.title}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / visibleSteps.length) * 100}%`, backgroundColor: '#1B6B4A' }}
          />
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 overflow-x-hidden w-full">
        <h2 className="text-lg font-semibold text-gray-900">{step.title}</h2>

        {visibleFields.map(field => {
          if ((field.type as string) === 'faktura_stavke') {
            const pdvObveznik = values['izdavalac_pdv_obveznik'] as boolean
            const pdvStopaStr = values['pdv_stopa'] as string
            const pdvStopa = pdvObveznik ? (parseInt(pdvStopaStr) || 0) : 0
            return (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <FakturaStavkeField
                  value={(values[field.id] as string) ?? '[]'}
                  pdvStopa={pdvStopa}
                  onChange={val => setValue(field.id, val)}
                />
                {field.helperText && <HelperText text={field.helperText} />}
                {errors[field.id] && <p className="mt-1 text-xs text-red-600">{errors[field.id]}</p>}
              </div>
            )
          }
          return (
            <FieldRenderer
              key={field.id}
              field={resolveField(field, values)}
              value={values[field.id]}
              error={errors[field.id]}
              onChange={setValue}
            />
          )
        })}
      </div>

      {apiError && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {apiError}
        </p>
      )}

      {/* Navigation */}
      <div className="mt-6 flex gap-3">
        {currentStep > 0 && (
          <button
            onClick={handleBack}
            disabled={loading}
            className="flex-1 sm:flex-none px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            ← Nazad
          </button>
        )}
        <button
          onClick={isLast ? handleSubmit : handleNext}
          disabled={loading}
          className="flex-1 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          style={primaryButtonStyle}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#155C3E' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#1B6B4A' }}
        >
          {loading ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generišem dokument...
            </>
          ) : isLast ? (
            'Generiši dokument ✨'
          ) : (
            'Dalje →'
          )}
        </button>
      </div>
    </>
  )
}

// ——— Field Renderer ———

interface FieldRendererProps {
  field: WizardField
  value: string | number | boolean | undefined
  error: string | undefined
  onChange: (id: string, value: string | number | boolean) => void
}

function FieldRenderer({ field, value, error, onChange }: FieldRendererProps) {
  const baseInput = 'w-full px-3 py-2 border rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary'
  const borderClass = error ? 'border-red-400' : 'border-gray-300'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-0.5">*</span>}
        {field.tooltip && <TooltipIcon tooltip={field.tooltip} />}
      </label>

      {field.hint && (
        <p className="text-xs text-gray-400 mb-1.5">{field.hint}</p>
      )}

      {field.type === 'text' && (
        <input
          type="text"
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={e => onChange(field.id, e.target.value)}
          className={`${baseInput} ${borderClass}`}
        />
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={(value as number) ?? ''}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          onChange={e => onChange(field.id, e.target.valueAsNumber)}
          className={`${baseInput} ${borderClass}`}
        />
      )}

      {field.type === 'date' && (
        <input
          type="date"
          value={(value as string) ?? ''}
          onChange={e => onChange(field.id, e.target.value)}
          className={`${baseInput} ${borderClass}`}
        />
      )}

      {field.type === 'textarea' && (
        <textarea
          value={(value as string) ?? ''}
          placeholder={field.placeholder}
          rows={3}
          onChange={e => onChange(field.id, e.target.value)}
          className={`${baseInput} ${borderClass} resize-none`}
        />
      )}

      {field.type === 'dropdown' && (
        <select
          value={(value as string) ?? ''}
          onChange={e => onChange(field.id, e.target.value)}
          className={`${baseInput} ${borderClass} bg-white`}
        >
          <option value="">— Izaberite —</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )}

      {field.type === 'radio' && (
        <div className="flex flex-wrap gap-2 mt-1 max-w-full">
          {field.options?.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(field.id, opt.value)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                value === opt.value
                  ? 'text-white'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
              }`}
              style={value === opt.value ? { backgroundColor: '#1B6B4A', borderColor: '#1B6B4A' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {field.type === 'toggle' && (
        <Switch
          checked={!!value}
          onCheckedChange={(checked) => onChange(field.id, checked)}
        />
      )}

      {field.helperText && <HelperText text={field.helperText} />}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
