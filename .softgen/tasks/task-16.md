---
title: Manual test reminder button on vehicle page
status: done
priority: high
type: feature
tags: [reminders, vehicle, dashboard, testing]
created_by: agent
created_at: 2026-07-23T17:00:00Z
position: 16
---

## Notes
Add a button to the vehicle detail dashboard page that sends a test service reminder email to the customer's registered email, regardless of due date.

## Checklist
- [x] Create `/api/reminders/send-test.ts` endpoint.
- [x] Reuse reminder template and SMTP config.
- [x] Add button to vehicle detail page.
- [x] Show toast/alert with result.
- [ ] Validate build.

## Acceptance
- Admin can click "Send Test Reminder" on any vehicle.
- Email is sent to the customer email from the `customers` table.
- UI shows success or error message.