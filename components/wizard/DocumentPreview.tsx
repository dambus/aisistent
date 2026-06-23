'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { documentReminders } from '@/data/reminders'
import { ReminderBox } from '@/components/wizard/ReminderBox'
import { SendEmailModal } from '@/components/wizard/SendEmailModal'
import { UpgradeModal } from '@/components/wizard/UpgradeModal'

interface DocumentPreviewProps {
  text: string
  documentId: string
  documentTitle: string
  documentType: string
  isFree?: boolean
  onReset: () => void
}

type ExportFormat = 'pdf' | 'docx'

function isFakturaJson(text: string): boolean {
  try {
    const parsed = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null && 'tip_dokumenta' in parsed
  } catch {
    return false
  }
}

function isOtpremnicaJson(text: string): boolean {
  try { const d = JSON.parse(text); return typeof d.isporucilac_naziv === 'string' }
  catch { return false }
}

function isPonudaZaRadoveJson(text: string): boolean {
  try { const d = JSON.parse(text); return typeof d.izvodjac_naziv === 'string' && typeof d.narucilac_naziv === 'string' }
  catch { return false }
}

function isPutniNalogJson(text: string): boolean {
  try {
    const parsed = JSON.parse(text)
    return typeof parsed === 'object' && parsed !== null &&
      'ime_vozaca' in parsed && 'registarski_broj' in parsed
  } catch {
    return false
  }
}

async function downloadExport(documentId: string, format: ExportFormat): Promise<string | null> {
  const res = await fetch(`/api/export/${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document_id: documentId }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    return (json as { error?: string }).error ?? 'Greška pri generisanju fajla.'
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  a.href = url
  a.download = match?.[1] ?? `dokument.${format}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return null
}

export function DocumentPreview({ text, documentId, documentTitle, documentType, isFree = false, onReset }: DocumentPreviewProps) {
  const [loading, setLoading] = useState<ExportFormat | null>(null)
  const [error, setError] = useState('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showEmailUpgrade, setShowEmailUpgrade] = useState(false)
  const reminder = documentReminders[documentType]

  async function handleExport(format: ExportFormat) {
    setError('')
    setLoading(format)
    const err = await downloadExport(documentId, format)
    if (err) setError(err)
    setLoading(null)
  }

  const putniNalogPreview = (() => {
    if (!isPutniNalogJson(text)) return null

    let data: Record<string, unknown> = {}
    try { data = JSON.parse(text) } catch {}

    function fmtDate(iso: string) {
      if (!iso) return '___________'
      const d = new Date(iso)
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
    }

    const troskovi = [
      data.dnevnica && 'Dnevnica',
      data.gorivo_na_teret_firme && 'Gorivo na teret firme',
      data.smestaj && 'Smeštaj',
    ].filter(Boolean) as string[]

    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1B6B4A' }}>
              PUTNI NALOG
            </h2>
            {!!data.broj_naloga && (
              <p className="text-sm text-gray-500">Broj: {data.broj_naloga as string}</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-500 space-y-0.5">
            <p>Datum izdavanja: {fmtDate(data.datum_izdavanja as string)}</p>
          </div>
        </div>

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Izdavalac</p>
          <p className="font-semibold text-gray-900">{data.naziv_firme as string}</p>
          {!!data.pib && <p className="text-sm text-gray-500">PIB: {data.pib as string}</p>}
          {!!data.adresa_firme && <p className="text-sm text-gray-500">{data.adresa_firme as string}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Vozač</p>
            <p className="font-semibold text-gray-900">{data.ime_vozaca as string}</p>
            {!!data.pozicija_vozaca && <p className="text-sm text-gray-500">{data.pozicija_vozaca as string}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Vozilo</p>
            <p className="font-semibold text-gray-900">{data.marka_model as string}</p>
            <p className="text-sm text-gray-500">{data.registarski_broj as string}</p>
            <p className="text-sm text-gray-500">
              Km polazak: {(data.km_pocetak as string) ?? '___________'}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Svrha putovanja</p>
          <p className="text-sm text-gray-700">{data.svrha_putovanja as string}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Kretanje</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#1B6B4A' }} className="text-white">
                  <th className="px-3 py-2 text-left text-xs font-semibold">Datum</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Polazište</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold">Odredište</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold">Km</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="px-3 py-2 text-gray-600">{fmtDate(data.datum_polaska as string)}</td>
                  <td className="px-3 py-2 text-gray-900">{data.polaziste as string}</td>
                  <td className="px-3 py-2 text-gray-900">{data.odrediste as string}</td>
                  <td className="px-3 py-2 text-right text-gray-400">___</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-3 py-2 text-gray-600">
                    {data.datum_povratka ? fmtDate(data.datum_povratka as string) : '___________'}
                  </td>
                  <td className="px-3 py-2 text-gray-900">{data.odrediste as string}</td>
                  <td className="px-3 py-2 text-gray-900">{data.polaziste as string}</td>
                  <td className="px-3 py-2 text-right text-gray-400">___</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {troskovi.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Troškovi na teret firme
            </p>
            <div className="flex flex-wrap gap-2">
              {troskovi.map(t => (
                <span
                  key={t}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border"
                  style={{ borderColor: '#1B6B4A', color: '#1B6B4A', backgroundColor: '#F0FDF4' }}
                >
                  ✓ {t}
                </span>
              ))}
            </div>
            {!!data.ostali_troskovi && (
              <p className="mt-2 text-sm text-gray-600">
                Ostalo: {data.ostali_troskovi as string}
              </p>
            )}
          </div>
        )}

        {!!data.dnevnica && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
            Dnevnica u Srbiji: neoporezivi iznos 3.316 RSD/dan (2026).
            Za inostranstvo do 90 EUR/dan. Obračunava se za putovanje duže od 8 sati.
          </div>
        )}
      </div>
    )
  })()

  const fakturaPreview = (() => {
    if (!isFakturaJson(text)) return null

    let data: Record<string, unknown> = {}
    try { data = JSON.parse(text) } catch {}

    let stavke: Array<{ rb: number; naziv: string; kolicina: number; jedinica: string; cena_bez_pdv: number }> = []
    try { stavke = JSON.parse((data.stavke as string) ?? '[]') } catch {}

    const tipDokumenta = (data.tip_dokumenta as string) ?? 'Faktura'
    const brojDokumenta = (data.broj_dokumenta as string) ?? ''
    const datumIzdavanja = (data.datum_izdavanja as string) ?? ''
    const datumValute = (data.datum_valute as string) ?? ''
    const izdavalacNaziv = (data.izdavalac_naziv as string) ?? ''
    const izdavalacPib = (data.izdavalac_pib as string) ?? ''
    const izdavalacAdresa = (data.izdavalac_adresa as string) ?? ''
    const primalacNaziv = (data.primalac_naziv as string) ?? ''
    const primalacPib = (data.primalac_pib as string) ?? ''
    const primalacAdresa = (data.primalac_adresa as string) ?? ''
    const izdavalacTekuciRacun = (data.izdavalac_tekuci_racun as string) ?? ''
    const pozivNaBroj = (data.poziv_na_broj as string) ?? ''
    const napomena = (data.napomena as string) ?? ''

    const pdvStopa = data.izdavalac_pdv_obveznik
      ? (parseInt((data.pdv_stopa as string) ?? '0') || 0) : 0
    const ukupnoBezPdv = stavke.reduce((sum, s) => sum + s.kolicina * s.cena_bez_pdv, 0)
    const iznosPdv = ukupnoBezPdv * pdvStopa / 100
    const ukupnoSaPdv = ukupnoBezPdv + iznosPdv

    function fmt(n: number) {
      return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    function fmtDate(iso: string) {
      if (!iso) return ''
      const d = new Date(iso)
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
    }

    return (
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1B6B4A' }}>
              {tipDokumenta.toUpperCase()}
            </h2>
            {brojDokumenta && (
              <p className="text-sm text-gray-500">Broj: {brojDokumenta}</p>
            )}
          </div>
          <div className="space-y-0.5 text-right text-sm text-gray-500">
            <p>Datum: {fmtDate(datumIzdavanja)}</p>
            <p>Rok plaćanja: {fmtDate(datumValute)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Izdavalac</p>
            <p className="font-semibold text-gray-900">{izdavalacNaziv}</p>
            <p className="text-sm text-gray-500">PIB: {izdavalacPib}</p>
            <p className="text-sm text-gray-500">{izdavalacAdresa}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Primalac</p>
            <p className="font-semibold text-gray-900">{primalacNaziv}</p>
            {primalacPib && <p className="text-sm text-gray-500">PIB: {primalacPib}</p>}
            <p className="text-sm text-gray-500">{primalacAdresa}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1B6B4A' }} className="text-white">
                <th className="rounded-tl-lg px-3 py-2 text-left text-xs font-semibold">Rb.</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Naziv</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Kol.</th>
                <th className="px-3 py-2 text-center text-xs font-semibold">Jed.</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Cena</th>
                <th className="rounded-tr-lg px-3 py-2 text-right text-xs font-semibold">Ukupno</th>
              </tr>
            </thead>
            <tbody>
              {stavke.map((s, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 py-2 text-gray-500">{s.rb}.</td>
                  <td className="px-3 py-2 text-gray-900">{s.naziv}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(s.kolicina)}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{s.jedinica}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(s.cena_bez_pdv)}</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">
                    {fmt(s.kolicina * s.cena_bez_pdv)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="min-w-[240px] space-y-1.5">
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
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold" style={{ color: '#1B6B4A' }}>
              <span>Ukupno za uplatu:</span>
              <span>{fmt(ukupnoSaPdv)} RSD</span>
            </div>
          </div>
        </div>

        {(izdavalacTekuciRacun || pozivNaBroj) && (
          <div className="space-y-1 rounded-xl bg-gray-50 p-4 text-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Podaci za plaćanje
            </p>
            {izdavalacTekuciRacun && (
              <div className="flex justify-between">
                <span className="text-gray-500">Račun:</span>
                <span className="font-medium">{izdavalacTekuciRacun}</span>
              </div>
            )}
            {pozivNaBroj && (
              <div className="flex justify-between">
                <span className="text-gray-500">Poziv na broj:</span>
                <span className="font-medium">{pozivNaBroj}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-100 pt-1">
              <span className="text-gray-500">Ukupno:</span>
              <span className="font-bold" style={{ color: '#1B6B4A' }}>{fmt(ukupnoSaPdv)} RSD</span>
            </div>
          </div>
        )}

        {!data.izdavalac_pdv_obveznik && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
            Napomena: Izdavalac nije u sistemu PDV-a. PDV nije obračunat.
          </div>
        )}

        {napomena && (
          <p className="text-sm italic text-gray-500">{napomena}</p>
        )}
      </div>
    )
  })()

  const otpremnicaPreview = (() => {
    if (!isOtpremnicaJson(text)) return null

    let data: Record<string, unknown> = {}
    try { data = JSON.parse(text) } catch {}

    let stavke: Array<{ rb: number; naziv: string; kolicina: number; jedinica: string; cena_bez_pdv: number }> = []
    try { stavke = JSON.parse((data.stavke as string) ?? '[]') } catch {}

    const brojDokumenta = (data.broj_dokumenta as string) ?? ''
    const datumIzdavanja = (data.datum_izdavanja as string) ?? ''
    const datumIsporuke = (data.datum_isporuke as string) ?? ''
    const isporucilacNaziv = (data.isporucilac_naziv as string) ?? ''
    const isporucilacPib = (data.isporucilac_pib as string) ?? ''
    const isporucilacAdresa = (data.isporucilac_adresa as string) ?? ''
    const primalacNaziv = (data.primalac_naziv as string) ?? ''
    const primalacPib = (data.primalac_pib as string) ?? ''
    const primalacAdresa = (data.primalac_adresa as string) ?? ''
    const nacinIsporuke = (data.nacin_isporuke as string) ?? ''
    const napomena = (data.napomena as string) ?? ''
    function fmt(n: number) {
      return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }

    function fmtDate(iso: string) {
      if (!iso) return ''
      const d = new Date(iso)
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
    }

    return (
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1B6B4A' }}>OTPREMNICA</h2>
            {brojDokumenta && <p className="text-sm text-gray-500">Broj: {brojDokumenta}</p>}
          </div>
          <div className="space-y-0.5 text-right text-sm text-gray-500">
            <p>Datum: {fmtDate(datumIzdavanja)}</p>
            {datumIsporuke && <p>Datum isporuke: {fmtDate(datumIsporuke)}</p>}
            {nacinIsporuke && <p>Način isporuke: {nacinIsporuke}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Isporučilac</p>
            <p className="font-semibold text-gray-900">{isporucilacNaziv}</p>
            {isporucilacPib && <p className="text-sm text-gray-500">PIB: {isporucilacPib}</p>}
            <p className="text-sm text-gray-500">{isporucilacAdresa}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Primalac</p>
            <p className="font-semibold text-gray-900">{primalacNaziv}</p>
            {primalacPib && <p className="text-sm text-gray-500">PIB: {primalacPib}</p>}
            <p className="text-sm text-gray-500">{primalacAdresa}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1B6B4A' }} className="text-white">
                <th className="rounded-tl-lg px-3 py-2 text-left text-xs font-semibold">Rb.</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Naziv robe/usluge</th>
                <th className="px-3 py-2 text-center text-xs font-semibold">Jed. mere</th>
                <th className="rounded-tr-lg px-3 py-2 text-right text-xs font-semibold">Količina</th>
              </tr>
            </thead>
            <tbody>
              {stavke.map((s, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 py-2 text-gray-500">{s.rb}.</td>
                  <td className="px-3 py-2 text-gray-900">{s.naziv}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{s.jedinica}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(s.kolicina)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {napomena && <p className="text-sm italic text-gray-500">{napomena}</p>}
      </div>
    )
  })()

  const ponudaZaRadovePreview = (() => {
    if (!isPonudaZaRadoveJson(text)) return null

    let data: Record<string, unknown> = {}
    try { data = JSON.parse(text) } catch {}

    let stavke: Array<{ rb: number; naziv: string; kolicina: number; jedinica: string; cena_bez_pdv: number }> = []
    try { stavke = JSON.parse((data.stavke as string) ?? '[]') } catch {}

    const pdvObveznik = !!data.izvodjac_pdv_obveznik
    const pdvStopaRaw = (data.pdv_stopa as string) ?? ''
    const pdvStopa = pdvObveznik
      ? (pdvStopaRaw === 'oslobodjeno' ? 0 : parseInt(pdvStopaRaw) || 0)
      : 0
    const ukupnoBezPdv = stavke.reduce((sum, s) => sum + s.kolicina * s.cena_bez_pdv, 0)
    const iznosPdv = pdvObveznik && pdvStopaRaw !== 'oslobodjeno' ? ukupnoBezPdv * pdvStopa / 100 : 0
    const ukupnoSaPdv = ukupnoBezPdv + iznosPdv

    function fmt(n: number) {
      return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    function fmtDate(iso: string) {
      if (!iso) return ''
      const d = new Date(iso)
      return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
    }

    return (
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#1B6B4A' }}>PONUDA ZA RADOVE</h2>
            {!!(data.broj_ponude as string) && <p className="text-sm text-gray-500">Broj: {data.broj_ponude as string}</p>}
          </div>
          <div className="space-y-0.5 text-right text-sm text-gray-500">
            <p>Datum: {fmtDate(data.datum_izdavanja as string)}</p>
            {!!(data.rok_vazenja as string) && <p>Rok važenja: {data.rok_vazenja as string}</p>}
            {!!(data.lokacija_radova as string) && <p>Lokacija: {data.lokacija_radova as string}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Izvođač</p>
            <p className="font-semibold text-gray-900">{data.izvodjac_naziv as string}</p>
            {!!(data.izvodjac_pib as string) && <p className="text-sm text-gray-500">PIB: {data.izvodjac_pib as string}</p>}
            <p className="text-sm text-gray-500">{data.izvodjac_adresa as string}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Naručilac</p>
            <p className="font-semibold text-gray-900">{data.narucilac_naziv as string}</p>
            {!!(data.narucilac_pib as string) && <p className="text-sm text-gray-500">PIB: {data.narucilac_pib as string}</p>}
            <p className="text-sm text-gray-500">{data.narucilac_adresa as string}</p>
          </div>
        </div>

        {!!(data.opis_radova as string) && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">Opis radova</p>
            <p className="text-sm text-gray-700">{data.opis_radova as string}</p>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#1B6B4A' }} className="text-white">
                <th className="rounded-tl-lg px-3 py-2 text-left text-xs font-semibold">Rb.</th>
                <th className="px-3 py-2 text-left text-xs font-semibold">Opis rada / materijala</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Kol.</th>
                <th className="px-3 py-2 text-center text-xs font-semibold">Jed.</th>
                <th className="px-3 py-2 text-right text-xs font-semibold">Cena</th>
                <th className="rounded-tr-lg px-3 py-2 text-right text-xs font-semibold">Ukupno</th>
              </tr>
            </thead>
            <tbody>
              {stavke.map((s, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="px-3 py-2 text-gray-500">{s.rb}.</td>
                  <td className="px-3 py-2 text-gray-900">{s.naziv}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(s.kolicina)}</td>
                  <td className="px-3 py-2 text-center text-gray-500">{s.jedinica}</td>
                  <td className="px-3 py-2 text-right text-gray-700">{fmt(s.cena_bez_pdv)}</td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">{fmt(s.kolicina * s.cena_bez_pdv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="min-w-60 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Ukupno bez PDV:</span>
              <span>{fmt(ukupnoBezPdv)} RSD</span>
            </div>
            {pdvObveznik && pdvStopaRaw !== 'oslobodjeno' && pdvStopa > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>PDV ({pdvStopa}%):</span>
                <span>{fmt(iznosPdv)} RSD</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold" style={{ color: '#1B6B4A' }}>
              <span>Ukupna vrednost:</span>
              <span>{fmt(ukupnoSaPdv)} RSD</span>
            </div>
          </div>
        </div>

        {!pdvObveznik && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
            Napomena: Izvođač nije u sistemu PDV-a. PDV nije obračunat.
          </div>
        )}
        {pdvObveznik && pdvStopaRaw === 'oslobodjeno' && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs text-yellow-800">
            Promet je oslobođen PDV-a.
          </div>
        )}
        {!!(data.napomena as string) && (
          <p className="text-sm italic text-gray-500">{data.napomena as string}</p>
        )}
      </div>
    )
  })()

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Vaš dokument je spreman</h2>
          <p className="text-sm text-gray-500">Proverite sadržaj i preuzmite u željenom formatu.</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-800"
        >
          ← Novi dokument
        </button>
      </div>

      {reminder && <ReminderBox reminder={reminder} />}

      <div className="mb-4 flex flex-wrap gap-2">
        <ExportButton
          label="Preuzmi PDF"
          format="pdf"
          loading={loading === 'pdf'}
          disabled={loading !== null}
          onClick={() => handleExport('pdf')}
          primary
        />
        <ExportButton
          label="Preuzmi DOCX"
          format="docx"
          loading={loading === 'docx'}
          disabled={loading !== null}
          onClick={() => handleExport('docx')}
        />
        <button
          type="button"
          disabled={loading !== null}
          onClick={() => isFree ? setShowEmailUpgrade(true) : setShowEmailModal(true)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Pošalji emailom
        </button>
      </div>

      <SendEmailModal
        documentId={documentId}
        documentTitle={documentTitle || 'Dokument'}
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
      {showEmailUpgrade && (
        <UpgradeModal
          onClose={() => setShowEmailUpgrade(false)}
          title="Slanje emailom nije dostupno"
          description="Besplatni plan ne uključuje slanje dokumenata emailom. Pređite na Starter ili Pro plan."
        />
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <div className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:font-semibold">
          {putniNalogPreview ?? fakturaPreview ?? otpremnicaPreview ?? ponudaZaRadovePreview ?? (() => {
            const lines = text.split('\n')
            const cutoff = Math.max(8, Math.floor(lines.length * 0.30))
            const visibleText = isFree ? lines.slice(0, cutoff).join('\n') : text
            const blurredText = isFree ? lines.slice(cutoff).join('\n') : ''

            return (
              <div className="relative">
                <ReactMarkdown>{visibleText}</ReactMarkdown>

                {isFree && blurredText && (
                  <div className="relative">
                    <div className="pointer-events-none select-none opacity-70 blur-sm">
                      <ReactMarkdown>{blurredText}</ReactMarkdown>
                    </div>

                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-16"
                      style={{ background: 'linear-gradient(to bottom, white, transparent)' }}
                    />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="mx-4 w-full max-w-sm rounded-2xl border border-gray-200 bg-white/95 p-6 text-center shadow-xl backdrop-blur-sm">
                        <div
                          className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full"
                          style={{ backgroundColor: '#D1FAE5' }}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#1B6B4A' }}>
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          Pređite na Starter da vidite ceo dokument
                        </h3>
                        <p className="mt-1.5 text-sm text-gray-500">
                          PDF bez oznake, Word format, arhiva dokumenata — od 1.080 RSD/mes.
                        </p>
                        <a
                          href="/#cenovnik"
                          className="mt-4 block rounded-xl py-2.5 text-sm font-semibold text-white transition-colors"
                          style={{ backgroundColor: '#1B6B4A' }}
                        >
                          Pogledajte planove →
                        </a>
                        <p className="mt-2 text-xs text-gray-400">
                          PDF preuzmite i sa besplatnim planom
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Dokument je sačuvan u vašoj arhivi.
      </p>
    </div>
  )
}

function ExportButton({
  label, format, loading, disabled, onClick, primary,
}: {
  label: string
  format: ExportFormat
  loading: boolean
  disabled: boolean
  onClick: () => void
  primary?: boolean
}) {
  const icon = format === 'pdf'
    ? 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    : 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'

  const base = 'flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
  const style = primary
    ? `${base} bg-[#1B6B4A] hover:bg-[#155C3E] text-white`
    : `${base} border border-gray-300 hover:bg-gray-50 text-gray-700`

  return (
    <button className={style} disabled={disabled} onClick={onClick}>
      {loading ? (
        <>
          <span className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${primary ? 'border-white/30 border-t-white' : 'border-gray-300 border-t-gray-600'}`} />
          Generišem...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}
