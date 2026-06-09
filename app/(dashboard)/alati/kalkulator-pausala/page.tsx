import Link from 'next/link'

const keyFacts = [
  'Plaća se do 15. u mesecu za prethodni mesec',
  'Limit prihoda: 6.000.000 RSD godišnje',
  'Ukupno poresko opterećenje: ~46,55% od paušalne osnovice',
  'Iznos varira od ~15.000 do ~45.000 RSD mesečno zavisno od delatnosti i opštine',
  'IT delatnosti (6201, 6202) imaju nacionalnu osnovicu — isti iznos bez obzira na opštinu',
]

const eligibilityRules = [
  'Godišnji prihod ispod 6.000.000 RSD',
  'Nije PDV obveznik',
  'Delatnost nije na listi isključenih',
  'Ne ulažu druga lica u delatnost',
]

const excludedActivities = [
  'Slobodne profesije (advokati, notari...)',
  'Aktivnosti u vezi sa nekretninama',
  'Neke finansijske delatnosti',
]

const deadlines = [
  'Do 15. u mesecu — uplata mesečnog poreza',
  'Do 15. aprila — godišnja poreska prijava (PPDG-1R)',
  'Do 30. novembra — zahtev za paušal za narednu godinu',
]

const usefulLinks = [
  { label: 'PURS — Poreski kalkulator', href: 'https://www.purs.gov.rs' },
  { label: 'APR — Registracija preduzetnika', href: 'https://www.apr.gov.rs' },
  { label: 'ePorezi portal', href: 'https://eporezi.purs.gov.rs' },
]

function BulletList({
  items,
  markerClassName,
}: {
  items: string[]
  markerClassName: string
}) {
  return (
    <ul className="space-y-3">
      {items.map(item => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
          <span className={`mt-0.5 shrink-0 text-base ${markerClassName}`}>•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function PausalnoOporezivanjePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paušalno oporezivanje</h1>
        <p className="mt-1 text-sm text-gray-500">Sve što treba da znate o paušalnom porezu</p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Šta je paušalni porez?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-700">
          Paušalni porez je fiksni mesečni iznos koji plaćaju preduzetnici paušalci, bez obzira na visinu
          ostvarenog prihoda. Poreska uprava utvrđuje iznos rešenjem na početku godine, na osnovu šifre
          delatnosti, lokacije i statističkih podataka.
        </p>

        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">Ključne činjenice</h3>
          <BulletList items={keyFacts} markerClassName="text-[#1B6B4A]" />
        </div>
      </section>

      <section className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-green-950">Izračunajte tačan iznos</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-green-900">
          Poreska uprava Republike Srbije pruža zvanični kalkulator koji uzima u obzir sve faktore — šifru
          delatnosti, opštinu, zonu, godinu registracije i prethodnu osnovicu.
        </p>

        <div className="mt-5">
          <Link
            href="https://www.purs.gov.rs"
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-[#1B6B4A] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#15563b]"
          >
            Otvorite zvanični PURS kalkulator →
          </Link>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-green-800">
          Preporučujemo korišćenje zvaničnog kalkulatora za tačan iznos koji odgovara vašoj situaciji.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Ko može biti paušalac?</h2>
          <div className="mt-4">
            <BulletList items={eligibilityRules} markerClassName="text-[#1B6B4A]" />
          </div>

          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
              Isključene delatnosti
            </h3>
            <ul className="space-y-3">
              {excludedActivities.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
                  <span className="mt-0.5 shrink-0 text-base text-red-600">✗</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Rokovi i obaveze</h2>
          <div className="mt-4 space-y-3">
            {deadlines.map(item => (
              <div key={item} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Korisni linkovi</h2>
        <div className="mt-4 grid gap-3">
          {usefulLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-[#1B6B4A] hover:text-[#1B6B4A]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
