---
title: Editable service reminder email template
status: in_progress
priority: high
type: feature
tags: [settings, reminders, email]
created_by: agent
created_at: 2026-07-21T21:12:22Z
position: 11
---
## Notes
Add a Workshop setting to customize the text of reminder emails sent to vehicle owners. Provide variable substitution for vehicle details.

## Checklist
- [x] Add `reminder_email_template` text column to `workshops`.
- [x] Update `Workshop` interface and save payload in `workshopService.ts`.
- [x] Add email template textarea in settings with variable hints.
- [x] Update `/api/reminders/send.ts` to use saved template with fallback default.
- [x] Validate build after changes.

## Acceptance
- Admin can edit the reminder email body in Settings.
- Sent reminders use the customized text with variables replaced.
- If no template is saved, a sensible default is used.