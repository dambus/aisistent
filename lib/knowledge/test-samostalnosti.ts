import type { KnowledgeTopic } from './types'

// Namerno NIJE u KNOWLEDGE_TOPICS/CONTRACT_TYPE_TOPICS (index.ts) — ta dva pogona
// getAllKnowledgeText() koji review-contract koristi kao "obavezni elementi ugovora"
// referencu (korak 3). Test samostalnosti je druga vrsta provere (odnos strana, ne
// sadržaj klauzula) i ubacuje se posebno, samo za ugovor-o-delu/ugovor-o-saradnji,
// preko getIndependenceTestKnowledge() u index.ts.
export const testSamostalnosti: KnowledgeTopic = {
  id: 'test-samostalnosti',
  naslov: 'Test samostalnosti preduzetnika',
  poslednjaProvera: '2026-07-16',
  pravniOsnov: 'Zakon o porezu na dohodak građana, čl. 85 (primena od 1.3.2020.)',
  sadrzaj: `Test samostalnosti proverava da li je paušalno oporezovani preduzetnik u stvarnosti nesamostalan (prikriveno zaposlen) u odnosu na nalogodavca. Test se sprovodi POSEBNO za svaki ugovorni odnos (svakog nalogodavca ponaosob) i primenjuje se i kad je nalogodavac strano pravno lice — u tom slučaju preduzetnik sam prijavljuje i plaća porez, jer strana firma nema obavezu obračuna po odbitku.

Devet kriterijuma:
1. Nalogodavac određuje radno vreme preduzetnika, ili njegov odmor/odsustva zavise od odluke nalogodavca (bez proporcionalnog umanjenja naknade za vreme odsustva)
2. Preduzetnik pretežno koristi prostorije koje obezbeđuje nalogodavac
3. Nalogodavac vrši stručno osposobljavanje ili usavršavanje preduzetnika
4. Nalogodavac je angažovao preduzetnika preko oglašavanja slobodnog radnog mesta ili posredstvom agencije za privremeno zapošljavanje
5. Nalogodavac obezbeđuje osnovna sredstva za rad (alat, opremu, materijal) ili rukovodi procesom rada preduzetnika
6. Preduzetnik je ostvario najmanje 70% ukupnog prihoda od jednog nalogodavca u periodu od 12 meseci
7. Preduzetnik obavlja poslove iz delatnosti nalogodavca bez preuzimanja uobičajenog poslovnog rizika (nema klauzule o odgovornosti/riziku za rezultat rada, izostaje mogućnost gubitka)
8. Ugovor sadrži odredbu koja zabranjuje preduzetniku da pruža usluge drugim nalogodavcima (osim konkurentima nalogodavca)
9. Preduzetnik obavlja poslove za istog nalogodavca 130 ili više radnih dana u periodu od 12 meseci

Prag: ako je ispunjeno najmanje 5 od 9 kriterijuma, preduzetnik se smatra nesamostalnim u tom odnosu. Posledica: prihod od tog nalogodavca se NE oporezuje kao prihod od samostalne delatnosti (paušal), nego kao "drugi prihodi" po stopi od 20% na bruto iznos, bez umanjenja za normirane troškove, uz dodatnu obavezu plaćanja doprinosa za PIO na istu osnovicu.

Napomena za procenu iz teksta ugovora: mnogi kriterijumi (npr. stvarno radno vreme, procenat prihoda od jednog nalogodavca, broj radnih dana) se ne mogu pouzdano utvrditi samo iz ugovora — moguće je proceniti samo ono što ugovor eksplicitno reguliše (npr. klauzula o zabrani rada za druge, odsustvo klauzule o poslovnom riziku, ko obezbeđuje opremu). Za kriterijume koji zavise od činjenica van teksta ugovora, treba označiti da se ne može utvrditi iz dostupnog teksta — ne pogađati.`,
}
