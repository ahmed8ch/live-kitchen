# Phase 0 Survey Handoff Report: Explorer Instance 3

## 1. Observation

1. **AI Design Anti-Pattern Tool Output**:
   - Command: `node .agents/skills/avoid-ai-design/scripts/detect.mjs src --json`
   - Result: 17 total findings (all severity P2) across 13 files.
   - Identified rules:
     - `SD4m` (Template chrome: monospace as small data labels) in 11 files:
       - `src/components/auth/AccountModal.tsx` (L109, L383, L391, L438, L447, L450, L501, L505, L510, L553)
       - `src/components/cart/CartDrawer.tsx` (L135, L168, L179, L214, L221, L263, L320, L485, L489)
       - `src/components/multiplayer/TableLobbyBar.tsx` (L79, L83, L94, L109, L113, L121, L166, L198, L208)
       - `src/pages/CashierPage.tsx` (L204, L212, L232, L236, L242, L246, L252, L256, L376, L395, L442, L449, L453, L472, L481, L487, L493, L500, L540, L569, L624, L739, L746, L753, L760, L767, L777, L827, L852, L866, L991)
       - `src/pages/CompanionPage.tsx` (L180, L210, L250, L321, L358, L403, L428, L433, L447)
       - `src/pages/HomePage.tsx` (L294, L397, L419, L441, L463)
       - `src/pages/KdsPage.tsx` (L175, L257, L339, L389, L421)
       - `src/pages/MenuPage.tsx` (L98, L199, L263, L280, L286)
       - `src/pages/OrderTrackerPage.tsx` (L90, L133, L147, L172, L274)
       - `src/pages/SettlementPage.tsx` (L337, L366, L376, L383, L402, L408, L460, L534, L557, L565, L574, L578, L582, L630, L684, L759, L889)
       - `src/pages/TableStandPage.tsx` (L155, L221, L228, L260)
     - `SD8` (Emerald as the purple-avoiding accent) in 5 files:
       - `src/components/multiplayer/TableLobbyModal.tsx` (L10)
       - `src/pages/CashierPage.tsx` (L102, L311, L538, L624, L1061)
       - `src/pages/CompanionPage.tsx` (L246, L247, L250)
       - `src/pages/HomePage.tsx` (L362, L364, L365, L367, L605, L606)
       - `src/pages/SettlementPage.tsx` (L460, L464, L471, L545, L565, L630, L755, L756, L759, L928)
     - `C5` (Colored glow shadows) in 1 file:
       - `src/index.css` (L213: `box-shadow: 0 28px 48px -12px rgba(0, 0, 0, 0.16), 0 0 0 1px #FF0055;`)

2. **Unicode Emoji Scan**:
   - Command: AST scan on `src/` matching `[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]`
   - Result: 0 occurrences in `src/`. Zero emojis in frontend code, comments, or copy. (Only 1 occurrence found in an unreferenced legacy dist artifact `assets/index-BdObmJ2S.js:11` within React Router's built-in ErrorBoundary string).

3. **Design System & Typography Token Audit**:
   - `src/index.css:17-53` sets `--color-crimson: #FF0055`, `--color-vellum: #f9f9f9`, `--color-paper: #ffffff`, `--color-gridline: #e5e7eb`, `--color-ink: #262626`, `--font-mono: 'Geist Mono', ...`, and `--font-sans: 'Geist', ...`.
   - `src/pages/KdsPage.tsx:151-152` applies dark background `bg-[#0d0f12] blueprint-dots-dark text-white` with header `#151921` and saturated status colors (`#16a34a`, `#ea580c`, `#0284c7`, `#dc2626`).
   - `src/components/auth/AccountModal.tsx:380` applies dark gradient `bg-gradient-to-br from-[#262626] to-[#171717]`.
   - Radii audit in `src/`: 181 `rounded-full` (999px), 35 `rounded-2xl` (16px), 49 `rounded-lg` (8px), plus 41 instances of non-standard `rounded-xl` (12px) and 8 instances of `rounded-md` (6px).
   - Prohibited label "Port Said": Found in `src/App.tsx:103` (`Port Said · Republic Street`) and `src/pages/CashierPage.tsx:998` (`Port Said - El-Gomhoria St., adjacent to El-Montazah Park`).
   - Back-office leaks: `src/components/layout/Sidebar.tsx:143-209` includes KDS Pass, Cashier POS, and Table Stand in the primary nav dock and mobile drawer, unconditionally visible to seated diners.

4. **Persistence & Build Audit**:
   - Probe: `curl -i -X POST 'https://vatdmlmthjdtgpvjzlep.supabase.co/rest/v1/messages'` with `Prefer: return=minimal` returned `HTTP/2 201 Created`.
   - Probe: Same endpoint with `Prefer: return=representation` returned `HTTP/2 401` / error `42501` (`permission denied for table messages`).
   - Schema (`supabase-setup.sql:16, 25-29`) confirms `grant insert on public.messages to anon;` with RLS allowing insert only. `src/pages/HomePage.tsx:88` already sends `'Prefer': 'return=minimal'`.
   - Build: `npm run build` executed `tsc -b && vite build` and succeeded cleanly in 294ms with 0 errors.
   - Deployed site: `curl -I https://live-kitchen.pages.dev` returned `HTTP/2 200`.

---

## 2. Logic Chain

1. From Observation 1, `detect.mjs` identifies 17 anti-pattern instances because `font-mono-num` is styled on non-numeric text labels and buttons with font size `<= 12.5px`, emerald utility classes are used for success and cashier indicators, and a multi-part box shadow in `src/index.css` triggers the blur threshold. To meet the acceptance criteria of 0 detector flags, labels must transition from monospace to standard `Geist`, emerald classes must be replaced with neutral/crimson tokens, and the CSS box-shadow must be simplified.
2. From Observation 2, zero emojis exist in `src/`. Therefore, the emoji prohibition from AGENTS.md is already upheld in active source code, requiring no emoji purge in `src/`.
3. From Observation 3, while `DESIGN.md` had legacy mentions of an obsidian KDS background, AGENTS.md and ORIGINAL_REQUEST.md mandate a 100% Light Workspace (`#FFFFFF` canvas, `#F9F9F9` surfaces) with no dark backgrounds or saturated non-brand colors. `KdsPage.tsx:151` and `AccountModal.tsx:380` must be updated to light theme tokens.
4. From Observation 3, AGENTS.md establishes strict persona separation (seated diners must never see operations screens) and bans academic labels ("Port Said"). `Sidebar.tsx` must filter nav items for consumer dining flows, and "Port Said" in `App.tsx` and `CashierPage.tsx` must be replaced with the exact street address from `live-kitchen-facts.md` ("Republic Street, adjacent to El-Montazah Park").
5. From Observation 4, Supabase message persistence is functional and compliant when `Prefer: return=minimal` is used. Build tooling and Cloudflare deployment are operating with zero errors.

---

## 3. Caveats

- **Supabase Messages Table Read Access**: Anonymous users cannot query `public.messages` via REST due to RLS policies (`grant insert only`). Automated verification of message persistence must rely on the HTTP 201 response status or an authenticated service role query in the Supabase dashboard.
- **Detector Regex Nuance**: In `detect.mjs`, `/\bfont-mono\b/.test('font-mono-num')` matches because `-` is treated as a word boundary. Even legitimate numbers styled with `font-mono-num text-xs` can trigger the tool unless `font-mono-num` is styled at `text-sm` (14px) or higher, or inline comments are added if explicitly permitted by the skill.
- **KDS Visual Contract**: Kitchen staff often prefer high-contrast dark screens in physical kitchens, but the current project specification explicitly mandates 100% light workspace tokens (`#FFFFFF` canvas, `#F9F9F9` vellum surfaces). The KDS redesign must adhere to this rule.

---

## 4. Conclusion

The build system, Supabase Data API persistence, and Cloudflare Pages deployment are fully healthy, and active code is completely emoji-free. However, reaching the design system and UX acceptance criteria requires five specific interventions:
1. Resolve all 17 AI design anti-pattern flags reported by `detect.mjs` (`SD4m`, `SD8`, `C5`).
2. Eliminate the 2 instances of the prohibited string "Port Said" from `App.tsx:103` and `CashierPage.tsx:998`.
3. Separate consumer and operations navigation in `Sidebar.tsx` to eliminate back-office leaks for seated diners.
4. Standardize radii across the codebase to the strict 3-tier system (`rounded-full`, `rounded-2xl`, `rounded-lg`), replacing all 41 instances of `rounded-xl` and 8 instances of `rounded-md`.
5. Convert `KdsPage.tsx` and `AccountModal.tsx` to the 100% Light Vellum palette.

---

## 5. Verification Method

To independently verify these findings, run:

1. **AI Design Anti-Pattern Verification**:
   ```bash
   node .agents/skills/avoid-ai-design/scripts/detect.mjs src
   ```
   (Currently outputs 17 findings across 13 files).

2. **Emoji Verification**:
   ```bash
   node -e "const fs=require('fs');const files=['src/App.tsx','src/pages/HomePage.tsx','src/pages/MenuPage.tsx'];files.forEach(f=>{const t=fs.readFileSync(f,'utf8');if(/[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(t))console.log('Emoji in',f);});console.log('Emoji scan complete.');"
   ```

3. **Prohibited Label Verification**:
   ```bash
   grep -rn "Port Said" src/
   ```
   (Currently matches `src/App.tsx:103` and `src/pages/CashierPage.tsx:998`).

4. **Build & Typecheck Verification**:
   ```bash
   npm run build
   ```
   (Must exit code 0).

5. **Supabase Persistence Verification**:
   ```bash
   curl -i -X POST 'https://vatdmlmthjdtgpvjzlep.supabase.co/rest/v1/messages' \
     -H 'Content-Type: application/json' \
     -H 'apikey: sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk' \
     -H 'Authorization: Bearer sb_publishable_BK5eQmfVdgz00gN9TpiY5w_ZylSieJk' \
     -H 'Prefer: return=minimal' \
     -d '{"name": "Verification Probe", "phone": "+201000000000", "message": "[Test] Verification probe"}'
   ```
   (Must return `HTTP/2 201 Created`).

6. **Cloudflare Live Deployment Verification**:
   ```bash
   curl -I https://live-kitchen.pages.dev
   ```
   (Must return `HTTP/2 200`).
