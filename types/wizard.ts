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
  helperText?: string
  tooltip?: string
  dynamicConfig?: {
    watchField: string
    values: Record<string, { label?: string; helperText?: string; tooltip?: string }>
  }
}

export interface WizardStep {
  id: string
  title: string
  fields: WizardField[]
  showIf?: {
    field: string
    value: string
  }
}

export interface UgovorORaduData {
  firma: string
  pib: string
  mb: string
  adresa_firme: string
  zastupnik: string
  funkcija: string
  broj_ugovora?: string
  datum_zakljucivanja?: string
  ime_prezime: string
  jmbg: string
  adresa_zaposlenog: string
  broj_lk?: string
  sprema: string
  pozicija: string
  opis: string
  mesto_rada: string
  nacin_rada: string
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
  otkazni_rok_zaposleni: number
  otkazni_rok_poslodavac: number
  zabrana_konkurencije: boolean
  trajanje_zabrane?: number
  naknada_zabrana?: number
  detaljna_prava_obaveze: boolean
  cuvanje_poslovne_tajne: boolean
  klauzula_izmene_zarade?: boolean
  napomene?: string
}

export interface UgovorODeluData {
  broj_ugovora?: string
  tip_narucioca: string
  naziv_narucioca: string
  pib_narucioca?: string
  broj_lk_narucioca?: string
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
  tip_prihoda: 'autorsko_delo' | 'ugovor_o_delu'
  iznos: number
  nacin_isplate: string
  avans?: number
  rok_placanja: number
  vlasnistvo: string
  nda: boolean
  trajanje_nda?: number
  zabrana: boolean
  ugovorna_kazna?: boolean
  iznos_kazne_dnevno?: number
  garantni_rok?: number
  napomene?: string
}

export interface NdaData {
  broj_ugovora?: string
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
  zabrana?: boolean
  zabrana_konkurencije?: boolean
  trajanje_zabrane?: number
  geografsko_ogranicenje_zabrane?: string
  opis_zabranjene_delatnosti?: string
  napomene?: string
}

export interface UgovorOZakupuData {
  broj_ugovora?: string
  tip_zakupa: string
  datum_zakljucivanja?: string
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
  broj_stanara?: number
  datum_pocetka: string
  tip_trajanja: string
  datum_isteka?: string
  otkazni_rok: number
  iznos: number
  valuta: string
  dan_placanja: number
  nacin_placanja: string
  pdv_obveznik?: boolean
  indeksacija_zakupnine?: string
  pravo_prece_kupovine?: boolean
  tabla_natpis?: boolean
  deponija: boolean
  iznos_deponije?: number
  komunalije: string
  internet: string
  komunalna_taksa?: string
  prijava_boravista: boolean
  adaptacije: boolean
  popis_namestaja: boolean
  zabrana_zivotinja: boolean
  zabrana_podzakupa: boolean
  broj_gostiju?: number
  datum_checkin?: string
  datum_checkout?: string
  turisticka_taksa?: boolean
  napomene?: string
  pdv_zakupnina?: 'ukljucuje' | 'ne_ukljucuje' | 'nije_u_sistemu'
}

export interface UgovorOSaradnjiZajmuData {
  broj_ugovora?: string
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
  ekskluzivnost: boolean
  opis_ekskl?: string
  nda: boolean
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

export interface PunomocjeData {
  broj_ugovora?: string
  tip_vlastodavca: string
  naziv_vlastodavca: string
  jmbg_pib_vlastodavca: string
  adresa_vlastodavca: string
  tip_punomocnika: string
  naziv_punomocnika: string
  jmbg_pib_punomocnika: string
  adresa_punomocnika: string
  tip_punomocja: string
  opis_ovlascenja: string
  naziv_suda_organa?: string
  broj_predmeta?: string
  adresa_nepokretnosti?: string
  katastarska_parcela?: string
  list_nepokretnosti?: string
  trajanje: string
  datum_isteka?: string
}

export interface OpstiUsloviData {
  naziv_firme: string
  pib: string
  adresa: string
  email: string
  url: string
  datum_objave?: string
  koristi_kolacice?: boolean
  koristi_google_analytics?: boolean
  dpo_email?: string
  tip_biznisa: string
  opis_usluge: string
  prikuplja_podatke: boolean
  vrste_podataka: string[] | string
  analitika: boolean
  deli_sa_trecim_stranama: boolean
}

export interface PoslovniMejlData {
  posiljalac_ime: string
  posiljalac_firma: string
  posiljalac_pozicija: string
  primalac_ime: string
  primalac_firma: string
  tip_mejla: string
  kontekst: string
  ton: string
  hitno: boolean
  predmet?: string
}

export interface OglasZaPosaoData {
  naziv_firme: string
  grad: string
  delatnost: string
  velicina: string
  naziv_pozicije: string
  tip_angazovanja: string
  lokacija_rada: string
  strucna_sprema: string
  iskustvo: string
  glavni_zadaci: string
  potrebne_vestine: string
  prednost?: string
  zarada_tip: string
  iznos_zarade?: string
  benefiti: string[] | string
  rok_prijave: string
  kako_aplicirati: string
}

export interface PonudaKlijentuData {
  ponudjac_naziv: string
  ponudjac_pib: string
  ponudjac_adresa: string
  kontakt_osoba: string
  email: string
  telefon: string
  klijent_naziv: string
  klijent_adresa: string
  klijent_kontakt: string
  broj_ponude?: string
  datum_ponude: string
  predmet_ponude: string
  opis: string
  rok_isporuke: string
  iznos_bez_pdv: number
  pdv: string
  uslovi_placanja: string
  validnost: number
  napomene?: string
}

export interface OdgovorKandidatuData {
  naziv_firme: string
  kontakt_osoba: string
  pozicija: string
  ime_kandidata: string
  email_kandidata?: string
  tip_odgovora: string
  datum_intervjua?: string
  vreme_intervjua?: string
  format_intervjua?: string
  adresa_ili_link?: string
  datum_pocetka?: string
  bruto_zarada?: number
  napomena?: string
}

export interface PreporukaData {
  ime_preporucioca: string
  pozicija_preporucioca: string
  naziv_firme: string
  email?: string
  telefon?: string
  ime_kandidata: string
  pozicija_kandidata: string
  period_saradnje: string
  tip_preporuke: string
  kvaliteti: string
  postignuca: string
  konkretni_primeri?: string
  posebna_napomena?: string
}

export interface ResenjeGodisnjiOdmorData {
  broj_resenja?: string
  datum_donosenja?: string
  naziv_firme: string
  pib: string
  adresa: string
  zastupnik: string
  funkcija: string
  ime_prezime: string
  radno_mesto: string
  broj_dana: number
  datum_od: string
  datum_do: string
  datum_povratka: string
  zamena?: string
}

export interface PravilnikORaduData {
  naziv_firme: string
  pib: string
  adresa: string
  zastupnik: string
  delatnost: string
  broj_zaposlenih: number
  radno_vreme: string
  rad_od_kuce: string
  smenski_rad: boolean
  postoji_sindikat?: boolean
  zabrana_konkurencije: boolean
  disciplinska_odgovornost: boolean
  zastita_uzbunjivaca: boolean
  posebna_oprema?: string
}

export interface OpisProizvodaData {
  naziv_firme: string
  kanal: string
  duzina: string
  naziv: string
  kategorija: string
  glavne_karakteristike: string
  cena?: string
  ciljna_grupa: string
  ton: string
  kljucne_prednosti: string
}

export interface BioONamaData {
  tip: string
  naziv: string
  delatnost: string
  godina_osnivanja?: string
  misija: string
  prednosti: string
  tim?: string
  ton: string
  duzina: string
}

export interface ZapisnikSastanakData {
  naziv_firme: string
  broj_zapisnika?: string
  datum_sastanka: string
  vreme: string
  lokacija: string
  predsedavajuci: string
  zapisnicar?: string
  prisutni: string
  odsutni?: string
  teme: string
  zakljucci: string
  akcije: string
  sledeci_sastanak?: string
}

export interface FakturaStavka {
  rb: number
  naziv: string
  kolicina: number
  jedinica: string
  cena_bez_pdv: number
  pdv_stopa: number
  iznos_pdv: number
  ukupno: number
}

export interface FakturaData {
  tip_dokumenta: 'Faktura' | 'Profaktura'
  broj_dokumenta?: string
  datum_izdavanja: string
  datum_prometa?: string
  datum_valute: string
  izdavalac_naziv: string
  izdavalac_pib: string
  izdavalac_adresa: string
  izdavalac_tekuci_racun?: string
  izdavalac_email?: string
  izdavalac_telefon?: string
  izdavalac_pdv_obveznik: boolean
  primalac_naziv: string
  primalac_pib?: string
  primalac_adresa: string
  stavke: string
  pdv_stopa?: '20' | '10' | '0' | 'oslobodjeno'
  napomena?: string
  poziv_na_broj?: string
}

export interface PutniNalogData {
  broj_naloga?: string
  datum_izdavanja: string
  svrha_putovanja: string
  destinacija: string
  datum_polaska: string
  datum_povratka: string
  ime_prezime: string
  pozicija: string
  prevozno_sredstvo: string
  registarski_broj?: string
  naziv_firme: string
  adresa_firme?: string
  pib?: string
  zastupnik?: string
  dnevnica?: number
  broj_dnevnica?: number
  troskovi_prevoza?: number
  troskovi_smestaja?: number
  ostali_troskovi?: number
  napomena?: string
}

export type WizardFormData =
  | FakturaData
  | PutniNalogData
  | UgovorORaduData
  | UgovorODeluData
  | NdaData
  | UgovorOZakupuData
  | UgovorOSaradnjiZajmuData
  | PunomocjeData
  | OpstiUsloviData
  | PoslovniMejlData
  | OglasZaPosaoData
  | PonudaKlijentuData
  | OdgovorKandidatuData
  | PreporukaData
  | ResenjeGodisnjiOdmorData
  | PravilnikORaduData
  | OpisProizvodaData
  | BioONamaData
  | ZapisnikSastanakData
