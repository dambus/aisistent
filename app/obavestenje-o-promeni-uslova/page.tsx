import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

export const metadata: Metadata = {
  title: 'Obaveštenje o promeni uslova rada — generator | AIsistent',
  description: 'Generator obaveštenja o promeni uslova rada po čl. 172-174 Zakona o radu RS. Radno vreme, zarada, mesto rada — PDF za 60 sekundi.',
  openGraph: {
    title: 'Obaveštenje o promeni uslova rada — generator za poslodavce',
    description: 'Generator obaveštenja o promeni uslova rada po čl. 172-174 Zakona o radu RS. Radno vreme, zarada, mesto rada — PDF za 60 sekundi.',
    url: 'https://aisistent.rs/obavestenje-o-promeni-uslova',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Obaveštenje o promeni uslova rada — generator za poslodavce"
      heroFlightLabel="Obaveštenje"
      intro="Generišite formalno obaveštenje zaposlenom o promeni uslova rada u skladu sa čl. 172-174 Zakona o radu RS. Radno vreme, zarada, mesto rada ili naziv radnog mesta — jasno staro i novo stanje."
      slug="obavestenje-o-promeni-uslova"
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['obavestenje-o-promeni-uslova'].ctaLabel}
      ctaNote="Zakonski usklađeno obaveštenje u PDF formatu za manje od 60 sekundi"
      features={[
        { icon: '⚖️', title: 'Usklađeno sa Zakonom o radu', text: 'Sadrži sve elemente propisane čl. 172-174 ZOR za formalno obaveštenje o promeni uslova rada.' },
        { icon: '🔄', title: 'Staro i novo stanje', text: 'Jasno navedeno šta se tačno menja — radno vreme, zarada, mesto rada, naziv radnog mesta ili organizaciona promena.' },
        { icon: '📅', title: 'Datum primene', text: 'Precizno naznačen datum od kada nova promena stupa na snagu.' },
        { icon: '⏳', title: 'Rok za izjašnjavanje', text: 'Opciono polje za rok u kom se zaposleni može izjasniti o ponuđenoj promeni.' },
        { icon: '📝', title: 'Razlog promene', text: 'Opciona napomena o razlogu promene — povećava transparentnost i smanjuje rizik od spora.' },
        { icon: '📄', title: 'PDF spreman za uručenje', text: 'Formalan dokument spreman za potpis zastupnika i uručenje zaposlenom.' },
      ]}
      whyAisistent={[
        'Usklađeno sa čl. 172-174 Zakona o radu Republike Srbije',
        'Formalan pravni jezik prilagođen svakom tipu promene uslova rada',
        'Jasno razdvojeno staro i novo stanje — smanjuje rizik od nesporazuma',
        'Arhiva svih obaveštenja za dokumentaciju i kasniju proveru',
        'PDF i Word (DOCX) format spreman za potpis i uručenje',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-radu', label: 'Ugovor o radu' },
        { href: '/kalkulator-zarade', label: 'Kalkulator zarade' },
        { href: '/oglas-za-posao', label: 'Oglas za posao' },
        { href: '/obrasci', label: 'Biblioteka zvaničnih obrazaca' },
      ]}
      faqs={[
        {
          q: 'Kada je poslodavac dužan da izda obaveštenje o promeni uslova rada?',
          a: 'Prema čl. 172 Zakona o radu, kada poslodavac želi da izmeni bilo koji od ugovorenih elemenata radnog odnosa — radno vreme, zaradu, mesto rada, naziv ili opis radnog mesta — dužan je da zaposlenom ponudi izmenu ugovora, formalno i pisano. Obaveštenje je prvi korak u tom procesu, kojim se zaposleni jasno informiše o predloženoj promeni.',
        },
        {
          q: 'Da li zaposleni mora da prihvati promenu uslova rada?',
          a: 'Ne automatski. Zaposleni ima pravo da prihvati ili odbije ponuđenu izmenu u roku koji odredi poslodavac. Ako zaposleni odbije, poslodavac može, u zavisnosti od situacije, otkazati ugovor o radu uz poštovanje zakonskog otkaznog roka — ali obaveštenje samo po sebi ne menja ugovor bez saglasnosti zaposlenog.',
        },
        {
          q: 'Da li obaveštenje mora navesti razlog promene?',
          a: 'Zakon ne propisuje eksplicitnu obavezu navođenja razloga u svakom slučaju, ali navođenje razloga (npr. reorganizacija, usklađivanje sa pravilnikom o radu) povećava transparentnost i smanjuje rizik od kasnijeg spora pred sudom ili inspekcijom rada. AIsistent omogućava opciono dodavanje razloga.',
        },
        {
          q: 'Koja je razlika između ovog obaveštenja i aneksa ugovora o radu?',
          a: 'Obaveštenje je prvi korak — formalna ponuda promene koju poslodavac upućuje zaposlenom. Ako zaposleni prihvati, promena se obično formalizuje aneksom ugovora o radu koji obe strane potpisuju. Obaveštenje samo najavljuje i obrazlaže promenu; aneks je pravni instrument koji je konačno sprovodi.',
        },
      ]}
    />
  )
}
