---
title: Bulk QR code generation and print page
status: in_progress
priority: high
type: feature
tags: [qr-codes, printing, vehicles]
created_by: agent
created_at: 2026-07-23T16:50:00Z
position: 14
---

## Notes
Admins need to select multiple vehicles and print their QR codes on a single page, optimized for paper (e.g. A4 sticker sheet).

## Checklist
- [ ] Inspect existing QR code page and vehicle service.
- [ ] Add vehicle selection UI with "Select all" and per-row checkboxes.
- [ ] Generate QR codes for selected vehicles using their public slug.
- [ ] Build a print-optimized layout (multiple QR codes per page with vehicle info).
- [ ] Add print button using window.print().
- [ ] Validate build.

## Acceptance
- Admin can select vehicles and print a page of QR codes.
- Each QR code links to the correct public vehicle page.