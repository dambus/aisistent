import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

export const metadata: Metadata = {
  title: 'Ugovor o zakupu Srbija — generator ugovora o najmu | AIsistent',
  description: 'Generator ugovora o zakupu stana ili poslovnog prostora prilagođen srpskom pravu. PDF za 60 sekundi.',
  openGraph: {
    title: 'Ugovor o zakupu — generator za stanodavce i zakupce u Srbiji',
    description: 'Generator ugovora o zakupu stana ili poslovnog prostora prilagođen srpskom pravu. PDF za 60 sekundi.',
    url: 'https://aisistent.rs/ugovor-o-zakupu',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      previewSlug="ugovor-o-zakupu"
      h1="Ugovor o zakupu — generator za stanodavce i zakupce"
      intro="Generišite ugovor o zakupu stana ili poslovnog prostora prilagođen srpskom pravu. Visina zakupnine, depozit, otkazni rok, stanje prostora — sve na jednom mestu."
      slug="ugovor-o-zakupu"
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['ugovor-o-zakupu'].ctaLabel}
      ctaNote="Dokument u PDF ili Word formatu za manje od 60 sekundi"
      features={[
        { icon: '🏠', title: 'Stan ili poslovni prostor', text: 'Podržava zakup stambenog prostora i poslovnog prostora — prilagođene klauzule za svaki tip.' },
        { icon: '💰', title: 'Zakupnina i depozit', text: 'Visina zakupnine, rok plaćanja, depozit i uslovi povraćaja — jasno definisano.' },
        { icon: '📆', title: 'Trajanje i otkazni rok', text: 'Određeno ili neodređeno trajanje zakupa sa zakonskim otkaznim rokom.' },
        { icon: '🔧', title: 'Stanje i popravke', text: 'Opis stanja prostora pri predaji, odgovornost za popravke i troškove održavanja.' },
        { icon: '📊', title: 'Troškovi i komunalije', text: 'Ko plaća struju, vodu, internet, komunalne troškove — bez nesporazuma.' },
        { icon: '📋', title: 'Overavanje i registracija', text: 'Obaveza overavanja kod notara za zakup duži od godinu dana i prijava Poreskoj upravi.' },
      ]}
      whyAisistent={[
        'Prilagođen Zakonu o stanovanju i zakupu RS i svim izmenama',
        'Podržava zakup stana i poslovnog prostora — izaberete tip',
        'Obavezna klauzula o depozitu i uslovima povraćaja',
        'Napomena o poreskim obavezama zakupodavca (porez na prihode od zakupa)',
        'PDF i Word (DOCX) format spreman za potpisivanje i overavanje',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-saradnji', label: 'Ugovor o saradnji' },
        { href: '/punomocje', label: 'Punomoćje za zastupanje' },
        { href: '/opsti-uslovi', label: 'Opšti uslovi' },
        { href: '/nda', label: 'NDA sporazum' },
        { href: '/pregled-ugovora', label: 'Dobili ste ugovor? Proverite ga pre potpisa' },
      ]}
      faqs={[
        {
          q: 'Da li ugovor o zakupu mora biti overen kod notara?',
          a: 'Zakon o overavanju potpisa propisuje obaveznu overu kod javnog beležnika za ugovor o zakupu nepokretnosti koji se zaključuje na duže od jedne godine. Za zakup do godinu dana overa nije obavezna, ali je preporučljiva. Zakup poslovnog prostora koji se registruje u APR-u ili koristi kao osnov za upis u katastar mora biti u formi javnobeležničke isprave.',
        },
        {
          q: 'Koji porez plaća zakupodavac?',
          a: 'Zakupodavac (stanodavac) plaća porez na prihode od davanja u zakup po stopi od 20% na poresku osnovicu. Osnova se dobija oduzimanjem normiranog troška od 25% — dakle oporezuje se 75% prihoda. Porez se plaća kvartalno na osnovu prijave ili godišnjom prijavom. Prijava se podnosi lokalnoj Poreskoj upravi, a od 2023. i elektronski. Neplaćanje poreza nosi kazne i kamatnu stopu.',
        },
        {
          q: 'Koliki je zakonski otkazni rok za zakup?',
          a: 'Za zakup stana na neodređeno vreme, zakonski otkazni rok je 90 dana. Za zakup poslovnog prostora na neodređeno vreme, otkazni rok je 12 meseci osim ako ugovorom nije drugačije predviđeno. Za zakup na određeno vreme, ugovor prestaje istekom roka bez otkaznog roka, osim ako zakupac nastavi da koristi prostor i zakupodavac to ne ospori — tada se smatra da je produžen na neodređeno.',
        },
        {
          q: 'Šta se dešava sa depozitom?',
          a: 'Depozit (kaucija) se vraća zakupcu po isteku zakupa ako je prostor u ispravnom stanju i sve obaveze izmirene. Zakupodavac može zadržati deo ili ceo depozit za neplaćenu zakupninu, troškove popravki nastalih krivicom zakupca, ili neizmirene komunalne troškove. Preporučuje se definisati u ugovoru rok za vraćanje depozita (npr. 15 dana od predaje ključeva) i dokumentovati stanje prostora zapisnikom pri predaji.',
        },
      ]}
    />
  )
}
