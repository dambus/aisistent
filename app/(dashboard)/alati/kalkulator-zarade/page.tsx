'use client'

import { useState, useMemo } from 'react'

// ─── Stope za 2026. godinu ─────────────────────────────────────────────────
const STOPE = {
  NORMIRANI_TROSKOVI: 25_025,
  POREZ: 0.10,
  PIO_ZAPOSL: 0.14,
  ZDRAVSTVO_ZAPOSL: 0.0515,
  NEZAPOSL_ZAPOSL: 0.0075,
  PIO_POSLOD: 0.115,
  ZDRAVSTVO_POSLOD: 0.0515,
  NEZAPOSL_POSLOD: 0.0075,
  MIN_BRUTO: 84_031,
  AZURIRANO: 'januar 2026.',
}

const DOPRINOSI_ZAPOSL = STOPE.PIO_ZAPOSL + STOPE.ZDRAVSTVO_ZAPOSL + STOPE.NEZAPOSL_ZAPOSL
const DOPRINOSI_POSLOD = STOPE.PIO_POSLOD + STOPE.ZDRAVSTVO_POSLOD + STOPE.NEZAPOSL_POSLOD

interface Rezultat {
  bruto: number
  porez: number
  pio_zaposl: number
  zdravstvo_zaposl: number
  nezaposl_zaposl: number
  neto: number
  pio_poslod: number
  zdravstvo_poslod: number
  nezaposl_poslod: number
  ukupan_trosak: number
}

function izracunajIzBruto(bruto: number): Rezultat {
  const poreska_osnovica = Math.max(bruto - STOPE.NORMIRANI_TROSKOVI, 0)
  const porez = poreska_osnovica * STOPE.POREZ
  const pio_zaposl = bruto * STOPE.PIO_ZAPOSL
  const zdravstvo_zaposl = bruto * STOPE.ZDRAVSTVO_ZAPOSL
  const nezaposl_zaposl = bruto * STOPE.NEZAPOSL_ZAPOSL
  const neto = bruto - porez - pio_zaposl - zdravstvo_zaposl - nezaposl_zaposl
  const pio_poslod = bruto * STOPE.PIO_POSLOD
  const zdravstvo_poslod = bruto * STOPE.ZDRAVSTVO_POSLOD
  const nezaposl_poslod = bruto * STOPE.NEZAPOSL_POSLOD
  const ukupan_trosak = bruto + pio_poslod + zdravstvo_poslod + nezaposl_poslod
  return { bruto, porez, pio_zaposl, zdravstvo_zaposl, nezaposl_zaposl, neto, pio_poslod, zdravstvo_poslod, nezaposl_poslod, ukupan_trosak }
}

function brutoIzNeto(neto: number): number {
  // Ako neto ≤ 20045 → bruto ≤ 25025, nema poreza
  // neto = bruto × (1 - doprinosi_zaposl)
  // Threshold: max(neto) pri bruto=25025 bez poreza = 25025 × (1 - DOPRINOSI_ZAPOSL)
  const threshold = STOPE.NORMIRANI_TROSKOVI * (1 - DOPRINOSI_ZAPOSL)
  if (neto <= threshold) {
    return neto / (1 - DOPRINOSI_ZAPOSL)
  }
  // neto = bruto × (1 - POREZ - DOPRINOSI_ZAPOSL) + NORMIRANI × POREZ
  const koef = 1 - STOPE.POREZ - DOPRINOSI_ZAPOSL
  const slobodni = STOPE.NORMIRANI_TROSKOVI * STOPE.POREZ
  return (neto - slobodni) / koef
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('sr-RS')
}

// ─── Komponenta ────────────────────────────────────────────────────────────
export default function KalkulatorZarade() {
  const [tab, setTab] = useState<'bruto' | 'neto'>('bruto')
  const [unos, setUnos] = useState<string>('')
  const [neputnoVreme, setNepunoVreme] = useState(false)
  const [sati, setSati] = useState<number>(20)
  const [topliObrok, setTopliObrok] = useState(false)
  const [topliIznos, setTopliIznos] = useState<string>('1600')
  const [prevoz, setPrevoz] = useState(false)
  const [prevozIznos, setPrevozIznos] = useState<string>('')
  const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({})

  const rezultat = useMemo<Rezultat | null>(() => {
    const val = parseFloat(unos.replace(/\./g, '').replace(',', '.'))
    if (!val || val <= 0) return null
    const bruto = tab === 'bruto' ? val : brutoIzNeto(val)
    if (bruto <= 0) return null
    return izracunajIzBruto(bruto)
  }, [unos, tab])

  const topliVal = parseFloat(topliIznos) || 0
  const prevozVal = parseFloat(prevozIznos) || 0

  const PRIMARY = '#1B6B4A'
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

  const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1B6B4A] focus:border-transparent'

  // Visual bar data (% of ukupan_trosak)
  const barData = rezultat ? [
    { label: 'Neto', value: rezultat.neto, color: '#1B6B4A' },
    { label: 'Porez', value: rezultat.porez, color: '#DC2626' },
    { label: 'Doprinosi zaposleni', value: rezultat.pio_zaposl + rezultat.zdravstvo_zaposl + rezultat.nezaposl_zaposl, color: '#F97316' },
    { label: 'Doprinosi poslodavac', value: rezultat.pio_poslod + rezultat.zdravstvo_poslod + rezultat.nezaposl_poslod, color: '#EAB308' },
  ] : []

  const faqItems = [
    { id: 'bruto', q: 'Šta je bruto zarada?', a: 'Bruto zarada je ukupan iznos koji poslodavac isplaćuje za rad zaposlenog, pre odbitka poreza i doprinosa koji padaju na teret zaposlenog. To je iznos koji se ugovara i navodi u ugovoru o radu.' },
    { id: 'neto', q: 'Šta je neto zarada?', a: 'Neto zarada je iznos koji zaposleni stvarno dobija na račun — bruto minus porez na dohodak i doprinosi na teret zaposlenog (PIO, zdravstvo, nezaposlenost).' },
    { id: 'doprinosi', q: 'Šta su doprinosi?', a: 'Doprinosi za obavezno socijalno osiguranje obezbeđuju zdravstvenu zaštitu, penzijsko osiguranje i osiguranje za slučaj nezaposlenosti. Plaćaju ih i zaposleni i poslodavac, svaki po svojoj stopi.' },
    { id: 'trosak', q: 'Zašto je ukupan trošak veći od bruto?', a: 'Pored bruto zarade, poslodavac plaća i dodatnih 17,4% za doprinose na svoj teret (PIO 11,5% + zdravstvo 5,15% + nezaposlenost 0,75%). Ukupan trošak po zaposlenom je zato bruto × 1,174.' },
  ]

  function Row({ label, value, bold, separator }: { label: string; value: string; bold?: boolean; separator?: boolean }) {
    return (
      <>
        {separator && <div className="border-t border-gray-200 my-2" />}
        <div className={`flex justify-between items-center py-1 text-sm ${bold ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
          <span>{label}</span>
          <span className={bold ? 'text-gray-900' : 'text-gray-700'}>{value} RSD</span>
        </div>
      </>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Naslov */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kalkulator zarade</h1>
        <p className="text-sm text-gray-500 mt-1">Bruto ↔ neto preračun sa aktuelnim stopama za 2026. godinu</p>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-xl p-1 flex gap-1">
        <button style={tabStyle(tab === 'bruto')} onClick={() => { setTab('bruto'); setUnos('') }}>
          Unesem bruto → vidim neto
        </button>
        <button style={tabStyle(tab === 'neto')} onClick={() => { setTab('neto'); setUnos('') }}>
          Unesem neto → vidim bruto
        </button>
      </div>

      {/* Inputi */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        {/* Zarada */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {tab === 'bruto' ? 'Bruto zarada (RSD)' : 'Neto zarada (RSD)'}
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <input
            type="number"
            value={unos}
            placeholder={tab === 'bruto' ? `min. ${fmt(STOPE.MIN_BRUTO)}` : 'npr. 80.000'}
            onChange={e => setUnos(e.target.value)}
            className={inputCls}
            min={0}
          />
          {tab === 'bruto' && unos && parseFloat(unos) < STOPE.MIN_BRUTO && (
            <p className="mt-1 text-xs text-amber-600">
              Ispod minimalne bruto zarade za 2026. ({fmt(STOPE.MIN_BRUTO)} RSD)
            </p>
          )}
        </div>

        {/* Radno vreme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Radno vreme</label>
          <div className="flex flex-wrap gap-2">
            {[false, true].map(nepuno => (
              <button
                key={String(nepuno)}
                type="button"
                onClick={() => setNepunoVreme(nepuno)}
                className="px-4 py-2 rounded-lg text-sm border transition-colors"
                style={!nepuno === !neputnoVreme
                  ? { background: '#1B6B4A', color: '#fff', borderColor: '#1B6B4A' }
                  : { background: '#fff', color: '#374151', borderColor: '#D1D5DB' }}
              >
                {nepuno ? 'Nepuno radno vreme' : 'Puno (40h/ned)'}
              </button>
            ))}
          </div>
          {neputnoVreme && (
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">Broj sati nedeljno: <strong>{sati}h</strong></label>
              <input
                type="range"
                min={1}
                max={39}
                value={sati}
                onChange={e => setSati(Number(e.target.value))}
                className="w-full accent-[#1B6B4A]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span>1h</span><span>39h</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Unesite zaradu za {sati}h/ned — kalkulator računa na osnovu unesenog iznosa.
              </p>
            </div>
          )}
        </div>

        {/* Topli obrok */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Topli obrok</label>
              <p className="text-xs text-gray-500 mt-0.5">Do 1.600 RSD/dan je oslobođeno poreza i doprinosa</p>
            </div>
            <button
              type="button"
              onClick={() => setTopliObrok(v => !v)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ background: topliObrok ? PRIMARY : '#D1D5DB' }}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${topliObrok ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {topliObrok && (
            <div className="mt-2">
              <input
                type="number"
                value={topliIznos}
                onChange={e => setTopliIznos(e.target.value)}
                placeholder="Iznos u RSD (mesečno)"
                className={inputCls}
                min={0}
              />
              <p className="text-xs text-gray-400 mt-0.5">Mesečni iznos naknade za topli obrok</p>
            </div>
          )}
        </div>

        {/* Prevoz */}
        <div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Naknada za prevoz</label>
              <p className="text-xs text-gray-500 mt-0.5">Do iznosa mesečne karte oslobođeno je poreza</p>
            </div>
            <button
              type="button"
              onClick={() => setPrevoz(v => !v)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
              style={{ background: prevoz ? PRIMARY : '#D1D5DB' }}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${prevoz ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          {prevoz && (
            <div className="mt-2">
              <input
                type="number"
                value={prevozIznos}
                onChange={e => setPrevozIznos(e.target.value)}
                placeholder="Iznos u RSD (mesečno)"
                className={inputCls}
                min={0}
              />
              <p className="text-xs text-gray-400 mt-0.5">Mesečna naknada za troškove prevoza</p>
            </div>
          )}
        </div>
      </div>

      {/* Rezultati */}
      {rezultat && (
        <div className="space-y-4">
          {/* Vizuelni bar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Raspodela ukupnog troška</h2>
            <div className="flex h-6 rounded-lg overflow-hidden">
              {barData.map(seg => {
                const pct = (seg.value / rezultat.ukupan_trosak) * 100
                return (
                  <div
                    key={seg.label}
                    style={{ width: `${pct}%`, background: seg.color }}
                    title={`${seg.label}: ${fmt(seg.value)} RSD (${pct.toFixed(1)}%)`}
                  />
                )
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
              {barData.map(seg => (
                <div key={seg.label} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="h-3 w-3 rounded-sm shrink-0" style={{ background: seg.color }} />
                  <span>{seg.label}</span>
                  <span className="text-gray-400">({((seg.value / rezultat.ukupan_trosak) * 100).toFixed(0)}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Kartice rezultata */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Kartica 1 — Zaposleni prima */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: PRIMARY }}>
                Zaposleni prima
              </h3>
              <Row label="Neto zarada" value={fmt(rezultat.neto)} />
              {topliObrok && topliVal > 0 && <Row label="Topli obrok" value={fmt(topliVal)} />}
              {prevoz && prevozVal > 0 && <Row label="Naknada prevoza" value={fmt(prevozVal)} />}
              <Row
                label="Ukupno u džep"
                value={fmt(rezultat.neto + (topliObrok ? topliVal : 0) + (prevoz ? prevozVal : 0))}
                bold
                separator
              />
            </div>

            {/* Kartica 2 — Odbici od bruto */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-3">
                Odbici od bruto
              </h3>
              <Row label="Bruto zarada" value={fmt(rezultat.bruto)} />
              <Row label="Porez na dohodak" value={fmt(rezultat.porez)} />
              <Row label="PIO (zaposleni)" value={fmt(rezultat.pio_zaposl)} />
              <Row label="Zdravstvo" value={fmt(rezultat.zdravstvo_zaposl)} />
              <Row label="Nezaposlenost" value={fmt(rezultat.nezaposl_zaposl)} />
              <Row label="Neto zarada" value={fmt(rezultat.neto)} bold separator />
            </div>

            {/* Kartica 3 — Trošak za firmu */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-700 mb-3">
                Trošak za firmu
              </h3>
              <Row label="Bruto zarada" value={fmt(rezultat.bruto)} />
              <Row label="PIO (poslodavac)" value={fmt(rezultat.pio_poslod)} />
              <Row label="Zdravstvo (posl.)" value={fmt(rezultat.zdravstvo_poslod)} />
              <Row label="Nezaposlenost (posl.)" value={fmt(rezultat.nezaposl_poslod)} />
              {topliObrok && topliVal > 0 && <Row label="Topli obrok" value={fmt(topliVal)} />}
              {prevoz && prevozVal > 0 && <Row label="Prevoz" value={fmt(prevozVal)} />}
              <Row
                label="Ukupan trošak"
                value={fmt(rezultat.ukupan_trosak + (topliObrok ? topliVal : 0) + (prevoz ? prevozVal : 0))}
                bold
                separator
              />
            </div>
          </div>

          {/* Bruto prikaz kad je unesen neto */}
          {tab === 'neto' && (
            <div className="rounded-xl border border-[#1B6B4A]/30 bg-[#1B6B4A]/5 px-5 py-4 text-sm text-gray-700">
              Unesenom neto od <strong>{fmt(parseFloat(unos) || 0)} RSD</strong> odgovara bruto zarada od{' '}
              <strong>{fmt(rezultat.bruto)} RSD</strong>.
            </div>
          )}
        </div>
      )}

      {/* Napomena */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 space-y-1">
        <p className="font-medium">Napomena</p>
        <p>Kalkulator koristi stope važeće za 2026. godinu (ažurirano: {STOPE.AZURIRANO}). Rezultati su informativni — za tačan obračun konsultujte računovođu.</p>
        <p className="text-xs text-amber-700">Minimalna bruto zarada 2026: {fmt(STOPE.MIN_BRUTO)} RSD</p>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Objašnjenje pojmova</h2>
        {faqItems.map(item => (
          <div key={item.id} className="border-b border-gray-100 last:border-0">
            <button
              className="flex w-full items-center justify-between py-3 text-left text-sm font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setFaqOpen(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
            >
              <span>{item.q}</span>
              <span className="ml-2 shrink-0 text-gray-400 transition-transform duration-200" style={{ transform: faqOpen[item.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                ▼
              </span>
            </button>
            {faqOpen[item.id] && (
              <p className="pb-3 text-sm text-gray-600 leading-relaxed">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
