import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

export const metadata: Metadata = {
  title: 'Ponuda klijentu — generator poslovnih ponuda | AIsistent',
  description: 'Generator profesionalnih ponuda klijentima. Prilagođena B2B ponuda sa cenama i uslovima — PDF za 60 sekundi.',
  openGraph: {
    title: 'Ponuda klijentu — generator za preduzetnike i agencije',
    description: 'Generator profesionalnih ponuda klijentima. Prilagođena B2B ponuda sa cenama i uslovima — PDF za 60 sekundi.',
    url: 'https://aisistent.rs/ponuda-klijentu',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Ponuda klijentu — generator za preduzetnike i agencije"
      heroFlightLabel="Ponuda"
      intro="Generišite strukturiranu poslovnu ponudu sa svim elementima koje B2B klijent očekuje. Cena, rok isporuke, uslovi plaćanja, validnost — sve na jednom mestu."
      slug="ponuda-klijentu"
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['ponuda-klijentu'].ctaLabel}
      ctaNote="Kompletna ponuda u PDF formatu za manje od 60 sekundi"
      features={[
        { icon: '🏢', title: 'Podaci o obe strane', text: 'Ponuđač i klijent jasno identifikovani sa svim poslovnim podacima.' },
        { icon: '📋', title: 'Opis usluge', text: 'Detaljan opis šta je uključeno i šta nije — zaštita od nesporazuma.' },
        { icon: '💰', title: 'Cena i PDV', text: 'Iznos bez PDV-a, PDV tretman i ukupno — jasno i pregledno.' },
        { icon: '📅', title: 'Rok i validnost', text: 'Rok isporuke i validnost ponude — koliko dugo stoji vaša cena.' },
        { icon: '💳', title: 'Uslovi plaćanja', text: 'Avansno, 15/30/45 dana, prema dogovoru — prilagođeno svakom klijentu.' },
        { icon: '📄', title: 'PDF spreman za slanje', text: 'Profesionalan PDF koji možete odmah poslati klijentu emailom.' },
      ]}
      whyAisistent={[
        'Prilagođena srpskoj B2B praksi i zakonskim zahtevima',
        'Automatska primena ispravnog PDV tretmana prema vašem statusu',
        'Profesionalan izgled koji gradi poverenje kod klijenata',
        'Arhiva svih ponuda za praćenje i ponovnu upotrebu',
        'PDF i Word format za dalju prilagodbu',
        'Besplatno za početak',
      ]}
      relatedLinks={[
        { href: '/poslovni-mejl', label: 'Poslovni mejl' },
        { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
        { href: '/ugovor-o-saradnji', label: 'Ugovor o saradnji' },
        { href: '/nda', label: 'NDA pre prezentacije' },
      ]}
      faqs={[
        {
          q: 'Šta mora da sadrži ponuda klijentu?',
          a: 'Dobra poslovna ponuda treba da sadrži: broj i datum ponude, podatke o ponuđaču i klijentu, precizno definisan predmet (šta je uključeno, šta nije), cenu bez PDV-a i sa PDV-om (ili napomenu o PDV statusu), rok isporuke ili realizacije, uslove plaćanja i rok, validnost ponude i kontakt za prihvatanje. Što je ponuda preciznija, manje su šanse za naknadne nesporazume.',
        },
        {
          q: 'Koliko dugo ponuda važi kao obavezujuća?',
          a: 'To definiše sama ponuda. Ako ste naveli rok validnosti (npr. "ponuda važi 15 dana"), tokom tog perioda ste obavezani cenom i uslovima ako klijent prihvati. Ako rok nije naveden, primenjuju se opšta pravila obligacionog prava o "razumnom roku". Preporučuje se uvek navesti rok validnosti, posebno ako su cene podložne tržišnim promenama.',
        },
        {
          q: 'Koja je razlika između ponude i predračuna?',
          a: 'Suštinski razlike nema — oba dokumenta opisuju šta nudite i po kojoj ceni, pre zaključivanja posla. "Predračun" je termin koji se češće koristi u računovodstvenom i PDV kontekstu (prethodi fakturi), dok je "ponuda" ili "oferta" termin koji se koristi u poslovnoj komunikaciji i ima jači obligacionopravni kontekst o obaveznosti. Naziv zavisi od vaše prakse i onoga što klijent traži.',
        },
        {
          q: 'Da li ponuda mora biti potpisana?',
          a: 'Ponuda ne mora biti potpisana da bi bila važeća — dovoljna je i emailom dostavljena pisana ponuda. Potpis (ili email potvrda prihvatanja) od strane klijenta čini je prihvaćenom ponudom koja postaje osnova za ugovor. Za veće poslove preporučuje se i formalni ugovor pored ponude, jer ponuda često ne pokriva sve aspekte saradnje.',
        },
      ]}
    />
  )
}
