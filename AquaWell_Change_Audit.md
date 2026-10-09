# AquaWell Corrected Refactor — Change Audit

## Baseline
This version is based on the first normalized/refactored AquaWell source rather than the shortened second revision. Existing functionality was preserved wherever it did not conflict with the requested changes.

## Explicit changes requested and implemented

### 1. Staff Portal — no Inventory module
- Removed the Inventory module/tab from the visible staff portal.
- Inventory data is still queried internally only when needed to calculate prices for the existing Sales Log; it is not exposed as a staff inventory-management feature.

### 2. Delivery Rider — accept/reject workflow
- Delivery assignment writes `orders.rider_id` and leaves the order `PENDING`.
- Rider sees only deliveries assigned to their own `staff_id`.
- Rider can Accept: `PENDING -> OUT FOR-DELIVERY`.
- Rider can Reject: `rider_id -> NULL` and status remains `PENDING`.
- Rider can mark an accepted delivery as `DELIVERED`.
- Completing a COD delivery records the order payment as Cash/PAID.

### 3. Cycle buttons replaced with dropdowns
- Admin order fulfillment status is now a dropdown.
- Admin payment status is now a dropdown.
- Staff order status is now a dropdown.
- No `🔄` cycle control remains in these modules.

### 4. Staff dark-mode button
- Added an icon-only theme toggle.
- No visible "Dark" or "Light" text.
- Theme persists in `localStorage`.

### 5. Customer dark-mode button
- Added the same icon-only theme toggle.
- Theme persists across portal navigation/reloads.

### 6. Customer payment/fulfillment restriction
- Customer checkout offers:
  - `Delivery — COD`
  - `Station Pickup`
- Customer no longer selects GCash or Bank Transfer.
- Customer no longer uploads online payment screenshots.
- Customer orders start as unpaid COD and can be marked paid by fulfillment staff/admin when completed.

### 7. Admin Sales Trend & WMA Forecast
- Restored a real data-driven forecasting module.
- Forecast source: `sales` table.
- Period choices:
  - Daily Sales
  - Weekly Sales
  - Monthly Sales
- Uses a three-period Weighted Moving Average with weights 1, 2, and 3.
- Displays:
  - Actual sales by period
  - Trend direction (Increasing / Decreasing / Stable)
  - Latest sales
  - Next-period WMA forecast
  - Weighted calculation breakdown

## Restored/preserved functionality
- Admin notifications and realtime notification subscription
- Admin audit logs
- Admin account profile
- Admin station settings
- Admin change-password modal
- Admin customer directory CRUD
- Admin staff/driver management
- Admin inventory/product management
- Admin order viewing/deletion/assignment
- Admin sales recording and CSV report export
- Customer profile/address editing
- Customer change-password modal
- Customer order history
- Customer active-order tracking
- Customer delivery map/pinned address workflow
- Customer product selection and stock validation
- Staff order processing
- Staff rider assignment
- Staff sales log and walk-in sale recording
- Staff order archiving
- Staff change-password modal
- Delivery rider route/map information

## Authentication correction
Login role resolution now checks the normalized `staff` record by `profile_id` and email before falling back to `profiles.role`. This prevents a Delivery staff account whose profile still says `customer` from being routed to the customer portal.

## Verification
- `tsc -b` passes successfully.
- A Vite production build could not be executed in the provided extracted environment because its existing `node_modules` is missing Rolldown's native optional binding. Run `npm install` in a clean environment before `npm run build`.
