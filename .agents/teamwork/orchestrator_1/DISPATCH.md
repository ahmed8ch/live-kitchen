## 2026-11-02T18:33:45Z

Comprehensive UX/UI audit and redesign of FlameLink for Live Kitchen (لايف كيتشن), upgrading all layouts and user flows beyond the hero section according to the design system and first-principles UX.

Working directory: /Users/apple/Downloads/dev/antigravity/port-said
Integrity mode: development

## Requirements

### R1. Comprehensive Multi-Screen Flow Audit and Redesign
Audit, critique, and upgrade all 8 primary screens and user flows in a single unified pass using `redesign-existing-projects`, `first-principles-ux`, and `avoid-ai-design`:
1. Menu Page (`/menu?table=T-04`): category pills, search bar, dietary filters, dish cards, touch customization modal (`DishModal.tsx`), floating cart pill (`FloatingCartBar.tsx`), slide-in cart drawer (`CartDrawer.tsx`), sticky table lobby bar (`TableLobbyBar.tsx`), loyalty profile modal (`AccountModal.tsx`).
2. Companion Flow (`/companion`): joining table session via 4-digit PIN, companion-attributed dish selection, ready toggle, distributed personal share payment.
3. Live Order Tracker (`/tracker` & `/order/:id`): thermal chit perforation, stage indicators, server bump alerts.
4. Table Bill & Settlement (`/settlement`): itemized diner split, equal split, tipping, post-payment rating, thermal receipt print/PDF.
5. Cashier POS Terminal (`/cashier`): table grid, pending chits, settlement verification, void order modal, audit ledger.
6. Kitchen Pass KDS (`/kds`): high-legibility tickets, stopwatch timers, batch totals footer.
7. Table QR Stand Generator (`/stand`): 4x6" tent stand rendering, acrylic/oak base toggle, print layout.
8. Global navigation and desktop dock / mobile header (`Sidebar.tsx`, `App.tsx`).

### R2. Design System and First-Principles UX Compliance
- Strictly follow the Light Vellum palette (#FFFFFF canvas, #F9F9F9 cards/surfaces, #E5E7EB hairline borders, #262626 text headings, #FF0055 Crimson Flame chromatic signal). No dark backgrounds or saturated non-brand colors.
- Use Geist and Geist Mono typography.
- Enforce strict 0 Unicode emojis across all code, UI, comments, and copy (use clean SVGs and typographic glyphs only).
- Enforce first-principles UX: zero back-office leaks in consumer UI; seated diners must never be asked party size or redundant questions; full card tap targets (minimum 44x44px).
- Respect Table Host authority for order submission while allowing distributed companion personal settlement.

### R3. Data Integrity, Cloudflare Deployment, and Supabase Persistence
- Frontend communicates directly with Supabase (`https://vatdmlmthjdtgpvjzlep.supabase.co`) with zero leaked secrets.
- Inquiries, suggestions, and feedback persist to `public.messages`.
- Changes deploy continuously via Cloudflare Pages on git push to `main` at `https://live-kitchen.pages.dev`.

## Acceptance Criteria

### UI and UX Quality
- [ ] `node .agents/skills/avoid-ai-design/scripts/detect.mjs src` reports 0 AI design anti-pattern flags.
- [ ] Zero Unicode emojis exist in any frontend component, copy, or asset file.
- [ ] All 8 defined screens and flows are upgraded, responsive, and visually compliant with FlameLink design tokens.
- [ ] Consumer flows (`/menu`, `/companion`, `/tracker`, `/settlement`) contain zero back-office leaks or redundant seated diner questions.
- [ ] Table Host retains exclusive authority to submit table orders, while companions can mark ready and settle their own shares.

### Build, Deployment, and Data Persistence
- [ ] `npm run build` succeeds cleanly with zero TypeScript errors or broken imports.
- [ ] Git changes are committed and pushed to `main`.
- [ ] Cloudflare Pages build succeeds and changes are live at `https://live-kitchen.pages.dev`.
- [ ] Submitting a message via the deployed application successfully creates a record in the Supabase `messages` table.
