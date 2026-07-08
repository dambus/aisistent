---
name: reference-installed-skills
description: Big set of Claude Code skills/plugins installed (2026-07-08) — categories and when to reach for them
metadata:
  type: reference
---

Milan installed large skill/plugin bundle 2026-07-08. Full list only visible in-session (system-reminder), not queryable standalone — if unsure whether one still exists, check `Skill` tool listing live instead of trusting this snapshot.

## Bundles installed

- **caveman** — token-compression mode (`/caveman`, cavecrew subagents: investigator/builder/reviewer for cheap delegated file lookups/edits/reviews). Already active this session via hook.
- **superpowers** — process skills: brainstorming (before creative work), systematic-debugging (before bug fixes), test-driven-development, writing-plans, executing-plans, subagent-driven-development, using-git-worktrees, verification-before-completion, requesting/receiving-code-review, finishing-a-development-branch. These are the ones most likely to auto-trigger on normal dev work in this repo.
- **engineering-skills** + **engineering-advanced-skills** — role-based specialists (senior-frontend/backend/fullstack/devops/security/ML/data/QA/architect...), plus infra tools (db-designer, migration-architect, ci-cd-pipeline-builder, dependency-auditor, observability-designer, rag-architect, mcp-server-builder, etc). Relevant if AIsistent work expands into infra/architecture territory.
- **product-skills** + **pm-skills** — product management routers (`cs-product`, `cs-pm`), prioritization/OKR/roadmap/UX-research/discovery tools, Jira/Confluence/Atlassian skills, sprint/scrum tools. Useful if Trello/backlog planning work wants a structured framework.
- **marketing-skills** — copywriting, SEO, CRO, pricing-strategy, launch-strategy, email-sequence, social/content tools. Relevant for AIsistent marketing texts, landing page, pricing decisions (ties to [[project_aisistent]] STRATEGIJA.md work).
- **claude-seo** — dedicated SEO suite (audit, schema, technical, backlinks, GEO/AI-search optimization, sitemap, local SEO). Relevant if aisistent.rs SEO work comes up.
- **social-media-skills** — post writers, hook generators, carousels/infographics, analytics dashboards, profile optimizers.
- **business-growth-skills** — contract/proposal writer, customer-success, revenue-ops, sales-engineer.
- Design/image generation: **brandkit, design-taste-frontend, gpt-taste, high-end-visual-design, image-to-code, imagegen-frontend-web/mobile, epic-design, redesign, redesign-existing-projects** — premium UI/visual design skills, useful for AIsistent frontend polish or marketing image generation.
- **dataviz** — chart/dashboard design system, read before building any chart/graph.
- **claude-api** — reference skill for Anthropic API/SDK details (models, pricing, caching, tool use) — read before answering Claude/API questions instead of relying on memory.
- Utility: **update-config** (settings.json/hooks/permissions changes), **keybindings-help**, **fewer-permission-prompts**, **loop** (recurring prompt on interval), **schedule** (cron cloud agents), **run** (launch/screenshot the app), **verify** (exercise a change end-to-end), **code-review** / **simplify** / **security-review** (diff review at various effort levels), **find-skills** (discover more skills), **init** (scaffold CLAUDE.md).

## How to apply

- Don't enumerate all of these unprompted — only reach for a bundle when the task matches (e.g. marketing-skills:copywriting for AIsistent landing copy, engineering-advanced-skills:migration-architect for a DB migration).
- Superpowers process skills (brainstorming, systematic-debugging, TDD) are the ones most likely relevant to routine AIsistent coding sessions — check those first per `using-superpowers` rule already active in this project.
- For AIsistent specifically: claude-seo + marketing-skills + product-skills are the highest-value bundles given it's a solo-founder SaaS in growth phase (see [[project_aisistent]], [[project_sprint_jun2026]]).
