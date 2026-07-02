'use client'

// Privremena izolovana preview stranica za Faza 3 Korak 3 STOP checkpoint —
// SectionWizardView sa mock podacima, van auth-a radi lakšeg testiranja.
// Ukloniti kad se komponenta poveže u pravi flow (Korak 4).

import { SectionWizardView } from '@/components/obrasci/SectionWizardView'
import type { FormSection } from '@/types/obrasci'

const MOCK_SECTIONS: FormSection[] = [
  {
    title: '1. ПОДАЦИ О ПОРЕСКОМ ОБВЕЗНИКУ',
    page: 1,
    fields: [
      { id: 'f1', label: 'ПИБ', suggestedValue: '123456789', profileKey: 'pib', isInternal: false, state: 'high' },
      { id: 'f2', label: 'Пословно име', suggestedValue: 'Testna Firma d.o.o.', profileKey: 'naziv', isInternal: false, state: 'high' },
      { id: 'f3', label: 'Општина', suggestedValue: 'Врачар', profileKey: 'grad', isInternal: false, state: 'low' },
      { id: 'f4', label: 'Организациона јединица', suggestedValue: null, profileKey: null, isInternal: true, state: 'manual' },
    ],
  },
  {
    title: '2. ПОДАЦИ О РАДЊИ',
    page: 1,
    fields: [
      { id: 'f5', label: 'Матични број радње', suggestedValue: null, profileKey: null, isInternal: false, state: 'manual' },
      {
        id: 'f6',
        label: 'Телефон',
        suggestedValue: '063 1234567',
        profileKey: 'telefon',
        isInternal: false,
        state: 'high',
        hint: 'Broj telefona je podeljen u više polja obrasca — proverite da li ceo broj staje.',
      },
      { id: 'f7', label: 'Датум уписа у регистар', suggestedValue: null, profileKey: null, isInternal: false, state: 'manual' },
    ],
  },
  {
    title: '3. ПОТПИС',
    page: 2,
    fields: [
      { id: 'f8', label: 'Потпис одговорног лица', suggestedValue: null, profileKey: null, isInternal: false, state: 'manual' },
      { id: 'f9', label: 'М.П.', suggestedValue: null, profileKey: null, isInternal: false, state: 'manual' },
    ],
  },
]

export default function DevWizardPreviewPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <SectionWizardView
          sections={MOCK_SECTIONS}
          filename="PPDG-1S-mock.pdf"
          onComplete={(fields) => console.log('onComplete', fields)}
          onBack={() => console.log('onBack')}
        />
      </div>
    </div>
  )
}
