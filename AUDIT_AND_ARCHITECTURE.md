# FlameLink — Multiplayer Dine-In Operating System Architecture & 10-Agent Swarm Audit

## Executive Summary
This document summarizes the comprehensive pivot of **FlameLink** into a synchronized **Multiplayer Dine-In Operating System**. FlameLink unites table self-ordering, PIN-protected multi-diner pools, physical cashier settlement verification, and real-time kitchen operations over low-latency telemetry.

Built strictly upon the Crimson Flame identity (`#FF0055`), high-contrast thermal chits, and the non-negotiable **Payment Gate**, FlameLink enforces first-principles restaurant dining physics: no food is prepared until payment is verified, zero apps to download, and zero developer leaks in consumer UI.

---

## 1. 10 Attacker Sub-Agent Domain Decomposition & Overhaul

### [Agent 01 — Multiplayer Session Architect]
**Domain:** PIN-Protected Lobby & Cross-Tab Shared State
- **4-Digit PIN Security**: The first scanner of a table QR code (`?table=T-04`) becomes the table Host and generates a unique 4-digit PIN.
- **Table Pool Binding**: Subsequent table scanners enter the 4-digit PIN to join the shared table pool (`TableLobbyModal.tsx`).
- **Host vs. Guest Roles**:
  - Guests can customize dishes and add items to the shared pool, attributed with their name (e.g. `addedBy: { name: "Sarah" }`).
  - Guests can toggle their readiness state via "Mark Ready to Pay".
  - Only the Host (or assigned delegate) can proceed to checkout once table members are ready. Host privileges can be transferred seamlessly.
- **BroadcastChannel Sync**: Implemented `flamelink_multiplayer_sync` channel syncing lobby members, cart line items, payment status, and order updates across all open browser tabs and devices in real time.

### [Agent 02 — Design Enforcer & Crimson Auditor]
**Domain:** Brand Overhaul & No-Slop CSS System
- **Crimson Palette Migration**: Replaced all legacy orange (`#EA580C` / `#ff4d00`) with Crimson Flame (`#FF0055`), ambient halo (`0 0 0 6px #ffd1dc`), and soft tinted wash (`#fff0f3`).
- **Logo Wordmark Unified Baseline**: Sourced vector SVG mark (`src/assets/logo.svg`) and engineered `FlameLinkLogo.tsx` with `Flame` in `#262626` and `Link` in `#FF0055` on a single horizontal baseline.
- **Strict Anti-Slop Policy**: 0 Unicode emojis in UI, code, and copy. 0 AI-slop gradients. Concentric radii, tabular numbers (`font-variant-numeric: tabular-nums`), and clean hairline gridlines.

### [Agent 03 — Culinary Menu & Shared Cart UX]
**Domain:** Ergonomic Menu & Multi-User Cart Drawer
- **48x48px Cart Thumbnails**: Sourced dish imagery and embedded crisp `48x48px` image thumbnails next to every item in the cart drawer (resolving Image 5 flaw).
- **Multi-User Visual Grouping**: Cart drawer automatically segments items by diner (e.g., "Your Items", "Sarah's Items", "Omar's Items").
- **Crisp Selection Borders**: Enforced `2px solid #FF0055` (`border-selected-crimson`) across active category pills and active touch cards.
- **Embedded Table Lobby Bar**: Mounts sticky at top of the menu, showing table number, copyable PIN badge, seated party members, and ready toggle.

### [Agent 04 — The Payment Gate & Checkout Strategist]
**Domain:** Order Validation & Kitchen Line Gate Lock
- **THE GATE LAW**: Orders are strictly BLOCKED from firing to the KDS kitchen line until payment is confirmed.
- **Dual Payment Routing**:
  1. **Instant Online Payment** (Apple Pay / Card): Authorizes immediately, marks `paymentStatus: 'verified_paid'`, and broadcasts directly to the KDS grill line.
  2. **Cashier Desk Settlement**: Generates a Cashier Chit (`#PAY-XX-YY`), sets `paymentStatus: 'pending_verification'`, and holds the order at the register. The KDS screen filters this out until the front cashier confirms settlement.
- **Advanced Bill Splitting**:
  - **Equal Fraction Split**: 1, 2, 3, 4, 5, 6, 8-way splits with exact per-person math and 14% ETA VAT breakdown.
  - **Itemized Dish Split**: Checkbox list of all ordered dishes. Diners check only what they consumed to calculate their exact personal total.
- **Post-Meal Tipping & 5-Star Reviews**: Tipping prompt and 5-star review request appear strictly AFTER payment is verified, avoiding awkward pre-meal payment friction.

### [Agent 05 — Cashier Station Engineer]
**Domain:** Dedicated Staff Route `/cashier`
- **Front Register Dashboard**: Live overview of restaurant tables (`T-01` to `T-12`) categorized into `Idle`, `Ordering in Progress`, `Waiting for Payment`, or `Paid & Cooking`.
- **Pending Chits Queue**: Displays incoming `#PAY-XX` chits with line-item breakdowns, ETA tax, and total.
- **Verify Settlement Action**: Cashier selects payment method (Cash, Visa, Apple Pay) and clicks "Verify Table Settlement". This unlocks the gate, marks the ticket `verified_paid`, and broadcasts it to the KDS pass in sub-150ms.
- **Transactions Audit Ledger**: Real-time log of verified collections today.

### [Agent 06 — KDS Thermal Chit Specialist]
**Domain:** Kitchen View `/kds`
- **Gate Enforcement**: Strictly filters `orders.filter(o => o.paymentStatus === 'verified_paid')`. Zero unpaid tickets ever crowd the kitchen line.
- **High-Legibility Typography**:
  - Table / Order header: `24px` font size bold.
  - Dish items: `20px` font size bold.
  - Modifiers: `18px` font size bold Crimson (`#FF0055`).
  - Kitchen notes: Bold high-contrast red alert box.
- **Sticky Batch Totals Footer**: Real-time footer aggregating whole-number dish totals needed across all active chits on the line (e.g. `6x Angus Smash Burger`, `3x Dry Aged Ribeye`).
- **Stacked Queue Indicator**: Badge showing queue volume when tickets exceed visible columns.

### [Agent 07 — Print, PDF & Image Export Engine]
**Domain:** Receipt Export & Print Isolation
- **Strict Print Isolation**: Wrapped thermal ticket in `#printable-receipt`. Scoped CSS `@media print` rules hiding sidebar rail, nav headers, footers, toasts, and buttons, printing ONLY the clean paper receipt (resolving Image 1 flaw).
- **Direct PDF Export**: One-click "Download PDF" using standard system print-to-PDF flow.
- **Save as Image**: Client-side canvas generation rendering a crisp PNG chit ready to save or share.

### [Agent 08 — Waiter Sync & Real-Time Telemetry]
**Domain:** Cross-Tab Telemetry & Status Broadcasts
- **Pass Bump Notification**: When KDS marks an order "Ready for Pass", a live toast notification alerts the table device: "Your food is ready at the kitchen pass! Server on the way."
- **Multiplayer State Sync**: Table members see live cart changes, guest join alerts, and payment verification toasts instantly.

### [Agent 09 — Asciify & Micro-Interaction Choreographer]
**Domain:** Tactile Physics & Motion Choreography
- **Thermal Flame ASCII Matrix**: Monospace 7x32 sensor wave reacting to cursor heat deflection on Crimson highlight.
- **Live WebSocket Conduit**: Telemetry wire showing latency and packet state.
- **Spring Pop Counters**: Tactile pill scaling on cart increment.

### [Agent 10 — Adversarial QA & Stress Tester]
**Domain:** Logic Breaking & Zero-Slop Verification
- **Zero Emojis**: Validated across all 25+ files. 0 Unicode emojis present.
- **TypeScript Purity**: `tsc --noEmit` exits with code `0`.
- **Vite Build**: Production bundle builds cleanly in `< 250ms`.

---

## 2. Git Checkpoint Milestone Log

| Tag | Commit Hash | Milestone Description |
|-----|-------------|-----------------------|
| `cp-baseline` | `49cd66b` | Snapshot before Multiplayer OS & Crimson migration |
| `cp-multiplayer-final` | *(Current)* | Production build of FlameLink Multiplayer OS |

---

## 3. URLs & Verification Endpoints
- **Overview (SaaS Narrative & ROI)**: `http://localhost:5173/`
- **Dine-In Menu (with Table Lobby Bar)**: `http://localhost:5173/menu?table=T-04`
- **Cashier Station (Verify Settlements)**: `http://localhost:5173/cashier`
- **Kitchen Pass KDS (Legible Wall Display)**: `http://localhost:5173/kds`
- **Table Bill & Settlement (Print / PDF / Split)**: `http://localhost:5173/settlement`
- **Acrylic Stand Studio (4x6" Tent Generator)**: `http://localhost:5173/stand`
