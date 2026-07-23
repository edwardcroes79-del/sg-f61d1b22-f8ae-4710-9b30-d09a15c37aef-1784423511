---
title: Implement MFA with TOTP for administrators
status: in_progress
priority: high
type: feature
tags: [auth, mfa, security, supabase]
created_by: agent
created_at: 2026-07-23T19:50:00Z
position: 18
---

## Notes
Add TOTP-based multi-factor authentication for admin accounts using Supabase Auth MFA. Admins can enable MFA in Settings, and login requires TOTP verification when enabled.

## Checklist
- [ ] Inspect Supabase MFA factor state and add helpers in authService.
- [ ] Update login flow to detect MFA challenge and show TOTP input screen.
- [ ] Add MFA enrollment UI in Settings (QR code + verify first code + recovery codes).
- [ ] Add option to disable/unenroll MFA with confirmation.
- [ ] Verify build and auth flows.

## Acceptance
- Admin can enable MFA from Settings.
- Login with MFA enabled requires TOTP code.
- Recovery codes are shown once during enrollment.
- MFA state is reflected in UI.