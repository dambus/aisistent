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
}

export interface MappedField {
  id: string;
  label: string | null;
  profileKey: ProfileKey | null;
  suggestedValue: string | null;
  // isInternal: polja koja korisnik ne popunjava (npr. "Organizaciona jedinica" u PPDG)
  isInternal: boolean;
}

// Vrednost profil ključa kao string za prikaz korisniku
function profileValue(key: ProfileKey, company: Company): string | null {
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

Odgovori ISKLJUČIVO validnim JSON nizom, bez ikakvog teksta pre ili posle:
[{"id":"...","profileKey":"naziv"|null,"isInternal":false}]`;

export async function mapFieldsToProfile(
  fields: FieldForMapping[],
  company: Company,
): Promise<MappedField[]> {
  // Polja bez labele odmah dobijaju null — Claude ih ne vidi
  const withLabel    = fields.filter((f) => f.label !== null && f.label.trim() !== '');
  const withoutLabel = fields.filter((f) => !f.label || f.label.trim() === '');

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
    withLabel.map((f) => ({ id: f.id, label: f.label })),
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
