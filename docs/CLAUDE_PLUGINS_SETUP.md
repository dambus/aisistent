# Claude Code — plugini/marketplace setup

Snapshot instaliranih Claude Code plugina i marketplace izvora (9. jul 2026.), za brzo podešavanje nove mašine.

## Šta je u `claude-plugins-export.json`

Dva ključa iz `~/.claude/settings.json`:
- `extraKnownMarketplaces` — git repo izvori (caveman, claude-code-skills, social-media-skills, agricidaniel-claude-seo, claude-plugins-official, thedotmack/claude-mem, openai-codex)
- `enabledPlugins` — lista uključenih plugina po marketplace-u

## Kako preneti na drugu mašinu

1. Otvori (ili napravi) `~/.claude/settings.json` na novoj mašini
2. Spoji sadržaj `docs/claude-plugins-export.json` u postojeći JSON — merge `extraKnownMarketplaces` i `enabledPlugins` ključeve, ne prepisuj ceo fajl ako već ima settings
3. Restartuj Claude Code — marketplace-i se fetch-uju i plugini instaliraju/enable-uju automatski

Ne pokriva: MCP server konfiguracije (API ključevi, auth tokeni) — to se podešava posebno po mašini, namerno se ne čuva u repou.
