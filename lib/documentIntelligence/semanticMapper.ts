import Anthropic from '@anthropic-ai/sdk';
import type { Company } from '@/types/database';

// Skup profil ključeva koje mapper može da vrati.
// Svaki ključ direktno odgovara polju u Company interfejsu.
export const PROFILE_KEYS = [
  'naziv',
  'pib',
  'maticni_broj',
  'adresa',
  'grad',
  'zastupnik',
  'funkcija_zastupnika',
  'email',
  'telefon',
  'ziro_racun',
  'pdv_obveznik',
  'website',
  'delatnost',
] as const;

export type ProfileKey = (typeof PROFILE_KEYS)[number];

export interface FieldForMapping {
  id: string;
  label: string | null;
  // Naslov sekcije iz istog dokumenta (Faza 3 Korak 2, detectSections.ts) — dodatni
  // kontekst za razlikovanje polja sa istom labelom u različitim delovima obrasca.
  // Nikad ne koristi se kao izvor "opšteg znanja", samo kao signal iz samog dokumenta.
  section?: string | null;
}

export interface MappedField {
  id: string;
  label: string | null;
  profileKey: ProfileKey | null;
  suggestedValue: string | null;
  // isInternal: polja koja korisnik ne popunjava (npr. "Organizaciona jedinica" u PPDG)
  isInternal: boolean;
}

// Vrednost profil ključa kao string za prikaz korisniku.
// Eksportovano: template keš (Faza 3 Korak 5) na cache HIT preskače Claude poziv
// (profileKey je poznat iz keša) ali vrednost MORA biti sveža iz trenutnog profila.
export function profileValue(key: ProfileKey, company: Company): string | null {
  switch (key) {
    case 'naziv':              return company.naziv || null;
    case 'pib':                return company.pib || null;
    case 'maticni_broj':       return company.maticni_broj || null;
    case 'adresa':             return company.adresa || null;
    case 'grad':               return company.grad || null;
    case 'zastupnik':          return company.zastupnik || null;
    case 'funkcija_zastupnika':return company.funkcija_zastupnika || null;
    case 'email':              return company.email || null;
    case 'telefon':            return company.telefon || null;
    case 'ziro_racun':         return company.ziro_racun || null;
    case 'pdv_obveznik':       return company.pdv_obveznik ? 'DA' : 'NE';
    case 'website':            return company.website || null;
    case 'delatnost':          return company.delatnost || null;
    default:                   return null;
  }
}

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
5. SUB-KOMPONENTE ADRESE: Polja koja traže samo deo adrese (samo naziv ulice bez broja, samo kućni broj, samo sprat, samo stan, samo slovo) → vrati profileKey: null. Profil ima adresu kao jednu celinu — ne možemo pouzdano da je rastavimo. Ovo se odnosi na labele tipa: "Naziv ulice", "Кућни број", "Broj", "Sprat", "Broj stana", "Slovo", "Ulica i broj" (samo ulica), i slično kada je jasno da se traži samo jedna komponenta. Izuzetak: ako labela eksplicitno traži punu adresu ("Adresa sedišta", "Adresa", "Место становања и адреса") → mapiraj na adresa.
6. SUB-KOMPONENTE TELEFONA: Polja koja traže samo deo broja telefona (pozivni broj, lokalni broj, faks posebno) → vrati profileKey: null osim prvog polja za telefon. Ako labela kaže "Телефон" bez dodatnih reči → mapiraj na telefon. Ako kaže "Телефон — факс", "Телефон/факс", "Факс" → vrati null.
7. SEKCIJA (ako je prosleđena): naslov dela obrasca iz kog polje dolazi, iz istog dokumenta — ne opšte znanje. Koristi je samo da razlikuješ dva polja sa istom labelom u različitim sekcijama (npr. "ПИБ" u sekciji o poreskom obvezniku vs "ПИБ" u sekciji o poslovnoj jedinici mogu se odnositi na različita lica). Ne menja pravila 1-6.
8. SUB-KOMPONENTE DELATNOSTI: Polja koja traže SAMO šifru delatnosti (labela "Шифра", "Šifra", "Шифра делатности") → vrati profileKey: null. Profil čuva delatnost kao jedan tekst (opis + šifra) — ne možemo pouzdano izdvojiti samo šifru, a upis celog teksta u kratko polje za šifru razbija obrazac. Mapiraj na delatnost samo labele koje traže naziv/opis delatnosti ili celu pretežnu delatnost ("Назив", "Претежна делатност", "Назив и шифра претежне делатности").

Odgovori ISKLJUČIVO validnim JSON nizom, bez ikakvog teksta pre ili posle:
[{"id":"...","profileKey":"naziv"|null,"isInternal":false}]`;

export async function mapFieldsToProfile(
  fields: FieldForMapping[],
  company: Company,
): Promise<MappedField[]> {
  // Polja bez labele odmah dobijaju null — Claude ih ne vidi.
  // Isto važi za čisto numeričke labele (redni brojevi tipa "1.", "2.5.4.") — bez
  // ijednog slova labela ne nosi semantiku, a sekcijski kontekst je Claude-a navodio
  // da pogađa (PPDG-1S: "1." u sekciji o računu u banci → ziro_racun u pogrešnoj koloni).
  const isMappable   = (f: FieldForMapping) =>
    f.label !== null && f.label.trim() !== '' && /\p{L}/u.test(f.label);
  const withLabel    = fields.filter(isMappable);
  const withoutLabel = fields.filter((f) => !isMappable(f));

  const nullResults: MappedField[] = withoutLabel.map((f) => ({
    id: f.id,
    label: f.label,
    profileKey: null,
    suggestedValue: null,
    isInternal: false,
  }));

  if (withLabel.length === 0) return nullResults;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = JSON.stringify(
    withLabel.map((f) => ({ id: f.id, label: f.label, ...(f.section ? { section: f.section } : {}) })),
    null,
    2,
  );

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '';
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  let claudeResults: Array<{ id: string; profileKey: string | null; isInternal: boolean }> = [];
  try {
    claudeResults = JSON.parse(stripped);
  } catch {
    throw new Error(`semanticMapper: Claude nije vratio validan JSON.\nOdgovor: ${raw}`);
  }

  const claudeMap = new Map(claudeResults.map((r) => [r.id, r]));

  const mappedWithLabel: MappedField[] = withLabel.map((f) => {
    const claudeResult = claudeMap.get(f.id);
    const rawKey = claudeResult?.profileKey ?? null;
    const profileKey = PROFILE_KEYS.includes(rawKey as ProfileKey)
      ? (rawKey as ProfileKey)
      : null;

    return {
      id: f.id,
      label: f.label,
      profileKey,
      suggestedValue: profileKey ? profileValue(profileKey, company) : null,
      isInternal: claudeResult?.isInternal ?? false,
    };
  });

  return [...mappedWithLabel, ...nullResults];
}
