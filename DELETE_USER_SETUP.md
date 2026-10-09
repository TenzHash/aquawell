# AquaWell: Permanent Auth User Deletion

## What changed

The Admin → Customers → Delete action now calls the Supabase Edge Function `delete-user` instead of deleting only the `customers` row.

The Edge Function:

1. Verifies the caller's Supabase session.
2. Verifies the caller has `profiles.role = 'admin'`.
3. Refuses to delete the currently signed-in admin.
4. Refuses to delete another administrator through the customer directory.
5. Removes linked customer/staff/notification/audit rows where safe.
6. Permanently deletes the target account from `auth.users` using the Supabase Admin API.
7. Removes the `profiles` row when the user has no historical orders.
8. Preserves historical orders when they reference the user's profile, avoiding accidental loss of order history.

## Deploy

From the AquaWell project root:

```bash
supabase functions deploy delete-user
```

The Edge Function uses the standard Supabase server environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

These are supplied to deployed Supabase Edge Functions by the Supabase platform. **Do not put `SUPABASE_SERVICE_ROLE_KEY` in Vite/React code or `.env` variables exposed to the browser.**

If your local Supabase CLI setup requires explicit secrets, set the service-role secret through the Supabase secrets mechanism before deployment.

## Important behavior

Deleting a customer with existing orders does **not** delete those historical orders. The Auth account is still permanently removed, while the profile may remain as a non-login historical reference if the database relationship requires it.

If the Edge Function returns `cleanupErrors`, the Auth account deletion still succeeded. Review the listed application-table cleanup errors rather than attempting to delete the Auth user again.
