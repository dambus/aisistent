---
name: project-aisistent
description: "AIsistent — web platforma za generisanje poslovnih dokumenata za srpsko tržište, u produkciji na aisistent.rs"
metadata: 
  node_type: memory
  type: project
---

AIsistent je u produkciji (aisistent.rs). MVP kompletiran jun 2026. Stack: Next.js 16, Supabase, Claude API (claude-sonnet-4-5), Vercel. 19 tipova dokumenata.

**Why:** B2B platforma za MSP, preduzetnike i freelancere na srpskom tržištu — specijalizovana alternativa ChatGPT-u sa srpskim pravom i wizard UX-om.

**How to apply:** Pre svake izmene čitati relevantni docs/ fajl (pogledati tabelu u CLAUDE.md). Production branch je `master` — sve ide direktno na Vercel.

## Trenutno blokirano
- Payment (Paddle) čeka APR registraciju preduzetnika
- APR API / PIB lookup čeka APR ugovor

## Email / notifikacije
- Waitlist skuplja emailove u Supabase (`waitlist` tabela)
- Resend šalje zahvalnicu na waitlist signup (sa 20% popust obećanjem)
- Bulk notifikacije će ići kroz n8n kada krene Paddle naplata

## Kritične konvencije
- Production branch: `master` (ne `main`)
- PDF font: uvek Roboto (ne Helvetica — ne podržava srpske dijakritike)
- PDF i DOCX moraju biti sinhronizovani (svaka promena u oba fajla)
- Toggle polja: uvek `defaultValue: false` (ne null/undefined)
- AI ne sme računati datume — ostaviti `___________`
- Iznosi slovima razdvojeno: "sto dvadeset hiljada" ne "stodvadeset"
- `sanitizeText()` obavezno za tekst koji ide u PDF (uklanja ćirilicu)
- Disclaimer samo u PDF footeru, nikad u telu dokumenta
