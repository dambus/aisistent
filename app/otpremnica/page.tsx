import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Otpremnica — generator otpremnica za isporuku robe | AIsistent',
  description: 'Generator otpremnica za srpske firme. Stavke, količine, izdavalac i primalac — PDF ili Word za 60 sekundi.',
  openGraph: {
    title: 'Otpremnica — generator za isporuku robe',
    description: 'Generator otpremnica za srpske firme. Stavke, količine, izdavalac i primalac — PDF ili Word za 60 sekundi.',
    url: 'https://aisistent.rs/otpremnica',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Otpremnica — generator za isporuku robe"
      intro="Napravite otpremnicu sa svim potrebnim podacima — izdavalac, primalac, stavke i količine. Dokument spreman za štampu i potpis za 60 sekundi."
      ctaHref="/register"
      ctaLabel="Napravite otpremnicu besplatno"
      ctaNote="Kompletna otpremnica u PDF ili Word formatu za manje od 60 sekundi"
      ctaTitle="Napravite otpremnicu za 60 sekundi"
      heroImage="/images/hero/ugovori.jpg"
      features={[
        { icon: '🏢', title: 'Isporučilac i primalac', text: 'Puni podaci obe strane — naziv, PIB, adresa, tekući račun — jasno razdvojeni na dokumentu.' },
        { icon: '📦', title: 'Stavke i količine', text: 'Neograničen broj stavki robe koja se isporučuje, sa jedinicom mere i količinom po stavci.' },
        { icon: '🚚', title: 'Način isporuke', text: 'Lično preuzimanje, kurirska služba ili sopstveni prevoz — naznačeno na dokumentu.' },
        { icon: '📅', title: 'Datum izdavanja i isporuke', text: 'Odvojeni datumi kada se otpremnica izdaje i kada se roba fizički isporučuje.' },
        { icon: '📝', title: 'Napomena', text: 'Opciono polje za dodatne napomene — stanje robe, uslovi prijema i slično.' },
        { icon: '📄', title: 'PDF i Word format', text: 'Dokument spreman za štampu, potpis i arhiviranje odmah po preuzimanju.' },
      ]}
      whyAisistent={[
        'Format usklađen sa srpskom poslovnom praksom za dokumenta o isporuci robe',
        'Brže od popunjavanja gotovog obrasca ili pisanja od nule u Wordu',
        'Svi obavezni podaci na jednom mestu — bez propuštenih polja',
        'Arhiva svih otpremnica na jednom mestu za kasniju proveru',
        'PDF i Word (DOCX) format spreman za štampu i potpisivanje',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/ponuda-za-radove', label: 'Ponuda za radove' },
        { href: '/ponuda-klijentu', label: 'Ponuda klijentu' },
        { href: '/poslovni-mejl', label: 'Poslovni mejl' },
        { href: '/obrasci', label: 'Biblioteka zvaničnih obrazaca' },
      ]}
      faqs={[
        {
          q: 'Šta mora da sadrži otpremnica?',
          a: 'Otpremnica treba da sadrži: broj i datum izdavanja, podatke o isporučiocu i primaocu (naziv, PIB, adresa), spisak stavki robe koja se isporučuje sa količinama i jedinicama mere, način isporuke i, po potrebi, napomenu o stanju robe pri preuzimanju. Za razliku od fakture, otpremnica ne mora da sadrži cene — fokus je na količini i identifikaciji robe.',
        },
        {
          q: 'Da li otpremnica mora imati cene stavki?',
          a: 'Ne — otpremnica je prevashodno dokument o kretanju robe (šta se isporučuje i u kojoj količini), ne finansijski dokument. Cene se obično iskazuju na fakturi koja prati ili sledi otpremnicu. Neke firme ipak dodaju orijentacione cene na otpremnicu radi lakšeg poređenja sa fakturom — to nije zakonska obaveza.',
        },
        {
          q: 'Da li se otpremnica razlikuje od fakture?',
          a: 'Da. Faktura je finansijski/poreski dokument koji dokazuje promet i obavezu plaćanja, sa PDV obračunom. Otpremnica prati fizičku isporuku robe i služi kao dokaz da je roba predata u određenoj količini na određeni datum. Često se koriste zajedno — otpremnica prati robu, faktura se ispostavlja za plaćanje.',
        },
        {
          q: 'Ko potpisuje otpremnicu?',
          a: 'Otpremnicu obično potpisuju predstavnik isporučioca (koji predaje robu) i predstavnik primaoca (koji robu preuzima i potvrđuje prijem). Potpis primaoca je važan jer služi kao dokaz da je roba stigla u navedenoj količini i stanju.',
        },
      ]}
    />
  )
}
