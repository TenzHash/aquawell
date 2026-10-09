# AquaWell Corrected Source Package

This package contains the corrected AquaWell source based on the uploaded `aquawell(3).zip`.

## Corrected areas

1. **Trusted account-role routing**
   - Login resolution no longer treats `user_metadata.role` as an authorization source.
   - Staff/Delivery routing uses the application staff/profile records.
   - Customer routing uses the application customer/profile records.
   - Completely orphaned Auth users are provisioned only as customers.

2. **Customer account deletion**
   - Admin customer deletion now calls the secure `delete-user` Edge Function when a linked profile/Auth user exists.
   - Legacy customer rows without a profile are deleted only as orphaned directory records; no unverified Auth account is guessed or deleted.

3. **Staff account deletion**
   - Admin staff deletion now uses `delete-user` when a linked profile/Auth user exists.
   - Legacy staff rows without a profile are treated as orphaned records.

4. **Historical audit preservation**
   - `delete-user` detaches `audit_logs.user_id` instead of deleting audit history.
   - Orders remain preserved by detaching nullable customer/rider references before Auth deletion.

5. **Staff portal inventory requirement**
   - Staff Dashboard no longer maintains an inventory state or loads the inventory module on dashboard startup.
   - Existing walk-in sales functionality remains; it performs a targeted inventory lookup only when a sale is recorded so stock and pricing can still be validated.
   - Customer and Admin inventory functionality remains unchanged.

6. **Existing features preserved**
   - Change Password remains available.
   - Theme toggle remains available.
   - Admin temporary-password credential modal remains available.
   - Customer temporary-password credential modal remains available.
   - Customer ordering remains Pickup or Delivery/COD.
   - Existing Admin, Staff/Delivery, Customer, sales, order, reporting, and inventory features were not intentionally removed except the Staff inventory dashboard/module behavior requested by the project requirements.

## Important deployment note

The source includes the Edge Functions under `supabase/functions/`.

Deploy the corrected functions after reviewing the project:

- `resolve-user-account`
- `delete-user`

The existing creation/reset/email functions are included unchanged unless their source was not part of the requested correction.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` or any Supabase secret in frontend code. The service-role credential belongs only in the server-side Edge Function environment. Supabase's current documentation likewise requires secret/service-role credentials to remain in trusted server environments. 

## Validation

- `npx tsc --noEmit`: PASS
- `npm run build`: could not complete from the supplied archive because its installed `node_modules` is missing the platform-specific Rolldown native binding. This package intentionally excludes `node_modules`; install dependencies fresh with `npm install` before building.
- `npm run lint`: existing project-wide lint configuration reports numerous pre-existing `no-explicit-any` and React purity issues. Those were not mass-refactored because doing so would create unrelated changes outside the requested account-management fixes.
