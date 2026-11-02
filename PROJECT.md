# Project: FlameLink & Live Kitchen (لايف كيتشن) UX/UI Audit & Redesign

## Architecture
FlameLink is a multi-persona restaurant ordering and operations platform synchronizing dine-in table ordering with live kitchen and cashier operations.

### Personas & Flow Isolation
1. **Consumer Persona (Diner & Companion)**:
   - Seated at physical table (e.g. Table T-04).
   - Interacts via mobile phone or mounted tabletop tablet.
   - Access to `/menu`, `/companion`, `/tracker`, `/settlement`.
   - Strictly isolated from operations views: ZERO back-office links (KDS, Cashier, Stand Generator) in consumer dock or drawer.
   - First-principles physical context: Seated diners are never asked party size or shown redundant QR codes on their phones. Full card tap targets (minimum 44x44px).
   - Table Host holds exclusive authority for collective order submission; companions can add items, toggle ready, and settle their own individual shares.
2. **Operations Persona (Kitchen & Cashier)**:
   - Kitchen Pass KDS (`/kds`): High-legibility light vellum tickets, stopwatch elapsed timers, arrival alerts, batch totals footer.
   - Cashier POS Terminal (`/cashier`): Table grid, pending chits, settlement verification, void order modal with reason retention, historical audit ledger.
   - Table Stand Generator (`/stand`): Offline vector SVG QR generator for 4x6" table tents with acrylic/oak preview and print layout.
3. **Global Shell & Navigation**:
   - `Sidebar.tsx`: Persona-aware navigation dock and mobile drawer. Suppresses back-office routes during dining sessions.
   - `App.tsx`: Clean global shell without back-office leaks in consumer footer.

### Design System (FlameLink Design Tokens)
- **Palette**: 100% Light Vellum Workspace:
  - Canvas: `#ffffff`
  - Surfaces/Cards: `#f9f9f9` (Vellum)
  - Hairline borders: `#e5e7eb` (1px Gridline)
  - Text Headings: `#262626` (Ink)
  - Text Slate: `#727272`
  - Chromatic Signal: `#FF0055` (Crimson Flame)
  - Prohibited: Dark canvas/backgrounds, saturated emerald/purple accents.
- **Typography**:
  - UI: `Geist` (humanist grotesk)
  - Numbers & Pricing: `Geist Mono` for prices (e.g. `185.00 EGP`), order IDs, and timers.
- **Radii**:
  - `999px` (`rounded-full`) for all pills, buttons, status tags.
  - `16px` (`rounded-2xl`) for all cards and modals.
  - `8px` (`rounded-lg`) for inputs and notes.
- **Prohibitions**:
  - ZERO Unicode emojis across UI, components, comments, and copy (use clean SVGs).
  - ZERO mentions of "Port Said" or academic labels in user-facing UI.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | AI Design De-slopping | Fix 17 findings in detect.mjs (SD4m monospace data labels, SD8 emerald accents, C5 shadow) | M1 | Survey |
| 2 | Persona Separation in Shell | Decouple Sidebar.tsx & App.tsx footer so seated diners never see /kds, /cashier, /stand | M1 | Survey |
| 3 | Token & Radii Standardization | Standardize on 3-tier radii (999px, 16px, 8px), eliminate rounded-xl/rounded-md, remove "Port Said" | M1 | Survey |
| 4 | Menu Page Touch Ergonomics | Expand dietary pills & controls to >=44px, full clickable dish cards, DishModal polish | M2 | Survey |
| 5 | Cart Drawer & Host Authority | Polish CartDrawer.tsx, FloatingCartBar.tsx, TableLobbyBar.tsx, enforce Host order submission | M2 | Survey |
| 6 | Account Modal Vellum Theme | Convert AccountModal dark gradient to 100% Light Vellum tokens | M2 | Survey |
| 7 | Companion Distributed Settlement | 4-digit PIN join, dish attribution, ready toggle, personal share payment authorization | M2 | Survey |
| 8 | Live Order Tracker Chit UI | Thermal chit perforation, stage indicators, server bump alerts in OrderTrackerPage.tsx | M2 | Survey |
| 9 | Table Bill & Settlement Split | Itemized & equal split with >=44px buttons, tip pills, post-payment rating, thermal receipt print/PDF | M2 | Survey |
| 10 | Cashier POS Void Retention | Retain voided orders with status: 'voided', voidReason, and voidedAt instead of array deletion | M3 | Survey |
| 11 | Cashier POS Audit Ledger | Add transaction history, void logs, and shift reconciliation ledger in CashierPage.tsx | M3 | Survey |
| 12 | Kitchen Pass KDS Light Redesign | Redesign KdsPage.tsx from dark #0d0f12 to 100% Light Vellum workspace, stopwatch timers, batch footer | M3 | Survey |
| 13 | Table Stand Vector SVG & Brand | Offline vector SVG QR code, bilingual Live Kitchen (لايف كيتشن) branding, acrylic/oak toggle, 4x6 print | M3 | Survey |
| 14 | E2E Testing Suite (Tiers 1-4) | Comprehensive test suite covering all 8 screens, persona isolation, tokens, emojis, and persistence | E2E Track | Requirements |
| 15 | Build & Deployment Verification | npm run build pass, Supabase messages persistence, git push to main, Cloudflare Pages live | M4 | Requirements |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | E2E Testing Track | Design test runner, test cases for Tiers 1-4, publish TEST_READY.md | none | IN_PROGRESS |
| M1 | Design Tokens, Anti-Patterns & Shell Decoupling | detect.mjs fixes, radii standardization, Sidebar.tsx/App.tsx persona isolation | none | READY |
| M2 | Consumer Dining Experience | /menu, DishModal, CartDrawer, TableLobbyBar, AccountModal, /companion, /tracker, /settlement | M1 | PLANNED |
| M3 | Operations Portal & Stand Generator | /cashier void retention & audit ledger, /kds light vellum redesign, /stand vector SVG | M1 | PLANNED |
| M4 | Final Milestone: 100% E2E Pass & Cloudflare Deployment | 100% E2E test pass, adversarial coverage, Supabase persistence, git push to main | M0, M2, M3 | PLANNED |

## Interface Contracts
### Shell ↔ Route Persona Isolation
- `Sidebar.tsx`:
  - When `location.pathname` matches consumer routes (`/menu`, `/companion`, `/tracker`, `/settlement`, `/`) or `activeTable` is set, render ONLY consumer navigation items (Menu, Table Companion, Bill & Split, Track Order).
  - Operator routes (`/cashier`, `/kds`, `/stand`) must NEVER render in consumer dock or drawer.
  - Operator routes can be accessed via direct path navigation or an explicit workstation lock barrier.
- `App.tsx`:
  - Hide floating dock on `/cashier` and `/kds` to prevent workstation overlap.
  - Master footer: remove direct links to Staff KDS and Cashier Register for dining users.

### Cashier POS ↔ State (`src/store/useAppStore.ts`)
- `voidOrder(orderId: string, voidReason: string)`:
  - Updates order status to `'voided'`, records `voidReason` and `voidedAt: string`.
  - Does NOT remove order from `orders` array.
- `AuditLedger`:
  - Computes: Total Sales, Cash Collected, Card/Apple Pay Collected, Total VAT (14%), Voided Orders Count & Value.
  - Lists all settled and voided transactions chronologically.

### KDS Pass ↔ Live Orders
- Reads `orders` filtered by `paymentStatus === 'verified_paid'`.
- 100% Light Vellum theme: Canvas `#ffffff`, cards `#f9f9f9`, borders `#e5e7eb`, ink text `#262626`.
- Priority indicators: `#FF0055` Crimson Flame for rush orders (>10m) and modifiers.

### Table Stand Generator
- Inline SVG QR code generator (zero external network calls to qrserver.com).
- Full bilingual restaurant branding: "Live Kitchen (لايف كيتشن)", Republic Street, adjacent to El-Montazah Park.

## Code Layout
- `src/components/layout/`: `Sidebar.tsx`, `WorkstationBarrier.tsx`
- `src/pages/`:
  - `MenuPage.tsx`, `CompanionPage.tsx`, `OrderTrackerPage.tsx`, `SettlementPage.tsx`
  - `CashierPage.tsx`, `KdsPage.tsx`, `TableStandPage.tsx`, `HomePage.tsx`
- `src/components/menu/`: `DishModal.tsx`, `DishCard.tsx`, `DietaryFilters.tsx`
- `src/components/cart/`: `CartDrawer.tsx`, `FloatingCartBar.tsx`
- `src/components/multiplayer/`: `TableLobbyBar.tsx`, `TableLobbyModal.tsx`
- `src/components/auth/`: `AccountModal.tsx`
- `src/components/cashier/`: `AuditLedgerModal.tsx` or inline audit ledger component
- `src/store/`: `useAppStore.ts`
- `src/index.css`: design tokens, print CSS, font definitions
