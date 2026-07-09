---
name: reference-plugin-export
description: Where the Claude Code plugin/marketplace config snapshot lives for transferring setup to a new machine
metadata:
  type: reference
---

`docs/claude-plugins-export.json` in the repo — snapshot of `extraKnownMarketplaces` + `enabledPlugins` from `~/.claude/settings.json` (taken 2026-07-09). Usage instructions in `docs/CLAUDE_PLUGINS_SETUP.md`.

**Why this exists:** laptop crashed mid-session with no git auth configured on the machine (no SSH key, no cached PAT) — surfaced that Claude Code's plugin setup itself wasn't portable either, only the code was (via git). This snapshot fixes that gap.

**How to apply:** when setting up a new machine, merge this JSON's two keys into `~/.claude/settings.json` and restart Claude Code — marketplaces refetch and plugins install/enable automatically. Doesn't cover MCP auth/API keys (per-machine, intentionally excluded). Re-export (overwrite the file) if the plugin set changes significantly — it's a point-in-time snapshot, not synced automatically. See also [[reference_installed_skills]] for what each bundle is used for.
