export type Industry =
  | 'general'
  | 'trade'
  | 'services'
  | 'construction'
  | 'accounting'
  | 'marketing'
  | 'hr'
  | 'freelance'
  | 'health'
  | 'hospitality'

export type ToolPriority = 'featured' | 'secondary' | 'hidden'

export interface IndustryConfig {
  label: string
  description: string
  tools: Record<string, ToolPriority>
}

// Tool slugs must match exactly the slugs used in existing document type config
export const INDUSTRY_CONFIG: Record<Industry, IndustryConfig> = {
  general: {
    label: 'Preduzetnik / Opšte',
    description: 'Opšti poslovni alati za svakodnevne potrebe',
    tools: {
      'faktura': 'featured',
      'poslovni-mejl': 'featured',
      'ponuda-klijentu': 'featured',
      'ugovor-o-delu': 'featured',
      'opis-proizvoda': 'featured',
      'bio-o-nama': 'secondary',
      'nda': 'secondary',
      'putni-nalog': 'secondary',
      'kalkulator-pausala': 'secondary',
      'kalkulator-ugovora-o-delu': 'secondary',
    },
  },
  trade: {
    label: 'Trgovina i prodaja',
    description: 'Alati za trgovinska i prodajna preduzeća',
    tools: {
      'faktura': 'featured',
      'otpremnica': 'featured',
      'ponuda-klijentu': 'featured',
      'opis-proizvoda': 'featured',
      'poslovni-mejl': 'featured',
      'bio-o-nama': 'secondary',
      'putni-nalog': 'secondary',
      'ugovor-o-saradnji': 'secondary',
      'nda': 'secondary',
      'opsti-uslovi': 'secondary',
    },
  },
  services: {
    label: 'Usluge i zanatstvo',
    description: 'Alati za uslužne delatnosti i zanatlije',
    tools: {
      'opis-proizvoda': 'featured',
      'bio-o-nama': 'featured',
      'ponuda-klijentu': 'featured',
      'faktura': 'featured',
      'poslovni-mejl': 'featured',
      'ugovor-o-delu': 'secondary',
      'punomocje': 'secondary',
      'putni-nalog': 'secondary',
      'kalkulator-ugovora-o-delu': 'secondary',
      'ponuda-za-radove': 'secondary',
    },
  },
  construction: {
    label: 'Građevina i izvođači radova',
    description: 'Alati za građevinske firme i izvođače',
    tools: {
      'ponuda-za-radove': 'featured',
      'faktura': 'featured',
      'ugovor-o-delu': 'featured',
      'otpremnica': 'featured',
      'kalkulator-ugovora-o-delu': 'featured',
      'ugovor-o-saradnji': 'secondary',
      'poslovni-mejl': 'secondary',
      'bio-o-nama': 'secondary',
      'opis-proizvoda': 'secondary',
      'oglas-za-posao': 'secondary',
      'putni-nalog': 'secondary',
      'nda': 'secondary',
      'ponuda-klijentu': 'secondary',
    },
  },
  accounting: {
    label: 'Računovodstvo i finansije',
    description: 'Alati za računovodstvene agencije i finansijske službe',
    tools: {
      'kalkulator-zarade': 'featured',
      'kalkulator-pausala': 'featured',
      'kalkulator-ugovora-o-delu': 'featured',
      'ugovor-o-radu': 'featured',
      'ugovor-o-delu': 'featured',
      'poslovni-mejl': 'featured',
      'ugovor-o-saradnji': 'secondary',
      'nda': 'secondary',
      'punomocje': 'secondary',
      'faktura': 'secondary',
      'resenje-godisnji-odmor': 'secondary',
      'pravilnik-o-radu': 'secondary',
      'opsti-uslovi': 'secondary',
    },
  },
  marketing: {
    label: 'Marketing i PR',
    description: 'Alati za marketinške i PR agencije',
    tools: {
      'poslovni-mejl': 'featured',
      'opis-proizvoda': 'featured',
      'bio-o-nama': 'featured',
      'ponuda-klijentu': 'featured',
      'faktura': 'featured',
      'oglas-za-posao': 'secondary',
      'odgovor-kandidatu': 'secondary',
      'preporuka': 'secondary',
      'zapisnik-sastanak': 'secondary',
      'ugovor-o-delu': 'secondary',
      'nda': 'secondary',
      'punomocje': 'secondary',
      'putni-nalog': 'secondary',
      'ugovor-o-saradnji': 'secondary',
      'kalkulator-ugovora-o-delu': 'secondary',
    },
  },
  hr: {
    label: 'HR i regrutacija',
    description: 'Alati za HR službe i agencije za zapošljavanje',
    tools: {
      'oglas-za-posao': 'featured',
      'odgovor-kandidatu': 'featured',
      'preporuka': 'featured',
      'resenje-godisnji-odmor': 'featured',
      'pravilnik-o-radu': 'featured',
      'poslovni-mejl': 'featured',
      'ugovor-o-radu': 'secondary',
      'ugovor-o-delu': 'secondary',
      'nda': 'secondary',
      'faktura': 'secondary',
      'opis-proizvoda': 'secondary',
      'bio-o-nama': 'secondary',
      'zapisnik-sastanak': 'secondary',
      'kalkulator-zarade': 'secondary',
    },
  },
  freelance: {
    label: 'Freelancer / Konsultant',
    description: 'Alati za freelancere i konsultante',
    tools: {
      'ugovor-o-delu': 'featured',
      'nda': 'featured',
      'ponuda-klijentu': 'featured',
      'poslovni-mejl': 'featured',
      'faktura': 'featured',
      'kalkulator-ugovora-o-delu': 'featured',
      'opsti-uslovi': 'secondary',
      'opis-proizvoda': 'secondary',
      'bio-o-nama': 'secondary',
      'ugovor-o-saradnji': 'secondary',
      'kalkulator-pausala': 'secondary',
      'putni-nalog': 'secondary',
    },
  },
  health: {
    label: 'Zdravlje i lepota',
    description: 'Alati za kozmetičare, fizioterapeute i zdravstvene radnike',
    tools: {
      'opis-proizvoda': 'featured',
      'bio-o-nama': 'featured',
      'ponuda-klijentu': 'featured',
      'faktura': 'featured',
      'poslovni-mejl': 'featured',
      'ugovor-o-delu': 'secondary',
      'nda': 'secondary',
      'opsti-uslovi': 'secondary',
      'kalkulator-ugovora-o-delu': 'secondary',
      'putni-nalog': 'secondary',
      'oglas-za-posao': 'secondary',
    },
  },
  hospitality: {
    label: 'Ugostiteljstvo i turizam',
    description: 'Alati za ugostiteljske objekte i turističke agencije',
    tools: {
      'faktura': 'featured',
      'opis-proizvoda': 'featured',
      'poslovni-mejl': 'featured',
      'ponuda-klijentu': 'featured',
      'bio-o-nama': 'featured',
      'otpremnica': 'secondary',
      'putni-nalog': 'secondary',
      'ugovor-o-delu': 'secondary',
      'oglas-za-posao': 'secondary',
      'opsti-uslovi': 'secondary',
    },
  },
}

// Helper: get priority of a tool for a given industry
// Tools not listed default to 'hidden'
export function getToolPriority(industry: Industry, toolSlug: string): ToolPriority {
  return INDUSTRY_CONFIG[industry]?.tools[toolSlug] ?? 'hidden'
}

// Helper: get all featured tools for an industry
export function getFeaturedTools(industry: Industry): string[] {
  const config = INDUSTRY_CONFIG[industry]
  return Object.entries(config.tools)
    .filter(([, priority]) => priority === 'featured')
    .map(([slug]) => slug)
}

// Helper: get all secondary tools for an industry
export function getSecondaryTools(industry: Industry): string[] {
  const config = INDUSTRY_CONFIG[industry]
  return Object.entries(config.tools)
    .filter(([, priority]) => priority === 'secondary')
    .map(([slug]) => slug)
}
