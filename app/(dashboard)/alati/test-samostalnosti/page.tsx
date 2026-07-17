'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

const PRIMARY = '#1B6B4A'

interface Kriterijum {
  id: string
  pitanje: string
  objasnjenje: string
}

const KRITERIJUMI: Kriterijum[] = [
  {
    id: 'radno-vreme',
    pitanje: 'Da li nalogodavac određuje vaše radno vreme, ili vaš odmor/odsustva zavise od njegove odluke?',
    objasnjenje: 'Npr. morate biti dostupni u tačno određenim satima, ili ne možete uzeti slobodan dan bez njegovog odobrenja.',
  },
  {
    id: 'prostor',
    pitanje: 'Da li pretežno radite u prostorijama koje obezbeđuje nalogodavac?',
    objasnjenje: 'Rad iz kancelarije/prostora nalogodavca, a ne od kuće ili iz sopstvenog prostora.',
  },
  {
    id: 'obuka',
    pitanje: 'Da li vas nalogodavac stručno osposobljava ili usavršava?',
    objasnjenje: 'Obuke, treninzi ili onboarding koje organizuje i finansira nalogodavac.',
  },
  {
    id: 'oglas-agencija',
    pitanje: 'Da li vas je nalogodavac angažovao preko oglasa za posao ili agencije za zapošljavanje?',
    objasnjenje: 'Kao da konkurišete za radno mesto, umesto da nudite uslugu kao nezavisan preduzetnik.',
  },
  {
    id: 'alat-oprema',
    pitanje: 'Da li vam nalogodavac obezbeđuje osnovni alat/opremu, ili rukovodi procesom vašeg rada?',
    objasnjenje: 'Npr. dobijate opremu, softver ili detaljna uputstva kako tačno da radite posao.',
  },
  {
    id: 'sedamdeset-posto',
    pitanje: 'Da li ste u poslednjih 12 meseci ostvarili 70% ili više ukupnog prihoda od jednog nalogodavca?',
    objasnjenje: 'Ovo je najčešći "okidač" kod frilensera sa jednim ili dva strana klijenta kao primarnim izvorom zarade.',
  },
  {
    id: 'poslovni-rizik',
    pitanje: 'Da li obavljate poslove iz delatnosti nalogodavca bez ikakvog poslovnog rizika za rezultat rada?',
    objasnjenje: 'Nemate mogućnost gubitka ili odgovornosti za kvalitet/rezultat — kao zaposleni, ne kao nezavisan izvođač.',
  },
  {
    id: 'zabrana-drugih',
    pitanje: 'Da li ugovor zabranjuje da radite za druge klijente (osim konkurenata nalogodavca)?',
    objasnjenje: 'Klauzula o ekskluzivnosti koja vas sprečava da imate druge nalogodavce.',
  },
  {
    id: '130-dana',
    pitanje: 'Da li za istog nalogodavca radite 130 ili više radnih dana u periodu od 12 meseci?',
    objasnjenje: 'To je otprilike više od pola radne godine posvećeno jednom nalogodavcu.',
  },
]

const PRAG = 5

export default function TestSamostalnostiPage() {
  const [odgovori, setOdgovori] = useState<Record<string, boolean>>({})

  const brojOdgovorenih = Object.keys(odgovori).length
  const brojIspunjenih = useMemo(
    () => Object.values(odgovori).filter(Boolean).length,
    [odgovori],
  )
  const sveOdgovoreno = brojOdgovorenih === KRITERIJUMI.length
  const rizicno = brojIspunjenih >= PRAG

  function odgovori_na(id: string, vrednost: boolean) {
    setOdgovori(prev => ({ ...prev, [id]: vrednost }))
  }

  function resetuj() {
    setOdgovori({})
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Test samostalnosti</h1>
        <p className="mt-1 text-sm text-gray-500">
          Proverite da li vaš odnos sa nalogodavcem (posebno stranim klijentom) nosi rizik da vas poreska uprava tretira
          kao nesamostalnog preduzetnika.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        {KRITERIJUMI.map((k, i) => (
          <div key={k.id} className={i > 0 ? 'border-t border-gray-100 pt-5' : ''}>
            <p className="text-sm font-medium text-gray-800">
              {i + 1}. {k.pitanje}
            </p>
            <p className="mt-1 text-xs text-gray-500">{k.objasnjenje}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => odgovori_na(k.id, true)}
                className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors"
                style={{
                  background: odgovori[k.id] === true ? PRIMARY : '#F3F4F6',
                  color: odgovori[k.id] === true ? '#fff' : '#374151',
                }}
              >
                Da
              </button>
              <button
                type="button"
                onClick={() => odgovori_na(k.id, false)}
                className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors"
                style={{
                  background: odgovori[k.id] === false ? PRIMARY : '#F3F4F6',
                  color: odgovori[k.id] === false ? '#fff' : '#374151',
                }}
              >
                Ne
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm text-gray-600 flex items-center justify-between">
        <span>Odgovoreno: {brojOdgovorenih}/{KRITERIJUMI.length}</span>
        {brojOdgovorenih > 0 && (
          <button onClick={resetuj} className="text-xs font-medium text-gray-400 hover:text-gray-600">
            Počni ispočetka
          </button>
        )}
      </div>

      {sveOdgovoreno && (
        <div
          className="rounded-2xl border p-6 space-y-3"
          style={{
            borderColor: rizicno ? '#FCA5A5' : '#86EFAC',
            background: rizicno ? '#FEF2F2' : '#F0FDF4',
          }}
        >
          <h2 className="text-lg font-bold" style={{ color: rizicno ? '#991B1B' : '#166534' }}>
            {brojIspunjenih}/9 kriterijuma ispunjeno — {rizicno ? 'rizik nesamostalnosti' : 'nizak rizik'}
          </h2>
          {rizicno ? (
            <p className="text-sm text-gray-700">
              Ispunjeno je 5 ili više od 9 zakonskih kriterijuma (čl. 85 Zakona o porezu na dohodak građana). Poreska
              uprava bi u ovom odnosu mogla da vas tretira kao nesamostalnog preduzetnika — prihod od ovog nalogodavca
              tada se ne oporezuje kao paušal, nego kao &bdquo;drugi prihodi&ldquo; po stopi od 20% na bruto iznos (bez
              normiranih troškova), uz dodatnu obavezu plaćanja PIO doprinosa. Ovo važi i kad je nalogodavac firma iz
              inostranstva — u tom slučaju vi sami prijavljujete i plaćate porez, jer strana firma nema obavezu obračuna
              po odbitku.
            </p>
          ) : (
            <p className="text-sm text-gray-700">
              Ispunjeno je manje od 5 od 9 zakonskih kriterijuma — odnos verovatno ne bi bio kvalifikovan kao nesamostalan.
              Test se sprovodi posebno za svakog nalogodavca, pa vredi proveriti odvojeno za svaki ugovorni odnos.
            </p>
          )}
          <p className="text-xs text-gray-500">
            Ovo je informativna procena, ne poreski ili pravni savet. Za konačnu ocenu i za smanjenje rizika (npr. dodavanje
            klauzule o poslovnom riziku, rad sa više klijenata, uklanjanje klauzule o ekskluzivnosti) konsultujte
            knjigovođu ili poreskog savetnika.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-950">
        <p className="font-medium">Imate ugovor sa stranim klijentom? →</p>
        <Link href="/alati/pregled-ugovora" className="mt-2 inline-flex font-semibold text-blue-700 hover:text-blue-900">
          Uploadujte ugovor za detaljnu AI analizu (Pregled ugovora)
        </Link>
      </div>
    </div>
  )
}
