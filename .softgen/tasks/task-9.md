---
title: Push notification service reminders
status: done
priority: high
type: feature
tags: [pwa, push-notifications, reminders, service-due]
created_by: agent
created_at: 2026-07-19T04:55:00Z
position: 9
---
## Notes
Send browser push notifications to users who opted in from a vehicle page, reminding them 1 day before their next service is due.

## Checklist
- [x] Add `push_subscriptions` table (vehicle_slug, endpoint, p256dh, auth, created_at).
- [x] Install `web-push` and generate VAPID keys.
- [x] Create `/api/subscribe` route to store push subscriptions.
- [x] Create `/api/send-reminders` route to find vehicles due tomorrow and send push notifications.
- [x] Update service worker to handle `push` events.
- [x] Add "Remind me" UI to public vehicle page.
- [x] Add VAPID env vars and document them.
- [x] Run check_for_errors.

## Acceptance
- A user taps "Remind me" on the vehicle page and receives a browser permission prompt.
- After allowing, the device is registered for that vehicle.
- 1 day before next_service_date, the user receives a push notification.
