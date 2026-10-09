# AquaWell Dashboard & Authentication Refactoring

## Scope
This refactor updates the AquaWell React/Supabase application to work with the normalized Supabase schema supplied for the project.

## Refactored files
- `src/components/AuthModals.tsx`
- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/customer/CustomerDashboard.tsx`
- `src/pages/staff/StaffDashboard.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/components/ChangePasswordModal.tsx`
- `src/types/index.ts`

## Normalized database mappings now used
- `profiles.id -> auth.users.id`
- `customers.profile_id -> profiles.id`
- `staff.profile_id -> profiles.id`
- `orders.customer_id -> profiles.id`
- `orders.rider_id -> staff.staff_id`
- `order_items.order_id -> orders.id`
- `order_items.inventory_id -> inventory.id`
- `payments.order_id -> orders.id`
- `sales.order_id -> orders.id`
- `notifications.user_id -> profiles.id`
- `notifications.order_id -> orders.id`
- `audit_logs.user_id -> profiles.id`

## Major changes
### Authentication
- Login no longer guesses roles from email addresses.
- Role resolution uses `profiles.role`, with `staff.role` as a fallback.
- Customer registration creates a Supabase Auth account and, when a session is immediately available, creates/updates the normalized `profiles` and `customers` records.
- Passwords are never written to application tables.

### Customer dashboard
- Orders are inserted into `orders` and their products into `order_items`.
- Product information is read from `inventory` through `order_items.inventory_id`.
- Order totals are stored as numeric values rather than peso-formatted strings.
- Payments are recorded in `payments` and the order is updated to `PAID`.
- Sales records now reference the originating order through `sales.order_id`.
- Receipt uploads continue to use the `receipts` Supabase Storage bucket.
- Rider display is resolved through `orders.rider_id -> staff.staff_id`.

### Staff dashboard
- Delivery riders are filtered using `orders.rider_id` rather than the removed `orders.rider` field.
- Orders are assembled from normalized order items and customer profiles.
- Walk-in sales use numeric `total_amount` values.

### Admin dashboard
- Order listings resolve customers through `profiles`, items through `order_items/inventory`, and riders through `staff`.
- Rider assignment writes `rider_id`.
- Audit activity uses `audit_logs` instead of storing audit entries in `notifications`.
- Customer directory records retain the normalized `customers.profile_id` relationship.
- Customer deletion removes the directory row rather than deleting `profiles`/`auth.users` records that may still be referenced by orders.
- Sales amounts are stored as numeric values.

## Important Supabase/RLS note
The frontend assumes the authenticated user is allowed by Supabase Row Level Security policies to read/write the rows used by their role. If RLS policies are enabled, verify policies for:
- `profiles`
- `customers`
- `staff`
- `orders`
- `order_items`
- `inventory`
- `payments`
- `sales`
- `notifications`
- `audit_logs`

For production, privileged account creation for staff/admin users should be handled by a trusted server-side process or Supabase Edge Function rather than creating Auth users directly from an admin browser.

## Verification
- TypeScript project build/check: **PASSED** with `tsc -b`.
- Vite production build could not be completed from the uploaded `node_modules` because the ZIP is missing Rolldown's native optional binding. This is an installation/environment issue, not a TypeScript error in the refactored source.

## Clean install before running
From the project root:

```bash
rm -rf node_modules
npm install
npm run build
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
npm run build
```

Then run:

```bash
npm run dev
```
