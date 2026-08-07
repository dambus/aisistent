import { describe, it, expect } from 'vitest'
import { decline } from '@/lib/declension'
import { declensionFixture } from './fixtures/declension-fixture'

/**
 * Zadatak 2 (CLAUDE_CODE_BRIEF_gramatika.md), tačka 6: isti fixture iz
 * Zadatka 1 mora proći 100% protiv determinističkog decline() modula.
 *
 * Za razliku od tests/declension.test.ts (živi Claude API poziv), ovaj test
 * je čisto lokalan — bez mreže, bez troška, momentalan. Bezbedan je za
 * pre-commit/CI na svaki commit.
 */
describe('decline() — deterministički modul (Zadatak 2)', () => {
  it.each(declensionFixture)('$tekst → $padez = "$ocekivano"', (row) => {
    const dobijeno = decline(row.tekst, row.rod, row.padez, { type: row.tip })
    expect(dobijeno).toBe(row.ocekivano)
  })
})
