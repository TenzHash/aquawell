# AquaWell Account Management Update

This revision addresses the account synchronization and recovery issues identified during testing.

## Implemented

1. **Orphaned Supabase Auth accounts**
   - Added `resolve-user-account` Edge Function.
   - Successful login now synchronizes Auth identity with `profiles`, `customers`, or `staff`.
   - Existing staff/customer records can be linked to the authenticated Auth user when their email identifies the account.
   - Completely orphaned Auth users are provisioned as customer accounts using Auth metadata.
   - The frontend does not query `auth.users` directly.

2. **Login error handling**
   - Invalid credentials now produce a clear login message.
   - Unconfirmed accounts receive a clear message instead of a database/schema error.
   - If the Auth account cannot be synchronized, the user receives an actionable administrator message.
   - Staff/Delivery role routing remains based on the repaired role.

3. **Duplicate registration handling**
   - Existing registration emails are reported as already used instead of exposing database constraint errors.
   - Supabase Auth duplicate identity responses are handled before creating public customer records.

4. **Password recovery fallback**
   - Login includes a normal `Forgot password?` email-reset action.
   - Admin Dashboard can generate a new temporary password through `admin-reset-user-password` when email delivery is unavailable or rate-limited.
   - Existing Change Password functionality is preserved.

5. **Admin-created staff/delivery accounts**
   - Admin creation now uses `create-staff-user` instead of inserting only a public staff row.
   - Auth account is automatically email-confirmed.
   - Existing orphaned Auth identities can be reused rather than duplicated.
   - Temporary credentials remain visible in a modal until the Admin closes it.

6. **Admin-created customer accounts**
   - Customer creation uses `create-customer-user`.
   - Admin-created accounts are automatically email-confirmed.
   - Existing orphaned Auth identities can be repaired/reused.
   - Temporary credentials remain visible until the Admin closes the modal.

7. **Preservation of existing functionality**
   - Admin, Staff, Delivery, and Customer dashboards remain in place.
   - Dark mode remains in place.
   - Change Password remains in place.
   - Delivery role routing remains in place.
   - Existing order, inventory, sales, reports, forecasting, customer, and staff workflows were not intentionally removed.

## Edge Functions to deploy

```bash
supabase functions deploy create-staff-user
supabase functions deploy create-customer-user
supabase functions deploy resolve-user-account
supabase functions deploy admin-reset-user-password
supabase functions deploy repair-user-login
supabase functions deploy update-user-email
supabase functions deploy delete-user
```

All of these functions require JWT verification in `supabase/config.toml` and use the server-side Supabase service-role key only inside Edge Functions.

## Verification

- TypeScript project check: **PASS** (`tsc -b`)
- Vite production build: not completed in this environment because the supplied `node_modules` is missing the Rolldown native optional binding. This is a dependency/environment issue, not a TypeScript error in the updated source.
