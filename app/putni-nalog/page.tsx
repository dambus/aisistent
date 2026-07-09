import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'

export const metadata: Metadata = {
  title: 'Putni nalog — generator putnih naloga za službena putovanja | AIsistent',
  description: 'Generator putnih naloga za službena putovanja. Vozač, vozilo, ruta, troškovi — PDF ili Word za 60 sekundi.',
  openGraph: {
    title: 'Putni nalog — generator za službena putovanja',
    description: 'Generator putnih naloga za službena putovanja. Vozač, vozilo, ruta, troškovi — PDF ili Word za 60 sekundi.',
    url: 'https://aisistent.rs/putni-nalog',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Putni nalog — generator za službena putovanja"
      heroFlightLabel="Putni nalog"
      intro="Napravite putni nalog sa svim podacima o putovanju, vozaču, vozilu i troškovima na teret firme. Dokument spreman za odobrenje i potpis za 60 sekundi."
      ctaHref="/register"
      ctaLabel="Napravite putni nalog besplatno"
      ctaNote="Kompletan putni nalog u PDF ili Word formatu za manje od 60 sekundi"
      features={[
        { icon: '🗺️', title: 'Podaci o putovanju', text: 'Svrha putovanja, mesto polaska i odredište, datumi polaska i povratka.' },
        { icon: '🚗', title: 'Podaci o vozilu', text: 'Marka, model, registarski broj i stanje kilometraže pri polasku.' },
        { icon: '👤', title: 'Vozač i ovlašćeno lice', text: 'Ime i pozicija vozača, ovlašćeno lice koje odobrava i potpisuje nalog.' },
        { icon: '💰', title: 'Troškovi na teret firme', text: 'Dnevnica, gorivo, smeštaj i ostali troškovi — jasno naznačeni na dokumentu.' },
        { icon: '📝', title: 'Napomena uz rutu', text: 'Opciono polje za obilazak više lokacija ili posebne napomene o ruti.' },
        { icon: '📄', title: 'PDF i Word format', text: 'Dokument spreman za štampu, odobrenje i arhiviranje odmah po preuzimanju.' },
      ]}
      whyAisistent={[
        'Svi obavezni elementi putnog naloga na jednom mestu — bez propuštenih podataka',
        'Brže od popunjavanja gotovog obrasca ručno za svako službeno putovanje',
        'Jasno razdvojeni troškovi na teret firme (dnevnica, gorivo, smeštaj)',
        'Arhiva svih naloga za kasniju proveru i obračun troškova',
        'PDF i Word (DOCX) format spreman za odobrenje i potpisivanje',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
        { href: '/kalkulator-zarade', label: 'Kalkulator zarade' },
        { href: '/poslovni-mejl', label: 'Poslovni mejl' },
        { href: '/obrasci', label: 'Biblioteka zvaničnih obrazaca' },
      ]}
      faqs={[
        {
          q: 'Šta mora da sadrži putni nalog?',
          a: 'Putni nalog treba da sadrži: broj i datum izdavanja, svrhu putovanja, mesto polaska i odredište, datume polaska i povratka, podatke o vozaču i vozilu (marka, model, registarski broj), podatke o firmi i ovlašćenom licu koje odobrava putovanje, i pregled troškova koji padaju na teret firme (dnevnica, gorivo, smeštaj, ostali troškovi).',
        },
        {
          q: 'Ko izdaje i odobrava putni nalog?',
          a: 'Putni nalog izdaje poslodavac (firma) pre početka službenog putovanja, a odobrava ga ovlašćeno lice — najčešće direktor ili neposredno nadređeni. Nalog treba da postoji pre putovanja, jer služi kao osnov za priznavanje troškova puta i obračun dnevnica.',
        },
        {
          q: 'Da li se dnevnica automatski obračunava?',
          a: 'Ne — AIsistent generiše dokument sa naznakom da li dnevnica pada na teret firme, ali sam iznos dnevnice (koji zavisi od destinacije, trajanja putovanja i internih akata firme ili zakonskih limita za neoporezivi iznos) obračunava se posebno, prema pravilniku o radu ili zakonskim propisima.',
        },
        {
          q: 'Da li je putni nalog obavezan za svako službeno putovanje?',
          a: 'Praktično da — putni nalog je standardni interni dokument kojim firma dokumentuje službeno putovanje zaposlenog, opravdava troškove (gorivo, dnevnice, smeštaj) i štiti i firmu i zaposlenog u slučaju kontrole ili spora oko troškova.',
        },
      ]}
    />
  )
}
