import type { UgovorOSaradnjiZajmuData, WizardStep } from '@/types/wizard'
import { getZastupnikRod } from '@/lib/utils/rod'

function opisZastupnika(tip: string | undefined, zastupnik: string | undefined): string {
  if (!zastupnik?.trim()) {
    return tip === 'Fizičko lice' ? 'nije primenljivo' : '[POPUNITI: zastupnik]'
  }
  if (tip === 'Fizičko lice') return zastupnik
  const prvoIme = zastupnik.trim().split(/[\s,]+/)[0]
  const rod = getZastupnikRod(prvoIme)
  if (tip === 'Preduzetnik') {
    return rod === 'zenski'
      ? `zastupana po preduzetnici ${zastupnik}`
      : `zastupan po preduzetniku ${zastupnik}`
  }
  return rod === 'zenski'
    ? `zastupana po direktorki ${zastupnik}`
    : `zastupan po direktoru ${zastupnik}`
}

export const systemPrompt = `## JEZIČKI STANDARD

Piši prirodnim srpskim jezikom kakav koriste obrazovani preduzetnici u svakodnevnoj poslovnoj komunikaciji.

Pravila:
- Izbegavaj kalkove sa engleskog (ne 'implementirati' nego 'sprovesti', ne 'procesirati' nego 'obraditi')
- Izbegavaj arhaične i birokratske izraze
- Koristi aktivnu formu umesto pasivne gde je moguće
- Termini koji se koriste u srpskoj pravnoj praksi su prihvatljivi (ugovor, član, strana, poslodavac)
- Anglicizmi su dozvoljeni samo kada ne postoji prirodna srpska alternativa

Ti si pravni asistent specijalizovan za izradu ugovora o poslovnoj saradnji i ugovora o zajmu u skladu sa važećim zakonodavstvom Republike Srbije, pre svega Zakonom o obligacionim odnosima i Zakonom o porezu na dohodak građana.

## TVOJ ZADATAK

Generiši jedan od dva tipa dokumenta. Pre generisanja određuješ TIP.

## TIPOVI

TIP 1 - UGOVOR O POSLOVNOJ SARADNJI
→ Dve strane udružuju resurse radi zajedničkog cilja
→ Nema zajma novca - ravnopravne strane
→ Tipično: zajednički projekat, tender, podela klijenata
→ Termini: "Prva strana" i "Druga strana"
→ VAŽNO: ne osniva zajedničko preduzeće - strane ostaju samostalni subjekti

TIP 2 - UGOVOR O ZAJMU
→ Zajmodavac daje novac Zajmoprimcu na određeno vreme
→ Sa kamatom ili bezkamatni
→ Tipično: pozajmica između fizičkih lica, firmi, osnivača firmi
→ Termini: "Zajmodavac" i "Zajmoprimac"
→ Poreski tretman: zavisi od tipa zajmodavca — vidi sekciju PORESKI TRETMAN KAMATE

## SRPSKI JEZIK I DEKLINACIJA - KRITIČNO PRAVILO

Sve podatke korisnik daje u NOMINATIVU. Dekliniraš prema kontekstu.
Ime/naziv koristiš SAMO u uvodu i potpisima.

Firme: "Sigma doo" → "Sigma doo-a" (gen.), "Sigma doo-u" (dat.)
Muška (suglasnik): Petar→Petra→Petru | Milan→Milana→Milanu
Muška na -a: Nikola→Nikole→Nikoli→Nikolu
Ženska na -a: Ana→Ane→Ani→Anu | Jelena→Jelene→Jeleni→Jelenu

## OBAVEZNI ELEMENTI - TIP 1 (Saradnja)

1. Identifikacija strana
2. Predmet i cilj saradnje
3. Doprinos svake strane
4. Podela prihoda i troškova
5. Upravljanje i donošenje odluka
6. Trajanje
7. Ekskluzivnost (ako se ugovara)
8. Poverljivost - NDA klauzula
9. Intelektualna svojina
10. Raskid i posledice
11. Rešavanje sporova
12. Potpisi

## FORMAT - TIP 1

UGOVOR O POSLOVNOJ SARADNJI
Broj: {broj_ugovora ako postoji; ako je 'bez broja', ne prikazuj red 'Broj:'}
Datum: ___________

I.    UGOVORNE STRANE
II.   PREDMET I CILJ SARADNJE
III.  DOPRINOS STRANA
IV.   PODELA PRIHODA I TROŠKOVA
V.    UPRAVLJANJE SARADNJOM
VI.   TRAJANJE UGOVORA
VII.  EKSKLUZIVNOST [ako se ugovara]
VIII. POVERLJIVOST
IX.   INTELEKTUALNA SVOJINA
X.    RASKID UGOVORA
XI.   REŠAVANJE SPOROVA
XII.  ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## INTELEKTUALNA SVOJINA — UPRAVLJANJE — TIP 1

Ako je vlasnistvo_ip == 'Zajednički', obavezno generisati u članu o intelektualnoj svojini sledeći stav:

"Zajedničkom intelektualnom svojinom Strane upravljaju konsenzusom. Nijedna Strana ne može samostalno licencirati, preneti ili komercijalno koristiti zajedničku IP bez pisane saglasnosti druge Strane, izuzev u svrhu realizacije ovog Ugovora.

Po prestanku Ugovora, svaka Strana zadržava pravo korišćenja zajedničke IP u jednakim udelima, bez prava da drugoj Strani uskrati ovo pravo."

## OBAVEZNI ELEMENTI - TIP 2 (Zajam)

1. Identifikacija zajmodavca i zajmoprimca
2. Iznos zajma
3. Svrha zajma (preporučljiva)
4. Rok vraćanja i plan otplate
5. Kamata ili eksplicitna izjava o bezkamatnosti
6. Način isplate i vraćanja
7. Sredstvo obezbeđenja (ako se ugovara)
8. Prevremena otplata
9. Posledice kašnjenja - zatezna kamata
10. Poreski tretman kamate
11. Potpisi i overa (preporučiti za iznose preko 50.000 RSD)

## FORMAT - TIP 2

UGOVOR O ZAJMU
Broj: {broj_ugovora ako postoji; ako je 'bez broja', ne prikazuj red 'Broj:'}
Datum: ___________

I.    UGOVORNE STRANE
II.   PREDMET - IZNOS I VALUTA ZAJMA
III.  SVRHA ZAJMA
IV.   ISPLATA ZAJMA
V.    KAMATA / BEZKAMATNI ZAJAM
VI.   ROK I NAČIN VRAĆANJA
VII.  PREVREMENA OTPLATA
VIII. SREDSTVO OBEZBEĐENJA [ako se ugovara]
IX.   POSLEDICE KAŠNJENJA
X.    PORESKE NAPOMENE
XI.   ZAVRŠNE ODREDBE
(Ne generiši sekciju POTPISI — sistem je dodaje automatski)

## PORESKI TRETMAN KAMATE — TIP 2

U članu o poreskim napomenama generiši prema tipu zajmodavca:

Ako tip_zajmodavca == 'Fizičko lice':
→ Kamata je prihod od kapitala, oporezuje se po stopi 15% (Zakon o PDG, čl. 61-64)
→ Zajmoprimac je dužan da obračuna i uplati porez po odbitku pre isplate kamate
→ Generiši poseban stav: "Zajmoprimac je obavezan da pre svake isplate kamate obračuna i uplati porez na prihod od kapitala po stopi 15% u ime i za račun Zajmodavca."

Ako tip_zajmodavca == 'Firma':
→ Kamata je prihod koji se uključuje u poslovni prihod firme i oporezuje kroz porez na dobit (stopa 15%)
→ Nema poreza po odbitku — zajmoprimac isplaćuje bruto kamatu
→ Generiši napomenu: "Kamata predstavlja poslovni prihod Zajmodavca koji se oporezuje u skladu sa Zakonom o porezu na dobit pravnih lica."

Ako tip_zajmodavca == 'Osnivač firme':
→ Zajam osnivača firmi nije prihod firme i ne podleže porezu na dobit
→ Firma vraća zajam osnivaču — to nije rashod firme
→ Generiši obaveznu napomenu: "Ovaj zajam ne predstavlja prihod Zajmoprimca i ne podleže porezu na dobit. Vraćanje zajma ne predstavlja rashod Zajmoprimca. Preporučuje se evidentiranje u poslovnim knjigama kao obaveza prema osnivaču."

## TON I STIL

- Formalan pravni jezik | Koristi ISKLJUČIVO latinicu kroz ceo dokument. Posebno pazi na: č, ć, š, đ, ž — moraju biti latinicom.
- Iznose slovima piši kao jednu reč bez razmaka: 300 → tristotine | 1.000 → hiljadu | 2.500 → dveihiljadepetsto | 10.000 → deset hiljada | 100.000 → sto hiljada | 1.000.000 → milion.
- TIP 1: "Prva strana" i "Druga strana"
- TIP 2: "Zajmodavac" i "Zajmoprimac"
- Novčane iznose i kamatnu stopu pisati i slovima
- Datume u punom formatu: 01. januar 2027. godine

## ŠTA NE RADIŠ

- Iznose slovima uvek piši razdvojeno: svaka reč posebno.
  Ispravno: "sto dvadeset hiljada", "dvesta pedeset hiljada", "petsto hiljada"
  Pogrešno: "stodvadeset hiljada", "dvestapedeset hiljada", "petstoniljada"
- Iznos slovima mora tačno odgovarati iznosu ciframa. Uvek proveri.
- Nikada ne računaj datume samostalno (npr. "danas + 24 meseca = datum isteka").
  Ako datum nije prosleđen kroz wizard, ostavi prazno: ___________
  Jedini datum koji možeš koristiti je onaj koji je eksplicitno dat u podacima.
- Ne generiši naslov dokumenta kao prvi red. PDF automatski dodaje naslov. Počni direktno sa sadržajem (Broj: ..., Datum: ...).
- Ne izmišljaš podatke - [POPUNITI: naziv podatka]
- Ne osnuješ zajedničko preduzeće ugovorom o saradnji
- Ne garantuješ poresku ispravnost
- Nikada ne kopiraj ime/naziv bez provere padeža
- Ne dodaješ napomenu/disclaimer na kraju dokumenta — to je već u footeru PDF-a
- Ne generišeš sekciju POTPISI ni pod kojim rimskim brojem — sistem je dodaje automatski
- Ako je broj_ugovora 'bez broja' ili prazan, ne generiši redak 'Broj:' u zaglavlju.
- DATUM ZAKLJUČIVANJA I DATUM POTPISIVANJA:
  - Nikada ne generiši automatski datum zaključivanja u zaglavlju dokumenta. Zaglavlje piše: 'Datum: ___________'
  - U uvodnom tekstu gde se pominje datum zaključivanja (npr. 'zaključen dana...') piše: 'zaključen dana ___________. godine'
  - U potpisničkom delu datum potpisivanja je uvek: 'Mesto i datum potpisivanja: _______________' (prazno polje, bez generisanog datuma)
  - JEDINI datum koji se generiše iz wizard inputa je datum početka saradnje / rok vraćanja zajma — jer ga korisnik eksplicitno unosi.
- Ne kopiraj u dokument tekst iz slobodnih polja koji opisuje samo polje umesto sadržaja. Ako slobodno polje sadrži bilo koji od ovih signala, zameni ga sa [POPUNITI: naziv polja]:
  • tekst počinje sa "U ovom polju", "Ovde se upisuje", "Popuniti", "Test", "N/A", "Lorem ipsum"
  • tekst sadrži reči: "testiranje", "radi testa", "generički", "izmišljam", "scenario", "placeholder"
  • tekst je kraći od 5 karaktera i ne opisuje konkretan sadržaj
- Ne generiši prazan poslednji član — svaki naslov člana mora imati tekst ispod.`

export function buildUserMessage(data: UgovorOSaradnjiZajmuData): string {
  const brojUgovora = data.broj_ugovora?.trim() ? data.broj_ugovora.trim() : 'bez broja'

  if (data.tip_dokumenta === 'Ugovor o zajmu') {
    const rodSufixZajmodavca = (() => {
      const tip = data.tip_zajmodavca
      const naziv = data.naziv_zajmodavca
      if ((tip === 'Fizičko lice' || tip === 'Osnivač firme') && naziv) {
        const prvoIme = naziv.trim().split(/[\s,]+/)[0]
        return getZastupnikRod(prvoIme) === 'zenski' ? ', ženski rod' : ', muški rod'
      }
      return ''
    })()
    const rodSufixZajmoprimca = (() => {
      const tip = data.tip_zajmoprimca
      const naziv = data.naziv_zajmoprimca
      if (tip === 'Fizičko lice' && naziv) {
        const prvoIme = naziv.trim().split(/[\s,]+/)[0]
        return getZastupnikRod(prvoIme) === 'zenski' ? ', ženski rod' : ', muški rod'
      }
      return ''
    })()

    return `Molim te generiši Ugovor o zajmu:

BROJ UGOVORA: ${brojUgovora}

ZAJMODAVAC: ${data.tip_zajmodavca ?? '[POPUNITI: tip zajmodavca]'}${rodSufixZajmodavca} | ${data.naziv_zajmodavca ?? '[POPUNITI: naziv zajmodavca]'} | JMBG/PIB: ${data.id_zajmodavca ?? '[POPUNITI: identifikacioni broj]'} | Adresa: ${data.adresa_zajmodavca ?? '[POPUNITI: adresa zajmodavca]'}
ZAJMOPRIMAC: ${data.tip_zajmoprimca ?? '[POPUNITI: tip zajmoprimca]'}${rodSufixZajmoprimca} | ${data.naziv_zajmoprimca ?? '[POPUNITI: naziv zajmoprimca]'} | JMBG/PIB: ${data.id_zajmoprimca ?? '[POPUNITI: identifikacioni broj]'} | Adresa: ${data.adresa_zajmoprimca ?? '[POPUNITI: adresa zajmoprimca]'} | Račun: ${data.racun ?? '[POPUNITI: račun]'}

ZAJAM: ${(data.iznos ?? 0).toLocaleString('sr-RS')} ${data.valuta ?? '[POPUNITI: valuta]'} | Svrha: ${data.svrha ?? '[nije navedena]'} | Isplata: ${data.datum_isplate ?? '[POPUNITI: datum isplate]'} | Način: ${data.nacin_isplate ?? '[POPUNITI: način isplate]'}

KAMATA: ${data.tip_kamate ?? '[POPUNITI: tip kamate]'} | Stopa: ${data.stopa ?? '[POPUNITI: stopa]'}% godišnje | Obračun: ${data.obracun ?? '[POPUNITI: obračun]'} | Plaćanje: ${data.placanje_kamate ?? '[POPUNITI: plaćanje kamate]'}

VRAĆANJE: ${data.nacin_vracanja ?? '[POPUNITI: način vraćanja]'} | Rok/Rate: ${data.rok_vracanja ?? '[POPUNITI: rok vraćanja]'} | Prva rata: ${data.prva_rata ?? '[nema]'} | Prevremena otplata: ${data.prevremena ? 'Da' : 'Ne'}

OBEZBEĐENJE: ${data.sredstvo} | Zatezna kamata: ${data.zatezna} | Napomene: ${data.napomene ?? '[nema]'}

Svi podaci u nominativu. Dekliniraš ispravno. Ako bezkamatni - eksplicitno navedi u ugovoru.`
  }

  return `Molim te generiši Ugovor o poslovnoj saradnji:

BROJ UGOVORA: ${brojUgovora}
PRVA STRANA: ${data.tip_1 ?? '[POPUNITI: tip prve strane]'} | ${data.naziv_1 ?? '[POPUNITI: naziv prve strane]'} | PIB/JMBG: ${data.id_1 ?? '[POPUNITI: identifikacioni broj]'} | Adresa: ${data.adresa_1 ?? '[POPUNITI: adresa prve strane]'} | Zastupnik: ${opisZastupnika(data.tip_1, data.zastupnik_1)}
DRUGA STRANA: ${data.tip_2 ?? '[POPUNITI: tip druge strane]'} | ${data.naziv_2 ?? '[POPUNITI: naziv druge strane]'} | PIB/JMBG: ${data.id_2 ?? '[POPUNITI: identifikacioni broj]'} | Adresa: ${data.adresa_2 ?? '[POPUNITI: adresa druge strane]'} | Zastupnik: ${opisZastupnika(data.tip_2, data.zastupnik_2)}

PREDMET: ${data.naziv_saradnje ?? '[POPUNITI: naziv saradnje]'}
Opis: ${data.opis_saradnje ?? '[POPUNITI: opis saradnje]'}
Doprinos Prve strane: ${data.doprinos_1 ?? '[POPUNITI: doprinos prve strane]'}
Doprinos Druge strane: ${data.doprinos_2 ?? '[POPUNITI: doprinos druge strane]'}

FINANSIJE: Podela ${data.podela ?? '[POPUNITI: model podele]'} (${data.udeo_1 ?? '[n/a]'}% / ${data.udeo_2 ?? '[n/a]'}%) | Upravljanje: ${data.upravljanje ?? '[POPUNITI: upravljanje]'} | Izveštavanje: ${data.rok ?? '[POPUNITI: rok]'} dana

USLOVI: Početak ${data.datum_pocetka ?? '[POPUNITI: datum početka]'} | Trajanje: ${data.trajanje ?? '[nije navedeno]'} | Krajnji datum: ${data.datum_zavrsetka ?? '[POPUNITI: datum završetka]'} | Ekskluzivnost: ${data.ekskluzivnost ? 'Da' : 'Ne'} - ${data.opis_ekskl ?? '[nema]'}
NDA: ${data.nda ? 'Da' : 'Ne'} | IP: ${data.vlasnistvo_ip ?? '[POPUNITI: vlasništvo nad IP]'} | Napomene: ${data.napomene ?? '[nema]'}

Svi podaci u nominativu. Dekliniraš ispravno.`
}

export const wizardSteps: WizardStep[] = [
  {
    id: 'zajednicki',
    title: 'Tip dokumenta',
    fields: [
      {
        id: 'broj_ugovora',
        label: 'Broj ugovora',
        type: 'text',
        required: false,
        placeholder: 'npr. 001/2026',
        helperText: 'Ostavite prazno ako ne želite broj',
        tooltip: 'Interni broj za vašu evidenciju. Ako ostavite prazno, ugovor neće imati broj u zaglavlju.',
      },
      {
        id: 'tip_dokumenta',
        label: 'Tip dokumenta',
        type: 'radio',
        required: true,
        tooltip: 'Ugovor o saradnji — dve strane zajedno rade na projektu ili dele resurse, ali ostaju samostalni subjekti. Nema zajma novca.\nUgovor o zajmu — jedna strana pozajmljuje novac drugoj, sa obavezom vraćanja.',
        options: [
          { value: 'Ugovor o poslovnoj saradnji', label: 'Ugovor o poslovnoj saradnji' },
          { value: 'Ugovor o zajmu', label: 'Ugovor o zajmu' },
        ],
      },
    ],
  },
  {
    id: 'saradnja',
    title: 'Saradnja',
    showIf: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' },
    fields: [
      { id: 'tip_1', label: 'Tip Prve strane', type: 'radio', required: false, tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Preduzetnik — registrovana delatnost sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.', options: [
        { value: 'Firma', label: 'Firma' },
        { value: 'Preduzetnik', label: 'Preduzetnik' },
        { value: 'Fizičko lice', label: 'Fizičko lice' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'naziv_1', label: 'Naziv / Ime Prve strane', type: 'text', required: false, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv firme ili ime i prezime Prve strane', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'id_1', label: 'PIB / JMBG Prve strane', type: 'text', required: false, placeholder: '123456789', helperText: 'PIB za firmu/preduzetnika ili JMBG za fizičko lice', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'adresa_1', label: 'Adresa Prve strane', type: 'text', required: false, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa sedišta ili stanovanja Prve strane', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'zastupnik_1', label: 'Zastupnik Prve strane', type: 'text', required: false, placeholder: 'npr. Petar Nikolić, direktor', helperText: 'Ime i funkcija zastupnika ako je Prva strana firma', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'tip_2', label: 'Tip Druge strane', type: 'radio', required: false, tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Preduzetnik — registrovana delatnost sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.', options: [
        { value: 'Firma', label: 'Firma' },
        { value: 'Preduzetnik', label: 'Preduzetnik' },
        { value: 'Fizičko lice', label: 'Fizičko lice' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'naziv_2', label: 'Naziv / Ime Druge strane', type: 'text', required: false, placeholder: 'npr. Sigma Solutions doo', helperText: 'Naziv firme ili ime i prezime Druge strane', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'id_2', label: 'PIB / JMBG Druge strane', type: 'text', required: false, placeholder: '123456789', helperText: 'PIB za firmu/preduzetnika ili JMBG za fizičko lice', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'adresa_2', label: 'Adresa Druge strane', type: 'text', required: false, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa sedišta ili stanovanja Druge strane', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'zastupnik_2', label: 'Zastupnik Druge strane', type: 'text', required: false, placeholder: 'npr. Petar Nikolić, direktor', helperText: 'Ime i funkcija zastupnika ako je Druga strana firma', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'naziv_saradnje', label: 'Naziv saradnje', type: 'text', required: false, placeholder: 'npr. Zajednički nastup na tenderu za IT usluge', helperText: 'Kratki naziv projekta ili saradnje', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'opis_saradnje', label: 'Detaljan opis', type: 'textarea', required: false, placeholder: 'npr. Strane zajednički pružaju usluge razvoja softvera klijentu X. Prva strana obezbeđuje projektni menadžment, Druga strana tehničku realizaciju...', helperText: 'Opišite šta ćete zajedno raditi i kako', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'doprinos_1', label: 'Doprinos Prve strane', type: 'textarea', required: false, placeholder: 'npr. Projektni menadžment, komunikacija sa klijentom...', helperText: 'Šta Prva strana unosi — znanje, resurse, kontakte', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'doprinos_2', label: 'Doprinos Druge strane', type: 'textarea', required: false, placeholder: 'npr. Tehnička realizacija, izvršioci, oprema...', helperText: 'Šta Druga strana unosi u saradnju', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'podela', label: 'Podela prihoda', type: 'radio', required: false, tooltip: 'Procenat udela određuje kako se dele prihodi od zajedničkog projekta. Pažnja: ako firma A naplati celokupan prihod pa deo preda firmi B, to može biti oporezivi promet usluga. Savetujte se sa računovođom.', options: [
        { value: 'Procenat', label: 'Procenat' },
        { value: 'Fiksni iznosi', label: 'Fiksni iznosi' },
        { value: 'Po projektu', label: 'Po projektu' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'udeo_1', label: 'Udeo Prve strane (%)', type: 'number', required: false, min: 0, max: 100, helperText: 'Procenat udela Prve strane u prihodima', conditional: { field: 'podela', value: 'Procenat' } },
      { id: 'udeo_2', label: 'Udeo Druge strane (%)', type: 'number', required: false, min: 0, max: 100, helperText: 'Procenat udela Druge strane u prihodima', conditional: { field: 'podela', value: 'Procenat' } },
      { id: 'upravljanje', label: 'Ko upravlja finansijama?', type: 'radio', required: false, tooltip: 'Odredite koja strana vodi naplatu, troškove i finansijsko izveštavanje u saradnji.', options: [
        { value: 'Prva', label: 'Prva' },
        { value: 'Druga', label: 'Druga' },
        { value: 'Zajednički račun', label: 'Zajednički račun' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'rok', label: 'Rok finansijskog izveštavanja (dana)', type: 'number', required: false, min: 1, defaultValue: 30, helperText: 'Broj dana za dostavljanje finansijskog izveštaja drugoj strani', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'datum_pocetka', label: 'Datum početka', type: 'date', required: false, helperText: 'Kada saradnja počinje da važi', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'trajanje', label: 'Trajanje', type: 'radio', required: false, tooltip: 'Odredite da li saradnja traje do određenog datuma, neograničeno ili do završetka konkretnog projekta.', options: [
        { value: 'Određeno', label: 'Određeno' },
        { value: 'Neodređeno', label: 'Neodređeno' },
        { value: 'Do završetka projekta', label: 'Do završetka projekta' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'datum_zavrsetka', label: 'Datum završetka', type: 'date', required: false, helperText: 'Krajnji datum saradnje ako je trajanje određeno', conditional: { field: 'trajanje', value: 'Određeno' } },
      { id: 'ekskluzivnost', label: 'Ekskluzivnost?', type: 'toggle', required: false, defaultValue: false, helperText: 'Opciono — uključite ako je potrebno', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'opis_ekskl', label: 'Oblast ekskluzivnosti', type: 'textarea', required: false, placeholder: 'npr. Ekskluzivna saradnja za teritoriju Srbije u oblasti razvoja ERP rešenja.', helperText: 'Opišite za koje tržište, klijente ili usluge važi ekskluzivnost', conditional: { field: 'ekskluzivnost', value: true } },
      { id: 'nda', label: 'NDA klauzula?', type: 'toggle', required: false, defaultValue: true, helperText: 'Opciono — uključite ako je potrebno', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'vlasnistvo_ip', label: 'Vlasništvo nad IP', type: 'radio', required: false, tooltip: 'Ko poseduje rezultate zajedničkog rada (kod, dizajn, dokumentaciju)? Bez eksplicitnog dogovora primenjuju se opšta pravila autorskog prava koja su često nejasna. Preporučujemo eksplicitno definisanje.', options: [
        { value: 'Prva strana', label: 'Prva strana' },
        { value: 'Druga strana', label: 'Druga strana' },
        { value: 'Zajednički', label: 'Zajednički' },
        { value: 'Po projektu', label: 'Po projektu' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
      { id: 'napomene', label: 'Napomene', type: 'textarea', required: false, placeholder: 'npr. Dodatni dogovori, rokovi, specifični uslovi saradnje...', helperText: 'Opciono — sve što želite dodatno da regulišete', conditional: { field: 'tip_dokumenta', value: 'Ugovor o poslovnoj saradnji' } },
    ],
  },
  {
    id: 'zajam',
    title: 'Zajam',
    showIf: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' },
    fields: [
      { id: 'tip_zajmodavca', label: 'Tip zajmodavca', type: 'radio', required: false, tooltip: 'Fizičko lice — osoba koja daje zajam. Firma — pravno lice koje daje zajam. Osnivač firme — vlasnik ili član društva koji pozajmljuje svojoj firmi.', options: [
        { value: 'Fizičko lice', label: 'Fizičko lice' },
        { value: 'Firma', label: 'Firma' },
        { value: 'Osnivač firme', label: 'Osnivač firme' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'naziv_zajmodavca', label: 'Ime/Naziv zajmodavca', type: 'text', required: false, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime ili naziv zajmodavca', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'id_zajmodavca', label: 'JMBG / PIB zajmodavca', type: 'text', required: false, placeholder: '1234567890123', helperText: 'JMBG za fizičko lice ili PIB za firmu', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'adresa_zajmodavca', label: 'Adresa zajmodavca', type: 'text', required: false, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta zajmodavca', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'tip_zajmoprimca', label: 'Tip zajmoprimca', type: 'radio', required: false, tooltip: 'Firma (doo/ad) — pravno lice sa PIB-om. Fizičko lice — osoba bez registrovane firme, ima JMBG.', options: [
        { value: 'Fizičko lice', label: 'Fizičko lice' },
        { value: 'Firma', label: 'Firma' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'naziv_zajmoprimca', label: 'Ime/Naziv zajmoprimca', type: 'text', required: false, placeholder: 'npr. Sigma Solutions doo', helperText: 'Ime i prezime ili naziv zajmoprimca', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'id_zajmoprimca', label: 'JMBG / PIB zajmoprimca', type: 'text', required: false, placeholder: '1234567890123', helperText: 'JMBG za fizičko lice ili PIB za firmu', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'adresa_zajmoprimca', label: 'Adresa zajmoprimca', type: 'text', required: false, placeholder: 'npr. Bulevar Mihajla Pupina 10, Novi Sad', helperText: 'Adresa stanovanja ili sedišta zajmoprimca', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'iznos', label: 'Iznos zajma', type: 'number', required: false, min: 1, helperText: 'Iznos zajma koji se pozajmljuje', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'valuta', label: 'Valuta', type: 'radio', required: false, tooltip: 'RSD — plaćanje u dinarima.\nEUR — iznos u evrima, plaća se u RSD po kursu NBS.', options: [
        { value: 'RSD', label: 'RSD' },
        { value: 'EUR (isplaćuje se u RSD po kursu NBS)', label: 'EUR (isplaćuje se u RSD po kursu NBS)' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'svrha', label: 'Svrha zajma', type: 'text', required: false, placeholder: 'npr. Finansiranje poslovnih aktivnosti', helperText: 'Zašto se uzima zajam (opciono ali preporučljivo)', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'datum_isplate', label: 'Datum isplate', type: 'date', required: false, helperText: 'Datum kada zajam treba da bude isplaćen', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'nacin_isplate', label: 'Način isplate', type: 'radio', required: false, tooltip: 'Prenos na račun — bankarski transfer.\nGotovina — gotovinska isplata.', options: [
        { value: 'Prenos na račun', label: 'Prenos na račun' },
        { value: 'Gotovina', label: 'Gotovina' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'racun', label: 'Broj računa zajmoprimca', type: 'text', required: false, placeholder: 'npr. 160-123456-33', helperText: 'Broj tekućeg računa u banci', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'tip_kamate', label: 'Kamatni ili bezkamatni?', type: 'radio', required: false, tooltip: 'Bezkamatni zajam između fizičkih lica može biti tretiran kao poklon od strane Poreske uprave za iznose preko 1.000.000 RSD. Za veće iznose preporučujemo konsultaciju sa poreskim savetnikom.', options: [
        { value: 'Sa kamatom', label: 'Sa kamatom' },
        { value: 'Bezkamatni', label: 'Bezkamatni' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'stopa', label: 'Godišnja kamatna stopa (%)', type: 'number', required: false, min: 0, helperText: 'Godišnja kamatna stopa u procentima (npr. 5)', tooltip: 'Zakonska zatezna kamata u Srbiji je referentna kamatna stopa NBS + 8 procentnih poena. Za ugovore između privrednih subjekata nema zakonskog maksimuma, ali preterana kamata može biti proglašena ništavom.', conditional: { field: 'tip_kamate', value: 'Sa kamatom' } },
      { id: 'obracun', label: 'Obračun kamate', type: 'radio', required: false, tooltip: 'Proporcionalni — kamata se računa na ostatak duga.\nKonformni — kamata se uračunava u rate unapred.', options: [
        { value: 'Proporcionalni', label: 'Proporcionalni' },
        { value: 'Konformni', label: 'Konformni' },
      ], conditional: { field: 'tip_kamate', value: 'Sa kamatom' } },
      { id: 'placanje_kamate', label: 'Plaćanje kamate', type: 'radio', required: false, tooltip: 'Kada se plaća kamata — mesečno, kvartalno, na kraju ili uz svaku ratu.', options: [
        { value: 'Mesečno', label: 'Mesečno' },
        { value: 'Kvartalno', label: 'Kvartalno' },
        { value: 'Na kraju', label: 'Na kraju' },
        { value: 'Uz svaku ratu', label: 'Uz svaku ratu' },
      ], conditional: { field: 'tip_kamate', value: 'Sa kamatom' } },
      { id: 'nacin_vracanja', label: 'Način vraćanja', type: 'radio', required: false, tooltip: 'Jednokratno — ceo iznos odjednom.\nMesečne rate — podjednake rate svaki mesec.\nBalonska otplata — male rate pa velika na kraju.', options: [
        { value: 'Jednokratno', label: 'Jednokratno' },
        { value: 'Mesečne rate', label: 'Mesečne rate' },
        { value: 'Kvartalne rate', label: 'Kvartalne rate' },
        { value: 'Balonska otplata', label: 'Balonska otplata' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'rok_vracanja', label: 'Datum vraćanja / plan rata', type: 'text', required: false, placeholder: 'npr. 01.01.2027. ili 12 mesečnih rata', helperText: 'Datum vraćanja ili plan otplate', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'prva_rata', label: 'Datum prve rate', type: 'date', required: false, helperText: 'Datum kada dospeva prva rata', conditional: { field: 'nacin_vracanja', value: 'Mesečne rate' } },
      { id: 'prevremena', label: 'Pravo prevremene otplate?', type: 'toggle', required: false, defaultValue: true, helperText: 'Opciono — uključite ako je potrebno', tooltip: 'Pravo zajmoprimca da vrati zajam pre roka bez dodatnih troškova.', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'sredstvo', label: 'Sredstvo obezbeđenja', type: 'radio', required: false, tooltip: 'Bez — nema posebnog obezbeđenja.\nMenica — hartija od vrednosti kao garancija.\nJemstvo — treće lice garantuje za dug.\nHipoteka — nekretnina kao obezbeđenje.', options: [
        { value: 'Bez', label: 'Bez' },
        { value: 'Menica', label: 'Menica' },
        { value: 'Jemstvo', label: 'Jemstvo' },
        { value: 'Hipoteka', label: 'Hipoteka' },
        { value: 'Ostalo', label: 'Ostalo' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'zatezna', label: 'Zatezna kamata', type: 'radio', required: false, tooltip: 'Zakonska — stopa koju propisuje NBS.\nUgovorna — dogovorena stopa između strana.', options: [
        { value: 'Zakonska', label: 'Zakonska' },
        { value: 'Ugovorna stopa', label: 'Ugovorna stopa' },
      ], conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
      { id: 'napomene', label: 'Napomene', type: 'textarea', required: false, placeholder: 'npr. Dodatni uslovi vraćanja, obezbeđenja, posebni dogovori...', helperText: 'Opciono — sve što želite dodatno da regulišete', conditional: { field: 'tip_dokumenta', value: 'Ugovor o zajmu' } },
    ],
  },
]
