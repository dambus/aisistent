import type { Contact, Company } from '@/types/database'

export const contactFieldMap: Record<string, Record<string, string>> = {
  'faktura': {
    naziv:   'primalac_naziv',
    pib:     'primalac_pib',
    adresa:  'primalac_adresa',
  },
  'otpremnica': {
    naziv:  'primalac_naziv',
    pib:    'primalac_pib',
    adresa: 'primalac_adresa',
  },
  'ponuda-za-radove': {
    naziv:  'narucilac_naziv',
    pib:    'narucilac_pib',
    adresa: 'narucilac_adresa',
  },
  'ugovor-o-delu': {
    naziv:      'naziv_izvodjaca',
    pib:        'jmbg_pib_izvodjaca',
    adresa:     'adresa_izvodjaca',
    ziro_racun: 'racun_izvodjaca',
  },
  'nda': {
    naziv:     'naziv_strane_2',
    pib:       'pib_strane_2',
    adresa:    'adresa_strane_2',
    zastupnik: 'zastupnik_strane_2',
  },
  'ugovor-o-zakupu': {
    naziv:  'naziv_zakupca',
    pib:    'jmbg_pib_zakupca',
    adresa: 'adresa_zakupca',
  },
  'ugovor-o-saradnji-zajmu': {
    naziv:     'naziv_2',
    pib:       'id_2',
    adresa:    'adresa_2',
    zastupnik: 'zastupnik_2',
  },
  'ponuda-klijentu': {
    naziv:     'klijent_naziv',
    adresa:    'klijent_adresa',
    zastupnik: 'klijent_kontakt',
  },
}

// Tipovi gde je agencija izdavalac, a klijent = primalac (druga strana)
export const AGENCY_BILLING_TYPES = new Set([
  'faktura',
  'otpremnica',
  'ponuda-za-radove',
  'ponuda-klijentu',
])

// Tipovi dokumenata koji imaju "drugu stranu" (kontakt)
export const CONTACT_SUPPORTED_TYPES = new Set(Object.keys(contactFieldMap))

export function buildContactFields(
  contact: Contact,
  docType: string
): Record<string, string> {
  const map = contactFieldMap[docType]
  if (!map) return {}

  const result: Record<string, string> = {}
  const adresaPuna = [contact.adresa, contact.grad].filter(Boolean).join(', ')

  for (const [contactKey, fieldId] of Object.entries(map)) {
    if (contactKey === 'adresa') {
      if (adresaPuna) result[fieldId] = adresaPuna
    } else {
      const val = contact[contactKey as keyof Contact]
      if (val && typeof val === 'string') result[fieldId] = val
    }
  }

  return result
}

// Koristi se za agency plan — puni "drugu stranu" iz Company objekta klijenta
export function buildCompanyAsContactFields(
  company: Company,
  docType: string
): Record<string, string> {
  const map = contactFieldMap[docType]
  if (!map) return {}

  const result: Record<string, string> = {}
  const adresaPuna = [company.adresa, company.grad].filter(Boolean).join(', ')

  for (const [contactKey, fieldId] of Object.entries(map)) {
    switch (contactKey) {
      case 'naziv':
        if (company.naziv) result[fieldId] = company.naziv
        break
      case 'pib':
        if (company.pib) result[fieldId] = company.pib
        break
      case 'adresa':
        if (adresaPuna) result[fieldId] = adresaPuna
        break
      case 'zastupnik':
        if (company.zastupnik) result[fieldId] = company.zastupnik
        break
      case 'ziro_racun':
        if (company.ziro_racun) result[fieldId] = company.ziro_racun
        break
    }
  }

  return result
}
