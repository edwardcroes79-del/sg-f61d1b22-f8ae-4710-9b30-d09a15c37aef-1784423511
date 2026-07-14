# Torque Log — QR Digital Vehicle Service Record

## Vision
A premium QR-based vehicle service record platform for automotive workshops. Admins manage all records through a branded dashboard. Customers scan a QR code to view their complete service history — no login required.

## Design
- **Evocation:** German service bay precision meets Linear dashboard. Workshop order tickets, Monroney stickers.
- **Emotional signature:** Calm competence — exacting care, transparent records.
- **Palette:**
  - `--background: 40 20% 97%` (warm paper #F8F7F4)
  - `--foreground: 222 47% 11%` (deep ink #0F172A)
  - `--primary: 32 93% 43%` (copper/amber #D97706)
  - `--secondary: 215 19% 35%` (steel #64748B)
  - `--accent: 32 93% 43%` (copper)
  - `--muted: 40 12% 92%` (subtle warm grey)
  - `--success: 160 84% 32%` (#059669)
  - `--danger: 0 72% 50%` (#DC2626)
- **Typography:** Sora (headings, 600/700) · IBM Plex Sans (body, 400/500) · IBM Plex Mono (data/VIN/mileage, 400/500)
- **Cards:** rounded-2xl, layered shadows (shadow-sm → shadow-md), generous padding
- **Data:** tabular-nums for all numeric vehicle data
- **Public page:** carries workshop branding (logo, colors, contact)

## Features
- Admin auth (Supabase Auth, email/password)
- Dashboard overview (stats, upcoming services)
- Customer CRUD
- Vehicle CRUD with unique QR slug
- Service record timeline
- Image/PDF upload (Supabase Storage)
- Public read-only vehicle page via `/vehicle/[slug]`
- Search (plate, name, phone, VIN, make, model)
- Brand customization
- Export records (PDF)