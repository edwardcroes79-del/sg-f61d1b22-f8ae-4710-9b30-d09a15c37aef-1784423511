---
title: Service Records & Public Vehicle Page
status: todo
priority: high
type: feature
tags: [service-records, public-page, timeline]
created_by: agent
created_at: 2026-07-14T20:06:00Z
position: 5
---

## Notes
Service record CRUD for admins and the public read-only vehicle page customers see when scanning QR codes.

## Checklist
- [ ] Create service record add/edit form
- [ ] Build service history timeline component
- [ ] Upload service images (before/after) to Storage
- [ ] Build public vehicle page at `/vehicle/[slug]`
- [ ] Display vehicle info, service status, and history
- [ ] Show next service countdown and progress
- [ ] Apply workshop branding to public page
- [ ] Handle overdue services with red highlighting

## Acceptance
- Admin can add/edit service records with images
- Public page loads without login via QR code URL
- Service timeline shows newest first
- Next service countdown displays correctly
- Overdue services are clearly marked