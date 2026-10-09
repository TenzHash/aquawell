# AquaWell Follow-up Fixes — 2026-10-08

## Confirmed from testing

- Customer ordering and generated `order_items.subtotal` are working after the database patch.
- Station Pickup now explicitly uses Cash only; Delivery remains COD.
- Admin audit writes are routed through a guarded `write_admin_audit_log` RPC so RLS cannot silently block the audit insert while the existing audit notification trigger remains active.
- Delivery rejection uses a guarded `reject_delivery_order` RPC because the existing orders RLS policy intentionally prevents a delivery rider from changing an assigned `rider_id` to NULL through a direct update.
- Staff/Delivery page backgrounds are explicitly forced to the shared dark/light surface colors.
- Staff/Delivery mobile header is now a single non-wrapping row; mobile controls are equal 40px buttons with icon-only labels, while desktop retains text labels.

## SQL to apply

Run `aquawell_followup_fixes_2026-10-08.sql` once in Supabase SQL Editor after the earlier `aquawell_order_audit_fix.sql` patch.

Do not delete or recreate users, orders, inventory, or other business data.
Do not run `supabase db push` for this targeted patch.

## Source files changed

- `src/pages/customer/CustomerDashboard.tsx` — Pickup cash-only rule and clear payment text.
- `src/pages/admin/AdminDashboard.tsx` — audit logging now calls `write_admin_audit_log`; duplicate direct notification insert removed because the database trigger owns that behavior.
- `src/pages/staff/StaffDashboard.tsx` — guarded rejection RPC, single-row mobile header, stronger page background theme.
- `src/index.css` — explicit Staff/Delivery dashboard solid background rules.

## Testing after applying

1. Admin performs an action that calls `addAuditLog`; confirm a row appears in `audit_logs` and a notification appears.
2. Delivery rider rejects a pending assigned delivery; confirm the order becomes `PENDING` and `rider_id` becomes NULL.
3. Staff and Delivery switch to dark mode; confirm the full page background changes, not only cards.
4. Test mobile width around 320–390px; header controls must stay on one row.
5. Customer chooses Station Pickup; UI must show Cash only and the order must still succeed.
