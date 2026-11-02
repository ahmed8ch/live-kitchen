# Phase 0 Survey & Audit Report: Design System, AI Tells, Build & Persistence

**Inspector**: Teamwork Explorer (Survey Instance 3)  
**Date**: 2026-11-02  
**Target Repository**: FlameLink / Live Kitchen (لايف كيتشن)  
**Workspace**: `/Users/apple/Downloads/dev/antigravity/port-said`  
**Deployment Target**: `https://live-kitchen.pages.dev`  
**Persistence Backend**: Supabase (`https://vatdmlmthjdtgpvjzlep.supabase.co`)

---

## Executive Summary

This comprehensive audit investigates four architectural and design pillars of the FlameLink platform for Live Kitchen:
1. **AI Design Anti-Patterns**: Audited using the `avoid-ai-design` zero-dependency detector (`detect.mjs`). A total of 17 code-certain findings were cataloged across 13 files, categorized into three distinct rule violations (`SD4m`, `SD8`, and `C5`).
2. **Unicode Emojis**: Scanned across all 29 TypeScript/CSS source files in `src/` and surrounding project markup. Zero Unicode emojis were found in active frontend components, copy, or comments (100% compliance with AGENTS.md). One isolated historical artifact was identified in an unreferenced legacy dist bundle in `assets/`.
3. **Design System & Typography Compliance**: Evaluated against the strict Light Vellum tokens (`#FFFFFF` canvas, `#F9F9F9` surfaces, `#E5E7EB` borders, `#262626` Ink headings, `#FF0055` Crimson Flame signal). Critical discrepancies were mapped, including dark background fills on the KDS pass (`bg-[#0d0f12]`), dark gradient card fills on `AccountModal.tsx`, multiple non-brand saturated accents (emerald, amber, sky blue), non-standard radii (41 instances of `rounded-xl` and 8 instances of `rounded-md`), two prohibited occurrences of the string "Port Said" in UI copy, and back-office navigation leaks in consumer viewports.
4. **Data Persistence & Build Pipeline**: Successfully verified the Supabase Data API endpoint for `public.messages`. Probed with curl and confirmed `HTTP/2 201 Created` with `Prefer: return=minimal`. Clean build executed (`npm run build` completed cleanly in 294ms with zero TypeScript or bundling errors). Cloudflare Pages continuous deployment and SPA redirect rewrites verified live at `https://live-kitchen.pages.dev`.

---

## Section 1: AI Design Anti-Pattern Audit (`avoid-ai-design`)

Execution command:
```bash
node .agents/skills/avoid-ai-design/scripts/detect.mjs src --json
```

Summary of Results:
- **Total Files Scanned**: 29
- **Total Code-Certain Findings**: 17
- **Severity Breakdown**: P0: 0 | P1: 0 | P2: 17
- **Affected Files**: 13

### Catalog of Detected Violations

| File Path | Rule ID | Severity | Rule Name & Rationale | Line Numbers |
|---|---|---|---|---|
| `src/components/auth/AccountModal.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L109, L383, L391, L438, L447, L450, L501, L505, L510, L553 |
| `src/components/cart/CartDrawer.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L135, L168, L179, L214, L221, L263, L320, L485, L489 |
| `src/components/multiplayer/TableLobbyBar.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L79, L83, L94, L109, L113, L121, L166, L198, L208 |
| `src/components/multiplayer/TableLobbyModal.tsx` | `SD8` | P2 | Emerald as the purple-avoiding accent | L10 |
| `src/index.css` | `C5` | P2 | Colored glow shadows | L213 |
| `src/pages/CashierPage.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L204, L212, L232, L236, L242, L246, L252, L256, L376, L395, L442, L449, L453, L472, L481, L487, L493, L500, L540, L569, L624, L739, L746, L753, L760, L767, L777, L827, L852, L866, L991 |
| `src/pages/CashierPage.tsx` | `SD8` | P2 | Emerald as the purple-avoiding accent | L102, L311, L538, L624, L1061 |
| `src/pages/CompanionPage.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L180, L210, L250, L321, L358, L403, L428, L433, L447 |
| `src/pages/CompanionPage.tsx` | `SD8` | P2 | Emerald as the purple-avoiding accent | L246, L247, L250 |
| `src/pages/HomePage.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L294, L397, L419, L441, L463 |
| `src/pages/HomePage.tsx` | `SD8` | P2 | Emerald as the purple-avoiding accent | L362, L364, L365, L367, L605, L606 |
| `src/pages/KdsPage.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L175, L257, L339, L389, L421 |
| `src/pages/MenuPage.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L98, L199, L263, L280, L286 |
| `src/pages/OrderTrackerPage.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L90, L133, L147, L172, L274 |
| `src/pages/SettlementPage.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L337, L366, L376, L383, L402, L408, L460, L534, L557, L565, L574, L578, L582, L630, L684, L759, L889 |
| `src/pages/SettlementPage.tsx` | `SD8` | P2 | Emerald as the purple-avoiding accent | L460, L464, L471, L545, L565, L630, L755, L756, L759, L928 |
| `src/pages/TableStandPage.tsx` | `SD4m` | P2 | Template chrome: monospace as small data labels | L155, L221, L228, L260 |

### Detailed Root Cause Analysis for Anti-Pattern Rules

#### 1. Rule `SD4m`: Monospace as Small Data Labels (11 Files)
- **Mechanism**: The detector checks if class strings contain `\bfont-mono\b` combined with font sizes `<= 12.5px` (`text-xs`, `text-[10px]`, `text-[11px]`, `text-[12px]`).
- **Code Reality**: In `src/index.css`, `.font-mono-num` is defined as:
  ```css
  .font-mono-num, [data-ui-number] {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'tnum' on, 'lnum' on;
  }
  ```
  Because the hyphen in `font-mono-num` creates a word boundary in JavaScript regular expressions (`/\bfont-mono\b/.test('font-mono-num') === true`), every occurrence of `font-mono-num` combined with `text-xs` or `text-[11px]` triggers the detector.
- **Visual Design Issue**: Beyond regex behavior, developers frequently placed `font-mono-num` on purely textual metadata labels and buttons rather than tabular numbers or prices:
  - `TableLobbyBar.tsx:94`: `<span className="text-[11px] font-mono-num uppercase tracking-wider text-[#727272]">Table PIN:</span>`
  - `TableLobbyBar.tsx:166`: `<button className="text-[10px] font-mono-num ...">Reset Diners</button>`
  - `CartDrawer.tsx:179`: `<button className="text-[11px] font-mono-num ...">Leave Table</button>`
  - `AccountModal.tsx:383`: `<span className="text-[11px] uppercase tracking-wider text-[#999999] font-mono-num">Live Kitchen Loyalty Balance</span>`
  - `TableStandPage.tsx:228`: `<div className="text-[11px] font-mono-num uppercase tracking-widest text-[#949494]">DINE-IN ORDERING</div>`
  - `OrderTrackerPage.tsx:274`: `<div className="text-[11px] font-mono-num uppercase text-[#949494]">Total Payable (incl. 14% VAT)</div>`
  - `MenuPage.tsx:280`: `<span className="text-xs font-mono-num text-[#949494]">{dish.calories} KCAL</span>`

#### 2. Rule `SD8`: Emerald as the Purple-Avoiding Accent (5 Files)
- **Mechanism**: The detector identifies Tailwind classes `(bg|text|from|to|border|ring)-emerald-*` or hex colors `#10b981`, `#059669`, `#34d399`, `#6ee7b7`, `#047857`.
- **Code Reality**:
  - `TableLobbyModal.tsx:10`: Defined animal avatar identity `{ id: 'owl', name: 'Emerald Owl', color: 'border-emerald-500 bg-emerald-50 text-emerald-800', dot: '#10b981' }`.
  - `CompanionPage.tsx:246-250`: Share settled state uses `bg-[#f0fdf4] border-[#bbf7d0] text-[#15803d] text-[#166534]`.
  - `SettlementPage.tsx:460-471, 755-759, 928`: Payment verified and review states use `bg-emerald-50`, `border-emerald-200`, `text-emerald-700`, `text-emerald-800`.
  - `CashierPage.tsx:102, 311, 538, 624, 1061`: Table status badges and online deduction text use `bg-emerald-50`, `border-emerald-200`, `text-emerald-800`.
  - `HomePage.tsx:362-367, 605-606`: Payment gate indicator and form submission confirmation use `bg-emerald-50`, `border-emerald-200`, `text-emerald-800`, `bg-emerald-100`.
- **Conflict with AGENTS.md**: AGENTS.md mandates a **Single Chromatic Signal: Crimson Flame (`#FF0055`)** and explicitly prohibits saturated non-brand colors. Status indications must use neutral high-contrast ink tags or crisp crimson signals, not saturated green/emerald fills.

#### 3. Rule `C5`: Colored Glow Shadows (1 File)
- **Mechanism**: The detector scans `box-shadow` properties with blur radius `>= 8px` and alpha `>= 0.25` of saturated colors.
- **Location**: `src/index.css:213`
  ```css
  .acrylic-stand-3d:hover {
    transform: perspective(1000px) rotateY(0deg) rotateX(0deg) translateY(-4px);
    box-shadow: 0 28px 48px -12px rgba(0, 0, 0, 0.16), 0 0 0 1px #FF0055;
  }
  ```
  The parser evaluated the multi-part box-shadow and matched the 48px blur of the elevation shadow against the adjacent `#FF0055` ring color token.

---

## Section 2: Unicode Emoji Audit

Scanning Methodology:
A deep AST/character scan was executed using Unicode property escapes:
`[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]`

### Findings
- **`src/` Directory**: **0 occurrences** across all 29 TypeScript, TSX, CSS, and SVG files.
- **Public & Root Markup (`index.html`, `table-stand.html`, `kds.html`)**: **0 occurrences**.
- **Data & Markdown Documents (`live-kitchen-facts.md`, `DESIGN.md`)**: **0 occurrences**.
- **Historical Bundle (`assets/index-BdObmJ2S.js:11`)**: Contains `💿 Hey developer 👋` from the compiled React Router v7 default ErrorBoundary template built on Oct 26. This file is an unreferenced artifact not used by the current Vite build (`dist/` uses `index-DwiNtaN9.js`).

### Audit Verdict
**100% Compliant in Active Source**. The codebase respects the strict ban on emojis in code, UI, and comments. Clean SVG icons (via `lucide-react` and inline SVGs) and typographic glyphs (`->`, `*`, `•`) are used throughout.

---

## Section 3: Design System, Typography & Persona Audit

### 1. Palette & Surface Tokens
The FlameLink design system mandates a Light Vellum palette:
- Canvas: `#ffffff`
- Surfaces / Cards: `#f9f9f9` (Vellum)
- Hairline borders: `#e5e7eb` (1px Gridline)
- Text headings: `#262626` (Ink)
- Descriptions / Subtitles: `#727272` (Slate)
- Neutral dark: `#616161` (Graphite)
- Single Chromatic Signal: `#FF0055` (Crimson Flame)
- Signal Glow: `0 0 0 6px rgba(255, 0, 85, 0.12)`

#### Deviations and Inconsistencies Discovered:
1. **KDS Dark Canvas (`src/pages/KdsPage.tsx:151-192`, `src/index.css:35-41, 96-99`)**:
   - `KdsPage.tsx:151` applies `bg-[#0d0f12] blueprint-dots-dark text-white`.
   - Headers and bars use `#151921`, `#11141a`, `#1f242d`, `#252b36`.
   - Action buttons and tags use `#16a34a` (green), `#ea580c` (amber), `#0284c7` (sky blue), `#dc2626` (red).
   - *Conflict*: While `DESIGN.md` documented an older dark canvas concept for KDS ("Obsidian `#0D0F12`"), `AGENTS.md` and `ORIGINAL_REQUEST.md` mandate a 100% Light Workspace across all portals with zero dark fills or gradients.
2. **Account Modal Gradient Card (`src/components/auth/AccountModal.tsx:380`)**:
   - Uses `bg-gradient-to-br from-[#262626] to-[#171717] text-white`. This violates the "NO GRADIENTS" and "100% Light Workspace" directives.
3. **Multi-Colored Animal Avatars (`src/components/multiplayer/TableLobbyModal.tsx:5-12`)**:
   - Defines six chromatic identities with amber (`#f59e0b`), yellow (`#eab308`), sky blue (`#0284c7`), emerald (`#10b981`), and slate (`#64748b`), conflicting with the single chromatic signal policy.
4. **Crimson Hex Drift**:
   - Instead of strictly adhering to `#FF0055`, multiple intermediate red/crimson values appear across components: `#D90048`, `#DA074D`, `#DE084F`, `#E0004D`, `#E50953`, `#F50757`.

### 2. Typography & Font Configuration
- **Primary Body & Headings**: Loaded in `index.html` via Google Fonts: `Geist` (wght 400, 500, 600, 700). Defined in `src/index.css` via `--font-sans`.
- **Tabular & Technical Data**: Loaded in `index.html` via Google Fonts: `Geist Mono` (wght 400, 500, 600, 700). Defined in `src/index.css` via `--font-mono`.
- **Brand Logotype / Arabic Font**: Local font file `public/fonts/Changa.ttf` (130 KB) declared in `@font-face` in `src/index.css`. Used for the FlameLink wordmark and table stand title.
- **Typography Scale**: Standardized across headings (`text-xl`, `text-lg`), body (`text-sm`), and technical data (`text-base font-mono-num`, `text-sm font-mono-num`).

### 3. Radii System Audit
AGENTS.md mandates a 3-tier radius architecture:
- `999px` (`rounded-full`): All pills, buttons, and status tags.
- `16px` (`rounded-2xl`): All cards, containers, and modals.
- `8px` (`rounded-lg`): All form inputs and notes.

#### Radius Violation Catalog
| Class Found | Count | Target Rule | Example Locations |
|---|---|---|---|
| `rounded-xl` (12px) | 41 | Should be `rounded-2xl` (cards) or `rounded-full` (buttons) | `AccountModal.tsx:195, 437, 497`<br>`CartDrawer.tsx:239, 354, 381`<br>`Sidebar.tsx:233, 274, 343, 391`<br>`DishModal.tsx:142`<br>`TableLobbyModal.tsx:128`<br>`CashierPage.tsx:211, 365, 412, 538, 991`<br>`CompanionPage.tsx:246, 367`<br>`HomePage.tsx:316, 362` |
| `rounded-md` (6px) | 8 | Should be `rounded-full` (buttons/pills) or `rounded-lg` (inputs) | `TableLobbyBar.tsx:100` (PIN button)<br>`TableStandPage.tsx:160, 168` (base toggle buttons)<br>`CashierPage.tsx:404` (clear session button)<br>`AccountModal.tsx:501` (order ID tag)<br>`DishModal.tsx:156` (checkbox container) |

### 4. Persona Separation & Back-Office Leaks
AGENTS.md states:
> "A real diner at Table 4 must NEVER see kitchen order screens, floor plans, developer device pickers, or administrative navigation tabs."

#### Discovered Leaks:
1. **Sidebar Navigation Dock (`src/components/layout/Sidebar.tsx:143-209`)**:
   - `navItems` contains `Kitchen Pass (KDS)` (`/kds`), `Cashier POS` (`/cashier`), and `Table QR Stand` (`/stand`).
   - Line 209 sets `const visibleNavItems = navItems;` unconditionally.
   - Both the desktop dock and the mobile drawer (`<header className="md:hidden">`) render operational buttons to regular diners sitting at tables.
2. **Global Footer (`src/App.tsx:118-120`)**:
   - Links to `Staff KDS Line` and `Cashier Register` exist in the consumer footer.

### 5. Prohibited Academic Label Audit
AGENTS.md states:
> "NO ACADEMIC/WORKSHOP LABELS: Never show 'DEBI', 'Port Said', 'workshop', or 'assignment' in the user interface."

#### Discovered Violations:
1. `src/App.tsx:103`:
   ```tsx
   <li><span>Port Said · Republic Street</span></li>
   ```
2. `src/pages/CashierPage.tsx:998`:
   ```tsx
   Port Said - El-Gomhoria St., adjacent to El-Montazah Park
   ```
*Correction needed*: Ground truth facts (`live-kitchen-facts.md`) establish the restaurant location as Republic Street adjacent to El-Montazah Park. The city name "Port Said" must be removed from consumer UI to prevent academic workshop labeling.

---

## Section 4: Data Persistence, Build Pipeline & Cloudflare Pages

### 1. Supabase Client & Table Integration
- **Endpoint**: `https://vatdmlmthjdtgpvjzlep.supabase.co`
- **Publishable Key**: `sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk`
- **Secrets in Code**: **0 secret keys**. Only publishable keys with client-side RLS are present. `.env*` and secrets are ignored in `.gitignore`.
- **Target Table**: `public.messages` (columns: `id`, `created_at`, `name`, `phone`, `message`).
- **RLS Policy (`supabase-setup.sql`)**:
  - `grant insert on public.messages to anon;`
  - `create policy "Allow anonymous inserts" on public.messages for insert to anon with check (true);`
  - Anonymous users are granted INSERT permissions only; SELECT is deliberately disallowed for public privacy.

#### Live Probe Verification Test:
- Probe A (with `Prefer: return=minimal`):
  ```bash
  curl -i -X POST 'https://vatdmlmthjdtgpvjzlep.supabase.co/rest/v1/messages' \
    -H 'Content-Type: application/json' \
    -H 'apikey: sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk' \
    -H 'Authorization: Bearer sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk' \
    -H 'Prefer: return=minimal' \
    -d '{"name": "Audit Probe", "phone": "+201000000000", "message": "[Audit Verification] Phase 0 Probe"}'
  ```
  **Result**: `HTTP/2 201 Created` with empty body and header `preference-applied: return=minimal`.
- Probe B (with `Prefer: return=representation`):
  **Result**: `HTTP/2 401 Unauthorized` / error `42501` (`permission denied for table messages`).
- **Conclusion**: `src/pages/HomePage.tsx:88` correctly specifies `'Prefer': 'return=minimal'`. Submitting the inquiry form successfully inserts into `public.messages`.

### 2. Build Pipeline & TypeScript Configuration
- **Package Manager**: npm
- **Vite Version**: 8.3.5
- **React Version**: 19.3.1
- **Tailwind Version**: 4.3.3 (`@tailwindcss/vite`)
- **TypeScript Version**: 7.0.2
- **Build Command**: `npm run build` (`tsc -b && vite build`)
- **Execution Test**:
  ```
  vite v8.3.5 building client environment for production...
  transforming (1967) src/index.css✓ 1967 modules transformed.
  dist/index.html                   1.30 kB │ gzip:   0.63 kB
  dist/assets/index-ClWvTHw2.css   89.77 kB │ gzip:  16.47 kB
  dist/assets/index-DwiNtaN9.js   538.73 kB │ gzip: 145.07 kB
  ✓ built in 294ms
  ```
  **Exit Code**: 0 (Clean build, zero TypeScript compilation errors).

### 3. Cloudflare Pages & Git Remote
- **Git Remote**: `origin https://github.com/ahmed8ch/live-kitchen.git`
- **Active Branch**: `main` (tracked to `origin/main`)
- **Pages Output Directory**: `dist` (configured in `wrangler.toml:2`)
- **Routing Rewrite**: `public/_redirects` contains `/* /index.html 200` to support client-side routing on Cloudflare Pages.
- **Deployed Production Host**: `https://live-kitchen.pages.dev`
- **HTTP Status Check**: `curl -I https://live-kitchen.pages.dev` returned `HTTP/2 200` with Cloudflare edge caching headers and active script bundle `assets/index-DwiNtaN9.js`.

---

## Section 5: Prioritized Action Plan for Implementation Agents

1. **Eliminate 17 AI Design Tells**:
   - Replace `font-mono-num` on labels and metadata strings with clean humanist grotesque (`Geist`). Reserve `font-mono-num` strictly for currency figures, order IDs, and timers.
   - Replace emerald accent classes (`emerald-50`, `emerald-700`, `emerald-800`, `bg-[#f0fdf4]`) with clean neutral ink styling, subtle border indicators, or crimson signals.
   - Adjust `index.css:213` box-shadow to eliminate multi-property blur conflation.
2. **Remove Prohibited Academic Labels**:
   - Update `src/App.tsx:103` and `src/pages/CashierPage.tsx:998` to display `Republic Street, adjacent to El-Montazah Park` without the string "Port Said".
3. **Enforce Persona Separation in Navigation**:
   - Filter `Sidebar.tsx` navigation items based on viewport and route context: consumer dining routes (`/menu`, `/companion`, `/tracker`, `/settlement`) must omit KDS, Cashier POS, and Table Stand links.
4. **Standardize Border Radii**:
   - Migrate 41 occurrences of `rounded-xl` to `rounded-2xl` (for cards/modals) or `rounded-full` (for pills/buttons).
   - Migrate 8 occurrences of `rounded-md` to `rounded-full` or `rounded-lg`.
5. **Harmonize KDS & Dark Elements**:
   - Align the KDS pass screen with the Light Vellum design system, removing the dark `#0d0f12` background in favor of clean high-legibility cards with perforated thermal edges.
   - Replace dark gradient on `AccountModal.tsx:380` with Light Vellum card tokens.

---
*Report compiled and certified by Teamwork Explorer (Survey Instance 3).*
