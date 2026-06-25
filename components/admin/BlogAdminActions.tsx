'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  published: boolean
  title: string
}

export function BlogAdminActions({ id, published, title }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function toggle() {
    setBusy(true)
    await fetch('/api/admin/blog', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, published: !published }),
    })
    router.refresh()
    setBusy(false)
  }

  async function del() {
    if (!confirm(`Obriši „${title}"? Ova akcija je nepovratna.`)) return
    setBusy(true)
    await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
    setBusy(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={busy}
        className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
          published
            ? 'bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20'
            : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-green-500/15 hover:text-green-400 hover:border-green-500/20'
        } disabled:opacity-40`}
      >
        {published ? '● Objavljeno' : '○ Draft'}
      </button>
      <button
        onClick={del}
        disabled={busy}
        className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-600 border border-zinc-800 hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20 transition-all disabled:opacity-40"
      >
        Obriši
      </button>
    </div>
  )
}
