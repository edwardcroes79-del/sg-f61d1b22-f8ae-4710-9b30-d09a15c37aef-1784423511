---
title: Implement MFA with TOTP for administrators
status: done
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
- [x] Inspect Supabase MFA factor state and add helpers in authService.
- [x] Update login flow to detect MFA challenge and show TOTP input screen.
- [x] Add MFA enrollment UI in Settings (QR code + verify first code + recovery codes).
- [x] Add option to disable/unenroll MFA with confirmation.
- [x] Verify build and auth flows.

## Acceptance
- Admin can enable MFA from Settings.
- Login with MFA enabled requires TOTP code.
- Recovery codes are shown once during enrollment.
- MFA state is reflected in UI.