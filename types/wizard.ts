export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'dropdown' | 'radio' | 'toggle'

export interface WizardField {
  id: string
  label: string
  type: FieldType
  required: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  defaultValue?: string | number | boolean
  conditional?: {
    field: string
    value: string | boolean
  }
  hint?: string
}

export interface WizardStep {
  id: string
  title: string
  fields: WizardField[]
}

// Ugovor o radu — form data
export interface UgovorORaduData {
  // Blok 1 — Poslodavac
  firma: string
  pib: string
  mb: string
  adresa_firme: string
  zastupnik: string
  funkcija: string
  // Blok 2 — Zaposleni
  ime_prezime: string
  jmbg: string
  adresa_zaposlenog: string
  broj_lk?: string
  sprema: string
  // Blok 3 — Radno mesto
  pozicija: string
  opis: string
  mesto_rada: string
  rad_od_kuce: string
  // Blok 4 — Trajanje
  vrsta_radnog_odnosa: string
  datum_pocetka: string
  datum_isteka?: string
  osnov?: string
  probni_rad: boolean
  probni_rad_meseci?: number
  // Blok 5 — Zarada
  bruto: number
  nacin_isplate: string
  dan_isplate: number
  topli_obrok?: number
  prevoz?: string
  // Blok 6 — Radno vreme
  fond_sati: number
  raspored: string
  godisnji_odmor: number
  // Blok 7 — Opciono
  zabrana_konkurencije: boolean
  trajanje_zabrane?: number
  napomene?: string
}

export type WizardFormData = UgovorORaduData
