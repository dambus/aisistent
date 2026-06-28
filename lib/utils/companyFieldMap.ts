export const companyFieldMap: Record<string, Record<string, string>> = {
  'ugovor-o-radu': {
    naziv:                'firma',
    pib:                  'pib',
    maticni_broj:         'mb',
    adresa:               'adresa_firme',
    zastupnik:            'zastupnik',
    funkcija_zastupnika:  'funkcija',
  },
  'ugovor-o-delu': {
    naziv:                'naziv_narucioca',
    pib:                  'pib_narucioca',
    adresa:               'adresa_narucioca',
    zastupnik:            'zastupnik_narucioca',
    ziro_racun:           'racun_izvodjaca',
  },
  'nda': {
    naziv:                'naziv_strane_1',
    pib:                  'pib_strane_1',
    adresa:               'adresa_strane_1',
    zastupnik:            'zastupnik_strane_1',
  },
  'ugovor-o-zakupu': {
    naziv:                'naziv_zakupodavca',
    pib:                  'jmbg_pib_zakupodavca',
    adresa:               'adresa_zakupodavca',
    zastupnik:            'zastupnik_zakupodavca',
  },
  'ugovor-o-saradnji': {
    naziv:                'naziv_1',
    pib:                  'id_1',
    adresa:               'adresa_1',
    zastupnik:            'zastupnik_1',
  },
  'ugovor-o-saradnji-zajmu': {
    naziv:                'naziv_1',
    pib:                  'id_1',
    adresa:               'adresa_1',
    zastupnik:            'zastupnik_1',
  },
  'punomocje': {
    naziv:                'naziv_vlastodavca',
    pib:                  'jmbg_pib_vlastodavca',
    adresa:               'adresa_vlastodavca',
  },
  'ponuda-klijentu': {
    naziv:                'ponudjac_naziv',
    pib:                  'ponudjac_pib',
    adresa:               'ponudjac_adresa',
    zastupnik:            'kontakt_osoba',
  },
  'poslovni-mejl': {
    naziv:                'posiljalac_firma',
  },
  'oglas-za-posao': {
    naziv:                'naziv_firme',
    adresa:               'grad',
    delatnost:            'delatnost',
  },
  'opsti-uslovi': {
    naziv:                'naziv_firme',
    pib:                  'pib',
    adresa:               'adresa',
    website:              'url',
  },
  'resenje-godisnji-odmor': {
    naziv:                'naziv_firme',
    pib:                  'pib',
    adresa:               'adresa',
    zastupnik:            'zastupnik',
    funkcija_zastupnika:  'funkcija',
  },
  'pravilnik-o-radu': {
    naziv:                'naziv_firme',
    pib:                  'pib',
    adresa:               'adresa',
    zastupnik:            'zastupnik',
    delatnost:            'delatnost',
  },
  'obavestenje-o-promeni-uslova': {
    naziv:                'naziv_firme',
    pib:                  'pib',
    adresa:               'adresa',
    zastupnik:            'zastupnik',
    funkcija_zastupnika:  'funkcija',
  },
  'preporuka': {
    naziv:                'naziv_firme',
    zastupnik:            'ime_preporucioca',
    funkcija_zastupnika:  'pozicija_preporucioca',
    email:                'email',
    telefon:              'telefon',
  },
  'opis-proizvoda': {
    naziv:                'naziv_firme',
  },
  'bio-o-nama': {
    naziv:                'naziv',
    delatnost:            'delatnost',
  },
  'zapisnik-sastanak': {
    naziv:                'naziv_firme',
    zastupnik:            'predsedavajuci',
  },
  'odgovor-kandidatu': {
    naziv:                'naziv_firme',
    zastupnik:            'kontakt_osoba',
  },
  'faktura': {
    naziv:                'izdavalac_naziv',
    pib:                  'izdavalac_pib',
    maticni_broj:         'izdavalac_pib',
    adresa:               'izdavalac_adresa',
    email:                'izdavalac_email',
    telefon:              'izdavalac_telefon',
    ziro_racun:           'izdavalac_tekuci_racun',
    pdv_obveznik:         'izdavalac_pdv_obveznik',
  },
  'putni-nalog': {
    naziv:                'naziv_firme',
    pib:                  'pib',
    adresa:               'adresa_firme',
    zastupnik:            'ovlasceno_lice',
  },
  'ponuda-za-radove': {
    naziv:                'izvodjac_naziv',
    pib:                  'izvodjac_pib',
    adresa:               'izvodjac_adresa',
    email:                'izvodjac_email',
    telefon:              'izvodjac_telefon',
    ziro_racun:           'izvodjac_tekuci_racun',
    pdv_obveznik:         'izvodjac_pdv_obveznik',
  },
  'otpremnica': {
    naziv:                'isporucilac_naziv',
    pib:                  'isporucilac_pib',
    adresa:               'isporucilac_adresa',
    email:                'isporucilac_email',
    telefon:              'isporucilac_telefon',
    ziro_racun:           'isporucilac_tekuci_racun',
  },
}

import type { Company } from '@/types/database'

export function buildCompanyFields(
  company: Company,
  docType: string
): Record<string, string | boolean> {
  const map = companyFieldMap[docType]
  if (!map) return {}

  const result: Record<string, string | boolean> = {}
  const adresaPuna = [company.adresa, company.grad].filter(Boolean).join(', ')

  for (const [companyKey, fieldId] of Object.entries(map)) {
    if (companyKey === 'adresa') {
      if (docType === 'oglas-za-posao') {
        if (company.grad) result[fieldId] = company.grad
      } else {
        if (adresaPuna) result[fieldId] = adresaPuna
      }
    } else {
      const val = company[companyKey as keyof Company]
      if (typeof val === 'boolean') {
        result[fieldId] = val
      } else if (val && typeof val === 'string') {
        result[fieldId] = val
      }
    }
  }

  return result
}
