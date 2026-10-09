# AquaWell — One-Time Admin Bootstrap

This package is based on the `AquaWell_corrected_source_package` currently used for the project.

It adds a **one-time local bootstrap script** for the first AquaWell Admin account. It does not insert directly into `auth.users`.

## What it does

1. Checks that the target email does not already exist.
2. Checks that no Admin profile/staff record already exists.
3. Calls Supabase's server-side `auth.admin.createUser` through `@supabase/supabase-js`.
4. Uses `email_confirm: true`.
5. Supplies only `full_name` metadata; it does not use `user_metadata.role` for authorization.
6. Waits for the existing `on_auth_user_created -> handle_new_user` trigger to create the profile.
7. Inserts exactly one `staff` row with `role = 'Admin'` and `profile_id = auth.users.id`.
8. Lets the existing staff trigger synchronize the profile, then explicitly verifies/finalizes `profiles.role = 'admin'`.
9. Verifies the Auth/profile/staff relationship.
10. If the newly created account cannot be completed, it attempts to remove only the newly created records.

## Security

The script requires a Supabase **server-side privileged key** (`SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`).

- Use it only on your own computer for this one-time bootstrap.
- Never put it in React/Vite source code.
- Never commit it to Git.
- Never paste it into chat.
- Do not put it in `.env` files that are shipped with the frontend.

## Prerequisites

- Node.js 18+ (Node 22 is fine).
- Dependencies installed in the AquaWell project with `npm install`.
- The database should be in the clean state you described: no existing Admin account.
- The existing Supabase triggers/functions should be present.

## PowerShell setup

From the AquaWell project root:

```powershell
$env:SUPABASE_URL="https://pwhcunqlijunipispiep.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="PASTE_YOUR_SERVICE_ROLE_KEY_LOCALLY"
$env:AQUAWELL_ADMIN_EMAIL="admin@aquawell.test"
$env:AQUAWELL_ADMIN_NAME="AquaWell Administrator"
$env:AQUAWELL_ADMIN_CONTACT="N/A"
```

Do not paste the service-role key into chat or commit it to the project.

Then run:

```powershell
node bootstrap-admin.mjs
```

The script generates a strong random password and prints it once if the bootstrap succeeds.

## After success

1. Save the generated password securely.
2. Open AquaWell.
3. Log in with `admin@aquawell.test`.
4. Confirm that the user reaches the Admin Dashboard.
5. Test Admin features before creating Staff, Delivery, or Customer accounts.
6. Once Admin login is confirmed, use the normal Admin Dashboard account-creation flow to create Staff, Delivery, and Customer test accounts.

## Do not run

Do not run the old SQL script that directly inserted into `auth.users`.
Do not run `supabase db push` as part of this bootstrap.
Do not deploy or modify unrelated Edge Functions for this one-time setup.
