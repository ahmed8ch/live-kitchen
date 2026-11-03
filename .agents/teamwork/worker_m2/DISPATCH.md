## 2026-11-02T22:21:24Z
You are teamwork_worker for Milestone 2: Consumer Dining Experience (Screens 1 through 4).
Your metadata working directory: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/worker_m2/
You must read the original user request at: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/ORIGINAL_REQUEST.md
Also read PROJECT.md, AGENTS.md, and TEST_READY.md at the project root.
Refer to skills:
- /Users/apple/Downloads/dev/antigravity/port-said/.agents/skills/first-principles-ux/SKILL.md
- /Users/apple/Downloads/dev/antigravity/port-said/.agents/skills/avoid-ai-design/SKILL.md
- /Users/apple/Downloads/dev/antigravity/port-said/.agents/skills/redesign-existing-projects/SKILL.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP FOR MILESTONE 2:
- `src/pages/MenuPage.tsx`
- `src/pages/CompanionPage.tsx`
- `src/pages/OrderTrackerPage.tsx`
- `src/pages/SettlementPage.tsx`
- `src/components/menu/DishModal.tsx`
- `src/components/menu/DishCard.tsx`
- `src/components/cart/CartDrawer.tsx`
- `src/components/cart/FloatingCartBar.tsx`
- `src/components/multiplayer/TableLobbyBar.tsx`
- `src/components/multiplayer/TableLobbyModal.tsx`
- `src/components/auth/AccountModal.tsx`

TASKS:
1. Menu Page (`/menu?table=T-04`):
   - Touch Ergonomics: Expand dietary filter pills from `py-1` (~26px) to minimum 44px height (`min-h-[44px]`). Ensure category pills and search inputs also meet minimum 44px tap targets.
   - Clickable Cards: Ensure the entire dish card is clickable (tapping anywhere opens DishModal).
   - Dish Customization (`DishModal.tsx`): Polish touchscreen customization (options, crust/doneness, add-ons, quantity selectors >=44px).
   - Floating Cart Pill (`FloatingCartBar.tsx`): Clean vellum surface, Crimson Flame badge, >=44px height.
   - Cart Drawer (`CartDrawer.tsx`): Table Host authority strictly preserved (only Host can finalize order; guests have "Waiting for Host" and "Done Choosing (Notify Host)").
   - Table Lobby (`TableLobbyBar.tsx`, `TableLobbyModal.tsx`): Touch targets >=44px (kick button, leave button, reset).
   - Loyalty Profile (`AccountModal.tsx`): Convert dark gradient card (`bg-gradient-to-br from-[#262626] to-[#171717]`) to 100% Light Vellum tokens (#ffffff, #f9f9f9, #e5e7eb, #262626, #FF0055).
2. Companion Flow (`/companion`):
   - 4-digit PIN join screen with generous touch targets.
   - Attributed dish selection (`addedBy: member.name`).
   - Ready toggle with clear tactile feedback.
   - Distributed personal share settlement card (itemized diner share + 14% VAT + Apple Pay / Card / Cashier authorization).
3. Live Order Tracker (`/tracker` & `/order/:id`):
   - Thermal chit perforation styling at top/bottom.
   - 4-stage indicators (Received -> Prep -> Grill -> Pass) with Crimson Flame signal (#FF0055).
   - Live elapsed stopwatch timer (`04:32`).
   - Server bump alerts.
4. Table Bill & Settlement (`/settlement`):
   - Split modes: Itemized Split, Equal Split (penny-exact division: 33.34 + 33.33 + 33.33 = 100.00 EGP).
   - Touch Ergonomics: Expand split selector buttons from `py-1.5` to minimum 44px height (`min-h-[44px]`), equal split pills, tip pills (0%, 10%, 15%, 20%), rating stars to >=44x44px.
   - Post-payment rating with clean Light Vellum styling.
   - Thermal receipt print layout / PDF trigger (`window.print()`).
5. Standards & Verification:
   - 100% Light Vellum palette (#FFFFFF, #F9F9F9, #E5E7EB, #262626, #FF0055). No dark fills, no saturated emerald/purple.
   - Exactly 0 Unicode emojis across all components and copy.
   - Zero "Port Said" or academic labels in user-facing UI.
   - Radii: 999px (rounded-full), 16px (rounded-2xl), 8px (rounded-lg).
   - Verification commands:
     - `node tests/e2e_suite.mjs --feature=5` -> 10/10 PASS
     - `node tests/e2e_suite.mjs --feature=6` -> 10/10 PASS
     - `node tests/e2e_suite.mjs --feature=7` -> 10/10 PASS
     - `node tests/e2e_suite.mjs --feature=8` -> 10/10 PASS
     - `node .agents/skills/avoid-ai-design/scripts/detect.mjs src` -> 0 findings
     - `npm run build` -> clean exit code 0
