# Security and Compliance Notes

## Non-negotiables

- No secrets in frontend JavaScript.
- Every tenant query must filter by tenant_id.
- Never trust tenant_id from the browser without checking tenant_users.
- Validate payment amounts server-side.
- Verify payment callbacks and references.
- Log payout detail changes.
- Restrict uploads to jpg, png and webp.
- Rename uploaded files server-side.
- Store minimal customer data.

## Practical Zimbabwe/POTRAZ-aware posture

Sale Company should act as commerce infrastructure, not a bank or wallet. Use terms like settlement and pending payout, not wallet or stored value. Keep data minimised and create clear privacy, deletion and breach procedures before scale.

## Dashboard controls

- Strong auth for admin.sale.co.zw
- Separate tenant dashboard and platform admin
- Rate-limit login and payment routes
- 2FA later for payout/payment settings
- 24-hour cooldown for payout account changes
