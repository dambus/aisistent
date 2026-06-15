# 003 — shadcn/ui migracija

**Datum:** jun 2026.
**Status:** Planiran — postepena migracija

## Odluka
Usvajamo shadcn/ui kao UI komponentnu biblioteku, postepeno.

## Zašto shadcn/ui
- Komponente se kopiraju direktno u projekat (nema zavisnosti)
- Tailwind-based — kompatibilno sa postojećim stackom
- Radix UI primitives ispod — dostupnost i keyboard nav rešeni
- Potpuna kontrola nad kodom

## Plan migracije (redosled)

### Faza 1 — Quick wins (uskoro)
- `ScrollArea` — zamena za native scroll u Sidebar-u (rešava ružni scrollbar)
- `Select` — zamena za `<select>` u arhiva filteru

### ✅ Faza 2 — Wizard komponente (jun 2026.)
- `Switch` — zamena za custom toggle polja ✅
- `Tooltip` — zamena za custom TooltipIcon ✅
- `AlertDialog` — za delete confirm u arhivi ✅
- Zelena tema (#1B6B4A) za radio, progress bar i focus ring ✅
- TooltipProvider dodat u app/layout.tsx ✅

### Faza 3 — Layout (planirano)
- `Sheet` — slide-in sidebar na mobilnom

## Šta NE migriramo odmah
Sve postojeće komponente koje rade dobro ostaju kako jesu.
Shadcn se dodaje samo za nove elemente ili kada ionako diramo stare.

## Instalacija
```bash
npx shadcn@latest init
npx shadcn@latest add scroll-area select switch tooltip dialog sheet
```

## Kada preispitati
Ako Tailwind v4 promeni API, ili ako se pojavi bolji alternativ.
