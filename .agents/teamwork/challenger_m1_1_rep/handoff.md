# Milestone 1 Empirical Challenger Report: Shell Persona Decoupling, Tokens, Emojis, and Ergonomics

## Verdict: REQUEST_CHANGES

---

## 1. Observation

Direct empirical tests were executed against the codebase in `/Users/apple/Downloads/dev/antigravity/port-said`.

### 1.1 Baseline Verification Commands & Results

1. **AI Design Cliché Detection**:
   - Command: `node .agents/skills/avoid-ai-design/scripts/detect.mjs src`
   - Result: Exit code 0.
   - Output verbatim:
     ```
     avoid-ai-design detect v0.4.0 · 29 files scanned

     0 findings  P0 0 · P1 0 · P2 0
     Code-certain signals only. Palette weight, rhythm, and hierarchy need a render (SKILL.md, step 2).
     A finding is a default nobody chose, not proof an AI made it. If the brief asked for it, keep it: avoid-ai-design-ignore: <ID>.
     ```

2. **TypeScript & Production Build Compilation**:
   - Command: `npm run build`
   - Result: Exit code 0 (`tsc -b && vite build` succeeded cleanly).
   - Bundles generated: `dist/index.html`, `dist/assets/index-DeDFJmR1.css`, `dist/assets/index-C7GYw-rs.js`.

3. **E2E Feature Suite (Features 1 through 4)**:
   - Command: `node tests/e2e_suite.mjs --feature=1` -> `10 Passed / 0 Failed` (Exit code 0).
   - Command: `node tests/e2e_suite.mjs --feature=2` -> `10 Passed / 0 Failed` (Exit code 0).
   - Command: `node tests/e2e_suite.mjs --feature=3` -> `10 Passed / 0 Failed` (Exit code 0).
   - Command: `node tests/e2e_suite.mjs --feature=4` -> `10 Passed / 0 Failed` (Exit code 0).
   - Total baseline test pass: 40/40.

4. **Unicode Emoji Scan**:
   - Command: Node.js AST/Regex scanner with `/\p{Extended_Pictographic}/u` across `src/` and `index.html`.
   - Result: Exactly 0 matches found across all TypeScript, TSX, CSS, HTML, and JSON files in `src/`.

5. **Prohibited Academic & Geographic Labels ("Port Said", "DEBI", "workshop")**:
   - Command: Case-insensitive ripgrep across `src/` and `index.html`.
   - Result: 0 occurrences of "Port Said", 0 occurrences of "DEBI", 0 occurrences of "workshop" or "assignment" in user-facing UI text.

---

### 1.2 Adversarial Stress Test Findings (5 Failures)

Execution of the adversarial stress harness (`node tests/adversarial_m1_stress.mjs`) returned 35 passes and 5 failures across 40 test cases:

```
FAILED TESTS SUMMARY:
  - ADV-4.1: Mobile drawer toggle button has minimum 44x44px touch target -> Current: min-w-[40px] min-h-[40px]
  - ADV-4.2: Mobile header "Dine-In Menu" button has minimum 44px height -> Missing min-h-[44px] (currently py-1.5)
  - ADV-4.3: Mobile drawer container has overflow-y-auto for short/landscape viewports -> Missing overflow-y-auto (risk of clipping)
  - ADV-4.4: Sidebar.tsx uses strictly standardized 3-tier radii (999px, 16px, 8px) -> Non-standard radii: rounded-[24px]
  - ADV-4.7: WorkstationBarrier.tsx preserves activeTable rather than hardcoding T-04 -> Hardcodes to="/menu?table=T-04"
```

Specific code inspection of the failing targets:

1. **Bug 1: Table State Clobbering in Workstation Barrier**:
   - File: `src/components/layout/WorkstationBarrier.tsx`, lines 102-107:
     ```tsx
     <Link
       to="/menu?table=T-04"
       className="w-full inline-flex items-center justify-center py-3 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[13px] font-bold btn-crimson-glow shadow-xs cursor-pointer transition-all active:scale-95"
     >
       <span>Return to Dine-In Menu -&gt;</span>
     </Link>
     ```
   - Observation: When a diner at Table 8 (`activeTable === 'T-08'`) hits a workstation view on mobile, clicking "Return to Dine-In Menu" sends them to `/menu?table=T-04`, which triggers `App.tsx:30` (`setActiveTable('T-04')`), permanently clobbering their dining table session to Table 4.

2. **Bug 2: Sub-44px Mobile Drawer Toggle Touch Target**:
   - File: `src/components/layout/Sidebar.tsx`, line 248:
     ```tsx
     <button
       onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
       className="p-2 rounded-lg text-[#262626] hover:bg-[#f9f9f9] border border-[#e5e7eb] flex items-center justify-center min-w-[40px] min-h-[40px] cursor-pointer"
       aria-label="Toggle navigation drawer"
     >
     ```
   - Observation: Explicitly configured with `min-w-[40px] min-h-[40px]`. This directly violates the mandatory 44x44px minimum touch target directive specified in `AGENTS.md` and `PROJECT.md`.

3. **Bug 3: Sub-44px Mobile Header Menu Button Tap Height**:
   - File: `src/components/layout/Sidebar.tsx`, lines 239-244:
     ```tsx
     <Link
       to={menuTarget}
       className="px-3.5 py-1.5 rounded-full bg-[#FF0055] hover:opacity-95 text-white text-[12px] font-bold btn-crimson-glow shadow-xs transition-all active:scale-95 cursor-pointer"
     >
       Dine-In Menu
     </Link>
     ```
   - Observation: With `py-1.5` padding and `text-[12px]` typography, this primary call-to-action renders at ~28px height, lacking `min-h-[44px]` or `min-w-[44px]` ergonomics on mobile touch screens.

4. **Bug 4: Mobile Drawer Viewport Clipping in Landscape / Short Screens**:
   - File: `src/components/layout/Sidebar.tsx`, lines 262-265:
     ```tsx
     <div
       className="w-72 bg-[#f9f9f9] h-full shadow-2xl p-5 flex flex-col justify-between border-r border-[#e5e7eb]"
       onClick={(e) => e.stopPropagation()}
     >
     ```
   - Observation: The drawer container has `h-full` and `flex flex-col justify-between` without `overflow-y-auto`. On landscape viewports (e.g., height <= 420px), lower navigation links and the footer branding are cut off and inaccessible.

5. **Bug 5: Non-Standard Radii Tokens in Shell Components**:
   - File: `src/components/layout/Sidebar.tsx`, line 349:
     ```tsx
     className={`... rounded-[24px] bg-white border border-[#e5e7eb] ...`}
     ```
   - File: `src/components/layout/WorkstationBarrier.tsx`, line 89:
     ```tsx
     <div className="p-3 rounded-xl bg-[#f9f9f9] border border-[#e5e7eb] text-[12px] text-[#616161] space-y-1 text-left">
     ```
   - Observation: `rounded-[24px]` and `rounded-xl` violate the 3-tier radii standard (999px `rounded-full`, 16px `rounded-2xl`, 8px `rounded-lg`) mandated in `AGENTS.md` section 2 and `PROJECT.md` Feature 3.

---

## 2. Logic Chain

1. **State Integrity**:
   - Observation 1.2(1) demonstrates that `WorkstationBarrier.tsx` hardcodes `to="/menu?table=T-04"`.
   - `App.tsx` lines 26-32 listen for `table` query param changes and invoke `setActiveTable(tableParam)`.
   - Therefore, any dining session at another table (e.g., T-01 through T-03, T-05 through T-12) will have its active table state corrupted if a diner is directed through the workstation barrier.
   - Mitigation: In `WorkstationBarrier.tsx`, import `useAppStore`, read `activeTable`, and compute `menuTarget = activeTable ? \`/menu?table=\${activeTable}\` : '/menu'`.

2. **Touchscreen Accessibility & Ergonomics**:
   - `AGENTS.md` section 1 mandates: "Touch targets must be generous (minimum 44x44px, large pills, clear tactile :active feedback)."
   - Observations 1.2(2) and 1.2(3) show that both the mobile drawer toggle button (`min-w-[40px] min-h-[40px]`) and the "Dine-In Menu" header button (`py-1.5` -> ~28px height) fail this standard.
   - Mitigation: Update the mobile drawer toggle to `min-w-[44px] min-h-[44px]` and add `min-h-[44px] flex items-center` to the "Dine-In Menu" mobile header button.

3. **Responsive Mobile Ergonomics**:
   - Observation 1.2(4) shows that the mobile slide-in drawer does not declare `overflow-y-auto`.
   - On compact devices or horizontal orientation, the contents overflow without scroll ability.
   - Mitigation: Add `overflow-y-auto` to the mobile drawer container in `Sidebar.tsx`.

4. **Design System Consistency**:
   - `PROJECT.md` section "Feature Inventory" item 3 states: "Standardize on 3-tier radii (999px, 16px, 8px), eliminate rounded-xl/rounded-md".
   - `Sidebar.tsx:349` introduces an ad-hoc `rounded-[24px]`.
   - `WorkstationBarrier.tsx:89` introduces `rounded-xl`.
   - Mitigation: Standardize `Sidebar.tsx` dock container to `rounded-2xl` (or `rounded-full` for pill capsule) and `WorkstationBarrier.tsx` notice to `rounded-lg` (8px).

---

## 3. Caveats

- Milestone 1 scope is strictly focused on Design Tokens, Anti-Patterns, and Shell Persona Decoupling (`Sidebar.tsx`, `App.tsx`, `WorkstationBarrier.tsx`, `index.css`). Components within future milestones (e.g. `DishModal.tsx`, `CartDrawer.tsx`, `CashierPage.tsx`) contain residual `rounded-xl` or `rounded-md` instances that fall under Milestone 2 and Milestone 3 scope.
- Vite build produces a warning regarding bundle chunk size (>500 kB) due to client bundling of icon libraries and QR code generator; this is expected and non-blocking for Milestone 1.

---

## 4. Conclusion

While Milestone 1 satisfies all baseline automated tests (`detect.mjs`, `npm run build`, and `tests/e2e_suite.mjs --feature=1..4`), adversarial stress-testing identified 5 concrete defects in the Milestone 1 shell implementation:

1. **State Mutation Bug**: `WorkstationBarrier.tsx:103` clobbers active diner table context with hardcoded `T-04`.
2. **Ergonomic Defect**: `Sidebar.tsx:248` mobile drawer toggle is sub-44px (`min-w-[40px] min-h-[40px]`).
3. **Ergonomic Defect**: `Sidebar.tsx:241` mobile header "Dine-In Menu" button is sub-44px height (`py-1.5`).
4. **Layout Clipping**: `Sidebar.tsx:263` mobile drawer lacks `overflow-y-auto`.
5. **Token Non-Compliance**: `Sidebar.tsx:349` uses `rounded-[24px]` and `WorkstationBarrier.tsx:89` uses `rounded-xl` instead of 3-tier radii.

Therefore, the verdict is **REQUEST_CHANGES**. The worker must address these 5 specific issues in `Sidebar.tsx` and `WorkstationBarrier.tsx`.

---

## 5. Verification Method

To independently reproduce all observations and verify subsequent fixes:

1. **Run the Adversarial Stress Suite**:
   ```bash
   node tests/adversarial_m1_stress.mjs
   ```
   *Expected Current Output*: 35 Passed / 5 Failed (ADV-4.1, ADV-4.2, ADV-4.3, ADV-4.4, ADV-4.7).
   *Expected Post-Fix Output*: 40 Passed / 0 Failed.

2. **Run Baseline Milestone 1 Test Suites**:
   ```bash
   node .agents/skills/avoid-ai-design/scripts/detect.mjs src
   npm run build
   node tests/e2e_suite.mjs --feature=1
   node tests/e2e_suite.mjs --feature=2
   node tests/e2e_suite.mjs --feature=3
   node tests/e2e_suite.mjs --feature=4
   ```
   *Expected Output*: 0 findings, clean Vite build, 40/40 tests passing.

3. **Verify Table Context Preservation in Workstation Barrier**:
   Inspect `src/components/layout/WorkstationBarrier.tsx`: ensure the "Return to Dine-In Menu" link dynamically references `activeTable` from `useAppStore` rather than static `T-04`.
