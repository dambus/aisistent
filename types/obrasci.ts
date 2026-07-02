// Unifikovano polje za GuideView — tri eksplicitna stanja.
// Svaki GuideField nastaje kombinovanjem DI geometrijskog matchinga i semantičkog mapiranja.
export interface GuideField {
  id: string;
  label: string | null;
  suggestedValue: string | null;
  profileKey: string | null;
  isInternal: boolean;
  // 'high'   = DI confident match + vrednost iz profila → zeleno, direktno kopiraj
  // 'low'    = DI slabo pouzdan match + vrednost iz profila → narandžasto, proveri pre unosa
  // 'manual' = nema predloga (intern, null label, nije u profilu) → sivo, popuni sâm
  state: 'high' | 'low' | 'manual';
  // Kratka napomena za korisnika (npr. telefon podeljen u više polja obrasca) — prikazuje se kao sitan tekst ispod labele
  hint?: string | null;
}
