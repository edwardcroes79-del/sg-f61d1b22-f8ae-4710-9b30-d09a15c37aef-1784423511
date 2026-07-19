---
title: Image compression and dashboard list caching
status: done
priority: high
type: feature
tags: [cost-optimization, performance, images, caching]
created_by: agent
created_at: 2026-07-19T01:29:27Z
position: 6
---
## Notes
Reduce Supabase storage and database read costs by:
- Compressing vehicle header images and service-record attachments before upload.
- Caching dashboard list queries (vehicles, customers, service records) in memory with stale-while-revalidate behavior and mutation invalidation.

## Checklist
- [x] Add `compressImage` helper using canvas with max width/quality.
- [x] Add lightweight `queryCache` utility with `getQuery`, `setQuery`, `invalidateQueries`.
- [x] Cache vehicle list with keyword key; refresh when keyword changes; invalidate on create/update/delete.
- [x] Cache customer list with keyword key; refresh when keyword changes; invalidate on create/update/delete.
- [x] Use compressed image for vehicle header upload.
- [x] Use compressed images for service-record attachments.
- [x] Run check_for_errors.

## Acceptance
- Vehicle header uploads are compressed before reaching Supabase Storage.
- Vehicle/customer lists do not refetch on every navigation within a session.
- After adding/editing a vehicle or customer, the list updates on next visit.
