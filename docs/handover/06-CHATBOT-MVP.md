# Kontekstualni chatbot — MVP implementaciono uputstvo

*BACKLOG istraživanje → MVP. Jedina vredna verzija: integrisana sa profilom/dokumentima (zna firmu, plan, istoriju; može da pokrene generisanje). Generički bot = nula diferencijacije, NE raditi.*

## Pre početka pročitati

- `docs/BACKLOG.md` sekcija "[ISTRAŽIVANJE] Kontekstualni asistent" — analiza verzija i rizika
- `.ai-memory/project_chatbot_research.md` — zaključci istraživanja
- `app/api/improve/route.ts` — najbliži postojeći pattern (Claude poziv + plan-based rate limit)
- `lib/utils/documentTypes.ts` — lista tipova za intent → dokument mapping

## Arhitektura MVP-a

```
components/chat/ChatPanel.tsx (Sheet, dugme u dashboard sidebar-u)
        ↓ POST /api/chat  { messages: [...] }
app/api/chat/route.ts:
  1. auth + rate limit (free 5/dan, starter+ neograničeno — plan config!)
  2. učitaj kontekst: profil firme (naziv, pravna forma, pdv_obveznik, delatnost),
     plan, poslednjih 5 dokumenata (type + title + created_at) — NE ceo sadržaj
  3. Claude poziv (claude-sonnet-4-5) sa system promptom + tool-use za "predloži dokument"
  4. vrati odgovor + opcioni { suggestedDocument: 'ugovor-o-radu' }
```

## System prompt — ključne komponente (pisati u `lib/prompts/chat-asistent.ts`)

1. Uloga: asistent za srpsko preduzetništvo na platformi AIsistent
2. Kontekst korisnika (interpolisan): firma, oblik, PDV status, plan, skorašnji dokumenti
3. **Disclaimer pravila (OBAVEZNO, pravni rizik):** svaki odgovor koji dodiruje porez/zakon/rokove završava napomenom da je informativno i da se konsultuje računovođa/pravnik; NIKAD ne tvrditi tačne iznose poreskih stopa/limita bez ograde da se menjaju
4. Intent → akcija: kada korisnik opisuje potrebu koju pokriva neki od tipova platforme, predloži KONKRETAN tip + ponudi pokretanje (`/dokumenti/<type>`) — lista tipova sa opisima interpolirana iz `documentTypes`
5. Odbijanje van scope-a: teme van poslovanja preusmeriti kratko

## Tool-use pattern za predlog dokumenta

Umesto parsiranja teksta, dati Claude-u tool `suggest_document { type: enum[...], reason: string }` — API vrati to klijentu, UI renderuje dugme "Kreiraj →" ka wizardu. Zbog ovoga NE treba parsirati odgovor regexom.

## Rate limit / trošak

- Free: 5 pitanja/dan (upgrade nudge posle), Starter+: fer neograničeno (npr. 100/dan tehnički cap)
- `max_tokens: 1024` za odgovore — chat, ne esej
- Koristiti rate limit helper iz 01-TECH-DEBT stavke 2 ako je urađen; NE još jedan in-memory Map

## Faze

- **MVP**: gore opisano, bez istorije razgovora u bazi (samo client-side state sesije)
- **V2**: tabela `chat_conversations` + istorija; "nastavi razgovor"
- **V3 (dugoročno)**: RAG sa zakonima — poseban projekat, ne mešati u MVP

## Kriterijumi gotovosti

1. Chat radi za auth korisnike, kontekst firme tačan (pitati "koja je moja firma?" → tačan odgovor)
2. "Kako da zaposlim radnika?" → predlaže ugovor-o-radu sa dugmetom ka wizardu
3. Pitanje o PDV stopi → odgovor SA disclaimerom
4. Free nalog: 6. pitanje istog dana → upgrade poruka
5. Sve na srpskom; tsc čisto; BACKLOG/PROGRESS ažurirani

## Zamke

- NE slati ceo sadržaj dokumenata u kontekst (token trošak + privatnost) — samo meta
- Claude zna zakone do svog cutoff-a — zato disclaimer NIJE opcion
- Streaming odgovora: lepše UX ali komplikuje; MVP može bez streaminga, dodati kasnije
- Ne praviti novu chat biblioteku — običan fetch + state, Sheet iz `components/ui/`
