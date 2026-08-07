/**
 * Regresioni fixture za deklinaciju (Zadatak 1, CLAUDE_CODE_BRIEF_gramatika.md).
 *
 * Pokriva: muška/ženska imena, imena na suglasnik i na -a/-o/-e, strana
 * (nesklonjiva) imena, dijakritike (Đ Š Č Ć Ž), firme (doo/ad), novčane iznose.
 *
 * Company i amount case coverage je namerno ograničen na padeže koje sistem
 * prompt (lib/prompts/ugovor-o-radu.ts) eksplicitno definiše — da fixture
 * ne izmišlja "tačan" oblik tamo gde pravilo nije definisano.
 */

export type DeklinacijaCase =
  | 'nominativ'
  | 'genitiv'
  | 'dativ'
  | 'akuzativ'
  | 'instrumental'
  | 'lokativ'

export type DeklinacijaTip = 'ime' | 'firma' | 'iznos'
export type DeklinacijaRod = 'm' | 'f'

export interface DeklinacijaRow {
  id: string
  tekst: string
  padez: DeklinacijaCase
  ocekivano: string
  tip: DeklinacijaTip
  rod: DeklinacijaRod
  napomena?: string
}

interface NameSpec {
  key: string
  rod: DeklinacijaRod
  nominativ: string
  genitiv: string
  dativ: string
  akuzativ: string
  instrumental: string
  lokativ: string
  napomena?: string
}

const NAMES: NameSpec[] = [
  {
    key: 'petar-nikolic',
    rod: 'm',
    nominativ: 'Petar Nikolić',
    genitiv: 'Petra Nikolića',
    dativ: 'Petru Nikoliću',
    akuzativ: 'Petra Nikolića',
    instrumental: 'Petrom Nikolićem',
    lokativ: 'Petru Nikoliću',
    napomena: 'muško ime, suglasnik, nepostojano a',
  },
  {
    key: 'aleksandar-popovic',
    rod: 'm',
    nominativ: 'Aleksandar Popović',
    genitiv: 'Aleksandra Popovića',
    dativ: 'Aleksandru Popoviću',
    akuzativ: 'Aleksandra Popovića',
    instrumental: 'Aleksandrom Popovićem',
    lokativ: 'Aleksandru Popoviću',
    napomena: 'muško ime, suglasnik, nepostojano a',
  },
  {
    key: 'vukasin-djordjevic',
    rod: 'm',
    nominativ: 'Vukašin Đorđević',
    genitiv: 'Vukašina Đorđevića',
    dativ: 'Vukašinu Đorđeviću',
    akuzativ: 'Vukašina Đorđevića',
    instrumental: 'Vukašinom Đorđevićem',
    lokativ: 'Vukašinu Đorđeviću',
    napomena: 'muško ime, suglasnik, regularno; dijakritik Đ u prezimenu',
  },
  {
    key: 'nikola-stanic',
    rod: 'm',
    nominativ: 'Nikola Stanić',
    genitiv: 'Nikole Stanića',
    dativ: 'Nikoli Staniću',
    akuzativ: 'Nikolu Stanića',
    instrumental: 'Nikolom Stanićem',
    lokativ: 'Nikoli Staniću',
    napomena: 'muško ime na -a',
  },
  {
    key: 'zarko-cirkovic',
    rod: 'm',
    nominativ: 'Žarko Ćirković',
    genitiv: 'Žarka Ćirkovića',
    dativ: 'Žarku Ćirkoviću',
    akuzativ: 'Žarka Ćirkovića',
    instrumental: 'Žarkom Ćirkovićem',
    lokativ: 'Žarku Ćirkoviću',
    napomena: 'muško ime na -o; dijakritici Ž, Ć',
  },
  {
    key: 'djordje-saric',
    rod: 'm',
    nominativ: 'Đorđe Šarić',
    genitiv: 'Đorđa Šarića',
    dativ: 'Đorđu Šariću',
    akuzativ: 'Đorđa Šarića',
    instrumental: 'Đorđem Šarićem',
    lokativ: 'Đorđu Šariću',
    napomena: 'muško ime na -e (nepravilna promena); dijakritici Đ, Š',
  },
  {
    key: 'milos-colovic',
    rod: 'm',
    nominativ: 'Miloš Čolović',
    genitiv: 'Miloša Čolovića',
    dativ: 'Milošu Čoloviću',
    akuzativ: 'Miloša Čolovića',
    instrumental: 'Milošem Čolovićem',
    lokativ: 'Milošu Čoloviću',
    napomena: 'muško ime, suglasnik; dijakritici Š, Č',
  },
  {
    key: 'ana-markovic',
    rod: 'f',
    nominativ: 'Ana Marković',
    genitiv: 'Ane Marković',
    dativ: 'Ani Marković',
    akuzativ: 'Anu Marković',
    instrumental: 'Anom Marković',
    lokativ: 'Ani Marković',
    napomena: 'žensko ime na -a; prezime na -ić se ne menja',
  },
  {
    key: 'jelena-stojanovic',
    rod: 'f',
    nominativ: 'Jelena Stojanović',
    genitiv: 'Jelene Stojanović',
    dativ: 'Jeleni Stojanović',
    akuzativ: 'Jelenu Stojanović',
    instrumental: 'Jelenom Stojanović',
    lokativ: 'Jeleni Stojanović',
    napomena: 'žensko ime na -a; prezime na -ić se ne menja',
  },
  {
    key: 'milica-djukic',
    rod: 'f',
    nominativ: 'Milica Đukić',
    genitiv: 'Milice Đukić',
    dativ: 'Milici Đukić',
    akuzativ: 'Milicu Đukić',
    instrumental: 'Milicom Đukić',
    lokativ: 'Milici Đukić',
    napomena: 'žensko ime na -a; dijakritik Đ u prezimenu',
  },
  {
    key: 'carmen-rodriguez',
    rod: 'f',
    nominativ: 'Carmen Rodriguez',
    genitiv: 'Carmen Rodriguez',
    dativ: 'Carmen Rodriguez',
    akuzativ: 'Carmen Rodriguez',
    instrumental: 'Carmen Rodriguez',
    lokativ: 'Carmen Rodriguez',
    napomena: 'strano žensko ime, nesklonjivo',
  },
  {
    key: 'isabel-fischer',
    rod: 'f',
    nominativ: 'Isabel Fischer',
    genitiv: 'Isabel Fischer',
    dativ: 'Isabel Fischer',
    akuzativ: 'Isabel Fischer',
    instrumental: 'Isabel Fischer',
    lokativ: 'Isabel Fischer',
    napomena: 'strano žensko ime, nesklonjivo',
  },
]

const nameRows: DeklinacijaRow[] = NAMES.flatMap((n) =>
  (['nominativ', 'genitiv', 'dativ', 'akuzativ', 'instrumental', 'lokativ'] as const).map(
    (padez) => ({
      id: `${n.key}-${padez}`,
      tekst: n.nominativ,
      padez,
      ocekivano: n[padez],
      tip: 'ime' as const,
      rod: n.rod,
      napomena: n.napomena,
    })
  )
)

interface CompanySpec {
  key: string
  nominativ: string
  genitiv: string
  dativ: string
  akuzativ: string
  napomena?: string
}

const COMPANIES: CompanySpec[] = [
  {
    key: 'sigma-solutions-doo',
    nominativ: 'Sigma Solutions doo',
    genitiv: 'Sigma Solutions doo-a',
    dativ: 'Sigma Solutions doo-u',
    akuzativ: 'Sigma Solutions doo',
    napomena: 'firma, naziv na suglasnik',
  },
  {
    key: 'vetar-doo',
    nominativ: '"Vetar" doo',
    genitiv: '"Vetar" doo-a',
    dativ: '"Vetar" doo-u',
    akuzativ: '"Vetar" doo',
    napomena: 'firma sa kvotiranim nazivom',
  },
  {
    key: 'techstart-solutions-ddoo',
    nominativ: 'TechStart Solutions d.o.o.',
    genitiv: 'TechStart Solutions d.o.o-a',
    dativ: 'TechStart Solutions d.o.o-u',
    akuzativ: 'TechStart Solutions d.o.o.',
    napomena: 'firma sa tačkastim oblikom pravne forme (d.o.o., ne "doo") — realan oblik iz wizard forme',
  },
  {
    key: 'metalprogres-ad',
    nominativ: 'Metalprogres ad',
    genitiv: 'Metalprogres ad-a',
    dativ: 'Metalprogres ad-u',
    akuzativ: 'Metalprogres ad',
    napomena: 'firma, naziv na suglasnik, ad umesto doo',
  },
  {
    key: 'format-doo',
    nominativ: '"Format" doo',
    genitiv: '"Format" doo-a',
    dativ: '"Format" doo-u',
    akuzativ: '"Format" doo',
    napomena: 'firma sa kvotiranim nazivom',
  },
]

const companyRows: DeklinacijaRow[] = COMPANIES.flatMap((c) =>
  (['nominativ', 'genitiv', 'dativ', 'akuzativ'] as const).map((padez) => ({
    id: `${c.key}-${padez}`,
    tekst: c.nominativ,
    padez,
    ocekivano: c[padez],
    tip: 'firma' as const,
    rod: 'm' as const, // firma ignoriše rod; polje se drži zbog jednoobrazne šeme reda
    napomena: c.napomena,
  }))
)

interface AmountSpec {
  key: string
  tekst: string
  padezi: DeklinacijaCase[]
}

const AMOUNTS: AmountSpec[] = [
  { key: 'iznos-50000-rsd', tekst: '50.000,00 dinara', padezi: ['genitiv', 'dativ'] },
  { key: 'iznos-150000-rsd', tekst: '150.000,00 dinara', padezi: ['akuzativ', 'instrumental'] },
  { key: 'iznos-1200-eur', tekst: '1.200 EUR', padezi: ['genitiv', 'dativ'] },
]

const amountRows: DeklinacijaRow[] = AMOUNTS.flatMap((a) =>
  a.padezi.map((padez) => ({
    id: `${a.key}-${padez}`,
    tekst: a.tekst,
    padez,
    ocekivano: a.tekst,
    tip: 'iznos' as const,
    rod: 'm' as const, // iznos ignoriše rod; polje se drži zbog jednoobrazne šeme reda
    napomena: 'novčani iznos ostaje nepromenjen (samo se rečenica oko njega menja)',
  }))
)

export const declensionFixture: DeklinacijaRow[] = [...nameRows, ...companyRows, ...amountRows]
