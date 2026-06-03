'use client'

import { useState, use } from 'react'
import { notFound } from 'next/navigation'
import { wizardSteps } from '@/lib/prompts/ugovor-o-radu'
import { WizardForm } from '@/components/wizard/WizardForm'
import { DocumentPreview } from '@/components/wizard/DocumentPreview'

const documentMeta: Record<string, { title: string; steps: typeof wizardSteps }> = {
  'ugovor-o-radu': { title: 'Ugovor o radu', steps: wizardSteps },
}

interface PageProps {
  params: Promise<{ type: string }>
}

export default function WizardPage({ params }: PageProps) {
  const { type } = use(params)
  const meta = documentMeta[type]

  const [result, setResult] = useState<{ documentId: string; generatedText: string } | null>(null)

  if (!meta) notFound()

  if (result) {
    return (
      <DocumentPreview
        text={result.generatedText}
        documentId={result.documentId}
        onReset={() => setResult(null)}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Popunite podatke i AI će generisati kompletan pravni dokument.
        </p>
      </div>

      <WizardForm
        steps={meta.steps}
        documentType={type}
        onComplete={(documentId, generatedText) => setResult({ documentId, generatedText })}
      />
    </div>
  )
}
