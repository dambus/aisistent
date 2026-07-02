// Cist modul bez Node-only zavisnosti (fs, fontkit...) — bezbedan za import i u server
// modulima (pdfOverlay.ts) i u client komponentama (WizardView.tsx). Ne upisuje se
// automatska vrednost u polja sa ovim labelama, ni u overlay-u ni u wizard-u.
const SIGNATURE_LABELS = [
  'потпис', 'potpis', 'одговорно лице', 'odgovorno lice',
  'директор', 'direktor', 'ovlašćeno lice', 'ovlasceno lice',
  'lice ovlašćeno', 'lice ovlasceno', 'печат', 'pecat', 'м.п', 'м.п.',
];

export function isSignatureField(label: string | null): boolean {
  if (!label) return false;
  const l = label.toLowerCase();
  return SIGNATURE_LABELS.some((s) => l.includes(s));
}
