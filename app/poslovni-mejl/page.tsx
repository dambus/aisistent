import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Poslovni mejl — AI generator profesionalnih mejlova | AIsistent',
  description: 'Generator profesionalnih poslovnih mejlova na srpskom. Ponude, opomene, zahvalnice — za 30 sekundi.',
  openGraph: {
    title: 'Poslovni mejl — AI generator za B2B komunikaciju',
    description: 'Generator profesionalnih poslovnih mejlova na srpskom. Ponude, opomene, zahvalnice — za 30 sekundi.',
    url: 'https://aisistent.rs/poslovni-mejl',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Poslovni mejl — AI generator za B2B komunikaciju"
      intro="Generišite profesionalan poslovni mejl za 30 sekundi. Ponude, opomene, zahvalnice, odbijanja — AI prilagođava ton i sadržaj vašoj situaciji."
      ctaHref="/register"
      ctaLabel="Napišite mejl besplatno"
      ctaNote="Gotov tekst za manje od 30 sekundi"
      features={[
        { icon: '💼', title: '10 tipova mejlova', text: 'Ponuda, opomena za dugovanje, zahvalnica, odbijanje, uvodni mejl, zahtev za produženje roka i više.' },
        { icon: '🎯', title: 'Prilagođen ton', text: 'Formalan, profesionalan ili topao — AI prilagođava ton tipu mejla i situaciji.' },
        { icon: '✍️', title: 'Ispravna deklinacija', text: 'Ime primaoca ispravno deklinisano u srpskom jeziku — bez gramatičkih grešaka.' },
        { icon: '⚡', title: 'Za 30 sekundi', text: 'Unesite kontekst, AI piše mejl. Kratak, jasan, bez korporativnog žargona.' },
        { icon: '📋', title: 'Spreman za slanje', text: 'Tekst koji možete direktno kopirati u vaš email klijent.' },
        { icon: '🔄', title: 'Bez ograničenja', text: 'Neograničen broj mejlova na Pro planu — za svakodnevnu komunikaciju.' },
      ]}
      whyAisistent={[
        'Prilagođen srpskoj B2B poslovnoj komunikaciji — ne generički engleski template',
        'AI razume kontekst: ko šalje, ko prima, šta je situacija',
        'Ispravna srpska gramatika i deklinacija — bez neugodnih grešaka',
        'Kratak i jasan tekst — vaš primalac će zaista pročitati',
        'Čuva se u arhivi za kasniju upotrebu kao šablon',
      ]}
      relatedLinks={[
        { href: '/ponuda-klijentu', label: 'Ponuda klijentu' },
        { href: '/oglas-za-posao', label: 'Oglas za posao' },
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
      ]}
      faqs={[
        {
          q: 'Kako napisati profesionalan poslovni mejl na srpskom?',
          a: 'Dobar poslovni mejl ima jasnu strukturu: pozdrav sa imenom primaoca (ispravno deklinovanim), jednu rečenicu svrhe, konkretan sadržaj bez uvijanja, jasnu akciju ili zahtev, i profesionalan potpis. Izbegavajte preopširan uvod i korporativni žargon — direktan ton se poštuje u srpskom B2B okruženju. AIsistent generiše mejl prema ovim principima na osnovu konteksta koji unesete.',
        },
        {
          q: 'Koji ton koristiti u poslovnom mejlu?',
          a: 'Ton zavisi od situacije i odnosa sa primaocem. Za prvog kontakta i formalne situacije — formalan ton. Za etablirane poslovne odnose — profesionalan ali topliji. Za opomene i žalbe — smiren i direktan, bez agresivnosti. AIsistent automatski prilagođava ton prema tipu mejla koji izaberete.',
        },
        {
          q: 'Kako napisati opomenu za dugovanje mejlom?',
          a: 'Opomena za dugovanje mejlom treba da bude: jasna (navesti tačan iznos i dospeće), bez emocija, sa konkretnim rokom za plaćanje i pozivom na kontakt ako postoji nesporazum. Pravno, pisana opomena je preporučljiva pre pokretanja bilo kakvog postupka. Za veće iznose uz mejl pošaljite i preporučenu poštu kao dokaz dostave.',
        },
        {
          q: 'Šta je razlika između formalnog i polufrmalnog mejla?',
          a: 'Formalan mejl koristi "Vi" obraćanje, puno ime primaoca, strukturirane rečenice i formalan pozdrav ("S poštovanjem"). Polufomalan mejl koristi "Vi" ali u toplijem tonu, može koristiti samo ime primaoca, i završava se prijateljem ("Srdačan pozdrav", "Puno uspeha"). Neformalan mejl (sa kolegama koje dobro poznajete) koristi "ti" i oslonjen je na kontekst odnosa.',
        },
      ]}
    />
  )
}
