---
title: PWA install prompt on public vehicle page
status: in_progress
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
- [ ] Add explicit PWA install button to public vehicle page.
- [ ] Detect beforeinstallprompt event on Android/Chrome.
- [ ] Show Safari iOS install instructions when prompt unavailable.
- [ ] Verify installed app opens directly to the scanned vehicle page.
- [ ] Run check_for_errors.

## Acceptance
- A user scanning a QR code sees a clear "Install App" button.
- Tapping it adds the vehicle page to their home screen.
- Opening the icon returns directly to that vehicle's service record.
</end_of_turn>