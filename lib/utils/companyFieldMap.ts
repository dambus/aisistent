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
  },
  'opsti-uslovi': {
    naziv:                'naziv_firme',
    pib:                  'pib',
    adresa:               'adresa',
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
  },
  'putni-nalog': {
    naziv:                'naziv_firme',
    pib:                  'pib',
    adresa:               'adresa_firme',
    zastupnik:            'ovlasceno_lice',
  },
}

import type { Company } from '@/types/database'

export function buildCompanyFields(
  company: Company,
  docType: string
): Record<string, string> {
  const map = companyFieldMap[docType]
  if (!map) return {}

  const result: Record<string, string> = {}
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
      if (val && typeof val === 'string') result[fieldId] = val
    }
  }

  return result
}
