import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Opšti uslovi korišćenja — generator za srpske sajtove | AIsistent',
  description: 'Generator opštih uslova korišćenja i politike privatnosti za srpske veb sajtove. GDPR i ZZPL usklađenost.',
  openGraph: {
    title: 'Opšti uslovi korišćenja — generator za srpske veb sajtove',
    description: 'Generator opštih uslova korišćenja i politike privatnosti za srpske veb sajtove. GDPR i ZZPL usklađenost.',
    url: 'https://aisistent.rs/opsti-uslovi',
  },
}

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <ToolLandingPage
      isLoggedIn={!!user}
      h1="Opšti uslovi korišćenja — generator za srpske veb sajtove"
      intro="Generišite opšte uslove korišćenja i politiku privatnosti usklađene sa ZZPL-om i GDPR-om. Prilagođeno vašem tipu biznisa — e-commerce, SaaS, uslužna delatnost."
      ctaHref={user ? '/dokumenti/opsti-uslovi' : '/register'}
      ctaLabel="Generišite uslove besplatno"
      ctaNote="Oba dokumenta zajedno — za manje od 2 minuta"
      features={[
        { icon: '🏢', title: 'Podaci o pružaocu', text: 'Ko ste vi, šta nudite, kontakt podaci — sve što zakon zahteva.' },
        { icon: '👤', title: 'Prava korisnika', text: 'Prava i obaveze korisnika, zabranjena ponašanja, uslovi ukidanja naloga.' },
        { icon: '🔒', title: 'Politika privatnosti', text: 'Koje podatke prikupljate, zašto, kako, i koja prava ima korisnik.' },
        { icon: '🍪', title: 'Cookies i analitika', text: 'Odredbe o kolačićima i analitičkim alatima po GDPR standardu.' },
        { icon: '⚖️', title: 'Ograničenje odgovornosti', text: 'Zakonski ispravne odredbe o ograničenju vaše odgovornosti.' },
        { icon: '📋', title: 'Merodavno pravo', text: 'Srpsko pravo i nadležnost srpskog suda — za srpske sajtove.' },
      ]}
      whyAisistent={[
        'Usklađeno sa Zakonom o zaštiti podataka o ličnosti (ZZPL, Sl. glasnik RS br. 87/2018)',
        'Kompatibilno sa GDPR-om EU za sajtove koji imaju evropske korisnike',
        'Prilagođeno tipu biznisa: e-commerce, SaaS, usluge, blog',
        'Oba dokumenta generišu se u jednom wizard-u',
        'Na srpskom jeziku — čitljivo za domaće korisnike i regulatora',
        'PDF i Word format spreman za objavljivanje',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
        { href: '/nda', label: 'NDA sporazum' },
        { href: '/blog/opsti-uslovi-koriscenja-srbija', label: 'Članak: Zašto su opšti uslovi obavezni' },
      ]}
      faqs={[
        {
          q: 'Da li svaki veb sajt mora imati opšte uslove?',
          a: 'Zakonski gledano, svaki veb sajt koji prikuplja podatke korisnika ili prodaje proizvode i usluge mora imati jasno objavljenu politiku privatnosti. Opšti uslovi korišćenja nisu uvek zakonski obavezni, ali su obavezni za e-commerce (Zakon o elektronskoj trgovini) i preporučeni za svaki sajt koji korisnici "koriste" na bilo koji način. Bez njih nemate pravnu zaštitu u sporovima sa korisnicima.',
        },
        {
          q: 'Šta je razlika između opštih uslova i politike privatnosti?',
          a: 'Opšti uslovi regulišu poslovni odnos između vas i korisnika — šta nudite, šta korisnik sme i ne sme da radi, kako rešavate sporove. Politika privatnosti reguliše obradu ličnih podataka — koje podatke prikupljate, zašto, kako dugo ih čuvate i koja su prava korisnika. Oba dokumenta su obavezna za sajtove koji obrađuju lične podatke.',
        },
        {
          q: 'Šta se dešava ako sajt nema politiku privatnosti?',
          a: 'Poverenik za informacije od javnog značaja i zaštitu podataka o ličnosti može izreći kaznu do 2 miliona RSD za pravna lica. Osim kazne, korisnici mogu tražiti naknadu štete. Za sajtove koji imaju korisnike iz EU važe i GDPR kazne koje idu do 20 miliona EUR ili 4% godišnjeg prometa. Pored finansijskog rizika, nedostatak politike privatnosti narušava poverenje korisnika.',
        },
        {
          q: 'Koliko često treba ažurirati opšte uslove?',
          a: 'Preporučuje se revizija jednom godišnje i uvek kada se promeni: vrsta podataka koje prikupljate, treće strane koje imaju pristup podacima (promena hosting-a, uvođenje novih alata), ili kada se promeni zakonodavstvo. Svaka izmena mora biti objavljena sa datumom i korisnici moraju biti obavešteni o bitnim promenama.',
        },
      ]}
    />
  )
}
