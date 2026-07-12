import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

export const metadata: Metadata = {
  title: 'Pregled ugovora AI — proverite ugovor pre potpisa | AIsistent',
  description: 'Uploadujte ugovor koji ste dobili od druge strane i AI ukazuje na rizične klauzule, šta nedostaje i na šta obratiti pažnju pre potpisivanja.',
  openGraph: {
    title: 'Pregled ugovora AI — proverite ugovor pre potpisa',
    description: 'Uploadujte ugovor koji ste dobili od druge strane i AI ukazuje na rizične klauzule, šta nedostaje i na šta obratiti pažnju pre potpisivanja.',
    url: 'https://aisistent.rs/pregled-ugovora',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Pregled ugovora — proverite pre nego što potpišete"
      heroFlightLabel="Analiza"
      intro="Dobili ste ugovor od klijenta, partnera ili poslodavca? Uploadujte ga i AI ukazuje na rizične klauzule, šta nedostaje i na šta obratiti pažnju — pre nego što potpišete."
      slug="pregled-ugovora"
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['pregled-ugovora'].ctaLabel}
      ctaTitle={TOOL_CONFIG['pregled-ugovora'].ctaTitle}
      ctaNote="Dostupno za Pro i Agency plan"
      features={[
        { icon: '⚠️', title: 'Rizične klauzule', text: 'AI prepoznaje formulacije koje mogu biti nepovoljne ili neuobičajene za vas.' },
        { icon: '🔍', title: 'Šta nedostaje', text: 'Ukazuje na delove koji bi trebalo da postoje u ovakvom ugovoru, a nema ih.' },
        { icon: '💡', title: 'Praktični saveti', text: 'Konkretne stvari na koje da obratite pažnju pre potpisivanja.' },
        { icon: '📄', title: 'PDF i DOCX', text: 'Podržani su najčešći formati ugovora koje dobijate od druge strane.' },
        { icon: '🔒', title: 'Privatnost', text: 'Dokument se analizira i ne čuva se na serveru nakon obrade.' },
        { icon: '⚖️', title: 'Ne zamenjuje advokata', text: 'Informativna AI analiza — za konačnu odluku konsultujte pravnika.' },
      ]}
      whyAisistent={[
        'Jedini alat na domaćem tržištu koji analizira TUĐI ugovor, ne samo generiše vaš',
        'Konkretna, strukturisana analiza — rizične klauzule, propusti, saveti',
        'Radi uz postojeće generisanje ugovora — kompletan ciklus na jednom mestu',
        'Jasan disclaimer — pomaže vam da postavite prava pitanja advokatu, ne zamenjuje ga',
        'Brzo — analiza za manje od minuta',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
        { href: '/nda', label: 'NDA sporazum' },
        { href: '/ugovor-o-zakupu', label: 'Ugovor o zakupu' },
      ]}
      faqs={[
        {
          q: 'Da li AI zamenjuje advokata?',
          a: 'Ne. Pregled ugovora je informativna AI analiza koja vam pomaže da uočite stvari vredne pažnje pre potpisivanja i da postavite prava pitanja. Za konačnu pravnu procenu i odluku o potpisivanju uvek konsultujte advokata — posebno kod ugovora veće vrednosti ili složenosti.',
        },
        {
          q: 'Koji formati ugovora su podržani?',
          a: 'PDF i DOCX, do 8MB. Ugovor mora sadržati čitljiv tekst — skenirane slike bez teksta (fotografije papirnog ugovora) trenutno nisu podržane.',
        },
        {
          q: 'Da li se moj uploadovan ugovor čuva?',
          a: 'Ne. Dokument se obrađuje u trenutku analize i ne čuva se trajno na serveru — vaš ugovor ostaje privatan.',
        },
        {
          q: 'Koliko ugovora mogu da analiziram?',
          a: 'Pro i Agency plan uključuju mesečni limit pregleda ugovora. Tačan broj vidite u aplikaciji nakon prijave.',
        },
      ]}
    />
  )
}
