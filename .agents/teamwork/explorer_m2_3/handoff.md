# Milestone 2 Investigation Report: Companion Flow, Live Order Tracker & Table Settlement

## 1. Observation

Direct code examination and automated testing across the Milestone 2 consumer surfaces (`src/pages/CompanionPage.tsx`, `src/pages/OrderTrackerPage.tsx`, `src/pages/SettlementPage.tsx`, related lobby components, and `tests/e2e_suite.mjs`) established the following verified facts:

### A. Companion Flow (`src/pages/CompanionPage.tsx` & Multi-Diner Components)
- **Table Session Initialization & Attribution**:
  - `src/pages/CompanionPage.tsx:44-48`: Auto-initializes companion session via `initCompanionSession(cleanTable)` when visiting with `?table=T-04`.
  - `src/pages/CompanionPage.tsx:75-80`: Filters dishes specifically attributed to the companion:
    ```tsx
    return activeTicket.items.filter(
      (item) => item.addedBy?.memberId === effectiveMember.id || item.addedBy?.name === effectiveMember.name
    );
    ```
  - `src/store/useAppStore.ts:559-570`: `addToCartAsCompanion` embeds `addedBy: { memberId: activeUser.id, name: activeUser.name, isHost: activeUser.isHost }` into every cart item.
- **Table Joining & Keypad Ergonomics**:
  - `src/components/multiplayer/TableLobbyBar.tsx:91-117`: The 4-digit PIN is strictly visible ONLY to the Table Host (`pin = activeTablePin || session?.pin`), with a 1-click copy action. Companions see `Shared Table Pool`.
  - `src/components/multiplayer/TableLobbyModal.tsx:177-185`: Companion joins by selecting an animal persona identity (`ANIMAL_IDENTITIES`) and entering a 4-digit PIN via an `<input id="table-pin" type="text" maxLength={4} ... />`. It relies on the mobile device soft-keyboard; there is no on-screen 0-9 touch keypad for tabletop tablet kiosks.
- **Ready Toggle Mechanism**:
  - `src/components/multiplayer/TableLobbyBar.tsx:63-67, 178-193`: Companion clicks button `I am Done Choosing` -> toggles to `Ready (Done Choosing)` (`setMemberReadyToPay`). A green status dot (`bg-[#15803d]`) appears beside their name. The Host sees `Host Controls Active (X/Y Diners Ready)` (lines 208-211).
- **Distributed Personal Share Payment**:
  - `src/pages/CompanionPage.tsx:169-346`: When a collective table order ticket is active (`isSettlementActive && activeTicket`), a dedicated `DISTRIBUTED SETTLEMENT CARD` is rendered directly on the companion's phone.
  - Lines 82-91 compute the companion's personal subtotal + 14% Egyptian ETA VAT (`Math.round(companionSubtotal * 0.14 * 100) / 100`).
  - Lines 262-301 provide personal payment method toggles (`Apple Pay`, `Card`, `Cashier Desk`).
  - Lines 303-316: `Pay My Share (XXX.XX EGP) ->` triggers `payDinerShare(activeTicket.id, effectiveMember.id, selectedMethod, companionTotalShare)`.
  - The companion authorizes and settles their share without handing their phone or credit card to the Host.
- **Touch Target & Radii Violations in `CompanionPage.tsx`**:
  - `CompanionPage.tsx:367`: `<div className="sm:text-right bg-[#f9f9f9] px-4 py-2 rounded-xl border border-[#e5e7eb] shrink-0">` uses prohibited `rounded-xl`.
  - `CompanionPage.tsx:263-301`: Payment method buttons use `p-2.5 rounded-lg border text-center`, resulting in an ~40-42px height, falling short of the mandatory 44x44px minimum touch target.
  - `CompanionPage.tsx:380-392`: Category filter pills use `px-4 py-2 rounded-full text-sm font-medium`, resulting in ~36px height, lacking explicit `min-h-[44px]`.

---

### B. Live Order Tracker (`src/pages/OrderTrackerPage.tsx`)
- **Thermal Chit Perforation & Physical Ticket Realism**:
  - `src/pages/OrderTrackerPage.tsx:122`: Wraps ticket in `.thermal-ticket-light p-6 sm:p-8 bg-white shadow-xs mb-6`.
  - `src/index.css:141-167`: `.thermal-ticket-light::before` and `::after` create 16px semi-circular notches. However, `top: 64px` is hard-coded, while the ticket header height with logo and table details is >90px. Consequently, the notches do not optically align with `.thermal-tear-line` (`border-top: 1px dashed #cbd5e1;`).
- **4 Sequential Stage Indicators**:
  - `OrderTrackerPage.tsx:8-13`: Defines stages:
    1. `received`: 'Order Received' ('Station cooks reviewing kitchen chit')
    2. `cooking`: 'Flame Line Cooking' ('Patties searing & wood-fire oven active')
    3. `ready`: 'Plating & Expediting' ('Final garnish & tray pass inspection')
    4. `served`: 'Delivered to Table' ('Delivered fresh to your table')
  - `OrderTrackerPage.tsx:153-218`: Renders vertical stepper: completed steps show `#FF0055` checkmark; active step shows white circle with 2px `#FF0055` border and glowing pulse; future steps show `#f9f9f9` circle with step number.
- **Stopwatch Elapsed Timer & Bump Alerts**:
  - `OrderTrackerPage.tsx` currently contains ZERO stopwatch elapsed timer code (`ticket.createdAt` exists but elapsed duration is never calculated or displayed).
  - `OrderTrackerPage.tsx` contains NO server bump alert banner when kitchen station updates status (e.g. when order is bumped to `ready`).
- **Voided Order Notice**:
  - If `ticket.status === 'voided'`, `currentStageIndex` evaluates to `-1`. Line 148 defaults headline to `'COOKING'` instead of displaying a cancellation banner with `ticket.voidReason`.

---

### C. Table Bill & Settlement (`src/pages/SettlementPage.tsx`)
- **Split Bill Mode Selector Buttons & Touch Targets**:
  - `SettlementPage.tsx:487, 495, 506`: Mode selectors (`Split by Diner`, `Equal Split`, `Custom Dishes`) include `min-h-[44px]`, passing test `T2.8.1`.
  - `SettlementPage.tsx:681-695`: In Equal Split mode, the `SPLIT_OPTIONS` buttons (`1 Pay All`, `2 Ways`, `3 Ways`, ...) use `px-3 py-1.5 rounded-lg text-[12px]`, giving a height of ~28px. They FAIL the 44x44px touch target directive.
  - `SettlementPage.tsx:886-900`: In Kitchen Gratuity tipping section, the percentage pills use `py-1.5 rounded-lg text-[12px]`, giving a height of ~28px. They also FAIL the 44x44px touch target directive.
- **Tip Percentages Mismatch**:
  - `SettlementPage.tsx:9`: `const TIP_PERCENTAGES = [0, 10, 12, 15];`.
  - Requirements and E2E test `T1.8.4` (`tests/e2e_suite.mjs:540-549`) mandate `[0, 10, 15, 20]`. `SettlementPage.tsx` is missing `20%` and incorrectly includes `12%`.
- **Split by Diner Arithmetic & Pre-Settled Shares**:
  - `SettlementPage.tsx:90-150`: Correctly computes itemized totals per seated diner, 14% VAT, and reflects already settled shares in progress bar:
    ```tsx
    const remainingTableBalance = Math.max(0, Math.round((ticket.total - totalPaidShares) * 100) / 100);
    ```
- **Equal Split Arithmetic**:
  - `SettlementPage.tsx:171`: Computes `const perPersonAmount = Math.round((ticket.total / splitWays) * 100) / 100;`.
  - If `total = 100.00` and `splitWays = 3`, `perPersonAmount = 33.33`. 3 diners paying 33.33 totals 99.99 EGP, leaving an odd penny orphan.
  - `tests/helpers/store_simulation.mjs:45-57` defines the exact odd penny algorithm: `calculateEqualSplit(total, n)` yields `[33.34, 33.33, 33.33]`.
- **Post-Payment Rating & Printable Receipt**:
  - Rating uses SVG star polygons with Happy Yellow `#FBBF24` fill. 0 emojis present.
  - `src/index.css:238-292`: `@media print` cleanly isolates `#printable-receipt`, hiding all `.no-print`, sidebars, headers, and buttons.
  - `SettlementPage.tsx:961-997`: Provides `Print Receipt` (`window.print()`), `Download PDF` (`window.print()`), and `Save as Image` (2x canvas PNG generation).
- **Radii Violation**:
  - `SettlementPage.tsx:519`: `<div className="p-3.5 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] space-y-2">` uses prohibited `rounded-xl`.

---

### D. Zero Unicode Emojis Audit
- Automated regex audit across `CompanionPage.tsx`, `OrderTrackerPage.tsx`, and `SettlementPage.tsx` returned **0 emojis**.
- Avoid-AI-design scanner (`node .agents/skills/avoid-ai-design/scripts/detect.mjs src/pages`) returned **0 findings**.

---

## 2. Logic Chain

```
Observation 1: CompanionPage.tsx:367 and SettlementPage.tsx:519 use `rounded-xl`.
Observation 2: AGENTS.md, PROJECT.md Section 2 strictly restrict radii to 3 tiers:
               999px (rounded-full), 16px (rounded-2xl), 8px (rounded-lg).
--> Inference: Both elements are surface card containers and must be updated to `rounded-2xl`.

Observation 3: SettlementPage.tsx:9 defines `TIP_PERCENTAGES = [0, 10, 12, 15]`.
Observation 4: ORIGINAL_REQUEST.md R1.4 and tests/e2e_suite.mjs T1.8.4 expect tip options of 0%, 10%, 15%, 20%.
--> Inference: TIP_PERCENTAGES must be updated to `[0, 10, 15, 20]` to satisfy feature specifications.

Observation 5: SettlementPage.tsx:686 (SPLIT_OPTIONS) and 891 (TIP_PERCENTAGES) use `py-1.5` (~28px height).
Observation 6: CompanionPage.tsx:266, 279, 292 (payment buttons) and 384 (category pills) lack explicit min-h-[44px].
Observation 7: AGENTS.md requires minimum 44x44px touch targets for all interactive controls.
--> Inference: All interactive pills, option buttons, and method cards must specify `min-h-[44px] flex items-center justify-center`.

Observation 8: OrderTrackerPage.tsx lacks a timer calculation hook and bump alert notification.
Observation 9: KdsPage.tsx:41-51 implements `getElapsedSeconds` and `formatElapsed` converting seconds to mm:ss.
--> Inference: OrderTrackerPage.tsx should incorporate an active 1-second interval timer formatting `ticket.createdAt` as mm:ss, and display an alert banner when `ticket.status === 'ready'`.

Observation 10: In OrderTrackerPage.tsx, voided tickets result in currentStageIndex = -1 and headline falling back to "COOKING".
Observation 11: Feature 7 specifications require explicit void notice with reason.
--> Inference: OrderTrackerPage.tsx must check `ticket.status === 'voided'` and display a prominent red cancellation chit banner with `ticket.voidReason`.
```

---

## 3. Caveats

1. **Test Suite Status**: Features 6, 7, and 8 currently report 10/10 PASS on `node tests/e2e_suite.mjs` because the test suite's static AST checks for touch targets and formatting are satisfied by existing tokens or helper functions. However, physical inspection reveals the interactive UX gaps outlined above (missing stopwatch in UI, 28px tip pills, `rounded-xl` token violations).
2. **Keypad Ergonomics**: While a numeric touch keypad on `TableLobbyModal.tsx` improves tabletop tablet usability, the existing `<input type="text" maxLength={4} />` functions correctly on phones with virtual numeric keyboards (`inputMode="numeric"`). Adding an on-screen keypad should be responsive or cleanly fitted.
3. **Multi-Item Overflow**: In both `OrderTrackerPage.tsx` and `SettlementPage.tsx`, very large orders (10+ items) render within scrollable containers (`max-h-[...] overflow-y-auto` or natural flex flow), which prevents clipping during standard viewing.

---

## 4. Conclusion & Concrete Recommended Implementation Plan for Worker M2

Worker M2 should apply the following targeted modifications across the consumer dining pages:

### Action Item 1: `src/pages/CompanionPage.tsx`
1. **Line 367**: Replace `rounded-xl` with `rounded-2xl`:
   ```tsx
   // BEFORE:
   <div className="sm:text-right bg-[#f9f9f9] px-4 py-2 rounded-xl border border-[#e5e7eb] shrink-0">
   // AFTER:
   <div className="sm:text-right bg-[#f9f9f9] px-4 py-2 rounded-2xl border border-[#e5e7eb] shrink-0">
   ```
2. **Lines 263-301**: Upgrade payment method cards to `min-h-[48px]`:
   Add `min-h-[48px] flex flex-col justify-center` to the 3 payment buttons (`apple_pay`, `card`, `cashier`).
3. **Lines 380-392**: Upgrade category filter pills:
   Add `min-h-[44px] inline-flex items-center justify-center` to the category buttons.

### Action Item 2: `src/pages/OrderTrackerPage.tsx`
1. **Add Stopwatch Elapsed Timer**:
   Implement a 1-second `setInterval` state measuring elapsed time from `ticket.createdAt` or `ticket.paidAt`, formatted as `mm:ss` (e.g., `04:15`).
   Display it in the chit header or tear line:
   ```tsx
   <div className="text-right">
     <span className="text-[11px] text-[#727272]">Kitchen Elapsed</span>
     <span className="text-sm font-mono-num font-bold text-[#FF0055]">{formatElapsed(ticket)}</span>
   </div>
   ```
2. **Add Server Bump Alert Banner**:
   When `ticket.status === 'ready'`, display a prominent status banner:
   ```tsx
   <div className="mb-4 p-3.5 rounded-2xl bg-[#fff0f3] border border-[#ffd1dc] flex items-center justify-between">
     <div className="flex items-center gap-2">
       <span className="w-2.5 h-2.5 rounded-full bg-[#FF0055] animate-ping" />
       <span className="text-[13px] font-bold text-[#FF0055]">Order Plated & Ready</span>
     </div>
     <span className="text-[12px] text-[#727272]">Staff heading to Table {ticket.tableNumber}</span>
   </div>
   ```
3. **Add Voided Order Cancellation View**:
   When `ticket.status === 'voided'`, replace cooking headline with:
   ```tsx
   <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 space-y-1">
     <div className="text-sm font-bold">Order Voided by Front Cashier</div>
     <div className="text-xs">{ticket.voidReason || 'Order cancelled at register.'}</div>
   </div>
   ```

### Action Item 3: `src/pages/SettlementPage.tsx`
1. **Line 9**: Update `TIP_PERCENTAGES`:
   ```tsx
   // BEFORE:
   const TIP_PERCENTAGES = [0, 10, 12, 15];
   // AFTER:
   const TIP_PERCENTAGES = [0, 10, 15, 20];
   ```
2. **Line 519**: Replace `rounded-xl` with `rounded-2xl`:
   ```tsx
   // BEFORE:
   <div className="p-3.5 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] space-y-2">
   // AFTER:
   <div className="p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#e5e7eb] space-y-2">
   ```
3. **Lines 681-695**: Upgrade Equal Split option buttons:
   Replace `px-3 py-1.5 rounded-lg text-[12px]` with `min-h-[44px] min-w-[56px] px-3.5 py-2.5 rounded-lg text-[13px] flex items-center justify-center`.
4. **Lines 886-900**: Upgrade Kitchen Gratuity tipping pills:
   Replace `py-1.5 rounded-lg text-[12px]` with `min-h-[44px] py-2.5 rounded-lg text-[13px] font-medium flex items-center justify-center`.
5. **Equal Split Odd Penny Accounting**:
   Incorporate `calculateEqualSplit(ticket.total, splitWays)` to display exact individual shares (e.g., `33.34 EGP, 33.33 EGP, 33.33 EGP`) rather than a single rounded fraction.

### Action Item 4: Associated Consumer Components Radii Clean-Up (Bonus Context for M2)
- `src/components/cart/CartDrawer.tsx:354, 381`: Replace `rounded-xl` with `rounded-2xl`.
- `src/components/auth/AccountModal.tsx:195, 267`: Replace `rounded-xl` with `rounded-2xl`.
- `src/components/menu/DishModal.tsx:142`: Replace `rounded-xl` with `rounded-2xl`.
- `src/components/menu/DishModal.tsx:156`: Replace `rounded-md` with `rounded-lg`.

---

## 5. Verification Method

To verify these findings and confirm resolution:

1. **Radii Tokens Check**:
   ```bash
   grep -n "rounded-xl" src/pages/CompanionPage.tsx src/pages/SettlementPage.tsx
   ```
   *Expected after Worker M2 fixes: 0 results.*

2. **Tip Percentages Check**:
   ```bash
   grep -n "TIP_PERCENTAGES" src/pages/SettlementPage.tsx
   ```
   *Expected: `[0, 10, 15, 20]`.*

3. **Touch Targets Check**:
   ```bash
   node tests/e2e_suite.mjs --feature=8
   ```
   *Expected: All Feature 8 tests pass cleanly.*

4. **Full Feature Regression**:
   ```bash
   node tests/e2e_suite.mjs --feature=6
   node tests/e2e_suite.mjs --feature=7
   node tests/e2e_suite.mjs --feature=8
   ```

5. **Anti-Pattern & Zero Emoji Verification**:
   ```bash
   node .agents/skills/avoid-ai-design/scripts/detect.mjs src/pages
   node tests/e2e_suite.mjs --feature=2
   ```

6. **Build Cleanliness**:
   ```bash
   npm run build
   ```
   *Expected: 0 TypeScript errors, bundle generated cleanly.*
