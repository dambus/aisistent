import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

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
      previewSlug="ugovor-o-radu"
      h1="Ugovor o radu — generator za poslodavce u Srbiji"
      intro="Generišite ugovor o radu u skladu sa Zakonom o radu Republike Srbije. Svi obavezni elementi, ispravne klauzule, srpska terminologija — PDF ili Word za 60 sekundi."
      slug="ugovor-o-radu"
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['ugovor-o-radu'].ctaLabel}
      ctaNote="Dokument u PDF ili Word formatu za manje od 60 sekundi"
      features={[
        { icon: '📋', title: 'Svi obavezni elementi', text: 'Naziv i opis posla, radno vreme, zarada, mesto rada — svi elementi propisani čl. 33. Zakona o radu.' },
        { icon: '💰', title: 'Zarada i dodaci', text: 'Osnovna zarada, minuli rad, topli obrok — ispravno definisani u skladu sa propisima.' },
        { icon: '⏰', title: 'Radno vreme i odmor', text: 'Puno, nepuno ili skraćeno radno vreme. Godišnji odmor, plaćeno i neplaćeno odsustvo.' },
        { icon: '🔒', title: 'Zabrana konkurencije', text: 'Opcionalna klauzula o zabrani konkurencije uz obaveznu naknadu — čl. 161. Zakona o radu.' },
        { icon: '📆', title: 'Probni rad', text: 'Probni rad do 6 meseci sa eksplicitnom odredbom i posledicama neuspešnog probnog rada.' },
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
        { href: '/pregled-ugovora', label: 'Dobili ste ugovor? Proverite ga pre potpisa' },
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
  )
}
