import type { WizardStep } from '@/types/wizard'

export interface OtpremnicaData {
  broj_dokumenta?: string
  datum_izdavanja: string
  datum_isporuke?: string

  isporucilac_naziv: string
  isporucilac_pib?: string
  isporucilac_adresa: string
  isporucilac_tekuci_racun?: string
  isporucilac_email?: string
  isporucilac_telefon?: string
  isporucilac_pdv_obveznik: boolean

  primalac_naziv: string
  primalac_pib?: string
  primalac_adresa: string

  nacin_isporuke?: string
  stavke: string
  pdv_stopa?: string
  napomena?: string
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'dokument',
    title: 'Dokument',
    fields: [
      {
        id: 'broj_dokumenta',
        label: 'Broj otpremnice',
        type: 'text',
        required: false,
        placeholder: 'npr. OT-2026-001',
        helperText: 'Redni broj otpremnice — opciono',
      },
      {
        id: 'datum_izdavanja',
        label: 'Datum izdavanja',
        type: 'date',
        required: true,
        helperText: 'Datum kada se otpremnica izdaje',
      },
      {
        id: 'datum_isporuke',
        label: 'Datum isporuke',
        type: 'date',
        required: false,
        helperText: 'Datum fizičke isporuke robe (ako se razlikuje)',
      },
    ],
  },
  {
    id: 'isporucilac',
    title: 'Isporučilac',
    fields: [
      { id: 'isporucilac_naziv', label: 'Naziv firme / preduzetnika', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Puni naziv kao u APR registru' },
      { id: 'isporucilac_pib', label: 'PIB', type: 'text', required: false, placeholder: '123456789', helperText: '9 cifara' },
      { id: 'isporucilac_adresa', label: 'Adresa sedišta', type: 'text', required: true, placeholder: 'npr. Mihajla Pupina 10, Novi Sad', helperText: 'Adresa iz APR registra' },
      { id: 'isporucilac_tekuci_racun', label: 'Tekući račun', type: 'text', required: false, placeholder: 'npr. 160-123456-33', helperText: 'Opciono' },
      { id: 'isporucilac_email', label: 'Email', type: 'text', required: false, placeholder: 'npr. office@firma.rs' },
      { id: 'isporucilac_telefon', label: 'Telefon', type: 'text', required: false, placeholder: 'npr. +381 21 123 456' },
      {
        id: 'isporucilac_pdv_obveznik',
        label: 'Isporučilac je u sistemu PDV-a?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        helperText: 'Uključite samo ako izdajete PDV dokumente',
        tooltip: 'PDV obveznici obračunavaju PDV na svaki promet i moraju ga iskazati na dokumentu.\nAko niste PDV obveznik, otpremnica nema PDV — dodaje se napomena.',
      },
    ],
  },
  {
    id: 'primalac',
    title: 'Primalac',
    fields: [
      { id: 'primalac_naziv', label: 'Naziv firme / primaoca', type: 'text', required: true, placeholder: 'npr. Klijent doo', helperText: 'Puni naziv primaoca' },
      { id: 'primalac_pib', label: 'PIB primaoca', type: 'text', required: false, placeholder: '123456789', helperText: 'Opciono — ako je primalac firma' },
      { id: 'primalac_adresa', label: 'Adresa primaoca', type: 'text', required: true, placeholder: 'npr. Knez Mihailova 1, Beograd' },
      {
        id: 'nacin_isporuke',
        label: 'Način isporuke',
        type: 'text',
        required: false,
        placeholder: 'npr. Lično preuzimanje / Kurirska služba / Sopstveni prevoz',
        helperText: 'Opciono — kako se roba isporučuje',
      },
    ],
  },
  {
    id: 'stavke',
    title: 'Stavke',
    fields: [
      {
        id: 'pdv_stopa',
        label: 'PDV stopa',
        type: 'radio',
        required: false,
        defaultValue: '0',
        conditional: { field: 'isporucilac_pdv_obveznik', value: true },
        tooltip: '20% — standardna stopa za većinu robe\n10% — snižena stopa\n0% — izvoz\nOslobođeno — određena roba po zakonu',
        options: [
          { value: '20', label: '20%' },
          { value: '10', label: '10%' },
          { value: '0', label: '0% (izvoz)' },
          { value: 'oslobodjeno', label: 'Oslobođeno PDV-a' },
        ],
      },
      {
        id: 'stavke',
        label: 'Stavke',
        type: 'faktura_stavke' as never,
        required: true,
        helperText: 'Dodajte stavke — roba koja se isporučuje',
      },
    ],
  },
  {
    id: 'napomene',
    title: 'Napomena',
    fields: [
      { id: 'napomena', label: 'Napomena', type: 'textarea', required: false, placeholder: 'npr. Roba preuzeta u ispravnom stanju.', helperText: 'Opciona napomena na dokumentu' },
    ],
  },
]
