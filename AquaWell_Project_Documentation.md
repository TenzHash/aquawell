# AquaWell Water Refill Station System
## Project Documentation, File Inventory, Dependencies, Progress & Source-Derived Database Schema

**Documentation generated from:** `aquawell.zip`  
**Project snapshot:** October 4, 2026  
**Starting point:** Built from scratch from the repository's initial Git commit (`ff0bf40`)  
**Primary stack:** React 19 + TypeScript + Vite + Supabase/PostgreSQL + Tailwind CSS + Leaflet

---

## 1. Executive Summary

AquaWell is a web-based water-refilling-station management system for operations in Albay, Philippines. The current project is no longer only a UI prototype: the source contains a substantial React application with customer, staff/delivery, and administrator workflows connected to Supabase.

The application currently covers:

- Public landing page and authentication pages
- Customer registration/login flow
- Customer ordering and order history
- Delivery/pickup fulfillment
- Payment status and receipt upload workflow
- Admin order management and rider assignment
- Inventory/product CRUD
- Customer directory and customer history
- Staff/rider management
- Sales transaction recording
- Notifications and real-time notification subscription
- Reporting-oriented dashboard views
- Weighted Moving Average demand forecasting
- Light/dark theme support
- Interactive maps through Leaflet/React Leaflet
- Supabase Auth, PostgreSQL access, and Storage integration

### Current overall status

**Feature maturity: advanced prototype / near-functional application, but not build-clean.**

The current ZIP contains a large amount of implemented functionality and an existing production `dist/` bundle. However, the source snapshot currently fails `npm run build` because of TypeScript errors, and the supplied database definition is incomplete from a reproducibility standpoint because no SQL migration/schema files are included.

---

# 2. Project Origin and Development Progress

The repository's Git history confirms that the application was developed incrementally from scratch.

### Git timeline

| Date | Commit | Progress |
|---|---|---|
| 2026-10-01 | `ff0bf40` | Initial commit |
| 2026-10-01 | `e96ccf0` | Added landing page, authentication modals, admin dashboard, theme switcher, royal-blue branding |
| 2026-10-01 | `07a21f4` | README merge-conflict fix |
| 2026-10-01 | `619cb9d` | Implemented light/dark theme system |
| 2026-10-01 | `ca7e81b` | Expanded admin dashboard with CRUD, demand forecasts, typography improvements |
| 2026-10-01 | `74b9bcc` | Added admin validations, notifications and audit logs |
| 2026-10-01 | `267f6d6` | Replaced BrowserRouter with HashRouter for publishing |
| 2026-10-01 | `6eef912` | Added low-stock alerts, validation, history modals and build cleanup |
| 2026-10-01 | `09fbb7d` | Added Supabase JS and fixed TypeScript unused-import build issues |
| 2026-10-01 | `91bb535` | Main/index entry-point fixes |
| 2026-10-01 | `dc2580a` | Render isolation testing |
| 2026-10-01 | `df9cfe8` | Second render-isolation test |
| 2026-10-01 | `381eb09` | Deployment testing |
| 2026-10-02 | `8ab95f6` | Connected admin modules/profile settings to Supabase cloud tables |
| 2026-10-02 | `f32b991` | Full Supabase integration across admin, customer, staff and auth utilities |
| 2026-10-02 | `31e44be` | Fixed notification real-time subscription and relative timestamps |
| 2026-10-02 | `3ca7aa9` | Removed unused imports |
| 2026-10-04 | `fa59e0b` | Fixed customer-directory fetching and deletion workflow |

### Development interpretation

The project progressed through these broad phases:

1. **Foundation** — Vite/React project and initial source structure.
2. **Public UI** — landing page, authentication pages and branding.
3. **Admin expansion** — CRUD, reports, forecasting, notifications and audit-oriented features.
4. **UI/UX infrastructure** — theme support and publishing/router changes.
5. **Cloud integration** — Supabase Auth/database/storage access.
6. **Multi-role operations** — customer, staff and delivery workflows.
7. **Real-time and operational refinements** — notifications, timestamps, customer directory fixes.
8. **Current state** — feature-rich application with remaining build/lint/architecture cleanup.

---

# 3. Complete Project File Inventory

The archive contains **39 project-owned files outside `node_modules`**, plus generated `dist/` files. Git tracks 34 of these; the existing `dist/` output is present in the ZIP but is not part of the tracked source set.

> `node_modules/` is intentionally not enumerated file-by-file because it contains thousands of third-party package files generated from `package-lock.json`. Its dependencies are documented in Section 6.

## Root/configuration files

| File | Purpose |
|---|---|
| `.gitignore` | Excludes generated/development files such as `node_modules`, `dist`, logs and IDE files |
| `README.md` | Project overview, feature documentation, technology stack and setup notes |
| `AquaTrack_Project_Documentation.md` | Existing detailed project documentation |
| `package.json` | Project metadata, scripts and dependencies |
| `package-lock.json` | Locks resolved npm dependency versions |
| `index.html` | Vite HTML entry point |
| `vite.config.ts` | Vite + React build configuration |
| `tsconfig.json` | Root TypeScript project references |
| `tsconfig.app.json` | Application TypeScript compiler configuration |
| `tsconfig.node.json` | Node/Vite TypeScript configuration |
| `eslint.config.js` | ESLint configuration |
| `postcss.config.js` | PostCSS/Tailwind integration |
| `tailwind.config.js` | Tailwind configuration |

## Public assets

| File | Purpose |
|---|---|
| `public/favicon.svg` | Application favicon |
| `public/icons.svg` | Public SVG icon asset |

## React source

| File | Purpose |
|---|---|
| `src/main.tsx` | React application entry point |
| `src/App.tsx` | Route definitions and ThemeProvider wrapper |
| `src/index.css` | Global CSS entry |
| `src/App.css` | Application-specific CSS |
| `src/types/index.ts` | Shared TypeScript domain interfaces |
| `src/lib/supabase.ts` | Supabase client configuration |
| `src/context/ThemeContext.tsx` | Light/dark theme state and persistence |

## Components

| File | Purpose |
|---|---|
| `src/components/Navbar.tsx` | Shared responsive navigation and theme control |
| `src/components/AuthModals.tsx` | Login/registration modal authentication logic |
| `src/components/ChangePasswordModal.tsx` | Password change UI and Supabase password workflow |

## Pages

| File | Purpose |
|---|---|
| `src/pages/LandingPage.tsx` | Public-facing landing page |
| `src/pages/LoginPage.tsx` | Standalone login page |
| `src/pages/RegisterPage.tsx` | Customer registration page |
| `src/pages/admin/AdminDashboard.tsx` | Main administrative management portal |
| `src/pages/customer/CustomerDashboard.tsx` | Customer ordering/account portal |
| `src/pages/staff/StaffDashboard.tsx` | Staff and delivery/rider operations portal |

## Source assets

| File | Purpose |
|---|---|
| `src/assets/hero.png` | Application-specific hero image |
| `src/assets/react.svg` | React/Vite starter asset |
| `src/assets/vite.svg` | Vite starter asset |

## Existing build output

| File | Purpose |
|---|---|
| `dist/index.html` | Existing generated production HTML |
| `dist/favicon.svg` | Generated/copied favicon |
| `dist/icons.svg` | Generated/copied public icons |
| `dist/assets/index-7DPAszmy.css` | Existing generated CSS bundle |
| `dist/assets/index-BZbaDnZ4.js` | Existing generated JavaScript bundle |

---

# 4. Application Architecture

```text
Browser
   |
   v
React 19 + TypeScript
   |
   +-------------------+
   |                   |
   v                   v
React Router       ThemeContext
   |
   +-------------------------------+
   |               |               |
   v               v               v
Public          Customer        Staff/Admin
Pages           Dashboard       Dashboards
   |               |               |
   +---------------+---------------+
                   |
                   v
             Supabase Client
                   |
       +-----------+------------+
       |           |            |
       v           v            v
     Auth      PostgreSQL     Storage
```

The application uses `HashRouter`, which was deliberately introduced in Git history to make publishing/deployment easier.

---

# 5. Application Routes

Defined in `src/App.tsx`:

| Route | Component | Role |
|---|---|---|
| `/` | `LandingPage` | Public |
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public/customer |
| `/admin/dashboard` | `AdminDashboard` | Admin |
| `/customer/dashboard` | `CustomerDashboard` | Customer |
| `/staff/dashboard` | `StaffDashboard` | Staff/Delivery |
| `*` | `LandingPage` | Fallback |

---

# 6. Dependencies

## Runtime dependencies

| Dependency | Declared version | Purpose |
|---|---:|---|
| `react` | `^19.2.8` | UI framework |
| `react-dom` | `^19.2.8` | Browser rendering |
| `react-router-dom` | `^7.18.4` | Client-side routing |
| `@supabase/supabase-js` | `^2.117.2` | Supabase Auth/database/storage client |
| `react-leaflet` | `^5.0.0` | React integration for Leaflet maps |
| `leaflet` | `^1.9.4` | Mapping engine |
| `lucide-react` | `^1.49.0` | Icon library |
| `@tailwindcss/postcss` | `^4.3.3` | Tailwind/PostCSS integration |
| `tailwind-merge` | `^3.7.0` | Tailwind class merging |
| `clsx` | `^2.1.1` | Conditional class names |
| `class-variance-authority` | `^0.7.1` | Variant-based styling |
| `@radix-ui/react-dialog` | `^1.1.23` | Accessible dialog primitives |
| `@radix-ui/react-label` | `^2.1.15` | Accessible label primitives |
| `@radix-ui/react-radio-group` | `^1.4.7` | Accessible radio controls |
| `@radix-ui/react-select` | `^2.3.7` | Accessible select control |
| `@radix-ui/react-slot` | `^1.3.3` | Component slot primitive |

## Development dependencies

| Dependency | Declared version | Purpose |
|---|---:|---|
| `typescript` | `~6.0.2` | TypeScript compiler |
| `vite` | `^8.3.0` | Dev server/build tool |
| `@vitejs/plugin-react` | `^6.1.1` | React integration for Vite |
| `eslint` | `^10.10.0` | Linting |
| `@eslint/js` | `^10.0.1` | ESLint recommended rules |
| `typescript-eslint` | `^8.69.0` | TypeScript ESLint support |
| `eslint-plugin-react-hooks` | `^7.1.1` | React Hooks linting |
| `eslint-plugin-react-refresh` | `^0.5.6` | Fast Refresh linting |
| `globals` | `^17.12.0` | ESLint environment globals |
| `@types/react` | `^19.2.18` | React types |
| `@types/react-dom` | `^19.2.7` | React DOM types |
| `@types/node` | `^24.13.3` | Node types |
| `@types/leaflet` | `^1.9.22` | Leaflet types |
| `postcss` | `^8.5.28` | CSS processing |
| `autoprefixer` | `^10.6.1` | CSS vendor prefixes |

### Dependency observations

The project declares several Radix and class utility packages that are not obviously imported by the current application source. They may be remnants of earlier implementation, future dependencies, or unused packages. A later dependency cleanup is recommended.

---

# 7. NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start development server |
| `build` | `tsc -b && vite build` | Type-check then build production bundle |
| `lint` | `eslint .` | Run ESLint |
| `preview` | `vite preview` | Preview production build |
| `deploy` | `gh-pages -d dist` | Publish the `dist` folder using GitHub Pages tooling |

---

# 8. Feature Documentation

## 8.1 Public/Authentication

Implemented pages and components include:

- Landing page
- Login page
- Registration page
- Login modal
- Registration modal
- Password change modal
- Theme switching
- Role-aware navigation after authentication

The registration UI collects customer information including name, email, phone, address, barangay and landmark.

---

## 8.2 Admin Dashboard

`src/pages/admin/AdminDashboard.tsx` is the largest application file and acts as the central operations console.

### Dashboard monitoring

Includes:

- Revenue metrics
- Total orders
- Pending deliveries
- Out-for-delivery orders
- Completed orders
- Sales trend visualization
- Order status distribution
- Notification center

### Orders

Supported operations include:

- Fetch orders
- View order details
- Update status
- Verify payment status
- Assign rider
- Delete orders
- Track receipt/reference information

The main status flow visible in the source is:

```text
PENDING
   ↓
OUT FOR-DELIVERY
   ↓
DELIVERED / PICKED UP
```

The source also contains broader status handling.

### Inventory

Admin can:

- Create products
- Update products
- Delete products
- Set product category
- Set price
- Set stock
- Set minimum stock threshold
- Detect low-stock items

### Customers

Admin functionality includes:

- Customer directory
- Customer lookup
- Profile fallback when customer table retrieval fails
- Profile editing
- Customer creation
- Customer deletion
- Customer history/LTV-oriented views

The latest Git commit specifically addressed customer directory fetching and deletion.

### Staff

Admin can manage:

- First/middle/last name
- Suffix
- Role
- Contact number
- Email

Roles include:

- Admin
- Staff
- Delivery

### Sales

The admin can record walk-in/over-the-counter sales using:

- Transaction ID
- Customer name
- Item
- Quantity
- Total amount
- Payment method
- Date

### Reporting and forecasting

The project documentation describes:

- Date filters
- Sales/transaction reports
- Inventory/demand forecast views
- CSV export
- Three-period Weighted Moving Average demand forecasting

### Notifications

The source includes:

- Notification retrieval
- Read/unread state
- Notification insertion
- Real-time Supabase subscription
- Relative timestamps
- Low-stock/order notification concepts

---

# 9. Customer Dashboard

`src/pages/customer/CustomerDashboard.tsx`

### Implemented capabilities

- Supabase session retrieval
- Customer profile retrieval
- Inventory/product retrieval
- Product selection
- Order creation
- Delivery/pickup selection
- Address handling
- Customer-specific order history
- Payment status update
- Reference number storage
- Receipt image upload
- Sales record creation after payment
- Profile editing
- Password change
- Map/location-related workflow

### Order data written by the customer UI

The customer order insert currently includes fields such as:

```text
id
customer_name
phone
type
inventory_id
item_name
address
total
status
payment_status
customer_id
```

This provides direct evidence for the `orders` table contract.

---

# 10. Staff and Delivery Dashboard

`src/pages/staff/StaffDashboard.tsx`

### Implemented capabilities

- Session detection
- Staff lookup by authenticated email
- Role detection
- Staff roster retrieval
- Order retrieval
- Rider-specific filtering
- Inventory retrieval
- Sales retrieval
- Rider assignment
- Order status progression
- Order archiving
- Walk-in sales recording
- Map display
- Password change

Delivery riders are restricted to orders assigned to their name and active order statuses.

---

# 11. Theme System

`src/context/ThemeContext.tsx`

The application supports:

- Light theme
- Dark theme
- Browser local-storage persistence
- `aquawell_theme` localStorage key
- `<html>` class switching
- `useTheme()` hook
- Global toggle support

---

# 12. Supabase Integration

`src/lib/supabase.ts` initializes the Supabase client.

The current source contains a Supabase project URL and anon/public API key directly in the source file.

### Recommended configuration

Move credentials to environment variables:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Because the supplied source contains a credential directly in the repository snapshot, review Supabase key exposure and rotate/restrict credentials as appropriate for the actual project.

---

# 13. Source-Derived Database Schema

## Important schema limitation

The ZIP does **not** contain SQL migration files, `schema.sql`, or database migration folders.

Therefore:

- Table names are verified from Supabase `.from(...)` calls and project documentation.
- Column names are verified where the frontend selects, inserts, updates or reads them.
- Some primary keys and foreign keys are explicit in code comments or query conditions.
- Some relationships are only logical/inferred.
- The exact PostgreSQL types, constraints, indexes, RLS policies and trigger definitions cannot be reconstructed with certainty from this ZIP alone.

The included PNG diagram is therefore a **source-derived database contract**, not a replacement for the live Supabase schema.

---

## 13.1 `profiles`

### Evidence

Used directly by admin/customer dashboards.

### Fields observed

| Field | Evidence | Notes |
|---|---|---|
| `id` | select/update/insert | UUID-like user identifier; tied to authenticated user |
| `full_name` | insert/update/read | Customer display name |
| `email` | insert/read | Email |
| `phone` | insert/update/read | Contact number |
| `address` | insert/update/read | Delivery/customer address |
| `role` | insert/filter/read | Customer role and profile classification |

### Likely relationship

`profiles.id` is used as the customer identity for `orders.customer_id`.

**Relationship status: verified by application query pattern.**

---

## 13.2 `customers`

### Fields observed

| Field |
|---|
| `customer_id` |
| `id` |
| `first_name` |
| `last_name` |
| `middle_name` |
| `suffix` |
| `address` |
| `contact_number` |
| `phone` |
| `email` |

The admin dashboard first queries `customers`, then falls back to `profiles` if the customer table query fails.

This indicates that the project currently contains **two overlapping customer representations**.

### Architectural recommendation

Choose one authoritative customer model in a future database cleanup:

```text
Supabase Auth user
       ↓
profiles
       ↓
customer-specific data
```

or a clearly related `customers` table with a formal FK to the authenticated profile.

---

## 13.3 `staff`

### Fields observed

| Field |
|---|
| `staff_id` |
| `first_name` |
| `last_name` |
| `middle_name` |
| `suffix` |
| `role` |
| `contact_number` |
| `email` |

The staff dashboard searches by authenticated user's email.

Roles currently represented:

```text
Admin
Staff
Delivery
```

---

## 13.4 `inventory`

### Fields observed

| Field |
|---|
| `id` |
| `name` |
| `category` |
| `price` |
| `stock` |
| `min_stock` |

The customer order code explicitly comments:

```text
inventory_id: selectedInventoryId // Relational Foreign Key to inventory(id)
```

**Relationship status: explicitly documented in source.**

---

## 13.5 `orders`

### Fields observed

| Field | Usage |
|---|---|
| `id` | Primary order identifier used by update/delete |
| `customer_id` | Customer identity |
| `customer_name` | Snapshot/display name |
| `phone` | Customer phone |
| `type` | Delivery/Pickup |
| `inventory_id` | Inventory reference |
| `item_name` | Product name snapshot |
| `address` | Delivery/pickup address |
| `total` | Order total |
| `status` | Fulfillment status |
| `rider` | Assigned rider name |
| `payment_status` | Payment state |
| `reference_no` | Payment reference |
| `receipt_url` | Uploaded receipt URL |
| `archived` | Staff workflow/archive flag |
| `created_at` | Ordering/sorting timestamp |

### Relationships

```text
orders.inventory_id → inventory.id
orders.customer_id → profiles.id
```

The inventory relationship is explicitly documented in source.

The customer relationship is strongly evidenced by:

```text
orders.customer_id = authenticated Supabase user id
```

but an actual PostgreSQL FK constraint is not visible in the archive.

### Important normalization issue

The order stores both:

- `inventory_id`
- `item_name`

This is a useful historical snapshot pattern, but the schema should deliberately decide whether `item_name` is immutable transaction data or merely duplicated catalog data.

---

## 13.6 `sales`

### Fields observed

| Field |
|---|
| `transaction_id` |
| `customer_name` |
| `item_name` |
| `quantity` |
| `total_amount` |
| `payment_method` |
| `date` |
| `created_at` |

Sales are written by:

- Admin dashboard
- Staff dashboard
- Customer payment workflow

### Current design observation

The application stores monetary values as formatted strings in several inserts, for example:

```text
₱50.00
```

For a production database, `numeric(12,2)` is preferable to formatted currency strings.

---

## 13.7 `notifications`

The admin dashboard reads and updates this table and subscribes to Supabase Realtime changes.

Observed field:

```text
unread
```

Other fields are read with `select("*")`, so the exact complete column set is not recoverable from the frontend.

The project documentation describes notification content for:

- Low stock
- Orders
- Administrative activity

---

## 13.8 `receipts`

The customer dashboard uses:

```text
supabase.storage.from("receipts")
```

This is specifically evidence of a **Supabase Storage bucket named `receipts`**.

The current source does not establish that a PostgreSQL table named `receipts` exists.

Therefore the database diagram treats `receipts` as a storage resource, not as a verified PostgreSQL table.

---

## 13.9 `audit_logs`

The project documentation states that `audit_logs` exists and is intended to capture administrative/system activity.

However, the current source files do not contain a direct `.from("audit_logs")` call.

Therefore:

**Status: documented/referenced, but not independently verified from current frontend queries.**

---

# 14. Database Relationship Diagram

See:

**`AquaWell_Database_Schema.png`**

The diagram distinguishes:

- Solid arrows — relationship explicitly evidenced by code.
- Dashed arrows — contextual/logical relationship without a verified FK definition.

The primary verified relationship is:

```text
inventory.id
      ↑
      |
orders.inventory_id

profiles.id
      ↑
      |
orders.customer_id
```

---

# 15. Suggested Target Database Model

For a cleaner future production schema, the database could evolve toward:

```text
auth.users
    |
    v
profiles
    |
    +--------------------+
    |                    |
    v                    v
customers             staff
    |
    v
orders -----> inventory
    |
    +-----> order/payment information
    |
    +-----> receipts (Storage)

sales
notifications
audit_logs
```

Recommended future relationships:

```text
profiles.id          PK
customers.profile_id FK → profiles.id
staff.profile_id     FK → profiles.id

orders.customer_id   FK → profiles.id
orders.inventory_id  FK → inventory.id

sales.order_id       FK → orders.id   (recommended)
orders.rider_id      FK → staff.id   (recommended)
```

This would eliminate reliance on rider names and repeated customer text where IDs can be used.

---

# 16. Authentication and Roles

The application currently represents:

```text
Admin
Staff
Delivery
Customer
```

Authentication is provided by Supabase Auth.

The source uses staff email lookup to determine role for staff/delivery workflows.

The existing project documentation also references a `handle_new_user` database function/trigger for profile provisioning.

### Reproducibility warning

The function/trigger is described by project documentation but its SQL definition is not included in this archive.

A future project package should include:

```text
supabase/
  migrations/
    001_profiles.sql
    002_customers.sql
    003_staff.sql
    004_inventory.sql
    005_orders.sql
    006_sales.sql
    007_notifications.sql
    008_audit_logs.sql
    009_triggers.sql
    010_rls.sql
```

---

# 17. Security and Configuration Findings

## 17.1 Supabase credentials

The current `src/lib/supabase.ts` contains credentials directly in source.

Recommended:

- Move configuration to `.env`.
- Keep `.env` out of Git.
- Use the public anon key only on the client.
- Enforce Row Level Security in Supabase.
- Rotate/review credentials if they were exposed outside the intended environment.

## 17.2 Customer administration

The admin dashboard creates customer profile records using `crypto.randomUUID()` and directly inserts them into `profiles`/`customers`.

This should be reviewed against the intended Supabase Auth model because a profile record does not automatically create an authenticated login account.

## 17.3 Authorization

Frontend role checks are useful for UI behavior, but they should not be treated as the primary security boundary.

Production authorization should be enforced using Supabase RLS policies and server/database-side constraints.

---

# 18. Verification Performed on the Supplied ZIP

## `npm run build`

**Result: FAILED**

The current snapshot produces these TypeScript errors:

- `src/App.tsx` — `AuthModals` is referenced with required props missing.
- `src/components/ChangePasswordModal.tsx` — unused `CheckCircle2`.
- `src/components/ChangePasswordModal.tsx` — unused `AlertCircle`.
- `src/pages/admin/AdminDashboard.tsx` — unused `History`.
- `src/pages/admin/AdminDashboard.tsx` — unused `user`.
- `src/pages/customer/CustomerDashboard.tsx` — unused `Link`.
- `src/pages/staff/StaffDashboard.tsx` — unused `Link`.
- `src/pages/staff/StaffDashboard.tsx` — unused `currentUser`.

The build stops at TypeScript before Vite production compilation.

### Most important current blocker

`src/App.tsx` imports no `AuthModals` props and does not render it with the required `loginOpen`, `registerOpen`, `onClose`, `onSwitchToRegister`, and `onSwitchToLogin` properties.

This appears to be the most structural build error in the current snapshot.

---

## `npm run lint`

In the supplied extracted environment:

```text
eslint: Permission denied
```

This is an environment/executable-permission issue rather than a source-code lint result.

The ZIP therefore does not provide a reliable current lint count from this run.

---

# 19. Current Progress Assessment

### Completed / substantially implemented

- [x] Project initialized from scratch
- [x] React/Vite application foundation
- [x] TypeScript integration
- [x] Responsive public landing page
- [x] Login page
- [x] Registration page
- [x] Authentication modal infrastructure
- [x] Theme system
- [x] Admin dashboard
- [x] Customer dashboard
- [x] Staff dashboard
- [x] Delivery/rider workflow
- [x] Inventory CRUD
- [x] Customer directory
- [x] Staff management
- [x] Order management
- [x] Rider assignment
- [x] Payment status
- [x] Receipt upload workflow
- [x] Sales recording
- [x] Reporting UI
- [x] Demand forecasting UI/logic
- [x] Notifications
- [x] Realtime notification subscription
- [x] Supabase integration
- [x] Leaflet map integration
- [x] Existing production `dist` bundle

### Needs attention

- [ ] Make `npm run build` pass
- [ ] Resolve `AuthModals` integration mismatch
- [ ] Remove remaining unused imports/variables
- [ ] Run a clean lint pass
- [ ] Move Supabase configuration to environment variables
- [ ] Add database migrations/schema to source control
- [ ] Document RLS policies
- [ ] Verify actual PostgreSQL foreign-key constraints
- [ ] Normalize customer/profile/staff relationships
- [ ] Replace rider-name relationship with `rider_id`
- [ ] Consider `order_id` linkage from sales to orders
- [ ] Use numeric database types for monetary values
- [ ] Add stronger shared TypeScript database types
- [ ] Split very large `AdminDashboard.tsx` into feature modules
- [ ] Remove unused dependencies where confirmed
- [ ] Add automated tests
- [ ] Establish reproducible deployment configuration

---

# 20. Recommended Next Development Milestones

## Milestone 1 — Build stability

Goal:

```text
npm run build → PASS
npm run lint → PASS
```

Priority fixes:

1. Fix `AuthModals` props integration.
2. Remove unused imports.
3. Resolve hook/dependency lint issues.
4. Re-run TypeScript and ESLint.

---

## Milestone 2 — Database reproducibility

Create the actual Supabase migration structure.

Include:

- Tables
- PKs
- FKs
- indexes
- RLS policies
- triggers
- notification functions
- low-stock automation
- inventory deduction logic
- profile provisioning

---

## Milestone 3 — Data model cleanup

Recommended target:

```text
profiles
customers
staff
inventory
orders
order_items (optional if multi-item orders are planned)
payments
sales
notifications
audit_logs
```

Prefer IDs over names for relationships.

---

## Milestone 4 — Security

Implement and document:

- RLS for customer-owned orders
- Admin-only management policies
- Staff operational policies
- Delivery rider assignment policies
- Storage policies for receipt uploads
- Protected profile updates

---

## Milestone 5 — Testing

Add:

- Authentication tests
- Order creation tests
- Inventory CRUD tests
- Payment/receipt tests
- Role/authorization tests
- Forecast calculation tests
- Customer CRUD tests

---

# 21. Final Project Status

AquaWell has progressed significantly beyond a starter Vite application.

The Git history shows a rapid progression from a blank project to a multi-role operational system with cloud persistence. The current codebase contains the foundation of a complete water-refilling-station management platform.

The largest remaining gap is not the absence of features; it is **production hardening and reproducibility**:

> The application needs a clean build, clean linting, explicit database migrations/RLS policies, and a more normalized data model before it should be treated as a production-ready system.

The ZIP already contains enough source evidence to reconstruct the application's current database contract at a high level, and the accompanying schema image documents that contract while clearly marking relationships that still require verification against the live Supabase project.

---

## Generated companion files

- `AquaWell_Database_Schema.png` — visual source-derived database schema.
- `AquaWell_Project_Documentation.md` — full editable project documentation.
- `AquaWell_Project_Documentation.pdf` — printable documentation version.
