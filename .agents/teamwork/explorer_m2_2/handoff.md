# Milestone 2 Investigation Report: Cart, Table Lobby & Account Modals

## 1. Observation

Direct evidence gathered from static code analysis, AST inspection, regex pattern matching, and store state tracing across the five targeted components:
- `src/components/cart/CartDrawer.tsx`
- `src/components/cart/FloatingCartBar.tsx`
- `src/components/multiplayer/TableLobbyBar.tsx`
- `src/components/multiplayer/TableLobbyModal.tsx`
- `src/components/auth/AccountModal.tsx`
- and supporting store `src/store/useAppStore.ts`

### 1.1 First-Principles UX & Host Authority
- **Observation 1.1a (`CartDrawer.tsx:50-56`)**:
  ```tsx
  const isCompanionRoute =
    location.pathname.startsWith('/companion') ||
    location.pathname.startsWith('/guest-order') ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/companion') || window.location.pathname.startsWith('/guest-order')));

  const isHost = !isCompanionRoute;
  ```
  `isHost` is calculated strictly by testing whether the URL path starts with `/companion` or `/guest-order`. If a companion diner joins Table T-04 via PIN and is browsing `/menu?table=T-04`, `isCompanionRoute` evaluates to `false`, causing `isHost` to evaluate to `true`.
- **Observation 1.1b (`CartDrawer.tsx:57-60`)**:
  ```tsx
  const hostMember = session?.members?.find((m) => m.isHost) || (currentMember?.isHost ? currentMember : null);
  const effectiveMember = isHost
    ? (hostMember || currentMember)
    : (companionMember || currentMember);
  ```
  When `isHost` evaluates to `true`, `effectiveMember` defaults to `hostMember` rather than the joined `currentMember`. Consequently, the companion's cart treats them as the Host, reveals the "Submit Table Order" button (line 478), and allows them to clear the entire table cart (line 144) or remove other seated diners (line 220).
- **Observation 1.1c (`TableLobbyBar.tsx:39-46`)**:
  ```tsx
  const isCompanionView =
    location.pathname.startsWith('/companion') ||
    location.pathname.startsWith('/guest-order') ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/companion') || window.location.pathname.startsWith('/guest-order')));
  const session = activeTable ? tableSessions[activeTable] : null;
  const members = session?.members || [];
  const isHost = !isCompanionView;
  ```
  Similarly in `TableLobbyBar.tsx`, `isHost` is determined exclusively by `!isCompanionView`. A companion diner navigating to `/menu?table=T-04` is rendered with the Crimson "HOST" tag (line 80), sees the private 4-digit Table PIN (lines 92-111), and sees "Host Controls Active" (lines 207-211).
- **Observation 1.1d (`src/store/useAppStore.ts:945-951`)**:
  ```tsx
  const isCompanionRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/companion') || window.location.pathname.startsWith('/guest-order'));

  const activeUser = isCompanionRoute
    ? (get().companionMember || currentMember || { id: 'guest-solo', name: 'You', isHost: false, isReadyToPay: false, joinedAt: Date.now() })
    : (hostMember || currentMember || { id: 'host-solo', name: 'Red Panda (Host)', isHost: true, isReadyToPay: false, joinedAt: Date.now() });
  ```
  In `addToCart`, when `isCompanionRoute` is `false`, `activeUser` checks `hostMember` before `currentMember`. Since `hostMember` exists in `session.members`, any item added to the cart by a companion browsing the menu is attributed to the Host (`addedBy: hostMember`).

### 1.2 Floating Cart Bar & Cart Drawer Ergonomics
- **Observation 1.2a (Touch targets below 44x44px in `CartDrawer.tsx`)**:
  - Line 146: `Clear Cart` button has `px-2.5 py-1.5 rounded-full` -> vertical height is ~28px.
  - Lines 391, 402, 413: Payment Strategy buttons (`host_pays_all`, `split_by_diner`, `equal_split`) have `p-2 rounded-lg border text-[11px]` -> vertical height is ~32px.
  - Line 457: Payment choice `Back` button has `py-2 rounded-full text-[12px]` -> vertical height is ~32px.
  - Line 464: Payment choice `Submit Table Order` button has `py-2.5 rounded-full text-[12px]` -> vertical height is ~36px.
- **Observation 1.2b (Touch targets below 44x44px in `TableLobbyBar.tsx`)**:
  - Line 28: `Join Table Pool ->` button has `px-3.5 py-1.5 rounded-full` -> vertical height is ~28px.
  - Line 100: Table PIN copy button has `px-2.5 py-0.5 rounded-lg` -> vertical height is ~26px.
  - Line 151: Kick member button has `w-4 h-4 rounded-full` -> physical footprint is 16x16px.
  - Line 166: `Reset Diners` button has `px-2 py-0.5 rounded-full` -> vertical height is ~22px.
  - Line 186: Toggle Ready button has `px-3 py-1 rounded-full` -> vertical height is ~28px.
  - Line 197: `Leave` button has `text-[11px] px-1` -> vertical height is ~18px.
- **Observation 1.2c (Touch targets below 44x44px in `TableLobbyModal.tsx`)**:
  - Line 90: Close modal button has `w-8 h-8 rounded-full` -> 32x32px.
  - Line 128: Animal identity buttons have `p-2.5 rounded-lg text-[12px]` -> vertical height is ~38px.
- **Observation 1.2d (Touch targets below 44x44px in `AccountModal.tsx`)**:
  - Line 119: Close modal button has `w-8 h-8 rounded-full` -> 32x32px.
  - Lines 135, 146, 159, 170, 181: Tab buttons have `py-3 px-3 text-[13px]` -> vertical height is ~40px.
  - Lines 232, 358: Form submit buttons have `py-2.5 rounded-full` -> vertical height is ~36px.
  - Line 245: 1-Click Demo button has `py-2 rounded-full` -> vertical height is ~32px.
  - Lines 342, 417: Dietary filter pills have `px-2.5 py-1 rounded-full` -> vertical height is ~24px.
  - Lines 460, 467: Past orders action buttons have `py-2 rounded-full` -> vertical height is ~32px.
  - Line 541: Reorder single item (`+ Add to Cart`) has inline link styling without touch padding.
  - Line 564: Reorder entire meal button has `py-1 rounded-full text-[11px]` -> vertical height is ~24px.
- **Observation 1.2e (Quantity Steppers & Order Notes in `CartDrawer.tsx`)**:
  - Lines 295, 305: Quantity adjustment buttons have `min-w-[44px] min-h-[44px] rounded-full`.
  - Line 282: Item notes are displayed if present (`item.notes`), but there is NO input in `CartDrawer.tsx` to add or edit notes, nor is there an order-level note input for kitchen requests.
- **Observation 1.2f (14% VAT Display Clarity)**:
  - `CartDrawer.tsx:343` displays `Taxes & Fees (14%)`. It does not explicitly state "14% Egyptian ETA VAT (ضريبة القيمة المضافة)".
  - `FloatingCartBar.tsx:68` displays `subtotal.toFixed(2)} EGP`. It does not indicate whether this amount includes or excludes the 14% Egyptian VAT.

### 1.3 Account Modal Styling & Residual Dark Gradients
- **Observation 1.3a (`AccountModal.tsx:380-400`)**:
  ```tsx
  <div className="bg-gradient-to-br from-[#262626] to-[#171717] text-white p-5 rounded-2xl relative overflow-hidden shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <span className="text-[11px] text-[#999999] font-medium">
          Live Kitchen Loyalty Balance
        </span>
        <div className="text-3xl font-mono-num font-bold text-white mt-1">
          {userAccount.loyaltyPointsEgp.toFixed(2)}{' '}
          <span className="text-[14px] text-[#FF0055] font-normal">EGP</span>
        </div>
      </div>
      <div className="px-2.5 py-1 bg-white/10 rounded-full text-[11px] font-medium text-white">
        10% Cashback Tier
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-[#cccccc]">
      <span>Member ID: {userAccount.id}</span>
      <span>{userAccount.phone}</span>
    </div>
  </div>
  ```
  The loyalty card uses a dark linear gradient (`from-[#262626] to-[#171717]`), white text (`text-white`), semi-transparent white borders (`border-white/10`), and muted grey text (`text-[#cccccc]`, `text-[#999999]`). This violates the mandatory 100% Light Vellum palette directive in `AGENTS.md` and `PROJECT.md`.

### 1.4 Radii Token Standardization
- **Observation 1.4a (`CartDrawer.tsx:354`)**:
  `className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-1"`
  Uses `rounded-xl`. Prohibited under the 3-tier system.
- **Observation 1.4b (`CartDrawer.tsx:381`)**:
  `className="p-4 rounded-xl bg-white border border-[#e5e7eb] space-y-3 animate-in fade-in duration-150"`
  Uses `rounded-xl`. Prohibited under the 3-tier system.
- **Observation 1.4c (`AccountModal.tsx:195`)**:
  `className="p-3 bg-[#fff0f3] border border-[#ffd1dc] rounded-xl text-[12px] text-[#262626]"`
  Uses `rounded-xl`. Prohibited under the 3-tier system.
- **Observation 1.4d (`AccountModal.tsx:267`)**:
  `className="p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-[12px] text-[#166534]"`
  Uses `rounded-xl`. Prohibited under the 3-tier system.
- **Observation 1.4e (`CartDrawer.tsx:391, 402, 413`)**:
  Uses `rounded-lg` on payment strategy buttons rather than `rounded-full` (999px).

### 1.5 Zero Unicode Emojis
- **Observation 1.5a (Regex scan across TSX source)**:
  Scanned all 5 target components with unicode regex `[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}]/u`.
  Result: 0 Unicode emojis found across all 5 files. All icons utilize Lucide inline SVGs or typographic glyphs (`->`, `×`).

---

## 2. Logic Chain

1. **Host Authority Vulnerability**:
   - `CartDrawer.tsx:56` and `TableLobbyBar.tsx:46` equate `isHost` to `!isCompanionRoute`.
   - When a companion joins a table and navigates to the standard menu at `/menu?table=T-04`, `location.pathname` is `/menu`, NOT `/companion`.
   - `isCompanionRoute` evaluates to `false`.
   - `isHost` therefore evaluates to `true`.
   - The companion diner is mistakenly granted Host privileges: they see the Host badge, the private Table PIN, the Table Order Submission button, and the Table Reset/Clear controls.
   - In addition, `useAppStore.ts:951` selects `hostMember` over `currentMember` when `isCompanionRoute` is false, attributing dishes added by companions on `/menu` to the Host instead of the companion.
   - *Conclusion*: Host authority and member attribution must be tied to the member's profile state (`currentMember?.isHost`) rather than relying solely on the URL route prefix.

2. **Touch Ergonomics & Accessibility**:
   - Touchscreen restaurant kiosks and mobile devices require generous tap targets (minimum 44x44px according to WCAG 2.5.5 and `AGENTS.md`).
   - Multiple secondary buttons, close buttons, modal tabs, dietary tags, and inline action links currently range from 16px to 36px in height (`CartDrawer.tsx:146, 391-413, 457, 464`, `TableLobbyBar.tsx:28, 100, 151, 166, 186, 197`, `TableLobbyModal.tsx:90`, `AccountModal.tsx:119, 232, 245, 342, 417, 460, 467, 564`).
   - *Conclusion*: These elements must be standardized with `min-h-[44px]` (or `min-w-[44px] min-h-[44px]` for circular/square action icons) and optical centering.

3. **Design System & Palette Compliance**:
   - `AGENTS.md` and `PROJECT.md` mandate a 100% Light Workspace with zero dark fills or gradients: Canvas `#ffffff`, cards `#f9f9f9`, borders `#e5e7eb`, headings `#262626`, signal `#FF0055`.
   - `AccountModal.tsx:380` implements a dark gradient (`bg-gradient-to-br from-[#262626] to-[#171717] text-white`).
   - Although test `T2.4.4` passed because it specifically checked for `from-neutral-900` and `#0d0f12`, the `#262626` to `#171717` dark fill violates the design system contract.
   - *Conclusion*: The loyalty card must be refactored to a Light Vellum card (`bg-[#f9f9f9] border border-[#e5e7eb] text-[#262626]`).

4. **Radii Token Standardization**:
   - Design tokens establish a strict 3-tier radii standard: `rounded-full` (999px) for buttons/pills, `rounded-2xl` (16px) for cards/modals, `rounded-lg` (8px) for inputs/notes.
   - `CartDrawer.tsx` (lines 354, 381) and `AccountModal.tsx` (lines 195, 267) use `rounded-xl`.
   - *Conclusion*: Replace all 4 instances of `rounded-xl` with `rounded-2xl` (16px).

5. **Clarity on Pricing and Egyptian ETA VAT**:
   - Egypt mandates a 14% Value Added Tax on dining services.
   - `FloatingCartBar.tsx` displays the subtotal without clarifying whether tax is included, which causes pricing dissonance when the cart drawer opens with an additional 14% VAT line item.
   - *Conclusion*: Add an explicit indicator on `FloatingCartBar.tsx` (e.g. `Subtotal (excl. 14% VAT)`) and update `CartDrawer.tsx` from "Taxes & Fees (14%)" to "14% Egyptian ETA VAT (ضريبة القيمة المضافة)".

---

## 3. Caveats

1. **BroadcastChannel Synchronization Across Windows**:
   - Table sessions synchronize across browser tabs using the HTML5 `BroadcastChannel('flamelink_table_sync')`. When testing multiplayer behavior locally in multiple browser tabs, ensure tab 1 is initialized as Host before tab 2 joins via PIN.
2. **Order-Level Notes Schema**:
   - `OrderTicket` in `src/types/domain.ts` currently does not have an `orderNotes?: string` top-level field (only individual `CartItem.notes?: string` exists). Adding an order-level note input in `CartDrawer.tsx` requires adding `orderNotes?: string` to `OrderTicket` in `src/types/domain.ts` and `createOrder` in `src/store/useAppStore.ts`.
3. **Existing E2E Test Suite Passing State**:
   - All 148 automated tests in `tests/e2e_suite.mjs` are currently passing. Refactoring must strictly maintain backwards compatibility with existing test assertions (such as selector names, ticket fields, and role checks).

---

## 4. Conclusion

The consumer cart, table lobby, and account modals are structurally functional, but require targeted refinements before Milestone 2 can be deemed complete:
1. **Fix Persona State Resolution**: Decouple `isHost` from URL route checks in `CartDrawer.tsx`, `TableLobbyBar.tsx`, and `useAppStore.ts:addToCart`. Ground `isHost` in `currentMember?.isHost` so companions browsing `/menu` remain strictly isolated from Host order submission.
2. **Standardize Touch Ergonomics**: Apply `min-h-[44px]` (and `min-w-[44px] min-h-[44px]`) across all interactive buttons, pills, steppers, and modal triggers.
3. **Eliminate Dark Gradient in AccountModal**: Convert the loyalty balance card to a 100% Light Vellum card (`bg-[#f9f9f9] border-[#e5e7eb] text-[#262626]`).
4. **Purge Prohibited Radii**: Replace all 4 occurrences of `rounded-xl` with `rounded-2xl`.
5. **Clarify 14% Egyptian ETA VAT & Add Order Notes**: Clarify VAT on the floating cart bar and drawer, and provide an order note input for kitchen instructions.

---

## 5. Concrete Recommended Implementation Plan for Worker M2

### Task 1: Fix Host Authority & Companion Persona Detection
- **Target Files**:
  - `src/components/cart/CartDrawer.tsx:50-61`
  - `src/components/multiplayer/TableLobbyBar.tsx:39-53`
  - `src/store/useAppStore.ts:945-952`
- **Implementation**:
  In `CartDrawer.tsx` and `TableLobbyBar.tsx`:
  ```tsx
  // Derive isHost from seated member profile state first, then route fallback
  const isCompanionRoute =
    location.pathname.startsWith('/companion') ||
    location.pathname.startsWith('/guest-order') ||
    (typeof window !== 'undefined' &&
      (window.location.pathname.startsWith('/companion') || window.location.pathname.startsWith('/guest-order')));

  const isHost = currentMember
    ? Boolean(currentMember.isHost)
    : companionMember
    ? false
    : !isCompanionRoute;

  const hostMember = session?.members?.find((m) => m.isHost) || (currentMember?.isHost ? currentMember : null);
  const effectiveMember = isHost
    ? (hostMember || currentMember)
    : (companionMember || currentMember);
  ```
  In `src/store/useAppStore.ts:945-952` (`addToCart`):
  ```tsx
  // Attribute item to current seated member first, avoiding premature host fallback
  const activeUser = currentMember
    ? currentMember
    : companionMember
    ? companionMember
    : isCompanionRoute
    ? { id: 'guest-solo', name: 'You', isHost: false, isReadyToPay: false, joinedAt: Date.now() }
    : (hostMember || { id: 'host-solo', name: 'Red Panda (Host)', isHost: true, isReadyToPay: false, joinedAt: Date.now() });
  ```

### Task 2: Standardize Radii Tokens (Eliminate `rounded-xl`)
- **Target Files**:
  - `src/components/cart/CartDrawer.tsx`:
    - Line 354: change `rounded-xl` -> `rounded-2xl`
    - Line 381: change `rounded-xl` -> `rounded-2xl`
  - `src/components/auth/AccountModal.tsx`:
    - Line 195: change `rounded-xl` -> `rounded-2xl`
    - Line 267: change `rounded-xl` -> `rounded-2xl`

### Task 3: Redesign Loyalty Card in `AccountModal.tsx` to 100% Light Vellum
- **Target File**: `src/components/auth/AccountModal.tsx:380-400`
- **Implementation**:
  Replace:
  ```tsx
  <div className="bg-gradient-to-br from-[#262626] to-[#171717] text-white p-5 rounded-2xl relative overflow-hidden shadow-md">
  ```
  With:
  ```tsx
  <div className="bg-[#f9f9f9] border border-[#e5e7eb] p-5 rounded-2xl relative overflow-hidden shadow-xs">
    <div className="flex items-start justify-between">
      <div>
        <span className="text-[11px] text-[#727272] font-medium">
          Live Kitchen Loyalty Balance
        </span>
        <div className="text-3xl font-mono-num font-bold text-[#262626] mt-1">
          {userAccount.loyaltyPointsEgp.toFixed(2)}{' '}
          <span className="text-[14px] text-[#FF0055] font-normal">EGP</span>
        </div>
      </div>
      <div className="px-2.5 py-1 bg-[#fff0f3] border border-[#ffd1dc] rounded-full text-[11px] font-semibold text-[#FF0055]">
        10% Cashback Tier
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-[#e5e7eb] flex items-center justify-between text-[11px] text-[#727272]">
      <span>Member ID: <span className="font-mono-num text-[#262626]">{userAccount.id}</span></span>
      <span className="font-mono-num text-[#262626]">{userAccount.phone}</span>
    </div>
  </div>
  ```

### Task 4: Upgrade Touch Ergonomics (>=44x44px Targets)
- **Target Files**:
  - `src/components/cart/CartDrawer.tsx`:
    - Line 146 (`Clear Cart`): `min-h-[44px] min-w-[44px] px-3 inline-flex items-center`
    - Lines 391, 402, 413 (Split Strategy buttons): `min-h-[44px] px-3 py-2.5 rounded-full`
    - Line 457 (`Back`): `min-h-[44px] py-2.5 px-4`
    - Line 464 (`Submit Table Order ->`): `min-h-[44px] py-3 px-4`
  - `src/components/cart/FloatingCartBar.tsx`:
    - Line 46: add `min-h-[48px]` to ensure resilient mobile touch target.
    - Right side: add descriptive tax indicator:
      ```tsx
      <div className="flex flex-col items-end">
        <span className="font-mono-num font-bold text-[15px] text-[#FF0055]" data-ui-number>
          {subtotal.toFixed(2)} EGP
        </span>
        <span className="text-[10px] text-[#727272] font-medium">
          + 14% VAT at checkout
        </span>
      </div>
      ```
  - `src/components/multiplayer/TableLobbyBar.tsx`:
    - Line 28: `min-h-[44px] px-4 py-2.5`
    - Line 100: `min-h-[44px] px-3.5 py-2 rounded-full`
    - Line 151: expand kick button hit area with `w-8 h-8 rounded-full` or `min-w-[44px] min-h-[44px]` container.
    - Line 166: `min-h-[44px] px-3 py-2`
    - Line 186: `min-h-[44px] px-4 py-2.5`
    - Line 197: `min-h-[44px] px-3 inline-flex items-center`
  - `src/components/multiplayer/TableLobbyModal.tsx`:
    - Line 90: `min-w-[44px] min-h-[44px]`
    - Line 128: `min-h-[44px]`
  - `src/components/auth/AccountModal.tsx`:
    - Line 119: `min-w-[44px] min-h-[44px]`
    - Lines 135, 146, 159, 170, 181: `min-h-[44px] py-3 px-4`
    - Lines 232, 358: `min-h-[44px] py-3`
    - Line 245: `min-h-[44px] py-2.5`
    - Lines 342, 417: `min-h-[36px] sm:min-h-[44px] px-3.5 py-2`
    - Lines 460, 467: `min-h-[44px] py-2.5 px-4`
    - Line 541: `min-h-[44px] inline-flex items-center px-2`
    - Line 564: `min-h-[44px] py-2.5 px-4`

### Task 5: Add Kitchen Order Notes Field & Tax Label Standardization
- **Target Files**:
  - `src/types/domain.ts`: Add `orderNotes?: string;` to `OrderTicket`.
  - `src/store/useAppStore.ts`: Update `createOrder` signature to accept `(paymentMethod, splitStrategy, orderNotes?: string)`.
  - `src/components/cart/CartDrawer.tsx`:
    - Add state: `const [orderNotes, setOrderNotes] = useState('');`
    - Add note input field right above the subtotal:
      ```tsx
      <div className="pt-2">
        <label htmlFor="cart-order-notes" className="block text-[12px] font-medium text-[#262626] mb-1">
          Kitchen Notes / Allergies (Optional)
        </label>
        <input
          id="cart-order-notes"
          type="text"
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="e.g. Extra napkins, serve all dishes together, peanut allergy"
          className="w-full px-3 py-2 rounded-lg border border-[#e5e7eb] bg-white text-[13px] text-[#262626] focus:outline-none focus:border-[#FF0055]"
        />
      </div>
      ```
    - Pass `orderNotes` into `createOrder(method, splitStrategy, orderNotes)`.
    - Change line 343 label to `14% Egyptian ETA VAT (ضريبة القيمة المضافة)`.

---

## 6. Verification Method

To independently verify all findings and test subsequent implementations:

1. **Verify Prohibited Radii Elimination**:
   ```bash
   grep -rn "rounded-xl" src/components/cart/ src/components/multiplayer/ src/components/auth/
   # Expected output: 0 results
   ```
2. **Verify Dark Gradient Elimination in AccountModal**:
   ```bash
   grep -rn "bg-gradient" src/components/auth/AccountModal.tsx
   # Expected output: 0 results
   ```
3. **Verify Zero Unicode Emojis**:
   ```bash
   node tests/e2e_suite.mjs --feature=2
   # Expected output: 10 Passed / 0 Failed
   ```
4. **Verify Host Authority & Companion Flow**:
   ```bash
   node tests/e2e_suite.mjs --feature=6
   # Expected output: 10 Passed / 0 Failed
   ```
5. **Verify Full Automated E2E Suite & Production Build**:
   ```bash
   node tests/e2e_suite.mjs
   # Expected output: 148 Passed / 0 Failed across all 4 tiers
   ```
6. **Verify Avoid AI Design Clean Scan**:
   ```bash
   node .agents/skills/avoid-ai-design/scripts/detect.mjs src
   # Expected output: 0 findings (P0: 0, P1: 0, P2: 0)
   ```
