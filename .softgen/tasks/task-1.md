---
title: Design System & Database Schema
status: in_progress
priority: urgent
type: chore
tags: [design-system, database, schema]
created_by: agent
created_at: 2026-07-14T20:06:00Z
position: 1
---

## Notes
Set up the complete design system (globals.css, tailwind.config.ts) and create all Supabase tables with RLS policies. This is the foundation for everything else.

## Checklist
- [x] Convert brand hex colors to HSL and define CSS variables in globals.css
- [x] Configure tailwind.config.ts with custom colors, fonts, and animations
- [x] Create `workshops` table for branding settings
- [x] Create `customers` table for customer profiles
- [x] Create `vehicles` table with unique QR slug
- [x] Create `service_records` table for service history
- [x] Create `service_images` table for service photos
- [x] Enable RLS on all tables with appropriate policies
- [x] Generate Supabase types after schema creation

## Acceptance
- All CSS variables render correctly in preview
- Database schema is queryable with no permission errors
- Tables have appropriate RLS policies for admin-only write, public read on vehicles