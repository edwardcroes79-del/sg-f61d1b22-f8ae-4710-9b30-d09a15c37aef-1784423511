---
title: PWA install for public vehicle page
status: in_progress
priority: medium
type: feature
tags: [pwa, mobile, install, qr]
created_by: agent
created_at: 2026-07-19T03:48:00Z
position: 7
---

## Notes
Make the public `/vehicle/[slug]` page installable as a native-like app on the customer's home screen after scanning the QR code. The install icon, theme color, and app name should reflect the workshop's uploaded logo and brand colors.

## Checklist
- [ ] Create `public/sw.js` to cache the public page and assets for offline access.
- [ ] Create `src/pages/api/manifest.ts` to serve a dynamic manifest with workshop name, colors, and logo as icons.
- [ ] Add global PWA meta tags and manifest link in `src/pages/_document.tsx`.
- [ ] Register the service worker in `src/pages/_app.tsx`.
- [ ] Add per-vehicle PWA meta tags (theme-color, apple-mobile-web-app-title, apple-touch-icon) in `src/pages/vehicle/[slug].tsx`.

## Acceptance
- Scanning a QR code and opening the public vehicle page shows an "Add to Home Screen" prompt on supported Android devices.
- The installed app icon uses the workshop logo and the app name is the workshop name.
- The splash/theme color matches the workshop's primary color.
</end_of_turn>