import type { Metadata } from 'next'
import { ToolLandingPage } from '@/components/landing/ToolLandingPage'
import { TOOL_CONFIG } from '@/lib/config/tools'

export const metadata: Metadata = {
  title: 'NDA sporazum Srbija — generator ugovora o poverljivosti | AIsistent',
  description: 'Generator NDA sporazuma (ugovora o poverljivosti) prilagođen srpskom pravu. Jednostrani i obostrani NDA za 60 sekundi.',
  openGraph: {
    title: 'NDA sporazum — generator ugovora o poverljivosti za Srbiju',
    description: 'Generator NDA sporazuma (ugovora o poverljivosti) prilagođen srpskom pravu. Jednostrani i obostrani NDA za 60 sekundi.',
    url: 'https://aisistent.rs/nda',
  },
}

export default function Page() {
  return (
    <ToolLandingPage
      previewSlug="nda"
      h1="NDA sporazum — generator ugovora o poverljivosti za Srbiju"
      intro="Zaštitite poslovne tajne i ideje pre pregovora, saradnje ili angažovanja. Jednostrani ili obostrani NDA prilagođen srpskom pravu — PDF za 60 sekundi."
      ctaHref="/register"
      ctaLabel={TOOL_CONFIG['nda'].ctaLabel}
      ctaNote="Sporazum u PDF ili Word formatu za manje od 60 sekundi"
      features={[
        { icon: '🔒', title: 'Definicija poverljivih inf.', text: 'Precizna definicija šta je poverljivo i šta nije — sprečava osporavanje u sporu.' },
        { icon: '⚖️', title: 'Jednostrani ili obostrani', text: 'Jednostrani NDA (samo jedna strana otkriva) ili obostrani (obe strane dele poverljive inf.).' },
        { icon: '📆', title: 'Trajanje obaveze', text: 'Period tokom kojeg obaveza čuvanja tajne važi — tipično 2-5 godina nakon isteka saradnje.' },
        { icon: '🚫', title: 'Izuzeci od poverljivosti', text: 'Standardni izuzeci: javno dostupne informacije, sudski nalog, prethodno poznate — zakonski neophodni.' },
        { icon: '💰', title: 'Ugovorna kazna', text: 'Opciona ugovorna kazna za kršenje — efikasnije od dokazivanja stvarne štete na sudu.' },
        { icon: '🌍', title: 'Merodavno pravo', text: 'Srpsko pravo i nadležnost srpskih sudova — ili arbitraža po izboru strana.' },
      ]}
      whyAisistent={[
        'Prilagođen srpskom Zakonu o obligacionim odnosima i Zakonu o poslovnoj tajni',
        'Podržava jednostrani i obostrani NDA — izaberete u wizard-u',
        'Ispravni izuzeci od poverljivosti koji su zakonski neophodni',
        'Opciona ugovorna kazna za lakše dokazivanje štete',
        'PDF i Word (DOCX) format spreman za potpisivanje',
        'Besplatno za početak — bez kreditne kartice',
      ]}
      relatedLinks={[
        { href: '/ugovor-o-saradnji', label: 'Ugovor o saradnji' },
        { href: '/ugovor-o-delu', label: 'Ugovor o delu' },
        { href: '/blog/nda-sporazum-srbija', label: 'Članak: šta mora da sadrži NDA' },
        { href: '/opsti-uslovi', label: 'Opšti uslovi korišćenja' },
      ]}
      faqs={[
        {
          q: 'Kada treba potpisati NDA?',
          a: 'NDA treba potpisati pre nego što otkrijete bilo kakve poverljive informacije — idealno pre prvog ozbiljnog poslovnog razgovora. Uobičajene situacije: pre pregovora o investiciji ili akviziciji, pre angažovanja freelancera na projektu sa poverljivim elementima, pre prezentacije poslovne ideje potencijalnom partneru ili klijentu, i pri zapošljavanju za pozicije sa pristupom poslovnim tajnama.',
        },
        {
          q: 'Koja je razlika između jednostranog i obostranog NDA?',
          a: 'Jednostrani NDA: samo jedna strana otkriva poverljive informacije, a druga se obavezuje na čuvanje tajne. Koristi se kada vi otkrivate ideju ili projekat potencijalnom partneru. Obostrani NDA: obe strane otkrivaju poverljive informacije i obe se obavezuju na čuvanje. Koristi se u pregovorima o partnerstvu, spajanju ili zajedničkom projektu gde obe strane dele osetljive podatke.',
        },
        {
          q: 'Koliko dugo NDA važi?',
          a: 'Trajanje obaveze poverljivosti se definiše ugovorom — tipično 2 do 5 godina od potpisivanja ili od prestanka saradnje. Zakonski, srpski sudovi prihvataju NDA sa rokom trajanja koji je razuman u odnosu na prirodu informacija. Trajni NDA (bez roka) za sve kategorije informacija mogao bi biti problematičan za sudsku primenu za opšte tržišne informacije, ali je prihvatljiv za specifične poslovne tajne.',
        },
        {
          q: 'Da li NDA mora biti overen kod notara?',
          a: 'Ne — NDA ne mora biti overen kod javnog beležnika da bi bio pravno valjano. Dovoljan je potpis ovlašćenih lica obe strane. Overavanjem se samo potvrđuje autentičnost potpisa, što olakšava dokazivanje u sporu. Za veće poslovne tajne ili kada postoji sumnja u buduće osporavanje potpisa, preporučuje se overa.',
        },
      ]}
    />
  )
}
