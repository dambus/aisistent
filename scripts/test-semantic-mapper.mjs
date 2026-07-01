/**
 * Korak 6 — test semantičkog mapiranja
 *
 * Uzima kalibracioni JSON (AcroForm ili flat PDF) i pokreće semantičko mapiranje
 * nad stvarno ekstrahovanim parovima (labela, polje) iz DI analize.
 *
 * STOP provera: demonstrira da polja bez labele NIKAD ne dobijaju suggestedValue.
 *
 * Usage: node scripts/test-semantic-mapper.mjs <calibration-json> [--mock-profile]
 *   --mock-profile: koristi hardkodovani test profil umesto env varijabli
 */
import { config } from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import Anthropic from '@anthropic-ai/sdk';

config({ path: '.env.local' });

const calPath = process.argv[2];
if (!calPath || !existsSync(calPath)) {
  console.error('Usage: node scripts/test-semantic-mapper.mjs <calibration-json>');
  process.exit(1);
}

const useMock = process.argv.includes('--mock-profile');

// ─── Profil kompanije ────────────────────────────────────────────────────────
// U produkciji dolazi iz Supabase. Ovde: hardkodovan test profil.
const MOCK_PROFILE = {
  naziv:               'Testna Firma d.o.o.',
  pib:                 '123456789',
  maticni_broj:        '87654321',
  adresa:              'Knez Mihailova 10',
  grad:                'Beograd',
  zastupnik:           'Marko Marković',
  funkcija_zastupnika: 'Direktor',
  email:               'info@testnafirma.rs',
  telefon:             '+381 11 123 4567',
  ziro_racun:          '160-123456789-12',
  pdv_obveznik:        true,
  website:             'www.testnafirma.rs',
  delatnost:           'Razvoj softvera (62.01)',
};

const profile = useMock ? MOCK_PROFILE : MOCK_PROFILE; // u produkciji: fetch iz DB

// ─── Sistem prompt ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Ti si precizni ekstraktor semantičkih veza između labela iz formulara i polja profila firme.

Tvoj zadatak: za svaku labelu iz formulara, odredi koji profil ključ joj odgovara.

DOSTUPNI PROFIL KLJUČEVI (jedino ovo možeš da vratiš kao profileKey):
- naziv           — pun naziv/ime firme ili preduzetnika
- pib             — poreski identifikacioni broj (PIB)
- maticni_broj    — matični broj iz APR-a
- adresa          — adresa sedišta (ulica i broj, bez grada)
- grad            — grad sedišta
- zastupnik       — ime i prezime zakonskog zastupnika / odgovornog lica
- funkcija_zastupnika — funkcija zastupnika (npr. direktor, vlasnik)
- email           — email adresa firme
- telefon         — broj telefona firme
- ziro_racun      — žiro račun / IBAN
- pdv_obveznik    — da li je firma PDV obveznik (true/false)
- website         — veb sajt firme
- delatnost       — pretežna delatnost firme (opis ili šifra)

PRAVILA — moraju biti ispoštovana bez izuzetka:
1. Mapiraj SAMO na osnovu prosleđene labele. Ne koristi opšte znanje o tome "kako obično izgleda ovaj tip obrasca."
2. Ako labela nije jasna ili ne odgovara nijednom profil ključu → vrati profileKey: null.
3. Polja koja popunjava institucija, ne podnosilac (npr. "Organizaciona jedinica poreske uprave", "Broj predmeta", "Šifra opštine") → vrati isInternal: true, profileKey: null.
4. Nikad ne nagađaj. Ako nisi siguran, vrati null.

Odgovori ISKLJUČIVO validnim JSON nizom, bez ikakvog teksta pre ili posle:
[{"id":"...","profileKey":"naziv"|null,"isInternal":false}]`;

// ─── Čitanje kalibr. JSON-a ──────────────────────────────────────────────────
const cal = JSON.parse(readFileSync(calPath));
const allFields = cal.fields ?? [];

console.log(`\n=== Kalibracioni JSON: ${cal._meta?.label} (${cal._meta?.pdfType ?? 'acroform'}) ===`);
console.log(`Ukupno polja: ${allFields.length}\n`);

// ─── Umetanje veštačkog null-label polja (STOP provera) ──────────────────────
// Dodajemo artificijelno polje bez labele da potvrdimo da sistem ne nagađa
const TEST_NULL_ID = '__test_null_label__';
const fieldsWithInjected = [
  ...allFields,
  {
    fieldName: TEST_NULL_ID,
    label: null,
    confidence: 'low',
    matchType: 'none',
    page: 1,
    boundingBox: { x: 0, y: 0, w: 0, h: 0 },
    signals: {},
  },
];

// ─── Razdvajanje: sa labelom vs. bez labele ──────────────────────────────────
const withLabel    = fieldsWithInjected.filter(f => f.label !== null && String(f.label).trim() !== '');
const withoutLabel = fieldsWithInjected.filter(f => !f.label || String(f.label).trim() === '');

console.log(`Sa labelom:    ${withLabel.length}`);
console.log(`Bez labele:    ${withoutLabel.length}  (uključuje ${withoutLabel.length - 1} iz obrasca + 1 veštačko)\n`);

// ─── Claude poziv ────────────────────────────────────────────────────────────
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Ograničavamo na max 30 polja za test — dovoljan uzorak za validaciju
// (u produkciji semanticMapper.ts šalje sva polja jednim pozivom)
const MAX_FIELDS_FOR_TEST = 30;
const inputForClaude = withLabel.slice(0, MAX_FIELDS_FOR_TEST).map(f => ({ id: f.fieldName, label: f.label }));

console.log(`Šaljem ${inputForClaude.length} polja Claudeu...`);
const t0 = Date.now();

const response = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 2048,
  system: SYSTEM_PROMPT,
  messages: [{ role: 'user', content: JSON.stringify(inputForClaude, null, 2) }],
});

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
const raw = response.content[0]?.type === 'text' ? response.content[0].text : '';
console.log(`Claude odgovorio za ${elapsed}s\n`);

// ─── Parsiranje odgovora ──────────────────────────────────────────────────────
// Claude ponekad umotava odgovor u ```json ... ``` blok
const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

let claudeResults = [];
try {
  claudeResults = JSON.parse(stripped);
} catch {
  console.error('GREŠKA: Claude nije vratio validan JSON:');
  console.error(raw);
  process.exit(1);
}

const VALID_KEYS = new Set([
  'naziv','pib','maticni_broj','adresa','grad','zastupnik','funkcija_zastupnika',
  'email','telefon','ziro_racun','pdv_obveznik','website','delatnost',
]);

function profileValue(key) {
  if (!VALID_KEYS.has(key)) return null;
  const v = profile[key];
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v ? 'DA' : 'NE';
  return String(v);
}

const claudeMap = new Map(claudeResults.map(r => [r.id, r]));

// ─── Spajanje rezultata ───────────────────────────────────────────────────────
const results = fieldsWithInjected.map(f => {
  if (!f.label || String(f.label).trim() === '') {
    return {
      id: f.fieldName,
      label: f.label,
      profileKey: null,
      suggestedValue: null,
      isInternal: false,
      source: 'no-label',
    };
  }
  const cr = claudeMap.get(f.fieldName) ?? {};
  const key = VALID_KEYS.has(cr.profileKey) ? cr.profileKey : null;
  return {
    id: f.fieldName,
    label: f.label,
    profileKey: key,
    suggestedValue: key ? profileValue(key) : null,
    isInternal: cr.isInternal ?? false,
    source: 'claude',
  };
});

// ─── Ispis ───────────────────────────────────────────────────────────────────
const mapped    = results.filter(r => r.profileKey !== null);
const internal  = results.filter(r => r.isInternal);
const unmatched = results.filter(r => !r.isInternal && r.profileKey === null && r.label !== null && String(r.label ?? '').trim() !== '');
const noLabel   = results.filter(r => !r.label || String(r.label).trim() === '');

console.log('═══════════════════════════════════════════════════════');
console.log(`MAPIRANA polja (${mapped.length}):`);
for (const r of mapped) {
  console.log(`  ${r.id.padEnd(30)} "${r.label}" → ${r.profileKey} = "${r.suggestedValue}"`);
}

console.log(`\nINTERNI (korisnik ne popunjava) (${internal.length}):`);
for (const r of internal) {
  console.log(`  ${r.id.padEnd(30)} "${r.label}"`);
}

console.log(`\nNEMAPOVANA sa labelom (${unmatched.length}):`);
for (const r of unmatched) {
  console.log(`  ${r.id.padEnd(30)} "${r.label}"`);
}

console.log(`\nBEZ LABELE — suggestedValue je uvek null (${noLabel.length}):`);
for (const r of noLabel) {
  const isTest = r.id === TEST_NULL_ID;
  const flag = isTest ? ' ← STOP PROVERA (veštačko polje)' : '';
  console.log(`  ${r.id.padEnd(30)} suggestedValue=${r.suggestedValue}${flag}`);
}

// ─── STOP provera — eksplicitna validacija ────────────────────────────────────
const testField = results.find(r => r.id === TEST_NULL_ID);
console.log('\n═══════════════════════════════════════════════════════');
if (testField?.suggestedValue === null && testField?.profileKey === null) {
  console.log('✓ STOP PROVERA PROŠLA: null-label polje nije dobilo suggestedValue ni profileKey.');
} else {
  console.log('✗ STOP PROVERA PALA: null-label polje dobilo vrednost — ovo ne sme da se desi!');
  console.log('  Rezultat:', testField);
}
console.log('');
