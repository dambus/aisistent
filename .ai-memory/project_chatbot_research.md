---
name: project-chatbot-research
description: Istraživanje kontekstualnog AI asistenta za srpsko preduzetništvo — chatbot integrisan sa korisničkim profilom
metadata:
  type: project
---

## Kontekstualni asistent — chatbot za srpsko preduzetništvo

**Status:** Istraživanje — u backlogu, nije blokiran tehnički, može se pokrenuti nezavisno.

**Ključna odluka:** Generički bot (samo system prompt) nema diferencijaciju — ChatGPT to već radi besplatno. Jedino što vredi je **kontekstualni asistent** koji zna profil firme, plan i istoriju dokumenata korisnika, i može da predloži ili triggeruje generisanje dokumenta.

**Why:** Ovo je jedina verzija koju ChatGPT ne može replicirati jer ne zna kontekst korisnika na platformi.

**MVP implementacija:**
- System prompt: srpsko poslovno znanje + disclaimer + kontekst iz baze (firma, plan, poslednji dokumenti)
- Prepoznaje intenciju → nudi shortcut ka generisanju dokumenta
- Rate limiting po planu: Free (5/dan), Starter+ (neograničeno)
- Cena tokena: ~$40/mes na 1000 korisnika × 5 pitanja — nije faktor

**Najveći rizik:** Pravna odgovornost. Srpski zakoni se menjaju, Claude knowledge cutoff može biti zastareo. Obavezni jak disclaimer — "informativno, ne pravni/poreski savet."

**RAG verzija** (dugoročno): Korpus ZOR, Zakon o PDV-u, paušal pravilnici — citira tačne članove. Vredna ali zahteva održavanje baze zakona.

**How to apply:** Kada se pokreće implementacija — fokus na kontekstualnu verziju, ne generički bot. Disclaimer je obavezan od prvog dana. Vidi `docs/BACKLOG.md`.
