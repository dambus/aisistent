import type { Employee } from '@/types/database'

// Polja koja ne postoje kod datog tipa dokumenta se namerno izostavljaju
// (npr. resenje-godisnji-odmor nema JMBG polje).
export const employeeFieldMap: Record<string, Record<string, string>> = {
  'ugovor-o-radu': {
    ime:               'ime_prezime',
    jmbg:              'jmbg',
    pozicija:          'pozicija',
    datum_zaposlenja:  'datum_pocetka',
  },
  'resenje-godisnji-odmor': {
    ime:      'ime_prezime',
    pozicija: 'radno_mesto',
  },
  'putni-nalog': {
    ime:      'ime_vozaca',
    pozicija: 'pozicija_vozaca',
  },
}

export const EMPLOYEE_SUPPORTED_TYPES = new Set(Object.keys(employeeFieldMap))

export function buildEmployeeFields(
  employee: Employee,
  docType: string
): Record<string, string> {
  const map = employeeFieldMap[docType]
  if (!map) return {}

  const result: Record<string, string> = {}

  for (const [employeeKey, fieldId] of Object.entries(map)) {
    const val = employee[employeeKey as keyof Employee]
    if (val && typeof val === 'string') result[fieldId] = val
  }

  return result
}
