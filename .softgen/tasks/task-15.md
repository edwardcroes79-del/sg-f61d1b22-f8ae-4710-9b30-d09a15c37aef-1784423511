---
title: Fix service reminders to use registered customer emails
status: in_progress
priority: high
type: feature
tags: [reminders, email, customers]
created_by: agent
created_at: 2026-07-23T16:50:00Z
position: 15
---

## Notes
Reminders should be sent 1 day and 1 week before the next service date, but only to customers whose email is registered in the system. Currently reminders rely on a public subscription form. We should source emails from the customers table.

## Checklist
- [ ] Inspect current reminder API and preferences table.
- [ ] Change reminder logic to pull customer emails from `customers.email`.
- [ ] Remove dependency on public `reminder_preferences` for cron-driven reminders (keep public opt-out if needed).
- [ ] Ensure 1-day and 1-week reminders are sent once per due date.
- [ ] Validate build.

## Acceptance
- Cron/send-reminders sends emails to registered customer emails only.
- 1-day and 1-week reminders are triggered correctly.
- No duplicate sends for the same due date.