---
title: Configurable service reminders via SMTP
status: in_progress
priority: high
type: feature
tags: [reminders, smtp, cron, notifications, settings]
created_by: agent
created_at: 2026-07-20T19:36:33Z
position: 10
---
## Notes
Users scanning the QR code should be able to subscribe to service reminders with their email and choose when to be notified (1 day before, 1 week before, or both). The admin can send reminders manually and view a delivery log on the settings page. Emails are sent via SMTP using environment variables.

## Checklist
- [x] Add `reminder_preferences` table with email, lead_time options (1d, 7d), subscribed_at.
- [x] Add `reminder_deliveries` log table with status, sent_at, error_message.
- [x] Update vehicle public page UI to let users enter email and pick reminder lead times.
- [x] Create `/api/reminders/preferences` endpoint to save preferences.
- [x] Create `/api/reminders/send` endpoint for manual + cron sending via SMTP.
- [x] Create `/api/reminders/log` endpoint to fetch delivery log.
- [x] Add cron endpoint `/api/reminders/cron` that runs daily and sends due reminders.
- [x] Add settings page "Reminders" section with delivery log, manual send button, and SMTP status.
- [ ] Document required SMTP environment variables.
- [ ] Run check_for_errors.

## Acceptance
- A customer can enter their email on the vehicle page and choose 1-day / 7-day reminders.
- Admin can click "Send due reminders now" and see success/failure in the log.
- `/api/reminders/cron` can be called by a cron job and sends emails only for due reminders.
- Settings page shows a table of recent deliveries with status and timestamp.