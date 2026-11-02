# Scope: FlameLink Live Kitchen (لايف كيتشن) UX/UI Upgrade

## Architecture
- Consumer Persona (`/menu`, `/companion`, `/tracker`, `/settlement`): Seated diner experience with zero back-office leaks, full card touch targets (>=44px), Host order submission authority, and companion personal settlement.
- Operations Persona (`/cashier`, `/kds`, `/stand`): Light Vellum workspace, void order retention, shift audit ledger, light pass KDS tickets with stopwatch timers, and offline SVG QR table stand generator.

## Feature Inventory
| # | Feature | Description | Milestone | Status |
|---|---------|-------------|-----------|--------|
| 1 | AI Design De-slopping | Fix 15 findings in detect.mjs (SD4m monospace data labels, SD8 emerald accents, C5 shadow) | M1 | DONE |
| 2 | Persona Separation in Shell | Decouple Sidebar.tsx & App.tsx footer so seated diners never see /kds, /cashier, /stand | M1 | DONE |
| 3 | Token & Radii Standardization | Standardize on 3-tier radii (999px, 16px, 8px), eliminate rounded-xl/rounded-md, remove "Port Said" | M1 | DONE |
| 4 | Menu Page Touch Ergonomics | Expand dietary pills & controls to >=44px, full clickable dish cards, DishModal polish | M2 | IN_PROGRESS |
| 5 | Cart Drawer & Host Authority | Polish CartDrawer.tsx, FloatingCartBar.tsx, TableLobbyBar.tsx, enforce Host order submission | M2 | IN_PROGRESS |
| 6 | Account Modal Vellum Theme | Convert AccountModal dark gradient to 100% Light Vellum tokens | M2 | IN_PROGRESS |
| 7 | Companion Distributed Settlement | 4-digit PIN join, dish attribution, ready toggle, personal share payment authorization | M2 | IN_PROGRESS |
| 8 | Live Order Tracker Chit UI | Thermal chit perforation, stage indicators, server bump alerts in OrderTrackerPage.tsx | M2 | IN_PROGRESS |
| 9 | Table Bill & Settlement Split | Itemized & equal split with >=44px buttons, tip pills, post-payment rating, thermal receipt print/PDF | M2 | IN_PROGRESS |
| 10 | Cashier POS Void Retention | Retain voided orders with status: 'voided', voidReason, and voidedAt instead of array deletion | M3 | PLANNED |
| 11 | Cashier POS Audit Ledger | Add transaction history, void logs, and shift reconciliation ledger in CashierPage.tsx | M3 | PLANNED |
| 12 | Kitchen Pass KDS Light Redesign | Redesign KdsPage.tsx from dark #0d0f12 to 100% Light Vellum workspace, stopwatch timers, batch footer | M3 | PLANNED |
| 13 | Table Stand Vector SVG & Brand | Offline vector SVG QR code, bilingual Live Kitchen (لايف كيتشن) branding, acrylic/oak toggle, 4x6 print | M3 | PLANNED |
| 14 | E2E Testing Suite (Tiers 1-4) | Comprehensive test suite covering all 8 screens, persona isolation, tokens, emojis, and persistence | M0 | DONE |
| 15 | Build & Deployment Verification | npm run build pass, Supabase messages persistence, git push to main, Cloudflare Pages live | M4 | PLANNED |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | E2E Testing Track | Design test runner, test cases for Tiers 1-4, publish TEST_READY.md | none | DONE |
| M1 | Design Tokens, Anti-Patterns & Shell Decoupling | detect.mjs fixes, radii standardization, Sidebar.tsx/App.tsx persona isolation | none | DONE |
| M2 | Consumer Dining Experience | /menu, DishModal, CartDrawer, TableLobbyBar, AccountModal, /companion, /tracker, /settlement | M1 | IN_PROGRESS |
| M3 | Operations Portal & Stand Generator | /cashier void retention & audit ledger, /kds light vellum redesign, /stand vector SVG | M1 | PLANNED |
| M4 | Final Milestone: 100% E2E Pass & Cloudflare Deployment | 100% E2E test pass, adversarial coverage, Supabase persistence, git push to main | M0, M2, M3 | PLANNED |
