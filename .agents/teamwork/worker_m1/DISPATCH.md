## 2026-11-02T19:08:09Z
You are teamwork_worker for Milestone 1: Design Tokens, AI Anti-Patterns, and Shell Persona Decoupling.
Your metadata working directory: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/worker_m1/
You must read the original user request at: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/ORIGINAL_REQUEST.md
Also read PROJECT.md and AGENTS.md at the project root.
Refer to skill: /Users/apple/Downloads/dev/antigravity/port-said/.agents/skills/avoid-ai-design/SKILL.md
and /Users/apple/Downloads/dev/antigravity/port-said/.agents/skills/first-principles-ux/SKILL.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP FOR THIS MILESTONE:
- `src/index.css`
- `src/components/layout/Sidebar.tsx`
- `src/App.tsx`
- Fixing `detect.mjs` flags in:
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

TASKS:
1. Fix all 17 AI Design Anti-Pattern flags identified by `node .agents/skills/avoid-ai-design/scripts/detect.mjs src`:
   - `SD4m` (Template chrome: monospace on small data labels): Replace `font-mono-num` or `font-mono` on non-numeric text labels and small buttons with standard `font-sans` (Geist). Ensure only actual prices/numbers (e.g. `185.00 EGP`, timer `12:45`) use `font-mono-num`.
   - `SD8` (Emerald accents): Replace emerald classes (`bg-emerald-50`, `text-emerald-800`, `bg-emerald-500`) with neutral tokens (#262626, #727272, #e5e7eb) or Crimson Flame (#FF0055).
   - `C5` (Colored glow shadow): In `src/index.css:213`, simplify or remove the colored blur glow that triggers C5.
   - Run `node .agents/skills/avoid-ai-design/scripts/detect.mjs src` to verify that 0 flags remain.
2. Persona Separation in Navigation Shell:
   - In `src/components/layout/Sidebar.tsx`: Filter `navItems` so that seated dining users on `/menu`, `/companion`, `/tracker`, `/settlement`, or when an active table exists, do NOT see `/kds`, `/cashier`, or `/stand` in either the desktop dock or the mobile drawer.
   - In `src/App.tsx`: Hide the floating desktop dock on `/kds` and `/cashier` so it never obscures workstation registers. Remove staff links (`Staff KDS Line`, `Cashier Register`) from the consumer footer.
3. Prohibited Labels & Academic Names:
   - Remove "Port Said" from `src/App.tsx:103` and `src/pages/CashierPage.tsx:998`. Replace with "Republic Street, adjacent to El-Montazah Park" as specified in `live-kitchen-facts.md`.
4. Radii & Emojis:
   - Ensure radii adhere strictly to 999px (rounded-full), 16px (rounded-2xl), 8px (rounded-lg).
   - Maintain strict 0 Unicode emojis across all modified files.
5. Verification:
   - Run `node .agents/skills/avoid-ai-design/scripts/detect.mjs src` -> must report 0 flags.
   - Run `npm run build` -> must compile with 0 errors.

DELIVERABLE:
Write your changes report to `/Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/worker_m1/handoff.md`.
Notify me via send_message with command outputs and verification evidence.
