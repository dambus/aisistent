import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/resend'

const VALID_PLANS = ['starter', 'pro'] as const

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
}

const FROM_EMAIL = 'AIsistent <noreply@aisistent.rs>'

function buildWaitlistEmailHtml(plan: string): string {
  const planLabel = PLAN_LABELS[plan] ?? plan
  return `<!DOCTYPE html>
<html lang="sr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Uspešno ste se prijavili — AIsistent</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation"
       style="background:#f3f4f6;padding:32px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" role="presentation"
           style="background:#ffffff;border-radius:12px;overflow:hidden;
                  box-shadow:0 2px 8px rgba(0,0,0,.08);max-width:560px;width:100%;">
      <tr>
        <td style="background:#1B6B4A;padding:18px 28px;">
          <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-.5px;">
            AIsistent
          </span>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 28px 24px;">
          <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;line-height:1.3;">
            Hvala što ste se prijavili!
          </p>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
            Uspešno ste rezervisali mesto na listi čekanja za
            <strong>${planLabel}</strong> plan.
          </p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151;">
            Čim AIsistent zvanično krene sa radom, bićete prvi obavešteni —
            uz <strong style="color:#1B6B4A;">20% popusta</strong> na prvi mesec
            kao zahvalnost za vaše poverenje.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;">
          <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280;">
            AIsistent je poslovni asistent za srpske preduzetnike — generisanje
            ugovora, faktura, HR dokumenata i još mnogo toga, prilagođeno srpskom
            pravu i jeziku.
            <br><br>
            <a href="https://aisistent.rs"
               style="color:#1B6B4A;text-decoration:none;font-weight:600;">aisistent.rs</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb;border-top:1px solid #e5e7eb;
                   padding:12px 28px;text-align:center;">
          <span style="font-size:12px;color:#9ca3af;">
            Automatski mejl — ne odgovarajte na ovu poruku.
          </span>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

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

  // Duplicate email+plan — still success, but skip sending email again
  if (error && error.code !== '23505') {
    console.error('[waitlist]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  if (!error) {
    const { error: sendError } = await getResend().emails.send({
      from: FROM_EMAIL,
      to: email.trim(),
      subject: 'Rezervisali ste mesto — AIsistent stiže uskoro',
      html: buildWaitlistEmailHtml(plan as string),
    })

    if (!sendError) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('waitlist')
        .update({ email_sent: true })
        .eq('email', email.toLowerCase().trim())
        .eq('plan', plan)
    } else {
      console.error('[waitlist] resend error:', sendError)
    }
  }

  return NextResponse.json({ ok: true })
}
