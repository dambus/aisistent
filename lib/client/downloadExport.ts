type ExportFormat = 'pdf' | 'docx'

export async function downloadExport(
  documentId: string,
  format: ExportFormat,
  overrideText?: string,
): Promise<string | null> {
  const res = await fetch(`/api/export/${format}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document_id: documentId,
      ...(overrideText ? { override_text: overrideText } : {}),
    }),
  })

  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    return (json as { error?: string }).error ?? 'Greška pri generisanju fajla.'
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = disposition.match(/filename="([^"]+)"/)
  a.href = url
  a.download = match?.[1] ?? `dokument.${format}`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  return null
}
