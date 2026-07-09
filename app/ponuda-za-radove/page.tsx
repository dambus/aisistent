import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

export const metadata: Metadata = {
  title: 'Ponuda za radove — generator ponuda za izvođače i majstore | AIsistent',
  description: 'Generator ponuda za radove — izvođači, majstori, zanatlije. Stavke, cene, PDV — PDF ili Word za 60 sekundi.',
  openGraph: {
    title: 'Ponuda za radove — generator za izvođače i majstore',
    description: 'Generator ponuda za radove — izvođači, majstori, zanatlije. Stavke, cene, PDV — PDF ili Word za 60 sekundi.',
    url: 'https://aisistent.rs/ponuda-za-radove',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      h1="Ponuda za radove — generator za izvođače i majstore"
      heroFlightLabel="Ponuda"
      intro="Napravite ponudu za izvođenje radova sa stavkama, cenama i uslovima. Za majstore, zanatlije i izvođače koji nude usluge sa jasnim obimom posla."
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['ponuda-za-radove'].ctaLabel}
      ctaNote="Kompletna ponuda za radove u PDF ili Word formatu za manje od 60 sekundi"
      ctaTitle={TOOL_CONFIG['ponuda-za-radove'].ctaTitle}
      features={[
        { icon: '🏗️', title: 'Opis radova i lokacija', text: 'Detaljan opis obima radova i adresa gde se radovi izvode — jasno definisano.' },
        { icon: '🧾', title: 'Stavke sa cenama', text: 'Neograničen broj stavki — opis rada, količina, jedinica mere i cena po stavci.' },
        { icon: '💰', title: 'PDV tretman', text: 'Automatska primena ispravnog PDV tretmana prema statusu izvođača (obveznik ili ne).' },
        { icon: '⏳', title: 'Rok važenja ponude', text: 'Jasno naznačeno koliko dugo važi ponuđena cena — zaštita od naknadnih promena.' },
        { icon: '🏢', title: 'Izvođač i naručilac', text: 'Puni podaci obe strane sa PIB-om, adresom i tekućim računom izvođača.' },
        { icon: '📄', title: 'PDF i Word format', text: 'Profesionalna ponuda spremna za slanje naručiocu odmah po preuzimanju.' },
      ]}
      whyAisistent={[
        'Prilagođeno srpskoj praksi za izvođače, majstore i zanatlije',
        'Automatska primena ispravnog PDV tretmana prema vašem statusu',
        'Profesionalan izgled koji gradi poverenje kod naručioca',
        'Arhiva svih ponuda za praćenje i ponovnu upotrebu na sličnim poslovima',
        'PDF i Word format za dalju prilagodbu pre slanja',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/otpremnica', label: 'Otpremnica' },
        { href: '/ponuda-klijentu', label: 'Ponuda klijentu' },
        { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
        { href: '/obrasci', label: 'Biblioteka zvaničnih obrazaca' },
      ]}
      faqs={[
        {
          q: 'Šta mora da sadrži ponuda za radove?',
          a: 'Ponuda za radove treba da sadrži: broj i datum ponude, podatke o izvođaču i naručiocu, lokaciju gde se radovi izvode, detaljan opis obima radova, stavke sa količinama, jedinicama mere i cenama, PDV tretman (ako je izvođač PDV obveznik), rok važenja ponude i eventualne uslove plaćanja ili dinamike izvođenja.',
        },
        {
          q: 'Da li ponuda mora imati PDV ako nisam obveznik?',
          a: 'Ne — ako niste u sistemu PDV-a (npr. paušalni preduzetnik ili firma ispod praga za obavezan ulazak u sistem), ponuda ne sadrži PDV, cene su konačne, a na dokumentu se dodaje napomena da izvođač nije u sistemu PDV-a. Ako jeste obveznik, primenjuje se odgovarajuća stopa (20%, 10%, 0% ili oslobođeno) prema vrsti radova.',
        },
        {
          q: 'Koja je razlika između ponude za radove i obične poslovne ponude?',
          a: 'Ponuda za radove je specijalizovana za izvođače, majstore i zanatlije — fokusirana je na opis fizičkih radova, lokaciju izvođenja i stavke tipa rad/materijal. Opšta poslovna ponuda (Ponuda klijentu) je fleksibilnija i pogodna za usluge i proizvode van građevinskog/zanatskog konteksta.',
        },
        {
          q: 'Da li je ponuda za radove obavezujuća?',
          a: 'Ponuda postaje obavezujuća kada je naručilac prihvati, u okviru navedenog roka važenja. Preporučuje se da rok važenja bude jasno naveden, posebno kod radova gde cene materijala mogu varirati. Za veće poslove korisno je pored ponude sklopiti i formalan ugovor o delu ili ugovor o izvođenju radova.',
        },
      ]}
    />
  )
}
