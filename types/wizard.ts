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

export interface UgovorORaduData {
  firma: string
  pib: string
  mb: string
  adresa_firme: string
  zastupnik: string
  funkcija: string
  broj_ugovora?: string
  ime_prezime: string
  jmbg: string
  adresa_zaposlenog: string
  broj_lk?: string
  sprema: string
  pozicija: string
  opis: string
  mesto_rada: string
  rad_od_kuce: string
  vrsta_radnog_odnosa: string
  datum_pocetka: string
  datum_isteka?: string
  osnov?: string
  probni_rad: boolean
  probni_rad_meseci?: number
  bruto: number
  nacin_isplate: string
  dan_isplate: number
  topli_obrok?: number
  prevoz?: string
  fond_sati: number
  raspored: string
  godisnji_odmor: number
  zabrana_konkurencije: boolean
  trajanje_zabrane?: number
  napomene?: string
}

export interface UgovorODeluData {
  tip_narucioca: string
  naziv_narucioca: string
  pib_narucioca?: string
  adresa_narucioca: string
  zastupnik_narucioca?: string
  tip_izvodjaca: string
  naziv_izvodjaca: string
  jmbg_pib_izvodjaca: string
  adresa_izvodjaca: string
  racun_izvodjaca?: string
  naziv_dela: string
  opis_dela: string
  rezultat: string
  specifikacije?: string
  datum_pocetka: string
  datum_zavrsetka: string
  fazno: boolean
  opis_faza?: string
  iznos: number
  bruto_neto: string
  nacin_isplate: string
  avans?: number
  rok_placanja: number
  vlasnistvo: string
  nda: boolean
  trajanje_nda?: number
  zabrana: boolean
  napomene?: string
}

export interface NdaData {
  tip_nda: string
  svrha: string
  tip_strane_1: string
  naziv_strane_1: string
  pib_strane_1?: string
  adresa_strane_1: string
  zastupnik_strane_1?: string
  tip_strane_2: string
  naziv_strane_2: string
  pib_strane_2?: string
  adresa_strane_2: string
  zastupnik_strane_2?: string
  oblast_informacija: string[] | string
  opis_informacija?: string
  oznacavanje: boolean
  datum: string
  trajanje_sporazuma: number
  trajanje_cuvanja: number
  kazna?: number
  zabrana: boolean
  trajanje_zabrane?: number
  napomene?: string
}

export interface UgovorOZakupuData {
  tip_zakupa: string
  uknjizena: boolean
  tip_zakupodavca: string
  naziv_zakupodavca: string
  jmbg_pib_zakupodavca: string
  adresa_zakupodavca: string
  zastupnik_zakupodavca?: string
  tip_zakupca: string
  naziv_zakupca: string
  jmbg_pib_zakupca: string
  adresa_zakupca: string
  zastupnik_zakupca?: string
  adresa_nepokretnosti: string
  kvadratura: number
  sprat: string
  struktura: string
  list_nepokretnosti?: string
  stanje?: string
  datum_pocetka: string
  tip_trajanja: string
  datum_isteka?: string
  otkazni_rok: number
  iznos: number
  valuta: string
  dan_placanja: number
  nacin_placanja: string
  deponija: boolean
  iznos_deponije?: number
  komunalije: string
  internet: string
  komunalna_taksa: string
  zivotinje?: boolean
  prijava_boravista?: boolean
  zabrana_podzakupa: boolean
  napomene?: string
}

export interface UgovorOSaradnjiZajmuData {
  tip_dokumenta: string
  tip_1?: string
  naziv_1?: string
  id_1?: string
  adresa_1?: string
  zastupnik_1?: string
  tip_2?: string
  naziv_2?: string
  id_2?: string
  adresa_2?: string
  zastupnik_2?: string
  naziv_saradnje?: string
  opis_saradnje?: string
  doprinos_1?: string
  doprinos_2?: string
  podela?: string
  udeo_1?: number
  udeo_2?: number
  upravljanje?: string
  rok?: number
  datum_pocetka?: string
  trajanje?: string
  datum_zavrsetka?: string
  ekskluzivnost?: boolean
  opis_ekskl?: string
  nda?: boolean
  vlasnistvo_ip?: string
  tip_zajmodavca?: string
  naziv_zajmodavca?: string
  id_zajmodavca?: string
  adresa_zajmodavca?: string
  tip_zajmoprimca?: string
  naziv_zajmoprimca?: string
  id_zajmoprimca?: string
  adresa_zajmoprimca?: string
  racun?: string
  iznos?: number
  valuta?: string
  svrha?: string
  datum_isplate?: string
  nacin_isplate?: string
  tip_kamate?: string
  stopa?: number
  obracun?: string
  placanje_kamate?: string
  nacin_vracanja?: string
  rok_vracanja?: string
  prva_rata?: string
  prevremena: boolean
  sredstvo: string
  zatezna: string
  napomene?: string
}

export type WizardFormData =
  | UgovorORaduData
  | UgovorODeluData
  | NdaData
  | UgovorOZakupuData
  | UgovorOSaradnjiZajmuData
