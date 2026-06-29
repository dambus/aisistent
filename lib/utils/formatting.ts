export function fmtNum(n: number): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtDate(iso: string, fallback = ''): string {
  if (!iso) return fallback
  const d = new Date(iso)
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}.`
}
