'use client'

import { useState, useEffect } from 'react'

interface Stavka {
  rb: number
  naziv: string
  kolicina: number
  jedinica: string
  cena_bez_pdv: number
}

interface Props {
  value: string
  pdvStopa: number
  onChange: (value: string) => void
}

export function FakturaStavkeField({ value, pdvStopa, onChange }: Props) {
  const [stavke, setStavke] = useState<Stavka[]>(() => {
    try { return JSON.parse(value) } catch { return [{ rb: 1, naziv: '', kolicina: 1, jedinica: 'kom', cena_bez_pdv: 0 }] }
  })

  useEffect(() => {
    onChange(JSON.stringify(stavke))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stavke])

  function updateStavka(index: number, field: keyof Stavka, val: string | number) {
    const next = stavke.map((s, i) => i === index ? { ...s, [field]: val } : s)
    setStavke(next)
  }

  function addStavka() {
    setStavke([...stavke, { rb: stavke.length + 1, naziv: '', kolicina: 1, jedinica: 'kom', cena_bez_pdv: 0 }])
  }

  function removeStavka(index: number) {
    const next = stavke.filter((_, i) => i !== index).map((s, i) => ({ ...s, rb: i + 1 }))
    setStavke(next)
  }

  const ukupnoBezPdv = stavke.reduce((sum, s) => sum + s.kolicina * s.cena_bez_pdv, 0)
  const iznosPdv = ukupnoBezPdv * pdvStopa / 100
  const ukupnoSaPdv = ukupnoBezPdv + iznosPdv

  function fmt(n: number) {
    return n.toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-3">
      {/* Mobile: kartica per stavka */}
      <div className="sm:hidden space-y-3">
        {stavke.map((stavka, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stavka {stavka.rb}</span>
              <button
                type="button"
                onClick={() => removeStavka(i)}
                disabled={stavke.length === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 text-lg"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={stavka.naziv}
              onChange={e => updateStavka(i, 'naziv', e.target.value)}
              placeholder="Naziv usluge / robe"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Količina</label>
                <input
                  type="number"
                  value={stavka.kolicina}
                  min={0.01}
                  step={0.01}
                  onChange={e => updateStavka(i, 'kolicina', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Jedinica</label>
                <input
                  type="text"
                  value={stavka.jedinica}
                  onChange={e => updateStavka(i, 'jedinica', e.target.value)}
                  placeholder="kom"
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Cena (RSD)</label>
                <input
                  type="number"
                  value={stavka.cena_bez_pdv}
                  min={0}
                  step={0.01}
                  onChange={e => updateStavka(i, 'cena_bez_pdv', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm text-right outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end text-sm text-gray-600">
              <span>Ukupno: <strong>{fmt(stavka.kolicina * stavka.cena_bez_pdv)} RSD</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: grid layout */}
      <div className="hidden sm:block space-y-2">
        <div className="grid grid-cols-[2rem_1fr_5rem_5rem_7rem_2rem] gap-2 text-xs font-semibold text-gray-500">
          <span>Rb.</span>
          <span>Naziv usluge / robe</span>
          <span>Kol.</span>
          <span>Jed.</span>
          <span className="text-right">Cena (RSD)</span>
          <span />
        </div>
        {stavke.map((stavka, i) => (
          <div key={i} className="grid grid-cols-[2rem_1fr_5rem_5rem_7rem_2rem] items-center gap-2">
            <span className="text-sm text-gray-400">{stavka.rb}.</span>
            <input
              type="text"
              value={stavka.naziv}
              onChange={e => updateStavka(i, 'naziv', e.target.value)}
              placeholder="npr. Izrada web sajta"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
            />
            <input
              type="number"
              value={stavka.kolicina}
              min={0.01}
              step={0.01}
              onChange={e => updateStavka(i, 'kolicina', parseFloat(e.target.value) || 0)}
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="text"
              value={stavka.jedinica}
              onChange={e => updateStavka(i, 'jedinica', e.target.value)}
              placeholder="kom"
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="number"
              value={stavka.cena_bez_pdv}
              min={0}
              step={0.01}
              onChange={e => updateStavka(i, 'cena_bez_pdv', parseFloat(e.target.value) || 0)}
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm text-right outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => removeStavka(i)}
              disabled={stavke.length === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addStavka}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-[#1B6B4A] hover:text-[#1B6B4A]"
      >
        + Dodaj stavku
      </button>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-1.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Ukupno bez PDV:</span>
          <span>{fmt(ukupnoBezPdv)} RSD</span>
        </div>
        {pdvStopa > 0 && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>PDV ({pdvStopa}%):</span>
            <span>{fmt(iznosPdv)} RSD</span>
          </div>
        )}
        <div className="flex justify-between border-t border-gray-300 pt-1.5 text-base font-bold text-gray-900">
          <span>Ukupno za uplatu:</span>
          <span>{fmt(ukupnoSaPdv)} RSD</span>
        </div>
      </div>
    </div>
  )
}
