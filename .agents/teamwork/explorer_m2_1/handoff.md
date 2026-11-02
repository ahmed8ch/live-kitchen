# Milestone 2 Exploration Report: Consumer Dining Experience (Menu Page & Customization Modals)

**Author**: teamwork_explorer (instance 1)  
**Date**: 2026-11-03T00:10:00Z  
**Scope**: Consumer Dining Experience (`MenuPage.tsx`, `DishModal.tsx`, `DishCard`, `DietaryFilters`, radii tokens, touch ergonomics, pricing arithmetic, zero emojis, first-principles UX)  
**Target Recipient**: Worker M2 & Orchestrator M2  

---

## 1. Observation

Direct factual observations verified via AST inspection, file analysis, and test execution:

### 1.1 Touch Ergonomics & Dimensions
- **Dietary Filter Pills (`src/pages/MenuPage.tsx:168-189`)**:
  - Code:
    ```tsx
    <button
      key={tag}
      type="button"
      onClick={() => setSelectedTag(tag)}
      className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs transition-all shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 ${
        selectedTag === tag
          ? 'bg-[#262626] text-white font-bold'
          : 'bg-[#f9f9f9] text-[#727272] hover:bg-[#f0f0f0] border border-[#e5e7eb]'
      }`}
    >
    ```
  - Test Result: `node tests/e2e_suite.mjs --feature=5` passes `T1.5.2` (`Dietary filter pills meet >=44px height`).
  - Finding: While `min-h-[44px]` is present, `min-w-[44px]` is omitted on individual tag pills. For short labels (e.g. tag "all"), adding `min-w-[44px]` guarantees the recommended 44x44px touch square per WCAG 2.2 and Apple HIG.
- **Category Filter Pills (`src/pages/MenuPage.tsx:150-165`)**:
  - Code at line 156: `className="px-4 py-2 min-h-[44px] rounded-full text-sm font-medium transition-all shrink-0 cursor-pointer flex items-center justify-center active:scale-95 ..."`
  - Test Result: `T1.5.3` passes. Meets 44px height and provides `active:scale-95` tactile response.
- **Search Bar Input & Clear Control (`src/pages/MenuPage.tsx:120-147`)**:
  - Code at line 132:
    ```tsx
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search dishes by name, ingredient, or cut..."
      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e5e7eb] bg-[#f9f9f9] text-[13px] text-[#262626] placeholder-[#949494] focus:outline-none focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055]/15 transition-all shadow-xs"
    />
    ```
  - Finding: The search input is sized with `py-2.5 text-[13px]` (~38px height), falling short of the 44px touch threshold (`min-h-[44px]`).
  - Clear button at line 138: `className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#949494] hover:text-[#262626] cursor-pointer"`. Its tap area is bounded only by the icon width (~16px) plus right padding rather than a 44x44px target box.
- **Full Dish Card Click Target (`src/pages/MenuPage.tsx:230-313`)**:
  - Code at lines 233-243:
    ```tsx
    role="button"
    tabIndex={0}
    onClick={() => setSelectedDish(dish)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setSelectedDish(dish);
      }
    }}
    data-ui-radius="16"
    className="group bg-white rounded-2xl border border-[#e5e7eb] overflow-hidden shadow-xs hover:border-[#FF0055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF0055] transition-all cursor-pointer flex flex-col active:scale-[0.99] select-none"
    ```
  - Finding: Card tap target covers the entire card body (300px+ by 380px+). Keyboard navigation handles Enter and Space. The bottom "Customize +" tag is a styled non-button `<span>`, preventing nested interactive event interference. Test `T1.5.1` passes.

### 1.2 Customization Modal (`src/components/menu/DishModal.tsx`)
- **Quantity Controls (`DishModal.tsx:201-220`)**:
  - Decrement at line 204: `onClick={() => setQuantity(Math.max(1, quantity - 1))}` with `min-w-[44px] min-h-[44px]`.
  - Increment at line 214: `onClick={() => setQuantity(quantity + 1)}` with `min-w-[44px] min-h-[44px]`.
  - Finding: Touch dimensions satisfy `T1.5.4` (`>=44x44px`). However, the decrement button lacks a disabled state indicator when `quantity === 1` (`disabled={quantity <= 1}`), and the increment button lacks an upper ceiling bound (`Math.min(50, quantity + 1)`).
- **Modifier Pricing Arithmetic (`DishModal.tsx:43-45, 229`)**:
  - Code:
    ```tsx
    const modTotal = selectedModifiers.reduce((sum, m) => sum + m.price, 0);
    const itemTotal = (dish.basePrice + modTotal) * quantity;
    ```
  - Display at line 229: `<span className="font-mono-num" data-ui-number>{itemTotal.toFixed(2)} EGP</span>`.
  - Test Result: `T2.5.2` verified modifier arithmetic across 0 modifiers (300 EGP), 1 modifier (340 EGP), and 2 modifiers (370 EGP).
- **Dietary Badges Omission in Modal**:
  - Finding: Lines 108-118 render `dish.calories`, `dish.category`, and `dish.prepTime`, but `dish.tags` (e.g. `['Halal', 'Gluten-Free', 'High-Protein']`) are NOT displayed in `DishModal.tsx`. Diners customizing dishes cannot see confirmed dietary certifications inside the modal.
- **Tactile Active States**:
  - Modal close button (line 85) has `active:scale-90`.
  - Modal submit button (line 226) has `active:scale-[0.99]` and `addedFeedback` ("Added!" for 280ms).
  - Modifier option rows (line 142) lack `active:scale-[0.99]` or active tap styling.

### 1.3 Radii Token Standardization
FlameLink specification enforces 3-tier radii tokens:
- `999px` (`rounded-full`): Pills, buttons, badges, status tags.
- `16px` (`rounded-2xl`): Cards, modal containers, and surface panels.
- `8px` (`rounded-lg`): Inputs, notes, textareas, and small controls.
- Prohibited: `rounded-md` (6px), `rounded-xl` (12px), `rounded-sm` (2px).

Grep analysis across `src/` revealed 12 residual violations, with 8 in Consumer Dining flows:
1. `src/pages/MenuPage.tsx:86`: `className="px-3.5 py-2 rounded-xl ..."` (Account / Loyalty button).
2. `src/pages/MenuPage.tsx:132`: `className="... rounded-xl ..."` (Search input).
3. `src/components/menu/DishModal.tsx:142`: `className="... min-h-[48px] rounded-xl ..."` (Modifier option row).
4. `src/components/menu/DishModal.tsx:156`: `className="w-5 h-5 rounded-md ..."` (Custom checkbox indicator).
5. `src/pages/CompanionPage.tsx:367`: `className="... rounded-xl ..."` (Table Seating badge).
6. `src/components/cart/CartDrawer.tsx:354`: `className="... rounded-xl ..."` (Companion waiting banner).
7. `src/components/cart/CartDrawer.tsx:381`: `className="... rounded-xl ..."` (Split payment strategy container).
8. `src/components/auth/AccountModal.tsx:195`: `className="... rounded-xl ..."` (Sign-in access callout).
9. `src/components/auth/AccountModal.tsx:267`: `className="... rounded-xl ..."` (Sign-up bonus callout).
10. `src/pages/SettlementPage.tsx:519`: `className="... rounded-xl ..."` (Table balance banner).

### 1.4 Zero Unicode Emojis
- Scan of all `.tsx`, `.ts`, `.css`, and `.html` files in `src/` yielded 0 Unicode emojis.
- `T1.2.1`-`T1.2.5` and `T2.2.1`-`T2.2.5` pass 100%.
- Iconography in `MenuPage.tsx` and `DishModal.tsx` strictly uses SVG paths.

### 1.5 First-Principles UX & Seated Diner Context
- Zero party-size questions exist in `MenuPage.tsx` (verified by `T2.3.3`). Table seating is determined from URL query parameter (`?table=T-04`) or session state.
- Zero redundant QR scanner screens exist in `MenuPage.tsx` (verified by `T2.3.4`).

### 1.6 Component Architecture Status
- `src/components/menu/DishCard.tsx` and `src/components/menu/DietaryFilters.tsx` currently DO NOT exist as standalone files.
- `MenuPage.tsx` defines dietary filter buttons (lines 168-189) and dish cards (lines 230-313) inline.
- `tests/e2e_suite.mjs` directly parses `src/pages/MenuPage.tsx` for:
  - `setSelectedDish(dish)` or `handleDishClick` (`T1.5.1`)
  - `data-ui-actions="dietary-filters"` with `min-h-[44px]` (`T1.5.2`)
  - `userAccount?.dietaryTags?.includes(tag)` (`T2.5.4`)

---

## 2. Logic Chain

1. **Touch Ergonomics Compliance**:
   - `MenuPage.tsx` search input currently renders at ~38px height with `rounded-xl`.
   - On handheld mobile devices and mounted kiosk tablets, targets smaller than 44px create input selection difficulty and thumb mis-clicks.
   - Expanding search input to `min-h-[44px]` (`h-11`) and replacing `rounded-xl` with `rounded-lg` satisfies both touch accessibility and design system token standards.
   - Sizing the clear search button to `w-11 h-11 min-w-[44px] min-h-[44px]` ensures a reliable 44px square tap area.

2. **Customization Modal Boundaries & Clarity**:
   - Unbounded quantity increment allows integer runaway (e.g. setting quantity to 9999). Adding `Math.min(50, quantity + 1)` maintains safety while preserving `Math.max(1, ...)` checked by `T2.5.5`.
   - Adding `disabled={quantity <= 1}` to the decrement control prevents confusing click interactions when at minimum quantity.
   - Omission of `dish.tags` in `DishModal.tsx` leaves diners uncertain about dietary criteria after opening the modal. Adding tag pills brings parity with `MenuPage.tsx` filters and highlights tags matching `userAccount.dietaryTags`.

3. **Radii Token Enforceability**:
   - The FlameLink system prohibits arbitrary radii like `rounded-xl` (12px) and `rounded-md` (6px).
   - `rounded-md` on `DishModal.tsx:156` violates the 3-tier system and should be `rounded-lg` (8px).
   - `rounded-xl` on `MenuPage.tsx:86`, `MenuPage.tsx:132`, `DishModal.tsx:142`, `CompanionPage.tsx:367`, `CartDrawer.tsx:354, 381`, and `AccountModal.tsx:195, 267` should map to `rounded-2xl` for surfaces/cards, `rounded-lg` for inputs/notes, or `rounded-full` for pills.

4. **Component Architecture & Test Regression Risk**:
   - If Worker M2 extracts `DietaryFilters.tsx` out of `MenuPage.tsx`, `T1.5.2` (which checks `/data-ui-actions="dietary-filters"[\s\S]*?<\/div>/` in `MenuPage.tsx`) and `T2.5.4` (which checks `userAccount?.dietaryTags?.includes(tag)` in `MenuPage.tsx`) will fail if the code is completely removed from `MenuPage.tsx`.
   - Therefore, Worker M2 must either maintain the wrapper and profile attributes in `MenuPage.tsx`, or export `DishCard.tsx` and `DietaryFilters.tsx` as modular standalone components while keeping `MenuPage.tsx` compliant with the AST checks in `tests/e2e_suite.mjs`.

---

## 3. Caveats

1. **Existing Test Suite Baseline**: All 148 tests in `tests/e2e_suite.mjs` currently pass. Any refactoring must strictly avoid regressing existing assertions.
2. **Operations Persona Boundary**: Workstation barrier and cashier POS files are Milestone 3 scope; changes in M2 must focus strictly on consumer dining components.
3. **Multiplayer Attribution**: In `useAppStore.ts`, cart items are attributed via `addedBy.memberId`. When modifying `DishModal.tsx`, the store's `addToCart` handles attribution automatically based on active route and member state.

---

## 4. Conclusion & Concrete Implementation Plan for Worker M2

### Recommended Changes for Worker M2:

#### Step 1: Polish `src/pages/MenuPage.tsx`
1. **Line 86 (Account / Loyalty pill)**:
   - Change `rounded-xl` to `rounded-2xl` (matches table seating badge at line 107) or `rounded-full`.
2. **Line 132 (Search input)**:
   - Change `py-2.5 rounded-xl` to `min-h-[44px] h-11 rounded-lg`.
   - Update clear button at line 138 to `w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center`.
3. **Line 177 (Dietary filter pills)**:
   - Add `min-w-[44px] justify-center` alongside existing `min-h-[44px]`.

#### Step 2: Polish `src/components/menu/DishModal.tsx`
1. **Line 142 (Modifier row label)**:
   - Change `rounded-xl` to `rounded-2xl` (16px surface). Add `active:scale-[0.99]`.
2. **Line 156 (Checkbox box)**:
   - Change `rounded-md` to `rounded-lg` (8px).
3. **Lines 204, 214 (Quantity controls)**:
   - Decrement button: Add `disabled={quantity <= 1}` and `disabled:opacity-40 disabled:cursor-not-allowed active:scale-95`.
   - Increment button: Change to `onClick={() => setQuantity(Math.min(50, quantity + 1))}` and add `active:scale-95`.
4. **Lines 108-121 (Dietary tag badges rendering)**:
   - Render `dish.tags` as `rounded-full` pills below description or alongside KCAL, highlighting tags that match `userAccount?.dietaryTags`.

#### Step 3: Standardize Residual Consumer Radii
1. `src/pages/CompanionPage.tsx:367`: Change `rounded-xl` to `rounded-2xl`.
2. `src/components/cart/CartDrawer.tsx:354`: Change `rounded-xl` to `rounded-2xl`.
3. `src/components/cart/CartDrawer.tsx:381`: Change `rounded-xl` to `rounded-2xl`.
4. `src/components/auth/AccountModal.tsx:195`: Change `rounded-xl` to `rounded-lg`.
5. `src/components/auth/AccountModal.tsx:267`: Change `rounded-xl` to `rounded-lg`.
6. `src/pages/SettlementPage.tsx:519`: Change `rounded-xl` to `rounded-2xl`.

#### Step 4: Component Parity (`DishCard.tsx` & `DietaryFilters.tsx`)
- If extracting `DishCard.tsx` and `DietaryFilters.tsx` to `src/components/menu/`:
  - Ensure `MenuPage.tsx` maintains `setSelectedDish(dish)` or `handleDishClick` (`T1.5.1`).
  - Ensure `MenuPage.tsx` retains `data-ui-actions="dietary-filters"` with `min-h-[44px]` (`T1.5.2`).
  - Ensure `MenuPage.tsx` retains `userAccount?.dietaryTags?.includes(tag)` (`T2.5.4`).

---

## 5. Verification Method

To verify after implementation:
1. **Run Feature 5 E2E Tests**:
   ```bash
   node tests/e2e_suite.mjs --feature=5
   ```
   *Expected: 10 Passed / 0 Failed.*
2. **Run AI Anti-Pattern Scanner**:
   ```bash
   node .agents/skills/avoid-ai-design/scripts/detect.mjs src/pages/MenuPage.tsx src/components/menu/DishModal.tsx
   ```
   *Expected: 0 findings (P0: 0, P1: 0, P2: 0).*
3. **Verify Zero Emojis**:
   ```bash
   node tests/e2e_suite.mjs --feature=2
   ```
   *Expected: 10 Passed / 0 Failed.*
4. **Scan for Residual Non-Standard Radii**:
   ```bash
   rg "rounded-(xl|md|sm)" src/pages/MenuPage.tsx src/components/menu/DishModal.tsx
   ```
   *Expected: 0 occurrences.*
5. **Run Full 148-Test Regression Suite**:
   ```bash
   node tests/e2e_suite.mjs
   ```
   *Expected: 148 Passed / 0 Failed.*
