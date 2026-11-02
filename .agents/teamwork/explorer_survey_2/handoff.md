# Handoff Report - Operations Screens & Global Shell Survey (Screens 5-8)

## 1. Observation

Direct observations from codebase inspection across `src/pages/CashierPage.tsx`, `src/pages/KdsPage.tsx`, `src/pages/TableStandPage.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/WorkstationBarrier.tsx`, `src/App.tsx`, and `src/store/useAppStore.ts`:

### 1.1 Screen 5: Cashier POS Terminal (`src/pages/CashierPage.tsx`)
- **Table Matrix & Floor Plan**: 8 tables (`T-01`, `T-02`, `T-03`, `T-04`, `T-05`, `T-06`, `T-08`, `T-12`) rendered with status filter tabs (`all`, `waiting`, `active`, `cleared`) and search query filtering (`CashierPage.tsx:132-149`).
- **Settlement Engine**: Calculates Net Subtotal, 14% Egyptian Tax Authority (ETA) VAT, Total Bill, Companion Deductions (`paidDiners`), and Remaining Balance Due (`CashierPage.tsx:56-66, 643-684`). Tender options include Visa/Meeza POS, Physical Cash, and Apple Pay (`CashierPage.tsx:690-724`), with cash presets and change calculation (`CashierPage.tsx:735-799`).
- **Thermal Receipt Modal**: Displays Live Kitchen restaurant information, ETA registration `849-204-118`, 14% VAT, itemized items, companion deductions, and triggers `window.print()` (`CashierPage.tsx:983-1114`).
- **Void Order Defect**: `CashierPage.tsx:174` invokes `voidOrder(voidTargetOrderId, selectedVoidReason)`. In `src/store/useAppStore.ts:1544`, `voidOrder` executes `const updatedOrders = orders.filter((o) => o.id !== orderId);`. The order is permanently deleted from the array rather than retained with `status: 'voided'` and `voidReason`.
- **Missing Audit Ledger**: `CashierPage.tsx` contains no audit ledger view, no historical transaction log, no void log, and no shift reconciliation.
- **AI Design Tells**: Detected by `avoid-ai-design` scanner: `SD8 Emerald` on lines 314, 538, 624, 1061 (`bg-emerald-50 text-emerald-800`), and `SD4m Monospace Chrome` on plain labels.

### 1.2 Screen 6: Kitchen Pass KDS (`src/pages/KdsPage.tsx`)
- **Payment Gate**: `src/pages/KdsPage.tsx:23` strictly filters `verifiedOrders = orders.filter((o) => o.paymentStatus === 'verified_paid')`.
- **Ticket Formatting**: 24px bold table identifier, 20px item names and quantities, 18px crimson modifiers (`KdsPage.tsx:327-377`). Live elapsed stopwatch timer (`KdsPage.tsx:41-51`) with rush threshold (>600s, `KdsPage.tsx:72`).
- **Batch Totals Footer**: Fixed bottom footer aggregates identical items across active cooking orders (`KdsPage.tsx:421-442`).
- **CRITICAL THEME VIOLATION**: `KdsPage.tsx:151-154` is hardcoded to a dark theme:
  ```tsx
  <div className="min-h-screen bg-[#0d0f12] blueprint-dots-dark text-white ...">
  <header className="h-16 px-6 sm:px-8 bg-[#151921] border-b border-[#252b36] ...">
  <section className="px-6 sm:px-8 py-3.5 bg-[#11141a] border-b border-[#1f242d] ...">
  <footer className="fixed bottom-0 inset-x-0 bg-[#151921] border-t border-[#252b36] ...">
  ```
  This directly contradicts AGENTS.md § 2: "Palette (100% Light Workspace — Never Dark Fills or Gradients): Canvas: #ffffff | Surfaces/Cards: #f9f9f9 (Vellum) | Hairline borders: #e5e7eb (1px Gridline). Single Chromatic Signal: Crimson Flame (#FF0055)... No dark backgrounds or saturated non-brand colors."
- **Expeditor Alerts**: Lacks an audio tone or visual arrival alert when a new chit is verified and fired to the pass.

### 1.3 Screen 7: Table QR Stand Generator (`src/pages/TableStandPage.tsx`)
- **Stand Rendering**: 4x6" cardstock aspect ratio (`aspect-ratio: 4 / 6`) with wood oak base and clear acrylic tent preview toggles (`TableStandPage.tsx:154-175, 269-276`).
- **Print Layout**: Injected `@media print` rule (`TableStandPage.tsx:64-109`) sets `@page { size: 4in 6in; margin: 0; }` and isolates `#printable-stand`.
- **Branding & Resiliency Gaps**:
  - Stand insert does not feature the Arabic/English restaurant identity "Live Kitchen (لايف كيتشن)" or Port Said address (`TableStandPage.tsx:218-265`).
  - QR image loads via an external HTTP dependency (`https://api.qrserver.com/...`, line 43) instead of an offline-resilient inline vector SVG.
  - Line 231 uses `font-changa` instead of project standard Geist/Geist Mono.

### 1.4 Screen 8: Global Navigation & Shell (`Sidebar.tsx`, `App.tsx`, `WorkstationBarrier.tsx`)
- **Workstation Enforcement**: `WorkstationBarrier.tsx:42-135` locks viewports <1024px on `/cashier` and `/kds` with a desktop emulation override.
- **CRITICAL PERSONA LEAK**: `Sidebar.tsx:177-195` lists:
  ```typescript
  { id: 'kds', label: 'Kitchen Pass (KDS)', to: '/kds', badge: 'KDS', icon: ChefHat },
  { id: 'cashier', label: 'Cashier POS', to: '/cashier', badge: 'POS', icon: Building },
  { id: 'stand', label: 'Table QR Stand', to: '/stand', icon: QrCode },
  ```
  These links render in both the desktop macOS dock and the mobile slide-in drawer on consumer pages (`/menu`, `/companion`, `/tracker`, `/settlement`), directly violating AGENTS.md § 1 ("A real diner at Table 4 must NEVER see kitchen order screens, floor plans, developer device pickers, or administrative navigation tabs").
- **Footer Leaks**: `App.tsx:118-120` renders `Staff KDS Line` and `Cashier Register` links, and line 82 lists `Acrylic Stand Generator` under "Dine In Experience" in the diner footer.
- **Dock Collision**: `App.tsx:37` hides `Sidebar` only if `isKds` (`{!isKds && <Sidebar />}`). It remains visible on `/cashier`, causing the auto-hiding dock to float over the POS register.

### 1.5 Codebase Health
- Command: `node .agents/skills/avoid-ai-design/scripts/detect.mjs src` -> 0 P0, 0 P1, 17 P2 findings (all code-certain tells cataloged).
- Command: Node Unicode regex scan across `src/` -> 0 Unicode emojis found.
- Command: `npm run build` -> Completed cleanly with 0 TypeScript errors (343ms).

---

## 2. Logic Chain

1. **Cashier POS Void Auditing**:
   - *Observation*: `useAppStore.ts:1544` filters out the order on void (`updatedOrders = orders.filter((o) => o.id !== orderId)`).
   - *Logic*: An operations POS register in a commercial dining environment requires an immutable audit trail for all cancellations and voids to prevent internal shrinkage and discrepancies.
   - *Conclusion*: `voidOrder` must be refactored to set `status: 'voided'`, `voidReason`, and `voidedAt`, and a dedicated "Audit Ledger" component must be integrated into `CashierPage.tsx`.

2. **KDS Dark Theme Violation**:
   - *Observation*: `KdsPage.tsx` sets `bg-[#0d0f12]`, `#151921`, `#11141a`, and saturated stage colors (`#0284c7`, `#ea580c`, `#16a34a`).
   - *Logic*: AGENTS.md § 2 and ORIGINAL_REQUEST.md Requirement R2 mandate a 100% Light Workspace (#ffffff canvas, #f9f9f9 vellum surfaces, #e5e7eb hairline borders, #FF0055 chromatic signal).
   - *Conclusion*: `KdsPage.tsx` must be converted to a Light Vellum palette while preserving high typographic contrast (black ink text, crisp cards, crimson priority badges and timers).

3. **Persona Separation & Zero Back-Office Leaks**:
   - *Observation*: `Sidebar.tsx` includes `/kds`, `/cashier`, and `/stand` in `navItems`. A seated diner at Table 4 viewing `/menu` can open the drawer or dock and navigate to staff screens. `App.tsx` footer also links staff screens.
   - *Logic*: AGENTS.md § 1 states: "A real diner at Table 4 must NEVER see kitchen order screens, floor plans, developer device pickers, or administrative navigation tabs."
   - *Conclusion*: Navigation items must be partitioned by persona. When on consumer routes or when `activeTable` is set, back-office items must be excluded from `Sidebar.tsx` and the mobile drawer. The global footer must omit staff links. Operations screens (`/cashier`, `/kds`) should not display the consumer dock.

4. **Table Stand Generator Resiliency**:
   - *Observation*: Stand generator relies on an external HTTP service (`qrserver.com`) and omits the Arabic restaurant name "لايف كيتشن".
   - *Logic*: An in-restaurant table stand is physical branding for the venue and must render reliably even without external network access.
   - *Conclusion*: Replace HTTP QR image with client-side vector SVG and embed "Live Kitchen (لايف كيتشن)" branding with Port Said location.

---

## 3. Caveats

- **Scope Boundary**: This survey evaluated Screens 5 to 8, global navigation, and relevant state actions. Detailed inspection of consumer screens 1 to 4 is delegated to `explorer_survey_1`.
- **Database Persistence**: Supabase inquiry persistence was verified as active via `submitPlatformFeedback` in `useAppStore.ts`, but live table session synchronization currently uses `BroadcastChannel` for multi-tab synchronization; backend cloud synchronization across separate physical devices requires Supabase Realtime channel integration in later phases.
- **Print Driver Variance**: While `@media print` rules are structurally sound for 4x6" cardstock, physical printer margins vary by hardware driver and may require custom padding adjustments in actual deployment.

---

## 4. Conclusion

The operations portal screens, stand generator, and global shell have solid foundations (functional table matrices, thermal chit generation, stopwatch timers, workstation barriers, and clean build status). However, four high-priority blockers must be resolved to satisfy Requirements R1 and R2:
1. **Persona Separation**: Remove staff links (`/kds`, `/cashier`, `/stand`) from the consumer mobile navigation drawer, desktop dock, and footer.
2. **KDS Light Vellum Redesign**: Refactor `KdsPage.tsx` from pitch-black `#0d0f12` to 100% Light Vellum workspace tokens (#FFFFFF, #F9F9F9, #E5E7EB, #262626, #FF0055).
3. **Cashier POS Audit Ledger & Void Preservation**: Retain voided orders in state with reason tracking and provide a full Cashier Audit Ledger view (transaction log, void log, shift reconciliation).
4. **Table Stand Resiliency & Branding**: Implement offline vector SVG QR generation and add "Live Kitchen (لايف كيتشن)" bilingual branding and address.

---

## 5. Verification Method

To independently verify all findings and validate subsequent implementations:

1. **Verify AI Design Signals & Palette Compliance**:
   ```bash
   node .agents/skills/avoid-ai-design/scripts/detect.mjs src
   ```
   *Expected*: Review lines flagged in `CashierPage.tsx`, `KdsPage.tsx`, and `TableStandPage.tsx`.

2. **Verify Zero Unicode Emojis**:
   ```bash
   node -e '
   const fs = require("fs");
   const path = require("path");
   function walk(dir, cb) {
     fs.readdirSync(dir).forEach(f => {
       const p = path.join(dir, f);
       if (fs.statSync(p).isDirectory()) walk(p, cb);
       else cb(p);
     });
   }
   const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/u;
   let count = 0;
   walk("src", f => {
     fs.readFileSync(f, "utf8").split("\n").forEach((l, i) => {
       if (emojiRegex.test(l)) { console.log(`${f}:${i+1}: ${l}`); count++; }
     });
   });
   console.log(`Total emojis: ${count}`);
   '
   ```
   *Expected*: Total emojis: 0.

3. **Verify Build Integrity**:
   ```bash
   npm run build
   ```
   *Expected*: Clean compilation with 0 TypeScript errors.

4. **Inspect Key File Locations**:
   - `src/components/layout/Sidebar.tsx:177-195` (check back-office links in `navItems`).
   - `src/App.tsx:37, 118-120` (check dock visibility condition and footer staff links).
   - `src/pages/KdsPage.tsx:151-154` (check dark theme canvas class names).
   - `src/store/useAppStore.ts:1544` (check order deletion vs void retention).
