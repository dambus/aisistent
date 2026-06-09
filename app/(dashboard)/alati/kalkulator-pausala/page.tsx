'use client'

import { useState } from 'react'

const RATES = {
  porez: 0.1,
  pio: 0.26,
  zdravstvo: 0.103,
  nezaposlenost: 0.0075,
  azurirano: 'januar 2026.',
}

const ACTIVITY_GROUPS = [
  {
    id: 'grupa-1',
    label: 'Grupa 1 — Usluge, IT, konsalting',
    base: 400_000,
    helperText:
      'Tipično obuhvata usluge, IT delatnosti, marketing, konsultantske i slične intelektualne usluge.',
  },
  {
    id: 'grupa-2',
    label: 'Grupa 2 — Trgovina, ugostiteljstvo',
    base: 300_000,
    helperText:
      'Najčešće obuhvata maloprodaju, veleprodaju, ugostiteljstvo i srodne komercijalne delatnosti.',
  },
  {
    id: 'grupa-3',
    label: 'Grupa 3 — Proizvodnja, zanatstvo',
    base: 200_000,
    helperText: 'Najčešće obuhvata proizvodnju, zanatske delatnosti, servise i fizičke uslužne poslove.',
  },
] as const

const MUNICIPALITIES = [
  { id: 'beograd-centar', label: 'Beograd (centar)', coefficient: 1.0 },
  { id: 'novi-sad', label: 'Novi Sad', coefficient: 0.9 },
  { id: 'nis', label: 'Niš', coefficient: 0.8 },
  { id: 'kragujevac', label: 'Kragujevac', coefficient: 0.75 },
  { id: 'subotica', label: 'Subotica', coefficient: 0.75 },
  { id: 'zrenjanin', label: 'Zrenjanin', coefficient: 0.7 },
  { id: 'cacak', label: 'Čačak', coefficient: 0.7 },
  { id: 'pancevo', label: 'Pančevo', coefficient: 0.85 },
  { id: 'ostale', label: 'Ostale opštine', coefficient: 0.65 },
] as const

const FAQ_ITEMS = [
  {
    id: 'sta-je',
    question: 'Šta je paušalno oporezivanje?',
    answer:
      'Paušalno oporezivanje je režim u kome preduzetnik ne vodi poslovne knjige u punom obimu, već plaća mesečno utvrđen porez i doprinose prema rešenju Poreske uprave.',
  },
  {
    id: 'ko-moze',
    question: 'Ko može biti paušalac?',
    answer:
      'Paušalac može biti preduzetnik koji ispunjava zakonske uslove za ovu vrstu oporezivanja i čija delatnost nije isključena iz paušala. Konačnu podobnost procenjuju APR i Poreska uprava.',
  },
  {
    id: 'kada-se-placa',
    question: 'Kada se plaća paušalni porez?',
    answer:
      'Mesečne obaveze se plaćaju do 15. u mesecu za prethodni mesec, na osnovu rešenja Poreske uprave i pripadajućih uplatnih računa.',
  },
  {
    id: 'limit',
    question: 'Šta ako prekoračim limit od 8 miliona RSD?',
    answer:
      'Ako pređete zakonski limit prihoda za paušalno oporezivanje, možete izgubiti pravo na paušal i preći na vođenje knjiga. Tada je važno da odmah proverite poreske posledice sa računovođom ili poreskim savetnikom.',
  },
] as const

type ActivityGroupId = (typeof ACTIVITY_GROUPS)[number]['id']
type MunicipalityId = (typeof MUNICIPALITIES)[number]['id']
type EntrepreneurStatus = 'nov' | 'postojeci'

function formatRsd(value: number) {
  return Math.round(value).toLocaleString('sr-RS')
}

function ResultRow({
  label,
  value,
  bold = false,
  separator = false,
}: {
  label: string
  value: number
  bold?: boolean
  separator?: boolean
}) {
  return (
    <>
      {separator && <div className="my-2 border-t border-gray-200" />}
      <div
        className={`flex items-center justify-between gap-4 py-1 text-sm ${
          bold ? 'font-semibold text-gray-900' : 'text-gray-600'
        }`}
      >
        <span>{label}</span>
        <span className={bold ? 'text-gray-900' : 'text-gray-700'}>{formatRsd(value)} RSD</span>
      </div>
    </>
  )
}

export default function KalkulatorPausalaPage() {
  const [activityGroup, setActivityGroup] = useState<ActivityGroupId>('grupa-1')
  const [municipality, setMunicipality] = useState<MunicipalityId>('ostale')
  const [status, setStatus] = useState<EntrepreneurStatus>('nov')
  const [annualIncome, setAnnualIncome] = useState('')
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({})

  const selectedGroup = ACTIVITY_GROUPS.find(group => group.id === activityGroup) ?? ACTIVITY_GROUPS[0]
  const selectedMunicipality =
    MUNICIPALITIES.find(item => item.id === municipality) ?? MUNICIPALITIES[MUNICIPALITIES.length - 1]

  const adjustedBase = selectedGroup.base * selectedMunicipality.coefficient
  const porez = adjustedBase * RATES.porez
  const pio = adjustedBase * RATES.pio
  const zdravstvo = adjustedBase * RATES.zdravstvo
  const nezaposlenost = adjustedBase * RATES.nezaposlenost
  const totalMonthly = porez + pio + zdravstvo + nezaposlenost
  const totalYearly = totalMonthly * 12

  const barData = [
    { label: 'Porez', value: porez, color: '#DC2626' },
    { label: 'PIO', value: pio, color: '#F97316' },
    { label: 'Zdravstvo', value: zdravstvo, color: '#2563EB' },
    { label: 'Nezaposlenost', value: nezaposlenost, color: '#EAB308' },
  ]

  const inputClassName =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalkulator paušala</h1>
        <p className="mt-1 text-sm text-gray-500">
          Aproksimacija mesečnih paušalnih obaveza za 2026. po grupi delatnosti i opštini.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Ulazni podaci</h2>
                <p className="mt-1 text-xs text-gray-500">Kalkulator računa odmah pri promeni bilo kog polja.</p>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">Grupa delatnosti</p>
                <div className="space-y-3">
                  {ACTIVITY_GROUPS.map(group => {
                    const checked = group.id === activityGroup
                    return (
                      <label
                        key={group.id}
                        className={`block cursor-pointer rounded-xl border p-4 transition-colors ${
                          checked ? 'border-[#1B6B4A] bg-[#1B6B4A]/5' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name="activityGroup"
                            value={group.id}
                            checked={checked}
                            onChange={() => setActivityGroup(group.id)}
                            className="mt-1 h-4 w-4 accent-[#1B6B4A]"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{group.label}</div>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500">{group.helperText}</p>
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Opština</label>
                <select
                  value={municipality}
                  onChange={event => setMunicipality(event.target.value as MunicipalityId)}
                  className={inputClassName}
                >
                  {MUNICIPALITIES.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.label} ({item.coefficient.toFixed(2)})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Koeficijent opštine množi osnovicu za obračun mesečnih obaveza.
                </p>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-gray-700">Status preduzetnika</p>
                <div className="space-y-3">
                  <label
                    className={`block cursor-pointer rounded-xl border p-4 transition-colors ${
                      status === 'nov' ? 'border-[#1B6B4A] bg-[#1B6B4A]/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="status"
                        value="nov"
                        checked={status === 'nov'}
                        onChange={() => setStatus('nov')}
                        className="mt-1 h-4 w-4 accent-[#1B6B4A]"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Nov preduzetnik (prve 2 godine)</div>
                        <p className="mt-1 text-xs text-gray-500">
                          Koristi osnovicu po grupi delatnosti i koeficijent opštine iz ovog kalkulatora.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`block cursor-pointer rounded-xl border p-4 transition-colors ${
                      status === 'postojeci'
                        ? 'border-[#1B6B4A] bg-[#1B6B4A]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="status"
                        value="postojeci"
                        checked={status === 'postojeci'}
                        onChange={() => setStatus('postojeci')}
                        className="mt-1 h-4 w-4 accent-[#1B6B4A]"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">Postojeći preduzetnik</div>
                        <p className="mt-1 text-xs text-gray-500">
                          Za postojeće preduzetnike konačna osnovica zavisi i od prihoda iz prethodne godine.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {status === 'postojeci' && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Godišnji prihod u prethodnoj godini (RSD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={annualIncome}
                    onChange={event => setAnnualIncome(event.target.value)}
                    placeholder="npr. 4500000"
                    className={inputClassName}
                  />
                  <p className="mt-1 text-xs text-gray-500">Prihod iz poreske prijave za prošlu godinu.</p>
                  <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                    Za postojeće preduzetnike Poreska uprava koristi posebnu tabelu zasnovanu na prihodu i drugim
                    parametrima. Ovde je prikazana osnovna aproksimacija po grupi delatnosti i opštini, a tačan iznos
                    proverite sa poreskim savetnikom.
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Česta pitanja</h2>
            <div className="space-y-2">
              {FAQ_ITEMS.map(item => (
                <div key={item.id} className="border-b border-gray-100 last:border-0">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                    onClick={() =>
                      setFaqOpen(previous => ({
                        ...previous,
                        [item.id]: !previous[item.id],
                      }))
                    }
                  >
                    <span>{item.question}</span>
                    <span
                      className="ml-2 shrink-0 text-gray-400 transition-transform duration-200"
                      style={{ transform: faqOpen[item.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      ▼
                    </span>
                  </button>
                  {faqOpen[item.id] && (
                    <p className="pb-3 text-sm leading-relaxed text-gray-600">{item.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-sm font-semibold text-gray-700">Mesečne obaveze</h2>
            <p className="mb-4 text-xs text-gray-500">
              Osnovica: {formatRsd(adjustedBase)} RSD ({selectedGroup.label}, {selectedMunicipality.label})
            </p>

            <ResultRow label="Porez na prihod" value={porez} />
            <ResultRow label="PIO doprinos" value={pio} />
            <ResultRow label="Zdravstveno" value={zdravstvo} />
            <ResultRow label="Nezaposlenost" value={nezaposlenost} />
            <ResultRow label="UKUPNO MESEČNO" value={totalMonthly} bold separator />
            <ResultRow label="UKUPNO GODIŠNJE" value={totalYearly} bold />
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Raspodela mesečnih obaveza</h2>
            <div className="flex h-6 overflow-hidden rounded-lg">
              {barData.map(segment => {
                const percent = (segment.value / totalMonthly) * 100
                return (
                  <div
                    key={segment.label}
                    style={{ width: `${percent}%`, background: segment.color }}
                    title={`${segment.label}: ${formatRsd(segment.value)} RSD (${percent.toFixed(1)}%)`}
                  />
                )
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {barData.map(segment => (
                <div key={segment.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="h-3 w-3 rounded-sm" style={{ background: segment.color }} />
                  <span>{segment.label}</span>
                  <span className="text-gray-400">({((segment.value / totalMonthly) * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-xl border border-[#1B6B4A]/20 bg-[#1B6B4A]/5 px-5 py-4 text-sm text-gray-700">
            <p className="font-medium text-gray-900">Rok plaćanja</p>
            <p className="mt-1">
              Paušalni porez se plaća do 15. u mesecu za prethodni mesec, na osnovu rešenja Poreske uprave.
            </p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
            <p className="font-medium">Napomena</p>
            <p className="mt-1">
              Prikazani iznosi su aproksimacija za nove preduzetnike. Tačan iznos paušalnog poreza utvrđuje Poreska
              uprava rešenjem. Ažurirano: {RATES.azurirano}
            </p>
          </div>

          {status === 'postojeci' && annualIncome && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-700">
              Unet prethodni godišnji prihod: <strong>{formatRsd(Number(annualIncome) || 0)} RSD</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
