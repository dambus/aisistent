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
import { wizardSteps as obavestenjeSteps } from '@/lib/prompts/obavestenje-o-promeni-uslova'
import { wizardSteps as opisProizvodaSteps } from '@/lib/prompts/opis-proizvoda'
import { wizardSteps as bioONamaSteps } from '@/lib/prompts/bio-o-nama'
import { wizardSteps as zapisnikSastanakSteps } from '@/lib/prompts/zapisnik-sastanak'
import { wizardSteps as fakturaSteps } from '@/lib/prompts/faktura'
import { wizardSteps as putniNalogSteps } from '@/lib/prompts/putni-nalog'
import { wizardSteps as otpremnicaSteps } from '@/lib/prompts/otpremnica'
import { wizardSteps as ponudaZaRadoveSteps } from '@/lib/prompts/ponuda-za-radove'
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
  'pravilnik-o-radu':                { title: 'Pravilnik o radu',                        steps: pravilnikORaduSteps },
  'obavestenje-o-promeni-uslova':    { title: 'Obaveštenje o promeni uslova rada',        steps: obavestenjeSteps },
  'opis-proizvoda':                  { title: 'Opis proizvoda/usluge',                    steps: opisProizvodaSteps },
  'bio-o-nama':               { title: 'Bio / O nama',                       steps: bioONamaSteps },
  'zapisnik-sastanak':        { title: 'Zapisnik sa sastanka',               steps: zapisnikSastanakSteps },
  'faktura':                  { title: 'Faktura / Profaktura',               steps: fakturaSteps },
  'putni-nalog':              { title: 'Putni nalog',                         steps: putniNalogSteps },
  'otpremnica':               { title: 'Otpremnica',                          steps: otpremnicaSteps },
  'ponuda-za-radove':         { title: 'Ponuda za radove',                    steps: ponudaZaRadoveSteps },
}

interface WizardPageClientProps {
  type: string
  companies: Company[]
  plan?: string
  initialValues?: Record<string, string | number | boolean>
  rootDocumentId?: string
  preselectedClientId?: string
}

export function WizardPageClient({ type, companies, plan, initialValues, rootDocumentId, preselectedClientId }: WizardPageClientProps) {
  const meta = documentMeta[type]
  const [result, setResult] = useState<{ documentId: string; generatedText: string; documentTitle: string; isFree: boolean; selectedCompany?: Company | null } | null>(null)

  if (!meta) notFound()

  const wizardSubtitle = (() => {
    if (['ugovor-o-radu','ugovor-o-delu','nda','ugovor-o-zakupu','ugovor-o-saradnji','punomocje','opsti-uslovi'].includes(type)) {
      return 'Popunite podatke i AI će generisati kompletan poslovni dokument.'
    }
    if (['poslovni-mejl','ponuda-klijentu'].includes(type)) {
      return 'Popunite podatke i AI će generisati profesionalan poslovni tekst.'
    }
    if (['oglas-za-posao','odgovor-kandidatu','preporuka','resenje-godisnji-odmor','pravilnik-o-radu','obavestenje-o-promeni-uslova'].includes(type)) {
      return 'Popunite podatke i AI će generisati kompletan HR dokument.'
    }
    if (type === 'faktura') {
      return 'Unesite podatke i sistem će generisati fakturu ili profakturu.'
    }
    if (type === 'putni-nalog') {
      return 'Unesite podatke o putovanju i sistem će generisati putni nalog.'
    }
    if (type === 'otpremnica') {
      return 'Unesite podatke i sistem će generisati otpremnicu.'
    }
    if (type === 'ponuda-za-radove') {
      return 'Unesite stavke radova i sistem će generisati profesionalnu ponudu.'
    }
    return 'Popunite podatke i AI će generisati profesionalan dokument.'
  })()

  if (result) {
    return (
      <DocumentPreview
        text={result.generatedText}
        documentId={result.documentId}
        documentTitle={result.documentTitle}
        documentType={type}
        isFree={result.isFree}
        plan={plan}
        selectedCompany={result.selectedCompany}
        onReset={() => setResult(null)}
      />
    )
  }

  return (
    <div className="max-w-2xl mx-auto w-full overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {wizardSubtitle}
        </p>
      </div>

      <WizardForm
        steps={meta.steps}
        documentType={type}
        companies={companies}
        plan={plan}
        initialValues={initialValues}
        rootDocumentId={rootDocumentId}
        preselectedClientId={preselectedClientId}
        onComplete={(documentId, generatedText, documentTitle, isFree, selectedCompany) => setResult({ documentId, generatedText, documentTitle, isFree, selectedCompany })}
      />
    </div>
  )
}
