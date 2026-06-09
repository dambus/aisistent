'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import { wizardSteps as raduSteps } from '@/lib/prompts/ugovor-o-radu'
import { wizardSteps as deluSteps } from '@/lib/prompts/ugovor-o-delu'
import { wizardSteps as ndaSteps } from '@/lib/prompts/nda'
import { wizardSteps as zakupuSteps } from '@/lib/prompts/ugovor-o-zakupu'
import { wizardSteps as saradnjaSteps } from '@/lib/prompts/ugovor-o-saradnji-zajmu'
import { wizardSteps as punomocjeSteps } from '@/lib/prompts/punomocje'
import { wizardSteps as opstiUsloviSteps } from '@/lib/prompts/opsti-uslovi'
import { wizardSteps as poslovniMejlSteps } from '@/lib/prompts/poslovni-mejl'
import { wizardSteps as oglasZaPosaoSteps } from '@/lib/prompts/oglas-za-posao'
import { wizardSteps as ponudaKlijentuSteps } from '@/lib/prompts/ponuda-klijentu'
import { wizardSteps as odgovorKandidatuSteps } from '@/lib/prompts/odgovor-kandidatu'
import { wizardSteps as preporukaSteps } from '@/lib/prompts/preporuka'
import { wizardSteps as resenjeGodisnjiSteps } from '@/lib/prompts/resenje-godisnji-odmor'
import { wizardSteps as pravilnikORaduSteps } from '@/lib/prompts/pravilnik-o-radu'
import { wizardSteps as opisProizvodaSteps } from '@/lib/prompts/opis-proizvoda'
import { wizardSteps as bioONamaSteps } from '@/lib/prompts/bio-o-nama'
import { wizardSteps as zapisnikSastanakSteps } from '@/lib/prompts/zapisnik-sastanak'
import { WizardForm } from '@/components/wizard/WizardForm'
import { DocumentPreview } from '@/components/wizard/DocumentPreview'
import type { WizardStep } from '@/types/wizard'
import type { Company } from '@/types/database'

const documentMeta: Record<string, { title: string; steps: WizardStep[] }> = {
  'ugovor-o-radu':     { title: 'Ugovor o radu',                       steps: raduSteps },
  'ugovor-o-delu':     { title: 'Ugovor o delu',                       steps: deluSteps },
  'nda':               { title: 'NDA / Sporazum o poverljivosti',       steps: ndaSteps },
  'ugovor-o-zakupu':   { title: 'Ugovor o zakupu',                     steps: zakupuSteps },
  'ugovor-o-saradnji': { title: 'Ugovor o saradnji / Ugovor o zajmu',  steps: saradnjaSteps },
  'punomocje':         { title: 'Punomoćje',                           steps: punomocjeSteps },
  'opsti-uslovi':      { title: 'Opšti uslovi i Politika privatnosti',  steps: opstiUsloviSteps },
  'poslovni-mejl':     { title: 'Poslovni mejl',                       steps: poslovniMejlSteps },
  'oglas-za-posao':    { title: 'Oglas za posao',                      steps: oglasZaPosaoSteps },
  'ponuda-klijentu':          { title: 'Ponuda klijentu',                     steps: ponudaKlijentuSteps },
  'odgovor-kandidatu':        { title: 'Odgovor kandidatu',                  steps: odgovorKandidatuSteps },
  'preporuka':                { title: 'Preporuka/Referenca',                steps: preporukaSteps },
  'resenje-godisnji-odmor':   { title: 'Rešenje o godišnjem odmoru',         steps: resenjeGodisnjiSteps },
  'pravilnik-o-radu':         { title: 'Pravilnik o radu',                   steps: pravilnikORaduSteps },
  'opis-proizvoda':           { title: 'Opis proizvoda/usluge',              steps: opisProizvodaSteps },
  'bio-o-nama':               { title: 'Bio / O nama',                       steps: bioONamaSteps },
  'zapisnik-sastanak':        { title: 'Zapisnik sa sastanka',               steps: zapisnikSastanakSteps },
}

interface WizardPageClientProps {
  type: string
  companies: Company[]
}

export function WizardPageClient({ type, companies }: WizardPageClientProps) {
  const meta = documentMeta[type]
  const [result, setResult] = useState<{ documentId: string; generatedText: string } | null>(null)

  if (!meta) notFound()

  if (result) {
    return (
      <DocumentPreview
        text={result.generatedText}
        documentId={result.documentId}
        documentType={type}
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
        companies={companies}
        onComplete={(documentId, generatedText) => setResult({ documentId, generatedText })}
      />
    </div>
  )
}
