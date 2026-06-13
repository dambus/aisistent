import type { WizardStep } from '@/types/wizard'

export const wizardSteps: WizardStep[] = [
  {
    id: 'tip',
    title: 'Tip dokumenta',
    fields: [
      {
        id: 'tip_dokumenta',
        label: 'Tip dokumenta',
        type: 'radio',
        required: true,
        defaultValue: 'Faktura',
        tooltip: 'Faktura — zvanični računovodstveni dokument za izvršenu uslugu ili isporuku.\nProfaktura — nije knjigovodstveni dokument, koristi se kao predračun pre isplate.',
        options: [
          { value: 'Faktura', label: 'Faktura' },
          { value: 'Profaktura', label: 'Profaktura' },
        ],
      },
      {
        id: 'broj_dokumenta',
        label: 'Broj dokumenta',
        type: 'text',
        required: false,
        placeholder: 'npr. 2026-001',
        helperText: 'Redni broj fakture — opciono, možete popuniti ručno',
      },
      {
        id: 'datum_izdavanja',
        label: 'Datum izdavanja',
        type: 'date',
        required: true,
        helperText: 'Datum kada se dokument izdaje',
      },
      {
        id: 'datum_prometa',
        label: 'Datum prometa',
        type: 'date',
        required: false,
        helperText: 'Datum kada je usluga izvršena ili roba isporučena (ako se razlikuje)',
      },
      {
        id: 'datum_valute',
        label: 'Datum valute (rok plaćanja)',
        type: 'date',
        required: true,
        helperText: 'Datum do kojeg primalac treba da plati',
      },
    ],
  },
  {
    id: 'izdavalac',
    title: 'Izdavalac',
    fields: [
      { id: 'izdavalac_naziv', label: 'Naziv firme / preduzetnika', type: 'text', required: true, placeholder: 'npr. Sigma Solutions doo', helperText: 'Puni naziv kao u APR registru' },
      { id: 'izdavalac_pib', label: 'PIB', type: 'text', required: true, placeholder: '123456789', helperText: '9 cifara' },
      { id: 'izdavalac_adresa', label: 'Adresa sedišta', type: 'text', required: true, placeholder: 'npr. Mihajla Pupina 10, Novi Sad', helperText: 'Adresa iz APR registra' },
      { id: 'izdavalac_tekuci_racun', label: 'Tekući račun', type: 'text', required: false, placeholder: 'npr. 160-123456-33', helperText: 'Broj računa za uplatu' },
      { id: 'izdavalac_email', label: 'Email', type: 'text', required: false, placeholder: 'npr. office@firma.rs' },
      { id: 'izdavalac_telefon', label: 'Telefon', type: 'text', required: false, placeholder: 'npr. +381 21 123 456' },
      {
        id: 'izdavalac_pdv_obveznik',
        label: 'Izdavalac je u sistemu PDV-a?',
        type: 'toggle',
        required: false,
        defaultValue: false,
        helperText: 'Uključite samo ako izdajete PDV račune i imate PDV broj',
        tooltip: 'PDV obveznici obračunavaju PDV na svaki promet i moraju ga iskazati na fakturi.\nAko niste PDV obveznik (paušalac, mali preduzetnik do 8M RSD), faktura nema PDV — dodaje se napomena.',
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
        conditional: { field: 'izdavalac_pdv_obveznik', value: true },
        tooltip: '20% — standardna stopa za većinu usluga\n10% — snižena stopa (hrana, lekovi, turistički promet)\n0% — izvoz\nOslobođeno — određene usluge po zakonu',
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
        helperText: 'Dodajte stavke — usluge ili robe koje fakturišete',
      },
    ],
  },
  {
    id: 'napomene',
    title: 'Napomene',
    fields: [
      { id: 'poziv_na_broj', label: 'Poziv na broj', type: 'text', required: false, placeholder: 'npr. 2026-001', helperText: 'Referenca za plaćanje — korisnik navodi pri uplati' },
      { id: 'napomena', label: 'Napomena', type: 'textarea', required: false, placeholder: 'npr. Hvala na saradnji!', helperText: 'Opciona napomena na dokumentu' },
    ],
  },
]
