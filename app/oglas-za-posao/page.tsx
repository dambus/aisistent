import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Oglas za posao — generator oglasa za zapošljavanje | AIsistent',
  description: 'Generator oglasa za posao prilagođen srpskom tržištu rada. Profesionalan oglas za 60 sekundi.',
  openGraph: {
    title: 'Oglas za posao — generator za HR menadžere i preduzetnike',
    description: 'Generator oglasa za posao prilagođen srpskom tržištu rada. Profesionalan oglas za 60 sekundi.',
    url: 'https://aisistent.rs/oglas-za-posao',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Oglas za posao — generator za HR menadžere i preduzetnike"
      intro="Generišite profesionalan oglas za posao prilagođen srpskom tržištu rada. Format za Infostud, LinkedIn i vaš sajt — AI piše oglas koji privlači prave kandidate."
      ctaHref="/register"
      ctaLabel="Napišite oglas besplatno"
      ctaNote="Profesionalan oglas za manje od 60 sekundi"
      features={[
        { icon: '🏢', title: 'Uvod o firmi', text: 'Kratak, privlačan uvod o firmi koji motiviše kandidate da se prijave.' },
        { icon: '📋', title: 'Opis posla i zadaci', text: 'Konkretni zadaci i odgovornosti — ne generički opisi koji nikoga ne privlače.' },
        { icon: '🎯', title: 'Uslovi i prednosti', text: 'Jasni zahtevi (sprema, iskustvo, veštine) i šta firma nudi — plata, benefiti.' },
        { icon: '⚖️', title: 'Bez diskriminacije', text: 'AI automatski izbegava diskriminatorne uslove (godine, pol, porodični status).' },
        { icon: '📱', title: 'Višeplatformski', text: 'Format prilagođen za Infostud, LinkedIn i sajt firme u jednom tekstu.' },
        { icon: '⚡', title: 'Za 60 sekundi', text: 'Unesite poziciju i ključne zahteve — oglas je gotov za manje od minute.' },
      ]}
      whyAisistent={[
        'Prilagođen srpskom tržištu rada i očekivanjima lokalnih kandidata',
        'AI piše oglas koji zvuči ljudski — ne kao robotski spisak zahteva',
        'Automatski izbegava diskriminatorne formulacije',
        'Format direktno upotrebljiv za Infostud, LinkedIn i sajt firme',
        'Arhiva oglasa za ponovnu upotrebu pri sledećem zapošljavanju',
        'Besplatno za početak',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
        { href: '/ponuda-klijentu', label: 'Ponuda klijentu' },
        { href: '/poslovni-mejl', label: 'Poslovni mejl' },
        { href: '/blog/ugovor-o-delu-vs-ugovor-o-radu', label: 'Članak: ugovor o radu vs. o delu' },
      ]}
      faqs={[
        {
          q: 'Šta mora da sadrži oglas za posao u Srbiji?',
          a: 'Zakon o radu i Zakon o zabrani diskriminacije ne propisuju tačnu formu oglasa, ali dobar oglas treba da sadrži: naziv firme i delatnosti, naziv pozicije, opis posla i zadataka, uslove (sprema, iskustvo, veštine), šta firma nudi, rok za prijavu i način prijavljivanja. Oglas ne sme sadržati diskriminatorne uslove vezane za pol, godine, bračni status, veroispovest, etničku pripadnost i slično.',
        },
        {
          q: 'Kako napisati oglas za posao koji privlači kandidate?',
          a: 'Ključ je konkretnost umesto opštosti. Umesto "tražimo komunikativnu osobu" — napišite šta konkretno znači: "kontaktiraćete 10-15 klijenata nedeljno i voditi evidenciju u CRM sistemu". Naglasite šta firma nudi pre nego šta traži — kandidati donose odluku na osnovu toga šta dobijaju. Kratki uvod o firmi koji zvuči autentično privlači bolje od opštih pohvala.',
        },
        {
          q: 'Da li oglas za posao mora pominjati platu?',
          a: 'U Srbiji nije zakonski obavezno navesti iznos plate u oglasu. U praksi, oglasi sa navedenom platom privlače više i kvalifikovanijih prijava, jer kandidati ne gube vreme na neadekvatne pozicije. Ako ne navedete iznos, bar naznačite opseg ("prema dogovoru" je manje privlačno od "800-1000 EUR neto").',
        },
        {
          q: 'Može li oglas biti objavljen samo na internetu?',
          a: 'Da, zakon ne propisuje obavezan medij objave oglasa za privatne poslodavce. Infostud, LinkedIn, vaš sajt ili društvene mreže su potpuno legitimni kanali. Neke firme imaju interni pravilnik koji propisuje javnu objavu. Ako zapošljavate za određena regulisana zanimanja (npr. javni sektor, bezbednost, zdravstvo), mogu se primenjivati posebna pravila.',
        },
      ]}
    />
  )
}
