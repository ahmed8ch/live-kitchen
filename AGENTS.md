# MatbakhLink (Digital Dine-In & Kitchen Synchronization Platform)
## Core Product Blueprint & AI Guidelines

MatbakhLink digitizes the restaurant dine-in experience and seamlessly synchronizes table self-ordering with real-time kitchen operations.

---

### 1. Persona Separation & Production-Ready UX (CRITICAL RULE)
- **NO DEVELOPER/DEMO SHORTCUTS IN USER UI**:
  - A real public customer dining at a table must NEVER see kitchen order screens, floor plans, developer device pickers, or administrative navigation tabs.
  - The customer experience must be 100% focused on dining: Welcome/Table Identification ➔ Digital Menu ➔ Dish Customization ➔ Cart/Checkout ➔ Live Order Tracker.
  - Operations/Staff interfaces (Kitchen Display System `KDS` and Floor Plan) must be separate dedicated portals (e.g. `kds.html` or protected staff view), accessed via a subtle staff link or credentialed portal.
- **TOUCHSCREEN & TABLET ERGONOMICS**:
  - The entire card for any menu item must be clickable (touch anywhere on the card to open customization, not just a small button).
  - Touch targets must be generous (minimum 44x44px, large pills, clear tactile feedback).
  - Layout must feel native whether opened on a guest's mobile phone (scanned QR) or a mounted tabletop tablet.

---

### 2. Design System Compliance (`DESIGN (3).md` — Firecrawl Reference)
- **Palette**:
  - Canvas: `#ffffff` | Surfaces/Cards: `#f9f9f9` (Vellum) | Hairline borders: `#e5e7eb` (1px Gridline).
  - Single Chromatic Signal: Ember Orange (`#ff4d00`) with warm ambient halo (`0 0 0 6px #fcddcc`).
  - Text: Ink (`#262626`) for headings, Slate (`#727272`) for descriptions.
- **Radii**:
  - `999px` for all pills, buttons, and status tags.
  - `16px` for all cards and modals.
  - `8px` for inputs and notes.
- **Typography**:
  - Primary UI: `Inter` / `Suisse` (humanist grotesk).
  - Technical Data & Pricing: `JetBrains Mono` / `Geist Mono` for prices (e.g. `185.00 EGP`), order IDs, and timers.
- **Strict Prohibitions**:
  - **NO EMOJIS**: Zero cheesy emojis (🍔, 🍕, 🍟). Use clean SVG icons, typographic glyphs, and badges.
  - **NO ACADEMIC/WORKSHOP LABELS**: Never show "DEBI", "Port Said", "workshop", or "assignment" in the user interface.

---

### 3. Data & Security Integrity
- **100% Managed Stack**: Frontend communicates directly with Supabase via `@supabase/supabase-js`.
- **Zero Secrets in Code**: Never commit or expose `sb_secret_` or any service credentials. Use only the `sb_publishable_` key on the client side with PostgreSQL Row Level Security (RLS).
- Ensure `.gitignore` ignores all `.env*`, `*.secret*`, and credentials.
