---
title: Fix PWA manifest branding and stale settings chunk
status: done
priority: urgent
type: bug
tags: [pwa, manifest, service-worker, branding, build-cache]
created_by: agent
created_at: 2026-07-23T15:48:00Z
position: 12
---

## Notes
- Phone-installed app shows wrong name/logo because `/api/manifest` selects a missing `background_color` column, causing Supabase to return no workshop data.
- Settings page throws a stale `.host` error from an old build chunk.

## Checklist
- [x] Add `background_color` column to `workshops`.
- [x] Fix `/api/manifest.ts` to query existing columns only.
- [x] Update service worker to use network-first for manifest and logo URLs.
- [x] Ensure vehicle public page links to manifest with its slug.
- [x] Wipe build cache, rebuild, and restart server.
- [x] Validate with `check_for_errors`.

## Acceptance
- Phone-installed app shows the uploaded workshop logo and name.
- Settings page loads without the `.host` runtime error.