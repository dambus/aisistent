/**
 * Novčani iznosi (broj + valuta, npr. "50.000,00 dinara") se ne menjaju kroz
 * padeže u srpskom — menja se samo rečenica oko njih. Ova funkcija postoji
 * kao eksplicitan no-op tool poziv: uklanja iz LLM-a bilo kakvu nedoumicu ili
 * pokušaj da "deklinuje" iznos.
 */
export function declineAmount(amount: string): string {
  return amount
}
