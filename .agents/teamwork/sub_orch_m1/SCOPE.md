# Scope: Milestone 1 — Design Tokens, Anti-Patterns & Shell Decoupling

## Architecture
This milestone establishes clean design system compliance across all components, eliminates all 17 AI design anti-pattern flags, eliminates prohibited academic/location labels, enforces strict 3-tier radii, and decouples the navigation shell so seated diners never see back-office routes.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | AI Design De-slopping | Fix 17 findings in detect.mjs (SD4m monospace data labels, SD8 emerald accents, C5 shadow) | M1 | Survey |
| 2 | Persona Separation in Shell | Decouple Sidebar.tsx & App.tsx footer so seated diners never see /kds, /cashier, /stand | M1 | Survey |
| 3 | Token & Radii Standardization | Standardize on 3-tier radii (999px, 16px, 8px), eliminate rounded-xl/rounded-md, remove "Port Said" | M1 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1.1 | AI Anti-Patterns Purge | Fix 17 flags in detect.mjs across 13 files, verify detect.mjs outputs 0 | none | IN_PROGRESS |
| 1.2 | Navigation & Shell Persona Decoupling | Sidebar.tsx and App.tsx footer filtering by persona / table session | none | IN_PROGRESS |
| 1.3 | Radii & Label Standardization | Standardize rounded-xl/rounded-md to 999px/16px/8px, purge "Port Said" | none | IN_PROGRESS |

## Interface Contracts
- `Sidebar.tsx`:
  - When on consumer routes or dining table session, hide `/kds`, `/cashier`, `/stand` from desktop dock and mobile drawer.
- `App.tsx`:
  - Hide floating dock on `/kds` and `/cashier`.
  - Remove staff links from consumer footer.
- `src/index.css`:
  - Fix C5 shadow at L213 to comply with blur threshold.

## Code Layout
- `src/index.css`
- `src/components/layout/Sidebar.tsx`
- `src/App.tsx`
- Files with SD4m/SD8 flags:
  - `src/components/auth/AccountModal.tsx`
  - `src/components/cart/CartDrawer.tsx`
  - `src/components/multiplayer/TableLobbyBar.tsx`
  - `src/components/multiplayer/TableLobbyModal.tsx`
  - `src/pages/CashierPage.tsx`
  - `src/pages/CompanionPage.tsx`
  - `src/pages/HomePage.tsx`
  - `src/pages/KdsPage.tsx`
  - `src/pages/MenuPage.tsx`
  - `src/pages/OrderTrackerPage.tsx`
  - `src/pages/SettlementPage.tsx`
  - `src/pages/TableStandPage.tsx`
