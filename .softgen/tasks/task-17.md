---
title: Clear old reminder delivery log
status: done
priority: medium
type: feature
tags: [settings, reminders, delivery-log, cleanup]
created_by: agent
created_at: 2026-07-23T17:15:00Z
position: 17
---

## Notes
Add a button in Settings > Service Reminders > Delivery Log to delete old reminder delivery log entries.

## Checklist
- [x] Add `DELETE` endpoint `/api/reminders/log` to clear old log entries.
- [x] Add "Clear old log" button in settings UI.
- [x] Add confirmation dialog before deletion.
- [x] Refresh delivery log after clearing.

## Acceptance
- Admin can clear old reminder delivery log entries from settings.
- Log table updates immediately.