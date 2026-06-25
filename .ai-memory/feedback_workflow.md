---
name: feedback-workflow
description: "Radni principi koje je Milan eksplicitno uspostavio — commit+push zajedno, modal UX, deterministički srpski"
metadata: 
  node_type: memory
  type: feedback
---

Uvek commit AND push zajedno.

**Why:** Commit-without-push prouzrokovao debugging confuziju mid-session.

**How to apply:** Svaki put kada se završava rad na kodu, finalni korak mora biti i `git commit` i `git push` — nikad samo commit.

---

Error UX koristi modals, ne stacked error banners.

**Why:** Milan je eksplicitno korigovao ovaj pattern.

**How to apply:** Kada prikazujem error stanja u UI-u, koristiti modal (shadcn Dialog) umesto višestrukih error poruka/banera na strani.

---

Deterministički sistemi preferirani nad AI-inferred za srpski jezik.

**Why:** Milan koriguje lingvističke greške. Srpska gramatika je hard requirement, ne best-effort.

**How to apply:** Za srpski jezik koristiti `lib/utils/vocative.ts` i `lib/utils/rod.ts` — nikad oslanjati se na AI da "pogodi" pravilan oblik.
