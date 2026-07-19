---
title: PWA install prompt on public vehicle page
status: done
priority: high
type: feature
tags: [pwa, install, qr, mobile]
created_by: agent
created_at: 2026-07-19T04:00:00Z
position: 8
---
## Notes
After scanning the QR code, users should be able to save the vehicle service page as an app on their home screen so they don't have to scan again. The installed app should open directly to that vehicle.

## Checklist
- [x] Add explicit PWA install button to public vehicle page.
- [x] Detect beforeinstallprompt event on Android/Chrome.
- [x] Show Safari iOS install instructions when prompt unavailable.
- [x] Verify installed app opens directly to the scanned vehicle page.
- [x] Run check_for_errors.

## Acceptance
- A user scanning a QR code sees a clear "Install App" button.
- Tapping it adds the vehicle page to their home screen.
- Opening the icon returns directly to that vehicle's service record.
