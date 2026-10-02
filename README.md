# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

# aquawell

A modern, fully responsive web application and management system for water refilling stations in Albay, Philippines. Built with React, TypeScript, Tailwind CSS, and Lucide Icons, featuring seamless glassmorphic authentication modals, interactive order dispatching, inventory control, and 3-period Weighted Moving Average (WMA) demand forecasting.

# AquaWell Water Refill Station System - Admin Module Documentation

## Overview

The **AquaWell Admin Portal** is a comprehensive, feature-complete administrative dashboard designed for water refill station owners and administrators. It handles complete operational oversight, customer relationship management, real-time order fulfillment, inventory thresholds, financial tracking, and staff management.

---

## Key Features & Capabilities As Of 01/10/2026

### 1. Admin Dashboard & Live Monitoring

- **Metrics Overview:** Real-time summary cards tracking Total Revenue (₱), Total Orders, Pending Deliveries, Out-for-Delivery items, and Completed fulfillments.
- **Graphical Visualizations:** Interactive SVG sales trend charts (last 7 days) and order status distribution progress bars.
- **System Audit Trail / Activity Log:** Real-time monitoring feed tracking administrative actions (e.g., rider assignments, manual sales recordings, profile modifications) with timestamps.
- **Low-Stock Inventory Alerts:** Automated warning banners and product-card highlights when stock levels drop below custom minimum thresholds.
- **Interactive Notifications Dropdown:** Live notification center tracking unread alerts, low-stock warnings, and order dispatches.

### 2. Order Management & Driver Assignment

- **Order Lifecycle Tracking:** Cycle order statuses instantly between `PENDING`, `OUT FOR-DELIVERY`, and `DELIVERED`.
- **Payment Status Verification:** Track and toggle payment verification states (`UNPAID`, `PAID - CASH`, `PAID - GCASH`) directly from the table row.
- **Assign Rider Modal:** Assign available delivery personnel and staff riders directly to active orders.
- **Order Details Drawer/Modal:** View comprehensive transaction data including customer contact numbers, fulfillment types, and timestamps.

### 3. Product Catalog & Inventory

- **Inventory CRUD:** Add, update, and remove refill variants (e.g., 5-Gallon Purified Water) and hardware accessories (dispenser pumps).
- **Threshold Control:** Set custom minimum stock alert thresholds (`Min Alert`) per product item.

### 4. Sales Reports & Demand Forecasting

- **Advanced Report Filtering:** Filter generated reports by date ranges (`Today`, `This Week`, `This Month`, `Year-to-Date`) and report types (`Sales & Transactions` vs. `Inventory & Demand Forecast`).
- **Record Sales Transaction Modal:** Quickly log walk-in or over-the-counter cash/GCash transactions independently of web orders.
- **CSV Export:** One-click data export functionality for financial audits.

### 5. Customer Directory & LTV

- **Customer Accounts:** Full CRUD for customer profiles including delivery addresses and contact information.
- **Customer Order History & LTV:** Click the **"History"** action on any customer to inspect their past orders, transaction counts, and total Lifetime Value (LTV).

### 6. Staff & Driver Management

- **Role Roster:** Manage team designations (`Admin`, `Staff`, `Delivery / Rider`).
- **Login Credentials Integration:** Assign and view login email addresses for staff portal access.

### 7. Global Command Palette & Form Validation

- **Quick Search Bar:** Master search input in the top header enabling instant multi-tab lookups across customers, products, and orders.
- **Strict Form Validators:** Real-time error handling and pattern checks ensuring proper Philippine mobile number formats (`09XXXXXXXXX` or `+639XXXXXXXXX`) and blocking numbers/symbols in name entries (supporting first names, middle names, last names, and suffixes like Jr./III)

---

## 🚀 Project Overview & Progress So Far 02/10/26

The system has successfully transitioned from static local state prototypes to a fully persistent, real-time cloud architecture powered by **React (Vite)** and **Supabase (Auth + PostgreSQL)**.

### Core Milestones Achieved:

- **Cloud Database & Schema Migration:** Configured relational tables for `orders`, `inventory` (products), `sales`, `customers`, `staff`, `audit_logs`, and `notifications`.
- **Secure Authentication & Role-Based Access Control (RBAC):** Integrated Supabase Auth with custom database triggers (`handle_new_user`) to automatically provision user profiles and route roles (`admin`, `staff`, `delivery`, `customer`).
- **Interactive Admin Dashboard:** Fully connected to live Supabase tables with asynchronous `useEffect` hooks and full CRUD mutation workflows for:
  - **Order Management & Fulfillment Tracking:** Real-time status cycling (`PENDING` $\rightarrow$ `OUT FOR-DELIVERY` $\rightarrow$ `DELIVERED`), payment verification, and driver assignment.
  - **Product Catalog & Inventory Control:** Stock level monitoring with low-stock warnings and threshold alerts.
  - **Customer Directory & History:** Centralized client profile management and order history tracking.
  - **Staff & Driver Roster:** Multi-tier role and contact management.
  - **Sales Reports & Demand Forecast:** Visual analytics graphs and Weighted Moving Average (WMA) demand projection metrics.
- **Automated Database Triggers:** Implemented server-side PostgreSQL functions and triggers for automatic low-stock warnings, new order notifications, automated inventory deductions, and system audit logging.

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router
- **Backend & Database:** Supabase (PostgreSQL, Row-Level Security, Auth, Serverless Functions/Triggers)
- **Deployment & Hosting:** Vercel / Netlify

---

## 📊 Database Schema & Architecture

The system utilizes the following core PostgreSQL tables in Supabase:

1. **`profiles` / `customers` / `staff`**: User classification and personnel records.
2. **`inventory`**: Tracks stock quantities, unit prices, and minimum alert thresholds.
3. **`orders`**: Handles customer refill requests, fulfillment types (Delivery/Pickup), and rider dispatch.
4. **`sales`**: Aggregates daily payment transactions and revenue data.
5. **`notifications` & `audit_logs`**: Captures real-time system alerts, stock warnings, and administrative activity tracking.

---

## 🚦 Getting Started & Test Credentials

### 1. Environment Setup

Create a `.env` or configuration file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```
