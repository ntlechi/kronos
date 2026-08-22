# Kronos Free vs Pro

New workspaces start on **Free**. Stripe checkout is stubbed (`coming soon`) — no charges yet.

## Free (always on)

- Pulse (day / week / month), burnout floor, quick log, Focus Runner
- Up to **6 activities** and **8 skills**
- **30-day** history
- This week's review
- One workspace

## Pro ($12 CAD / month, Stripe later)

- Unlimited activities, skills, and history (including year)
- 12-week seasons (3 priorities)
- Cash logs, hourly rate → time-as-capital
- Export (with Stripe)

## Enforcement

- `Tenant.plan` is `free` | `pro` (`stripeCustomerId` / `stripeSubscriptionId` reserved)
- APIs return **402** `{ error: "plan_limit", code, upgrade: "/pricing" }`
- Demo seed `janara` is **pro** so the 9-brand workspace stays usable

## Public page

`/pricing` is unauthenticated — share from Arsitech and Survive Backpacking.

Legal pages (public): `/privacy` and `/terms`. Privacy officer: privacy@oskronos.com (forward to your inbox).
