import { describe, it, expect } from 'vitest'
import { parseQaResponse } from '@/lib/qa/review'

describe('parseQaResponse — marker-split parsing (Zadatak: nezavisan QA korak)', () => {
  it('parsira ispravan format: JSON header + marker + dokument', () => {
    const raw = `{"fixed": ["ispravljen padež: 'Ana Marković' -> 'Ani Marković'"], "needs_review": [{"issue": "nejasan iznos", "detail": "korisnik nije uneo valutu"}]}
<<<DOKUMENT>>>
Ugovor o radu

Član 1.
Tekst ugovora...`
    const result = parseQaResponse(raw)
    expect(result.correctedText).toBe('Ugovor o radu\n\nČlan 1.\nTekst ugovora...')
    expect(result.fixed).toEqual(["ispravljen padež: 'Ana Marković' -> 'Ani Marković'"])
    expect(result.needsReview).toEqual([{ issue: 'nejasan iznos', detail: 'korisnik nije uneo valutu' }])
  })

  it('fallback regex kad header ima tekst pre/posle JSON objekta', () => {
    const raw = `Evo rezultata: {"fixed": [], "needs_review": []} hvala
<<<DOKUMENT>>>
Dokument tekst`
    const result = parseQaResponse(raw)
    expect(result.correctedText).toBe('Dokument tekst')
    expect(result.fixed).toEqual([])
    expect(result.needsReview).toEqual([])
  })

  it('fail-safe kad marker potpuno nedostaje — ceo odgovor postaje correctedText, flaguje se needs_review', () => {
    const raw = 'Model je vratio samo tekst dokumenta bez ikakvog header-a.'
    const result = parseQaResponse(raw)
    expect(result.correctedText).toBe(raw)
    expect(result.fixed).toEqual([])
    expect(result.needsReview).toHaveLength(1)
    expect(result.needsReview[0].issue).toBe('QA format')
  })

  it('fail-safe kad header nije parsabilan JSON — dokument iz posle-marker dela se i dalje koristi', () => {
    const raw = `ovo nije JSON uopšte
<<<DOKUMENT>>>
Ispravljen dokument tekst`
    const result = parseQaResponse(raw)
    expect(result.correctedText).toBe('Ispravljen dokument tekst')
    expect(result.fixed).toEqual([])
    expect(result.needsReview[0].issue).toBe('QA format')
  })

  it('ignoriše needs_review stavke bez "issue" polja umesto da baci grešku', () => {
    const raw = `{"fixed": [], "needs_review": [{"detail": "nema issue polje"}, {"issue": "validna", "detail": "ok"}]}
<<<DOKUMENT>>>
Tekst`
    const result = parseQaResponse(raw)
    expect(result.needsReview).toEqual([{ issue: 'validna', detail: 'ok' }])
  })
})
