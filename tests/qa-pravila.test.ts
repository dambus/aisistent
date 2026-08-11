import { describe, it, expect } from 'vitest'
import { GRAMATICKA_PRAVILA, getPravilaText } from '@/lib/qa/pravila'

describe('GRAMATICKA_PRAVILA — priručnik pravila za QA korak', () => {
  it('nema duplih id-jeva', () => {
    const ids = GRAMATICKA_PRAVILA.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('svako pravilo ima neprazan otkriveno trag (zašto postoji)', () => {
    for (const p of GRAMATICKA_PRAVILA) {
      expect(p.otkriveno.length).toBeGreaterThan(0)
    }
  })

  it('getPravilaText() sadrži tekst svakog pravila', () => {
    const text = getPravilaText()
    for (const p of GRAMATICKA_PRAVILA) {
      expect(text).toContain(p.pravilo)
    }
  })
})
