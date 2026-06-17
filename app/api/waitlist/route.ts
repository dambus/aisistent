import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_PLANS = ['starter', 'pro', 'business'] as const

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, plan } = body as { email?: unknown; plan?: unknown }

  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }
  if (!VALID_PLANS.includes(plan as typeof VALID_PLANS[number])) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('waitlist')
    .insert({ email: email.toLowerCase().trim(), plan })

  // Duplicate email+plan — still success
  if (error && error.code !== '23505') {
    console.error('[waitlist]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
