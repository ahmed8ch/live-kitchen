# FlameLink & Live Kitchen (لايف كيتشن)
## Core Product Blueprint & AI Guidelines

FlameLink digitizes the restaurant dine-in experience and seamlessly synchronizes table self-ordering with real-time kitchen operations.

---

### MANDATORY PLATFORM & DEPLOYMENT DIRECTIVES (CRITICAL)
1. **Business Identity & Ground Truth**:
   - Business Name: **Live Kitchen (لايف كيتشن)**.
   - All factual restaurant information, hours, menu prices, and policies are strictly documented in `live-kitchen-facts.md`. Do not invent or fabricate any data outside of `live-kitchen-facts.md`.
2. **Cloudflare Pages Continuous Deployment**:
   - Every push to the `main` branch deploys automatically to Cloudflare Pages at `https://live-kitchen.pages.dev`.
3. **Supabase Data Persistence**:
   - Platform inquiries, suggestions, and feedback forms save directly into the `public.messages` table on Supabase (`https://vatdmlmthjdtgpvjzlep.supabase.co`).
4. **Post-Deployment Verification Protocol**:
   - After any edit or code change: submit a message through the form on the deployed `pages.dev` URL and confirm that the record reached the `messages` table on Supabase.

---

### 1. First-Principles Product Thinking & Persona Separation
All agents working on this project MUST follow `.agents/skills/first-principles-ux/SKILL.md`:
- **PHYSICAL REALITY CONTEXT**:
  - Understand the customer's physical situation: A customer sitting at Table 4 is holding their mobile phone after scanning a physical table QR code, OR looking at a mounted tabletop tablet kiosk.
  - **Never show a QR code on the mobile app to a user who already opened the app on their phone!**
  - The physical QR code lives on the acrylic table stand on the real wooden table (`table-stand.html`).
- **ELIMINATE REDUNDANT QUESTIONS**:
  - Never ask a customer sitting at Table 4 "How many people are at this table?". Table 4 already has chairs and they are already seated. Party size is a Host/Cashier check-in concern at the restaurant door, never a seated diner's concern.
  - Never place a mandatory login/account creation gatekeeper screen before showing the menu. Customers are hungry; show the food and prices immediately.
- **ZERO BACK-OFFICE OR DEVELOPER LEAKS IN CONSUMER UI**:
  - A real diner at Table 4 must NEVER see kitchen order screens, floor plans, developer device pickers, or administrative navigation tabs.
  - The customer experience (`index.html`) is 100% focused on dining: Menu -> Touchscreen Dish Customization -> Cart/Checkout -> Live Order Tracker.
  - Operations/Staff interfaces (Kitchen Display System `KDS` and Floor Plan) must be a separate dedicated portal (`kds.html` / `/kds`).
- **HOST AUTHORITY & DISTRIBUTED COMPANION SETTLEMENT**:
  - Only the Table Host has the decision right to finalize and submit the collective table order.
  - Companions can add/edit their own items and mark themselves as ready.
  - When splitting the bill, companions pay their own share directly on their own device (via Apple Pay, Card, or Cashier chit). Companions must never hand their personal phone or credit card to the host.
- **TOUCHSCREEN & TABLET ERGONOMICS**:
  - The entire card for any menu item must be clickable (touch anywhere on the card to open customization, not just a small button).
  - Touch targets must be generous (minimum 44x44px, large pills, clear tactile `:active` feedback).

---

### 2. Design System Compliance (FlameLink Design Tokens)
- **Palette (100% Light Workspace — Never Dark Fills or Gradients)**:
  - Canvas: `#ffffff` | Surfaces/Cards: `#f9f9f9` (Vellum) | Hairline borders: `#e5e7eb` (1px Gridline).
  - Single Chromatic Signal: Crimson Flame (`#FF0055`) with subtle ambient glow (`0 0 0 6px rgba(255,0,85,0.12)`).
  - Text: Ink (`#262626`) for headings, Slate (`#727272`) for descriptions, Graphite (`#616161`).
- **Radii**:
  - `999px` for all pills, buttons, and status tags.
  - `16px` for all cards and modals.
  - `8px` for inputs and notes.
- **Typography**:
  - Primary UI: `Inter` / `Suisse` (humanist grotesk).
  - Technical Data & Pricing: `JetBrains Mono` / `Geist Mono` for prices (e.g. `185.00 EGP`), order IDs, and timers.
- **Strict Prohibitions**:
  - **NO EMOJIS**: Zero cheesy emojis (such as food icons, cartoon graphics, or emoji symbols). Use clean SVG icons, typographic glyphs, and badges. This applies to UI, code, comments, AND AI chat responses.
  - **NO ACADEMIC/WORKSHOP LABELS**: Never show "DEBI", "Port Said", "workshop", or "assignment" in the user interface.

---

### 3. Data & Security Integrity
- **100% Managed Stack**: Frontend communicates directly with Supabase via `@supabase/supabase-js` or Supabase REST Data API.
- **Zero Secrets in Code**: Never commit or expose `sb_secret_` or any service credentials. Use only the `sb_publishable_` key on the client side with PostgreSQL Row Level Security (RLS).
- Ensure `.gitignore` ignores all `.env*`, `*.secret*`, and credentials.

---

### 4. Mandatory Pre-Flight Self-Audit Protocol (Every Turn Verification)
Before finalizing any turn or outputting a response, the agent MUST run a self-audit:
1. Scan for emojis in code, UI, and response text. Must be 0 emojis.
2. Verify Light Theme tokens: `#ffffff`, `#f9f9f9`, `#e5e7eb`, `#262626`, `#FF0055`. No dark backgrounds or saturated non-brand colors.
3. Verify first-principles physical reality: no redundant QR screens on phone, no party-size questions for seated diners.
4. Verify Host authority and companion payment distribution on separate mobile devices.
