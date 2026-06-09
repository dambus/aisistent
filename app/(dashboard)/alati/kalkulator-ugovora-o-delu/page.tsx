'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

const PRIMARY = '#1B6B4A'

const RATES = {
  normiraniTrosak: 0.2,
  poreskaOsnovica: 0.8,
  porez: 0.2,
  pio: 0.255,
  zdravstvo: 0.103,
  netoKoeficijent: 0.5536,
  pdv: 0.2,
  azurirano: 'januar 2026.',
}

const FAQ_ITEMS = [
  {
    id: 'ko-placa',
    q: 'Ko plaća porez za ugovor o delu?',
    a: 'Kada je izvođač fizičko lice bez firme, naručilac obračunava i prijavljuje porez i doprinose kroz PPP-PD prijavu. Kada je izvođač preduzetnik ili firma, dodatnih obračuna na strani naručioca nema.',
  },
  {
    id: 'normirani',
    q: 'Šta je normiran trošak od 20%?',
    a: 'Normirani trošak je zakonski priznati trošak koji se automatski odbija od bruto iznosa pre obračuna poreza i doprinosa. Za ugovor o delu iznosi 20% od bruta.',
  },
  {
    id: 'pio',
    q: 'Da li se plaća PIO za ugovor o delu?',
    a: 'Da. Za fizičko lice po ugovoru o delu plaća se PIO na poresku osnovicu. Doprinos za nezaposlenost se ne plaća.',
  },
  {
    id: 'razlika',
    q: 'Razlika između fizičkog lica i preduzetnika?',
    a: 'Kod fizičkog lica porez i doprinosi se obračunavaju iz bruto iznosa. Kod preduzetnika ili firme ugovoreni iznos je konačan, a izvođač svoje poreske obaveze rešava kroz registrovanu delatnost.',
  },
  {
    id: 'kad-preduzetnik',
    q: 'Kada je bolje angažovati preduzetnika?',
    a: 'Kada saradnja traje duže, kada izvođač već posluje kroz registrovanu delatnost ili kada želite jednostavniji obračun bez PPP-PD prijave na strani naručioca.',
  },
] as const

type MainTab = 'fizicko-lice' | 'preduzetnik'
type PhysicalMode = 'neto-u-bruto' | 'bruto-u-neto'

interface PhysicalCalculation {
  bruto: number
  normiraniTrosak: number
  poreskaOsnovica: number
  porez: number
  pio: number
  zdravstvo: number
  neto: number
}

function formatRsd(value: number) {
  return Math.round(value).toLocaleString('sr-RS')
}

function parseAmount(value: string) {
  const parsed = parseFloat(value.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function calculateFromBruto(bruto: number): PhysicalCalculation {
  const normiraniTrosak = bruto * RATES.normiraniTrosak
  const poreskaOsnovica = bruto * RATES.poreskaOsnovica
  const porez = poreskaOsnovica * RATES.porez
  const pio = poreskaOsnovica * RATES.pio
  const zdravstvo = poreskaOsnovica * RATES.zdravstvo
  const neto = bruto - porez - pio - zdravstvo

  return {
    bruto,
    normiraniTrosak,
    poreskaOsnovica,
    porez,
    pio,
    zdravstvo,
    neto,
  }
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
      <div className={`flex items-center justify-between gap-4 py-1 text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
        <span>{label}</span>
        <span className={bold ? 'text-gray-900' : 'text-gray-700'}>{formatRsd(value)} RSD</span>
      </div>
    </>
  )
}

export default function KalkulatorUgovoraODeluPage() {
  const [mainTab, setMainTab] = useState<MainTab>('fizicko-lice')
  const [physicalMode, setPhysicalMode] = useState<PhysicalMode>('neto-u-bruto')
  const [physicalAmount, setPhysicalAmount] = useState('')
  const [businessAmount, setBusinessAmount] = useState('')
  const [pdvEnabled, setPdvEnabled] = useState(false)
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({})

  const physicalResult = useMemo(() => {
    const input = parseAmount(physicalAmount)
    if (input <= 0) return null

    const bruto = physicalMode === 'neto-u-bruto' ? input / RATES.netoKoeficijent : input
    return calculateFromBruto(bruto)
  }, [physicalAmount, physicalMode])

  const businessBase = parseAmount(businessAmount)
  const businessPdv = pdvEnabled ? businessBase * RATES.pdv : 0
  const businessTotal = businessBase + businessPdv

  const physicalBarData = physicalResult
    ? [
        { label: 'Neto', value: physicalResult.neto, color: '#1B6B4A' },
        { label: 'Porez', value: physicalResult.porez, color: '#DC2626' },
        { label: 'PIO', value: physicalResult.pio, color: '#F97316' },
        { label: 'Zdravstvo', value: physicalResult.zdravstvo, color: '#2563EB' },
      ]
    : []

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1B6B4A]'

  const tabStyle = (active: boolean) => ({
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: 'none',
    background: active ? PRIMARY : 'transparent',
    color: active ? '#fff' : '#6B7280',
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalkulator ugovora o delu</h1>
        <p className="mt-1 text-sm text-gray-500">Obračun poreza i troškova za ugovor o delu u 2026. godini</p>
      </div>

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        <button style={tabStyle(mainTab === 'fizicko-lice')} onClick={() => setMainTab('fizicko-lice')}>
          Fizičko lice
        </button>
        <button style={tabStyle(mainTab === 'preduzetnik')} onClick={() => setMainTab('preduzetnik')}>
          Preduzetnik / Firma
        </button>
      </div>

      {mainTab === 'fizicko-lice' ? (
        <div className="space-y-4">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            <button
              style={tabStyle(physicalMode === 'neto-u-bruto')}
              onClick={() => {
                setPhysicalMode('neto-u-bruto')
                setPhysicalAmount('')
              }}
            >
              Unesem neto → vidim bruto i troškove
            </button>
            <button
              style={tabStyle(physicalMode === 'bruto-u-neto')}
              onClick={() => {
                setPhysicalMode('bruto-u-neto')
                setPhysicalAmount('')
              }}
            >
              Unesem bruto → vidim neto
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {physicalMode === 'neto-u-bruto' ? 'Neto iznos (RSD)' : 'Bruto iznos (RSD)'}
            </label>
            <input
              type="number"
              value={physicalAmount}
              onChange={event => setPhysicalAmount(event.target.value)}
              placeholder={physicalMode === 'neto-u-bruto' ? 'npr. 80.000' : 'npr. 144.000'}
              className={inputCls}
              min={0}
            />
            <p className="mt-1 text-xs text-gray-500">
              {physicalMode === 'neto-u-bruto'
                ? 'Iznos koji izvođač prima na račun'
                : 'Iznos koji se upisuje u ugovor'}
            </p>
          </div>

          {physicalResult && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-gray-700">Raspodela bruto iznosa</h2>
                <div className="flex h-6 overflow-hidden rounded-lg">
                  {physicalBarData.map(segment => {
                    const percent = (segment.value / physicalResult.bruto) * 100
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
                  {physicalBarData.map(segment => (
                    <div key={segment.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <div className="h-3 w-3 rounded-sm" style={{ background: segment.color }} />
                      <span>{segment.label}</span>
                      <span className="text-gray-400">({((segment.value / physicalResult.bruto) * 100).toFixed(0)}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: PRIMARY }}>
                    Izvođač prima
                  </h3>
                  <ResultRow label="Neto isplata" value={physicalResult.neto} bold />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-orange-600">
                    Razrada obračuna
                  </h3>
                  <ResultRow label="Bruto iznos" value={physicalResult.bruto} />
                  <ResultRow label="Normiran trošak (20%)" value={physicalResult.normiraniTrosak} />
                  <ResultRow label="Poreska osnovica (80%)" value={physicalResult.poreskaOsnovica} />
                  <ResultRow label="Porez (20% od osnov.)" value={physicalResult.porez} separator />
                  <ResultRow label="PIO (25,5% od osnov.)" value={physicalResult.pio} />
                  <ResultRow label="Zdravstvo (10,3% od osn.)" value={physicalResult.zdravstvo} />
                  <ResultRow label="Neto isplata" value={physicalResult.neto} bold separator />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-yellow-700">
                    Trošak za naručioca
                  </h3>
                  <ResultRow label="Iznos za uplatu (bruto)" value={physicalResult.bruto} bold />
                  <p className="mt-4 text-xs leading-relaxed text-gray-500">
                    Ovaj iznos se upisuje u ugovor. Naručilac ga uplaćuje na račun izvođača, a zatim podnosi
                    PPP-PD prijavu i uplaćuje porez i doprinose u budžet.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#1B6B4A]/30 bg-[#1B6B4A]/5 px-5 py-4 text-sm text-gray-700">
                Neto iznos: <strong>{formatRsd(physicalResult.neto)} RSD</strong> → Bruto (u ugovor):{' '}
                <strong>{formatRsd(physicalResult.bruto)} RSD</strong>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <label className="mb-1 block text-sm font-medium text-gray-700">Ugovoreni iznos (RSD)</label>
            <input
              type="number"
              value={businessAmount}
              onChange={event => setBusinessAmount(event.target.value)}
              placeholder="npr. 120.000"
              className={inputCls}
              min={0}
            />
            <p className="mt-1 text-xs text-gray-500">Iznos koji se upisuje u ugovor i na fakturu</p>

            <div className="mt-5 flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Izvođač je PDV obveznik</label>
              </div>
              <button
                type="button"
                onClick={() => setPdvEnabled(value => !value)}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                style={{ background: pdvEnabled ? PRIMARY : '#D1D5DB' }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    pdvEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {businessBase > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-700">
                  Ugovoreni iznos
                </h3>
                <ResultRow label="Iznos bez PDV" value={businessBase} />
                {pdvEnabled && <ResultRow label="PDV (20%)" value={businessPdv} />}
                {pdvEnabled && <ResultRow label="Ukupno sa PDV" value={businessTotal} bold separator />}
                {!pdvEnabled && <ResultRow label="Ukupno za uplatu" value={businessBase} bold separator />}
              </div>

              <div className="rounded-xl border border-[#1B6B4A]/30 bg-[#1B6B4A]/5 px-5 py-4 text-sm text-gray-700">
                Za preduzetnike i firme nema dodatnih poreskih obaveza na strani naručioca. Izvođač prima pun
                ugovoreni iznos i sam izmiruje poreske obaveze kroz registrovanu delatnost.
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-950">
        <p className="font-medium">Spremi za ugovor? →</p>
        <Link href="/dokumenti/ugovor-o-delu" className="mt-2 inline-flex font-semibold text-blue-700 hover:text-blue-900">
          Napravi Ugovor o delu
        </Link>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <p className="font-medium">Napomena</p>
        <p className="mt-1">Rezultati su informativni. Ažurirano: {RATES.azurirano}.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Česta pitanja</h2>
        <div className="space-y-2">
          {FAQ_ITEMS.map(item => (
            <div key={item.id} className="border-b border-gray-100 last:border-0">
              <button
                type="button"
                className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setFaqOpen(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
              >
                <span>{item.q}</span>
                <span
                  className="ml-2 shrink-0 text-gray-400 transition-transform duration-200"
                  style={{ transform: faqOpen[item.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  ▼
                </span>
              </button>
              {faqOpen[item.id] && <p className="pb-3 text-sm leading-relaxed text-gray-600">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
