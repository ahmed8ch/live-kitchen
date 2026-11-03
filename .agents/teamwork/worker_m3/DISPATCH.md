## 2026-11-02T23:07:13Z
You are teamwork_worker for Milestone 3: Operations Portal & Stand Generator (Screens 5, 6, 7).
Your metadata working directory: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/worker_m3/
You must read the original user request at: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/ORIGINAL_REQUEST.md
Also read PROJECT.md, AGENTS.md, and TEST_READY.md at the project root.
Refer to skill: /Users/apple/Downloads/dev/antigravity/port-said/.agents/skills/avoid-ai-design/SKILL.md
and /Users/apple/Downloads/dev/antigravity/port-said/.agents/skills/first-principles-ux/SKILL.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE CARDINALITY FOR MILESTONE 3:
- `src/store/useAppStore.ts`
- `src/pages/CashierPage.tsx`
- `src/pages/KdsPage.tsx`
- `src/pages/TableStandPage.tsx`

TASKS:
1. Cashier POS State & Void Retention (`src/store/useAppStore.ts`):
   - Refactor `voidOrder(orderId, voidReason)`: Do NOT filter out or delete the order! Instead, retain the ticket in `orders` with `status: 'voided'`, `voidReason: voidReason`, and `voidedAt: new Date().toISOString()`.
   - Ensure other store functions (e.g. `clearOrder` or active order filters) respect the `'voided'` status without deleting historical records.
2. Cashier POS Terminal (`src/pages/CashierPage.tsx`):
   - Add a dedicated "Audit Ledger" section or modal displaying:
     - Shift Reconciliation Metrics: Gross Sales, Cash Collected, Card/Apple Pay Collected, Total 14% ETA VAT, Voided Count, and Total Void Value.
     - Chronological transaction ledger listing settled orders and voided orders with timestamps and void reasons.
   - Upgrade all interactive buttons/selectors to minimum 44x44px.
   - Ensure 100% Light Vellum palette (#FFFFFF canvas, #F9F9F9 surfaces, #E5E7EB borders, #262626 text headings, #FF0055 Crimson Flame).
3. Kitchen Pass KDS (`src/pages/KdsPage.tsx`):
   - Refactor from the pitch-black `#0d0f12` theme to 100% Light Vellum workspace tokens:
     - Canvas: `#ffffff`
     - Cards/Surfaces: `#f9f9f9`
     - Hairline borders: `#e5e7eb`
     - Ink headings & text: `#262626`
     - Crimson Flame (`#FF0055`) for priority tickets, rush alerts (>600s), and modifiers.
   - Maintain high typographic legibility: 24px table identifier, 20px item names, live elapsed stopwatch timers.
   - Add visual/audio bump alert when a new verified order arrives at the pass.
   - Fixed bottom batch totals footer aggregating identical dishes across active orders.
4. Table Stand Generator (`src/pages/TableStandPage.tsx`):
   - Replace external HTTP QR service (`api.qrserver.com`) with an offline-resilient inline vector SVG QR code (pure client-side SVG).
   - Display official bilingual restaurant identity: "Live Kitchen (لايف كيتشن)" and official address: "Republic Street, adjacent to El-Montazah Park".
   - 4x6" cardstock tent stand aspect ratio (`aspect-ratio: 4 / 6`) with wood oak / clear acrylic base preview toggles and `@media print` rules.
5. Quality & Compliance:
   - Exactly 0 Unicode emojis across all components and copy.
   - 0 findings in `node .agents/skills/avoid-ai-design/scripts/detect.mjs src`.
   - Strict 3-tier radii (999px, 16px, 8px).
   - `npm run build` succeeds cleanly with 0 errors.
   - Run tests:
     - `node tests/e2e_suite.mjs --feature=9` -> 10/10 PASS
     - `node tests/e2e_suite.mjs --feature=10` -> 10/10 PASS
     - `node tests/e2e_suite.mjs --feature=11` -> 10/10 PASS

DELIVERABLE:
Write your changes report to `/Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/worker_m3/handoff.md`.
Notify me via send_message with command outputs and verification evidence.
