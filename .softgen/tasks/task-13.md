---
title: Remove PWA install prompt from public vehicle pages
status: in_progress
priority: high
type: bug
tags: [pwa, public-page, qr-code, manifest]
created_by: agent
created_at: 2026-07-23T16:30:00Z
position: 13
---

## Notes
Users scanning a QR code reach `/vehicle/[slug]` without logging in. The current setup shows an "Add to Home Screen" prompt via the PWA manifest, which is meant for admin users. Public pages should not prompt installation.

## Checklist
- [ ] Inspect where the PWA manifest link is registered.
- [ ] Remove the manifest/service-worker registration from the public vehicle page.
- [ ] Keep the PWA install capability for authenticated/admin routes.
- [ ] Validate the build.

## Acceptance
- Scanning a vehicle QR code no longer shows an "Add to Home Screen" prompt.
- Admin dashboard still supports install-to-home-screen.