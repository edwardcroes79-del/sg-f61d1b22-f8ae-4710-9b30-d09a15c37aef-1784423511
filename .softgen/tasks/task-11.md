---
title: Editable service reminder email template
status: done
priority: high
type: feature
tags: [settings, reminders, email]
created_by: agent
created_at: 2026-07-21T21:15:00Z
position: 11
---
## Notes
Allow workshop admins to customize the plain-text email sent for service reminders.

## Checklist
- [x] Add `reminder_email_template` text column to `workshops`.
- [x] Update `Workshop` interface and save payload in `workshopService.ts`.
- [x] Add email template textarea in settings with variable hints.
- [x] Update `/api/reminders/send.ts` to use saved template with fallback default.
- [x] Validate build after changes.

## Acceptance
- Settings shows an editable "Reminder Email Template" field with variable hints.
- Saving settings persists the customized template.
- The send-reminders API uses the customized text with variables replaced.
- If no template is saved, a sensible default is used.