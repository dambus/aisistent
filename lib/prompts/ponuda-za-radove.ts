import type { WizardStep } from '@/types/wizard'

export interface PonudaZaRadoveData {
  broj_ponude?: string
  datum_izdavanja: string
  rok_vazenja?: string

  izvodjac_naziv: string
  izvodjac_pib?: string
  izvodjac_adresa: string
  izvodjac_tekuci_racun?: string
  izvodjac_email?: string
  izvodjac_telefon?: string
  izvodjac_pdv_obveznik: boolean

  narucilac_naziv: string
  narucilac_pib?: string
  narucilac_adresa: string

  lokacija_radova?: string
  opis_radova?: string

  stavke: string
  pdv_stopa?: string
  napomena?: string
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'ponuda',
    title: 'Ponuda',
    fields: [
      {
        id: 'broj_ponude',
        label: 'Broj ponude',
        type: 'text',
        required: false,
        placeholder: 'npr. PR-2026-001',
        helperText: 'Redni broj ponude — opciono',
      },
      {
        id: 'datum_izdavanja',
        label: 'Datum izdavanja',
        type: 'date',
        required: true,
        helperText: 'Datum kada se ponuda izdaje',
      },
      {
        id: 'rok_vazenja',
        label: 'Rok važenja ponude',
        type: 'text',
        required: false,
        placeholder: 'npr. 30 dana od datuma izdavanja',
        helperText: 'Koliko dugo važi ova ponuda',
      },
    ],
  },
  {
    id: 'izvodjac',
    title: 'Izvođač',
    fields: [
      { id: 'izvodjac_naziv', label: 'Naziv firme / preduzetnika', type: 'text', required: true, placeholder: 'npr. Majstor doo', helperText: 'Puni naziv kao u APR registru' },
      { id: 'izvodjac_pib', label: 'PIB', type: 'text', required: false, placeholder: '123456789', helperText: '9 cifara' },
      { id: 'izvodjac_adresa', label: 'Adresa sedišta', type: 'text', required: true, placeholder: 'npr. Mihajla Pupina 10, Novi Sad', helperText: 'Adresa iz APR registra' },
      { id: 'izvodjac_tekuci_racun', label: 'Tekući račun', type: 'text', required: false, placeholder: 'npr. 160-123456-33', helperText: 'Opciono' },
      { id: 'izvodjac_email', label: 'Email', type: 'text', required: false, placeholder: 'npr. office@majstor.rs' },
      { id: 'izvodjac_telefon', label: 'Telefon', type: 'text', required: false, placeholder: 'npr. +381 21 123 456' },
      {
        id: 'izvodjac_pdv_obveznik',
        label: 'Izvođač je u sistemu PDV-a?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        helperText: 'Uključite samo ako ste PDV obveznik',
        tooltip: 'PDV obveznici obračunavaju PDV na svaki promet i moraju ga iskazati na dokumentu.\nAko niste PDV obveznik, cene u ponudi su konačne — dodaje se napomena.',
      },
    ],
  },
  {
    id: 'narucilac',
    title: 'Naručilac',
    fields: [
      { id: 'narucilac_naziv', label: 'Naziv firme / naručioca', type: 'text', required: true, placeholder: 'npr. Klijent doo', helperText: 'Puni naziv naručioca' },
      { id: 'narucilac_pib', label: 'PIB naručioca', type: 'text', required: false, placeholder: '123456789', helperText: 'Opciono — ako je naručilac firma' },
      { id: 'narucilac_adresa', label: 'Adresa naručioca', type: 'text', required: true, placeholder: 'npr. Knez Mihailova 1, Beograd' },
      {
        id: 'lokacija_radova',
        label: 'Lokacija radova',
        type: 'text',
        required: false,
        placeholder: 'npr. Bulevar Oslobođenja 12, Novi Sad',
        helperText: 'Adresa gde se radovi izvode (ako se razlikuje od adrese naručioca)',
      },
      {
        id: 'opis_radova',
        label: 'Opis radova',
        type: 'textarea',
        required: false,
        placeholder: 'npr. Kompletna rekonstrukcija kupatila — keramika, vodoinstalacije, elektrika',
        helperText: 'Kratak opis obima radova',
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
        conditional: { field: 'izvodjac_pdv_obveznik', value: true },
        tooltip: '20% — standardna stopa\n10% — snižena stopa\n0% — izvoz\nOslobođeno — određeni radovi po zakonu',
        options: [
          { value: '20', label: '20%' },
          { value: '10', label: '10%' },
          { value: '0', label: '0% (izvoz)' },
          { value: 'oslobodjeno', label: 'Oslobođeno PDV-a' },
        ],
      },
      {
        id: 'stavke',
        label: 'Stavke radova',
        type: 'faktura_stavke' as never,
        required: true,
        helperText: 'Dodajte stavke — opis rada, količina, jedinica mere i cena',
      },
    ],
  },
  {
    id: 'napomena',
    title: 'Napomena',
    fields: [
      { id: 'napomena', label: 'Napomena', type: 'textarea', required: false, placeholder: 'npr. Cene važe pod uslovom da se radovi izvode bez prekida.', helperText: 'Opciona napomena na dokumentu' },
    ],
  },
]
