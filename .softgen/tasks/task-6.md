---
title: Image compression and dashboard list caching
status: in_progress
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
- [ ] Add `compressImage` helper using canvas with max width/quality.
- [ ] Add lightweight `queryCache` utility with `getQuery`, `setQuery`, `invalidateQueries`.
- [ ] Cache vehicle list with keyword key; refresh when keyword changes; invalidate on create/update/delete.
- [ ] Cache customer list with keyword key; refresh when keyword changes; invalidate on create/update/delete.
- [ ] Use compressed image for vehicle header upload.
- [ ] Use compressed images for service-record attachments.
- [ ] Run check_for_errors.

## Acceptance
- Vehicle header uploads are compressed before reaching Supabase Storage.
- Vehicle/customer lists do not refetch on every navigation within a session.
- After adding/editing a vehicle or customer, the list updates on next visit.
</end_of_turn>