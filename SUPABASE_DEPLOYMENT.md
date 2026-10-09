# AquaWell Supabase Deployment

## 1. Database
Open Supabase SQL Editor and run:
1. Your existing schema.
2. `aquawell_database_patch.sql`

The patch adds RLS policies, indexes, staff-role helpers, and the atomic `place_customer_order` function.

## 2. Edge Functions
From the project root, run:

```bash
supabase functions deploy delete-user
supabase functions deploy create-staff-user
supabase functions deploy create-customer-user
supabase functions deploy repair-user-login
supabase functions deploy update-user-email
```

The functions use Supabase's server-side `SUPABASE_SERVICE_ROLE_KEY`. Never put that key in React/Vite source code.

## 3. Auth settings
For normal customer registration, choose the email-confirmation behavior you want in Supabase Auth. New admin-created staff/customer accounts are explicitly created as confirmed users by the Edge Functions.

Existing accounts created while email confirmation was enabled can be repaired from Admin Dashboard → Customers/Staff → Repair Login.

## 4. Frontend
Install dependencies:

```bash
npm install
npm run build
npm run dev
```

The frontend supports `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; the bundled fallback points to the Supabase project already present in the original source.

## Important
The source ZIP intentionally excludes `node_modules` and the old `dist` directory. `dist` from the original ZIP was built before these fixes and should not be treated as the final production build.

## 5. Account synchronization and recovery functions

Deploy the additional account-management functions introduced in the latest revision:

```bash
supabase functions deploy resolve-user-account
supabase functions deploy admin-reset-user-password
```

### `resolve-user-account`

Runs immediately after a successful login. It synchronizes the authenticated Supabase user with `profiles`, `customers`, and `staff` and repairs orphaned/legacy records when enough information exists to identify the account. The browser does not query `auth.users` directly.

### `admin-reset-user-password`

Allows an authenticated administrator to generate a new temporary password for an existing customer/staff login. This provides an administrator-controlled recovery path when Supabase email-reset delivery is unavailable or rate-limited.

### Admin-created credentials

`create-staff-user` and `create-customer-user` create accounts with `email_confirm: true`. The Admin Dashboard displays the generated temporary password in a persistent credential modal until the administrator closes it.

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
