import type { Metadata } from 'next'
<<<<<<< HEAD
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ugovor o radu — obrazac i generator | AIsistent',
  description:
    'Besplatan generator ugovora o radu usklađen sa Zakonom o radu RS. Popunite formu, preuzmite PDF za 60 sekundi.',
  keywords: [
    'ugovor o radu',
    'obrazac ugovor o radu',
    'generator ugovora',
    'ugovor o radu srbija',
    'zakon o radu',
    'radni ugovor pdf',
  ],
  openGraph: {
    title: 'Ugovor o radu — obrazac i generator | AIsistent',
    description:
      'Besplatan generator ugovora o radu usklađen sa Zakonom o radu RS. PDF za 60 sekundi.',
    url: 'https://aisistent.rs/ugovor-o-radu',
    siteName: 'AIsistent',
    locale: 'sr_RS',
    type: 'website',
  },
}

const faq = [
  {
    q: 'Šta mora da sadrži ugovor o radu po srpskom pravu?',
    a: 'Zakon o radu RS propisuje obavezne elemente: naziv i sedište poslodavca, ime i adresu zaposlenog, vrstu i opis poslova, mesto rada, datum početka rada, trajanje radnog odnosa, radno vreme, zaradu i način isplate, godišnji odmor i otkazni rok. AIsistent automatski generiše sve obavezne elemente na osnovu vaših unosa.',
  },
  {
    q: 'Da li AI ugovor o radu važi pravno?',
    a: 'Da — sadržaj ugovora određuju strane, a ne ko ga je napisao. AIsistent generiše tekst koji je usklađen sa Zakonom o radu RS. Preporučujemo da pre potpisivanja dokument pregleda pravnik ako imate specifičnu situaciju (probni rad, zabrana konkurencije, posebna naknada).',
  },
  {
    q: 'Koliko košta izrada ugovora o radu?',
    a: 'Kreiranje jednog ugovora na AIsistenu je besplatno. Plaćeni planovi (od 1.080 RSD/mes.) daju neograničen broj dokumenata, PDF bez watermark-a i Word format — jeftinije od jednog sata rada pravnika.',
  },
  {
    q: 'Mogu li da koristim ovaj ugovor za paušalce?',
    a: 'Ugovor o radu je za zapošljavanje u radnom odnosu. Za angažovanje paušalca kao samostalnog preduzetnika koristite Ugovor o delu ili Ugovor o poslovnoj saradnji — oba su dostupna na AIsistenu.',
  },
]

const sadrzaj = [
  'Podaci o poslodavcu i zaposlenom',
  'Vrsta i opis radnog mesta',
  'Zarada (bruto), naknade i isplata',
  'Radno vreme i godišnji odmor',
  'Probni rad i otkazni rok',
  'Opcionalno: zabrana konkurencije i čuvanje poslovne tajne',
]

const prednosti = [
  { icon: '⚡', title: 'Za 60 sekundi', text: 'Popunite formu, dokument je spreman odmah — bez čekanja na pravnika.' },
  { icon: '⚖️', title: 'Srpsko pravo', text: 'Usklađen sa Zakonom o radu RS i aktuelnom praksom za 2026.' },
  { icon: '💾', title: 'PDF i Word', text: 'Preuzmite u PDF ili DOCX formatu, pošaljite emailom direktno iz aplikacije.' },
]

const ostaliAlati = [
  { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
  { href: '/nda', label: 'NDA sporazum' },
  { href: '/ugovor-o-zakupu', label: 'Ugovor o zakupu' },
  { href: '/oglas-za-posao', label: 'Oglas za posao' },
]

const PRIMARY = '#1B6B4A'

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
}

export default function UgovorORaduPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      <div className="min-h-screen bg-white">
        {/* Nav */}
        <nav className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold" style={{ color: PRIMARY }}>
              AIsistent
            </Link>
            <Link
              href="/register"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: PRIMARY }}
            >
              Besplatno počnite
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-4xl px-4 py-12">
          {/* Hero */}
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold" style={{ color: PRIMARY }}>
              Ugovori i dokumenti
            </span>
            <h1 className="mb-4 text-4xl font-bold text-gray-900 leading-tight">
              Ugovor o radu —<br className="hidden sm:block" /> generator za srpske poslodavce
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 leading-relaxed">
              Kreirajte pravno ispravan ugovor o radu za manje od 60 sekundi. Vodimo vas
              korak po korak kroz sve obavezne elemente propisane Zakonom o radu RS —
              bez advokata, bez template-a u Wordu, bez grešaka.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-xl px-8 py-4 text-base font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105"
              style={{ backgroundColor: PRIMARY }}
            >
              Napravi ugovor o radu besplatno →
            </Link>
            <p className="mt-3 text-sm text-gray-400">Bez kreditne kartice. Besplatno za 1 dokument.</p>
          </div>

          {/* Šta sadrži */}
          <section className="mb-12 rounded-2xl border border-gray-100 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Šta sadrži ovaj ugovor</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {sadrzaj.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold" style={{ backgroundColor: PRIMARY }}>✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Zašto AIsistent */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Zašto AIsistent, a ne pravnik ili Word template?</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {prednosti.map(p => (
                <div key={p.title} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-3 text-3xl">{p.icon}</div>
                  <h3 className="mb-2 font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-12 rounded-2xl p-10 text-center text-white" style={{ backgroundColor: PRIMARY }}>
            <h2 className="mb-3 text-2xl font-bold">Spreman za potpisivanje za 60 sekundi</h2>
            <p className="mb-6 text-green-100">Popunite formu, preuzmite PDF. Besplatno za prvi dokument.</p>
            <Link
              href="/register"
              className="inline-block rounded-xl bg-white px-8 py-4 font-bold transition-all hover:bg-green-50"
              style={{ color: PRIMARY }}
            >
              Napravi ugovor o radu besplatno →
            </Link>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Česta pitanja</h2>
            <div className="space-y-4">
              {faq.map(({ q, a }) => (
                <div key={q} className="rounded-xl border border-gray-100 bg-white p-6">
                  <h3 className="mb-2 font-semibold text-gray-900">{q}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Ostali alati */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-gray-700">Ostali alati koje možda trebate</h2>
            <div className="flex flex-wrap gap-3">
              {ostaliAlati.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-green-300 hover:text-green-700"
                >
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
          <Link href="/" className="font-semibold hover:text-gray-600" style={{ color: PRIMARY }}>AIsistent.rs</Link>
          {' '}— Generator poslovnih dokumenata za srpsko tržište
        </footer>
      </div>
    </>
=======
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Ugovor o radu Srbija — generator ugovora o radu | AIsistent',
  description: 'Generator ugovora o radu u skladu sa Zakonom o radu RS. Popunite wizard i dobijte PDF za 60 sekundi.',
  openGraph: {
    title: 'Ugovor o radu — generator za poslodavce u Srbiji',
    description: 'Generator ugovora o radu u skladu sa Zakonom o radu RS. Popunite wizard i dobijte PDF za 60 sekundi.',
    url: 'https://aisistent.rs/ugovor-o-radu',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Ugovor o radu — generator za poslodavce u Srbiji"
      intro="Generišite ugovor o radu u skladu sa Zakonom o radu Republike Srbije. Svi obavezni elementi, ispravne klauzule, srpska terminologija — PDF ili Word za 60 sekundi."
      ctaHref="/register"
      ctaLabel="Generišite ugovor besplatno"
      ctaNote="Dokument u PDF ili Word formatu za manje od 60 sekundi"
      features={[
        { icon: '📋', title: 'Svi obavezni elementi', text: 'Naziv i opis posla, radno vreme, zarada, mesto rada — svi elementi propisani čl. 33. Zakona o radu.' },
        { icon: '💰', title: 'Zarada i dodaci', text: 'Osnovna zarada, minuli rad, topli obrok — ispravno definisani u skladu sa propisima.' },
        { icon: '⏰', title: 'Radno vreme i odmor', text: 'Puno, nepuno ili skraćeno radno vreme. Godišnji odmor, plaćeno i neplaćeno odsustvo.' },
        { icon: '🔒', title: 'Zabrana konkurencije', text: 'Opcionalna klauzula o zabrani konkurencije uz obaveznu naknadu — čl. 161. Zakona o radu.' },
        { icon: '📅', title: 'Probni rad', text: 'Probni rad do 6 meseci sa eksplicitnom odredbom i posledicama neuspešnog probnog rada.' },
        { icon: '⚖️', title: 'Zaštita podataka', text: 'ZZPL klauzula o zaštiti ličnih podataka zaposlenog — obavezna od 2023. godine.' },
      ]}
      whyAisistent={[
        'Usklađen sa Zakonom o radu RS i svim izmenama do 2026. godine',
        'AI proverava konzistentnost podataka — adresa, zarada, radno vreme',
        'Slovni zapis iznosa za zakonsku valjanost',
        'Ispravna klauzula o zabrani konkurencije uz naknadu (čl. 161 st. 2)',
        'PDF i Word (DOCX) format spreman za potpisivanje i arhiviranje',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
        { href: '/kalkulator-zarade', label: 'Kalkulator zarade' },
        { href: '/oglas-za-posao', label: 'Oglas za posao' },
        { href: '/blog/ugovor-o-delu-vs-ugovor-o-radu', label: 'Članak: ugovor o radu vs. o delu' },
      ]}
      faqs={[
        {
          q: 'Šta mora da sadrži ugovor o radu po srpskom zakonu?',
          a: 'Prema čl. 33. Zakona o radu, ugovor o radu mora da sadrži: naziv i sedište poslodavca, lične podatke zaposlenog, naziv posla i opis radnih zadataka, mesto rada, vrstu i stepen stručne spreme, trajanje radnog odnosa (određeno/neodređeno), dan početka rada, radno vreme, iznos i strukturu zarade, rokove isplate zarade, odredbe o godišnjem odmoru i plaćenim odsustvima, i trajanje otkaznog roka.',
        },
        {
          q: 'Može li se ugovor o radu zaključiti na određeno vreme?',
          a: 'Da, ali uz stroga ograničenja. Ugovor na određeno vreme može se zaključiti za rad čiji je prestanak unapred određen — sezonski posao, projekat, zamena odsutnog zaposlenog. Ukupno trajanje ugovora na određeno vreme sa istim poslodavcem ne može biti duže od 24 meseca. Po isteku, ako zaposleni nastavi da radi, smatra se da je zasnovan radni odnos na neodređeno vreme.',
        },
        {
          q: 'Da li ugovor o radu mora biti overen kod notara?',
          a: 'Ne — ugovor o radu ne mora biti overen kod javnog beležnika. Dovoljni su potpisi ugovornih strana. Poslodavac je obavezan da zaposlenom uruči primerak ugovora pre stupanja na posao, a da drugi primerak zadrži za sebe. Prijava na PIO i zdravstveno osiguranje (M obrazac) se podnosi odvojeno.',
        },
        {
          q: 'Koji je minimalni otkazni rok po Zakonu o radu?',
          a: 'Minimalni otkazni rok zavisi od razloga otkaza i dužine radnog staža kod poslodavca. Za otkaz od strane poslodavca iz poslovnih razloga ili razloga nesposobnosti: 8 do 30 dana u zavisnosti od staža. Za otkaz od strane zaposlenog: 15 dana za radni staž do 1 godine, do 30 dana za duži staž. Ugovorom se može predvideti duži, ali ne kraći otkazni rok od zakonskog minimuma.',
        },
      ]}
    />
>>>>>>> a0bb098d1100e6b301aebbb43a37073f9b18f1dd
  )
}
