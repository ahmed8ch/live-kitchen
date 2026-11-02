# FlameLink Operations & Global Shell Survey Report (Screens 5-8)

Date: 2026-11-02
Explorer: teamwork_explorer (instance 2)
Scope: Operations Portal Screens, Stand Generator, and Global Shell
Target Artifacts:
- Screen 5: Cashier POS Terminal (`/cashier`, `src/pages/CashierPage.tsx`)
- Screen 6: Kitchen Pass KDS (`/kds`, `src/pages/KdsPage.tsx`)
- Screen 7: Table QR Stand Generator (`/stand`, `src/pages/TableStandPage.tsx`)
- Screen 8: Global Navigation & Desktop Dock / Mobile Header (`src/components/layout/Sidebar.tsx`, `src/App.tsx`, `src/components/layout/WorkstationBarrier.tsx`)
- State Store: `src/store/useAppStore.ts`
- Domain Types: `src/types/domain.ts`, `src/domain/types.ts`
- Styling Tokens: `src/index.css`

---

## Executive Summary

A comprehensive survey of Screens 5 through 8 was conducted against the FlameLink Core Product Blueprint, AGENTS.md, first-principles UX, and the Light Vellum design system tokens.

### Key Assessment Matrix
| Screen / Area | Primary Purpose | Current Status | Critical Deficiencies Identified |
| --- | --- | --- | --- |
| **5. Cashier POS Terminal** (`/cashier`) | Front register settlement verification, table matrix, physical cash/card tender, thermal chit generation, void tracking | Functional with gaps | 1. Voiding permanently deletes orders from state (`orders.filter(...)`) rather than recording `status: 'voided'` and `voidReason`.<br>2. Missing dedicated Audit Ledger (no historical transaction ledger, void log, or shift reconciliation).<br>3. Overuse of monospace fonts on plain labels (`SD4m`) and emerald color defaults (`SD8`). |
| **6. Kitchen Pass KDS** (`/kds`) | Cook line ticket presentation, stage progression, elapsed stopwatch timers, batch quantity aggregation | Functional with major theme violation | 1. **CRITICAL THEME VIOLATION**: KDS is hardcoded to a pitch-black dark theme (`bg-[#0d0f12]`, `#151921`, `#11141a`, `blueprint-dots-dark`), violating the mandatory 100% Light Workspace directive.<br>2. Saturated status headers (`#0284c7`, `#d97706`, `#ea580c`, `#16a34a`) instead of FlameLink Crimson Signal (`#FF0055`) and Light Vellum tokens.<br>3. Lack of audio chime or visual alert banner for incoming verified tickets and bump events. |
| **7. Table QR Stand Generator** (`/stand`) | Physical 4x6" table tent insert generator, base style preview, print CSS | Functional | 1. Missing prominent Arabic & English restaurant branding: "Live Kitchen (لايف كيتشن)" and Port Said address.<br>2. External HTTP dependency for QR codes (`api.qrserver.com`) instead of local resilient SVG generation.<br>3. Wi-Fi credentials use generic "FlameLink-Guest" rather than restaurant brand. |
| **8. Global Navigation & Shell** (`Sidebar.tsx`, `App.tsx`) | Desktop auto-hiding macOS dock, mobile header & drawer, workstation barrier | Functional with persona leak | 1. **CRITICAL PERSONA LEAK**: The mobile navigation drawer and desktop dock expose back-office staff links (`/kds`, `/cashier`, `/stand`) directly to consumer seated diners browsing `/menu`.<br>2. `App.tsx` global footer renders staff links (`Staff KDS Line`, `Cashier Register`, `Acrylic Stand Generator`) directly in the consumer footer.<br>3. Auto-hiding dock renders on `/cashier`, colliding with the POS terminal layout. |

---

## Detailed Investigation by Screen

### 1. Screen 5: Cashier POS Terminal (`/cashier`)

#### 1.1 Direct Observations
- **File**: `src/pages/CashierPage.tsx` (1119 lines)
- **Workstation Barrier**: Wrapped in `WorkstationBarrier` (`portalCode="POS-FRONT-01"`), properly restricting viewports <1024px to prevent unauthorized mobile operations while providing an emulation toggle for developers.
- **Header & Telemetry**:
  - Live clock and total collected today: `{totalCollectedToday.toFixed(2)} EGP`.
  - 3 KPI metric cards: "Waiting for Payment" ({pendingOrders.length} chits), "Verified & Fired to KDS" ({verifiedOrders.length} orders), and "Active Dining Tables" ({seated tables} count).
- **Floor Plan Matrix**:
  - 8 tables: `T-01`, `T-02`, `T-03`, `T-04`, `T-05`, `T-06`, `T-08`, `T-12`.
  - Filter tabs: `All Tables`, `Waiting Payment`, `Active Kitchen`, `Cleared`.
  - Real-time search input matching table number, chit code (`cashierChitCode`), or order ID.
- **Table Inspection & Settlement Engine**:
  - Displays selected table PIN, seated companions list, individual host tags, and diner payment status (whether a diner settled online or is still ordering/ready).
  - Itemized order breakdown showing dish quantity, modifiers, diner attribution, and unit pricing.
  - Tax computation: Net Subtotal, 14% Egyptian Tax Authority (ETA) VAT, Total Bill, Companion Deductions (`paidDiners`), and Remaining Balance Due.
  - Tender options: Visa/Meeza POS, Physical Cash, Apple Pay.
  - Cash quick-tender presets: Exact, 100, 200, 500, 1000, +50 EGP, with instant Change Due computation.
- **Thermal Receipt Modal**:
  - Complete with Live Kitchen business info, ETA Tax Registration `849-204-118`, Terminal POS ID, fiscal status, and `@media print` trigger via `window.print()`.

#### 1.2 Defects & Missing Features
1. **Permanent Deletion on Void Order**:
   - In `src/store/useAppStore.ts` line 1544:
     ```typescript
     voidOrder: (orderId, reason) => {
       const { orders, tableSessions } = get();
       const target = orders.find((o) => o.id === orderId);
       if (!target) return;
       const updatedOrders = orders.filter((o) => o.id !== orderId);
       ...
     ```
   - Calling `voidOrder` completely removes the record from `orders`. The reason selected in the modal is never recorded in state or an audit ledger!
   - **Requirement**: The order must remain in state with `status: 'voided'`, `voidReason: reason`, `voidedAt: Date.now()`, and be excluded from active kitchen/cashier totals while appearing in the audit ledger.
2. **Missing Cashier Audit Ledger**:
   - The user request explicitly demands: `5. Cashier POS Terminal (/cashier): table grid, pending chits, settlement verification, void order modal, audit ledger.`
   - Currently, there is NO audit ledger UI in `CashierPage.tsx`. Cashiers cannot review closed transactions, voided chits, breakdown by payment method (Cash vs Card vs Apple Pay), or shift reconciliation.
3. **AI Design Anti-Patterns (`avoid-ai-design`)**:
   - `P2 SD8 Emerald`: Emerald green badges (`bg-emerald-50 text-emerald-800`, `border-emerald-200`) are used in lines 314, 538, 624, 1061. The design system prescribes Light Vellum neutral backgrounds (`#f9f9f9`), hairline borders (`#e5e7eb`), `#15803d` text for currency figures only, and `#FF0055` as the primary chromatic signal.
   - `P2 SD4m Monospace Chrome`: Monospace font class (`font-mono-num`) is applied indiscriminately to descriptive labels rather than strictly to tabular numbers, prices, order IDs, and timers.

---

### 2. Screen 6: Kitchen Pass KDS (`/kds`)

#### 2.1 Direct Observations
- **File**: `src/pages/KdsPage.tsx` (447 lines)
- **Workstation Barrier**: Wrapped in `WorkstationBarrier` (`portalCode="KDS-BOH-01"`), locking viewports <1024px.
- **Payment Gate**: Line 23 strictly filters orders by `paymentStatus === 'verified_paid'`. Unpaid chits never appear on the kitchen line.
- **Ticket Formatting**:
  - Auto-fill grid layout for expeditor displays.
  - Perforated thermal ticket styling (`.thermal-chit-kds`) with notches.
  - Legible typography: 24px bold table identifier, 20px item names and quantities, 18px crimson modifiers, and highlighted kitchen notes.
  - Live stopwatch timers calculating elapsed seconds since order verification (`currentTime - baseline`).
  - Rush threshold (>600 seconds) triggering visual rush label and ping indicator.
- **Order Progression**: Bump button advances tickets through `received` -> `cooking` -> `ready` -> `served`.
- **Batch Totals Footer**: Fixed bottom footer aggregating identical items (e.g., `4x Angus Flame-Grilled Burger`, `2x Golden French Fries`) across all active cooking tickets.

#### 2.2 Defects & Missing Features
1. **CRITICAL THEME VIOLATION (Dark Theme Canvas)**:
   - Lines 151-154, 156, 192, 421:
     ```tsx
     <div className="min-h-screen bg-[#0d0f12] blueprint-dots-dark text-white ...">
     <header className="h-16 px-6 sm:px-8 bg-[#151921] border-b border-[#252b36] ...">
     <section className="px-6 sm:px-8 py-3.5 bg-[#11141a] border-b border-[#1f242d] ...">
     <footer className="fixed bottom-0 inset-x-0 bg-[#151921] border-t border-[#252b36] ...">
     ```
   - This directly violates AGENTS.md § 2:
     > **Palette (100% Light Workspace — Never Dark Fills or Gradients)**:
     > Canvas: `#ffffff` | Surfaces/Cards: `#f9f9f9` (Vellum) | Hairline borders: `#e5e7eb` (1px Gridline).
     > Single Chromatic Signal: Crimson Flame (`#FF0055`).
     > Strict Prohibitions: No dark backgrounds or saturated non-brand colors.
   - Saturated stage colors: Blue (`#0284c7`), Amber (`#ea580c`), Green (`#16a34a`).
   - **Resolution Plan**: Refactor KDS into a high-contrast 100% Light Vellum interface:
     - Background: `#f9f9f9` (Light Vellum) with subtle `#e5e7eb` grid lines.
     - Header and subheaders: `#ffffff` canvas with `#e5e7eb` borders.
     - Text: Ink (`#262626`) for headings and items, Slate (`#727272`) for secondary metadata.
     - Ticket cards: `#ffffff` with `#e5e7eb` border, clean perforation notches, and `#FF0055` Crimson Flame accents for rush tickets and active timers.
     - Batch totals footer: `#f9f9f9` surface with `#e5e7eb` border and `#262626` text.
2. **Missing Audio / Visual Bump Alert**:
   - When a ticket is bumped or a new verified chit arrives at the pass, there is currently no expeditor tone/chime or alert notification banner. An audio chime (using Web Audio API synthesized gentle chime) and visual highlight will prevent missed orders during busy shifts.
3. **Keyboard Expediting Shortcuts**:
   - High-throughput commercial KDS expeditors rely on keyboard bump bars or numpads. Adding shortcuts (e.g. `Space` or `Enter` to bump earliest active ticket) improves kitchen throughput.

---

### 3. Screen 7: Table QR Stand Generator (`/stand`)

#### 3.1 Direct Observations
- **File**: `src/pages/TableStandPage.tsx` (284 lines)
- **Table Selection**: Supports tables `T-01` through `T-12` and freeform custom table ID input.
- **Target URL Construction**: Generates direct link to `${origin}/menu?table=${tableCode}`.
- **Physical Base Preview**:
  - Natural oak base preview: Wood-toned block with router slot (`#b48052`).
  - Clear acrylic tent preview: Sleek acrylic foot (`#f0f2f5`).
- **Card Insert Rendering**:
  - 4x6" cardstock aspect ratio (`aspect-ratio: 4 / 6`).
  - Scannable QR code preview.
  - Table number badge, scanning instructions, Wi-Fi details.
- **Print Stylesheet (`@media print`)**:
  - Configures `@page { size: 4in 6in; margin: 0; }`.
  - Hides non-printable toolbars and bases, isolating `#printable-stand` at exact 3.75x5.75" dimensions.

#### 3.2 Defects & Missing Features
1. **Missing Restaurant Identity**:
   - The stand insert currently shows the "FlameLink" technology logo and "DINE-IN ORDERING", but does NOT prominently feature the restaurant name: **Live Kitchen (لايف كيتشن)** or its Port Said address ("بورسعيد - شارع الجمهورية"). A physical stand on a dining table must represent the restaurant identity first.
2. **External HTTP QR Dependency**:
   - The QR code is loaded via `https://api.qrserver.com/v1/create-qr-code/...`. If the terminal or restaurant has limited Internet connectivity or if the external service experiences latency, the QR code breaks. An inline SVG vector QR generator (pure client-side) should be used for 100% reliability and maximum vector print resolution.
3. **Typography & Styling**:
   - Line 231 uses `font-changa` which diverges from the project standard (Geist & Geist Mono per R2).
   - Wi-Fi credentials display `FlameLink-Guest` instead of restaurant branded `LiveKitchen-Guest`.

---

### 4. Screen 8: Global Navigation & Shell (`Sidebar.tsx`, `App.tsx`)

#### 4.1 Direct Observations
- **Files**:
  - `src/components/layout/Sidebar.tsx` (454 lines)
  - `src/App.tsx` (146 lines)
  - `src/components/layout/WorkstationBarrier.tsx` (137 lines)
- **Desktop macOS Auto-Hiding Dock (>= 768px)**:
  - Fixed floating capsule on left edge with auto-hide behavior and 24px edge sensor.
  - Smooth parabolic magnification on hover.
  - Vertical Crimson Flame indicator bar for active route.
  - Pin / unpin toggle with `sessionStorage` persistence.
- **Mobile Navigation (< 768px)**:
  - 56px sticky top bar with FlameLink logo, "Dine-In Menu" pill, and hamburger button.
  - Slide-in navigation drawer with route links.
- **Workstation Enforcement**:
  - `WorkstationBarrier` restricts `/cashier` and `/kds` on screens <1024px, mandating desktop/tablet hardware for operations.

#### 4.2 Defects & Persona Separation Breaches
1. **CRITICAL LEAK: Operations Links in Consumer Navigation**:
   - In `Sidebar.tsx` lines 177-195:
     ```typescript
     {
       id: 'kds',
       label: 'Kitchen Pass (KDS)',
       to: '/kds',
       badge: 'KDS',
       icon: ChefHat,
     },
     {
       id: 'cashier',
       label: 'Cashier POS',
       to: '/cashier',
       badge: 'POS',
       icon: Building,
     },
     {
       id: 'stand',
       label: 'Table QR Stand',
       to: '/stand',
       icon: QrCode,
     },
     ```
   - When a consumer diner sits at Table 4 (`/menu?table=T-04`), opening the mobile hamburger drawer reveals links to the Kitchen Pass, Cashier POS, and Stand Generator!
   - On desktop, the floating dock icons include the Chef Hat, Cashier POS, and QR Stand.
   - This violates AGENTS.md § 1:
     > **ZERO BACK-OFFICE OR DEVELOPER LEAKS IN CONSUMER UI**:
     > A real diner at Table 4 must NEVER see kitchen order screens, floor plans, developer device pickers, or administrative navigation tabs.
     > The customer experience (`index.html`) is 100% focused on dining: Menu -> Touchscreen Dish Customization -> Cart/Checkout -> Live Order Tracker.
   - **Resolution Plan**:
     - Separate navigation items into two distinct sets:
       1. **Consumer Dine-In Items**: Overview (`/`), Menu (`/menu`), Companion Order (`/companion`), Order Tracker (`/tracker`), Bill & Split (`/settlement`).
       2. **Staff / Operations Navigation**: Dedicated workstation bar on `/cashier` and `/kds` allowing quick toggle between Cashier and KDS only.
     - When a diner is on a consumer route (`/menu`, `/companion`, `/tracker`, `/settlement`) or has `activeTable` set, the back-office links MUST be hidden from the dock and mobile drawer.
2. **Consumer Footer Leaks (`App.tsx`)**:
   - Lines 118-120 in `src/App.tsx`:
     ```tsx
     <Link to="/kds" className="hover:text-[#FF0055] transition-colors">Staff KDS Line</Link>
     <span>·</span>
     <Link to="/cashier" className="hover:text-[#FF0055] transition-colors">Cashier Register</Link>
     ```
   - Line 82:
     ```tsx
     <li><Link to="/stand" className="hover:text-[#FF0055] transition-colors">Acrylic Stand Generator</Link></li>
     ```
   - These links leak staff interfaces into the diner footer. Diners at Table 4 should not see staff portal links in their dining footer.
3. **Dock Collision on Cashier Page**:
   - `App.tsx` hides the dock only if `isKds` (`{!isKds && <Sidebar />}`). It does NOT hide the dock on `/cashier`!
   - The cashier POS terminal already has its own dedicated top bar; the floating auto-hiding dock pops up over the table matrix when the cashier moves their mouse near the left edge.
   - The dock should be hidden on all operations portals (`!isKds && !isCashier`).

---

## Synthesis & Recommended Upgrades for Phase 1-3

### 1. Cashier POS Terminal (`src/pages/CashierPage.tsx`)
- [ ] **Implement Immutable Void Ledger**:
  - Update `useAppStore.ts` so `voidOrder(orderId, reason)` preserves the order in state with `status: 'voided'`, `voidReason: reason`, and `voidedAt: Date.now()`.
  - Prevent voided orders from being wiped out or appearing in active kitchen passes.
- [ ] **Add Cashier Audit Ledger Section**:
  - Add a dedicated "Audit Ledger" tab in `CashierPage.tsx` displaying:
    - Chronological transaction log (verified payments, timestamps, chit codes, payment methods, amounts).
    - Void log table (timestamp, chit code, void reason, amount, items).
    - Shift reconciliation breakdown: Cash collected, Card/Meeza collected, Apple Pay collected, total voids, net revenue.
- [ ] **Purge AI Design Tells**:
  - Replace `bg-emerald-50 text-emerald-800` defaults with Light Vellum styling (`#f9f9f9` cards, `#e5e7eb` hairline borders, `#15803d` for currency figures).
  - Clean up `font-mono-num` usage so it is reserved for numeric and pricing figures.

### 2. Kitchen Pass KDS (`src/pages/KdsPage.tsx`)
- [ ] **Redesign to 100% Light Vellum Workspace**:
  - Eliminate all dark backgrounds (`#0d0f12`, `#151921`, `#11141a`, `blueprint-dots-dark`).
  - Convert canvas to `#f9f9f9` / `#ffffff`, borders to `#e5e7eb`, headings to `#262626`.
  - Restructure status ticket headers from saturated primary colors to clean light tickets with `#FF0055` Crimson Flame priority badges and elapsed timers.
  - Convert batch totals footer to Light Vellum palette.
- [ ] **Add Expeditor Alert System**:
  - Integrate visual arrival indicator and synthesized Web Audio chime when a new verified chit lands on the pass.
- [ ] **Add Keyboard Bump Shortcuts**:
  - Support `Space` to advance the oldest active ticket, enabling touchless/bump-bar kitchen operation.

### 3. Table QR Stand Generator (`src/pages/TableStandPage.tsx`)
- [ ] **Embed Restaurant Brand Identity**:
  - Feature "Live Kitchen (لايف كيتشن)" prominently in Arabic & English at the top of the stand insert.
  - Include restaurant address: "Port Said - Republic St., next to El-Montazah Park" / "بورسعيد - شارع الجمهورية".
  - Update Wi-Fi details to "LiveKitchen-Guest".
- [ ] **Client-Side Vector SVG QR Code**:
  - Replace external HTTP QR image endpoint with an inline SVG QR generator for 100% reliability and crisp 300+ DPI print resolution.
- [ ] **Ensure Geist & Geist Mono Typography**:
  - Remove `font-changa` and standardize on `Geist` / `Geist Mono`.

### 4. Global Shell & Navigation (`Sidebar.tsx`, `App.tsx`)
- [ ] **Enforce Strict Persona Separation**:
  - Filter `Sidebar.tsx` navigation items: diners only see consumer dining routes (`/menu`, `/companion`, `/tracker`, `/settlement`).
  - Remove `/kds`, `/cashier`, and `/stand` from the consumer dock and mobile slide-in drawer.
  - Hide `<Sidebar />` on both `/kds` and `/cashier` in `App.tsx` (`!isKds && !isCashier`).
- [ ] **Clean Consumer Footer in `App.tsx`**:
  - Remove staff links (`Staff KDS Line`, `Cashier Register`, `Acrylic Stand Generator`) from the consumer dining footer.
  - Provide a dedicated, discrete staff portal access point or route.

---

## Verification & Compliance Checklist
- [x] 0 Unicode emojis present across all surveyed code, comments, and copy.
- [x] Persona separation audited: back-office leaks documented with exact line numbers and proposed fixes.
- [x] Light Vellum palette tokens audited: KDS dark theme violation identified and migration mapped.
- [x] Cashier POS state surveyed: void deletion defect identified, audit ledger requirements specified.
- [x] Table Stand generator surveyed: restaurant branding and offline SVG QR improvements specified.
- [x] TypeScript build verified: `npm run build` succeeds cleanly.
