'use client'

// Privremena izolovana preview stranica za Faza 3 Korak 3 STOP checkpoint —
// SectionWizardView sa mock podacima, van auth-a radi lakšeg testiranja.
// Ukloniti kad se komponenta poveže u pravi flow (Korak 4).

import { useState } from 'react'
import { SectionWizardView } from '@/components/obrasci/SectionWizardView'
import type { FormSection } from '@/types/obrasci'

const SMALL_SECTIONS: FormSection[] = [
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

// Stvarni naslovi detektovani na PPDG-1S (Korak 2 test) — za proveru navigacije na skali (19 sekcija)
const PPDG_TITLES = [
  'МИНИСТАРСТВО ФИНАНСИЈА HOPECKA yПРАВА',
  '1. ПОДАЦИ О ПОРЕСКОМ ОБВЕЗНИКУ:',
  '2. ПОДАЦИ О РАДЊИ:',
  '3. ПОДАЦИ О ДЕЛАТНОСТИ:',
  '4. ПОДАЦИ О РАЧУНУ У БАНЦИ:',
  '5. ПОДАЦИ О ПОСЕБНИМ ПРОСТОРИМА - ИЗДВОЈЕНИМ ПОСЛОВНИМ ЈЕДИНИЦАМА:',
  'ПОДАЦИ О ПОСЛОВНОМ РЕЗУЛТАТУ:',
  'ПОДАЦИ ОД ЗНАЧАЈА ЗА ОСТВАРИВАЊЕ ПОРЕСКИХ ПОДСТИЦАЈА И ПОРЕСКИХ КРЕДИТА:',
  'ПОДАЦИ О ПОРЕСКОЈ ОСНОВИЦИ И ОБРАЧУНАТОМ ПОРЕЗУ:',
  'ПОДАЦИ О ОСНОВИЦИ ДОПРИНОСА И ОБРАЧУНАТИМ ДОПРИНОСИМА:',
  'ПОДАЦИ ОД ЗНАЧАЈА ЗА УТВРЂИВАЊЕ ВИСИНЕ АКОНТАЦИЈЕ ПОРЕЗА И ДОПРИНОСА:',
  'ПОДАЦИ ОД ЗНАЧАЈА ЗА ИЗМЕНУ МЕСЕЧНЕ АКОНТАЦИЈЕ:',
  'ПОСЕБНИ ПОДАЦИ:',
  '13.3.1. Укупна вредност основних средстава',
  '14. ПОПИС ПРИЛОЖЕНИХ ДОКАЗА:',
  '15. НАПОМЕНА ПОРЕСКОГ ОБВЕЗНИКА / ПУНОМОЋНИКА / ЗАСТУПНИКА:',
  'попуњава подносилац пореске пријаве:',
  'М.П.',
  'попуњава Пореска управа:',
]

const BIG_SECTIONS: FormSection[] = PPDG_TITLES.map((title, i) => ({
  title,
  page: 1 + Math.floor(i / 5),
  fields: [
    { id: `big-${i}-a`, label: `Polje A sekcije ${i + 1}`, suggestedValue: i % 3 === 0 ? 'Testna Firma d.o.o.' : null, profileKey: null, isInternal: false, state: i % 3 === 0 ? 'high' as const : 'manual' as const },
    { id: `big-${i}-b`, label: `Polje B sekcije ${i + 1}`, suggestedValue: null, profileKey: null, isInternal: false, state: 'manual' as const },
  ],
}))

export default function DevWizardPreviewPage() {
  const [big, setBig] = useState(false)
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-3">
        <button
          onClick={() => setBig(b => !b)}
          className="text-xs text-gray-500 underline"
        >
          Mock: {big ? '19 sekcija (PPDG-1S)' : '3 sekcije'} — klikni za {big ? '3 sekcije' : '19 sekcija'}
        </button>
        <SectionWizardView
          key={big ? 'big' : 'small'}
          sections={big ? BIG_SECTIONS : SMALL_SECTIONS}
          filename={big ? 'PPDG-1S-p.pdf' : 'PPDG-1S-mock.pdf'}
          onComplete={(fields) => console.log('onComplete', fields)}
          onBack={() => console.log('onBack')}
        />
      </div>
    </div>
  )
}
