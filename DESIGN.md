# FlameLink — Design System & Interactive Blueprint (Crimson OS Edition)
> Multiplayer Dine-In OS. Technical blueprint on warm vellum with a piercing Crimson Flame signal (`#FF0055`).

## 0. Absolute Laws
1. **NO EMOJIS:** Use crisp geometric SVGs or Asciify components only.
2. **NO GRADIENTS:** Flat solid fills. Depth comes from layering and solid 6px glow rings.
3. **CRIMSON SIGNAL:** The ONLY brand color is `#FF0055`. Replace all orange.
4. **PAYMENT GATE:** Orders are "Pending" until paid. They ONLY fire to KDS after settlement.

## 1. Tokens — Color System
| Name | Value | Token | Role |
|------|-------|-------|------|
| Crimson Flame | `#FF0055` | `--color-crimson` | Primary Signal, CTAs, Active States, Logo |
| Crimson Glow | `#FF00551A`| `--color-glow` | `0 0 0 6px` Rings on active inputs |
| Vellum Canvas | `#F9F9F9` | `--color-vellum` | Page background (Diner/Cashier) |
| Paper Surface | `#FFFFFF` | `--color-paper` | Cards, Modals, Receipt Sheets |
| Obsidian | `#0D0F12` | `--color-kds-bg` | High-contrast Kitchen background |
| Chit Paper | `#FCFBF7` | `--color-chit` | Warm thermal paper for KDS tickets |

## 2. Typography & KDS Readability
- **Diner UI:** `Suisse` / `Inter` (Authoritative Grotesque).
- **Kitchen/Data:** `Geist Mono` (Tabular numbers for timers and prices).
- **KDS Sizing (Large Screen optimized):**
  - Table/Order Header: `24px` Bold Monospace.
  - Dish Titles: `20px` Bold Suisse.
  - Modifiers: `18px` Medium Geist Mono (Crimson ink, indented `↳`).

## 3. Physical "Dine-In OS" Shapes
1. **Perforated Thermal Chit:** Give KDS and Order Tracker cards physical punch-hole side notches (`16px` half-circle cutouts at the header line) and `1px dashed` internal dividers.
2. **Shared Cart Indicators:** Small user markers (e.g., `[ User A ]`, `[ User B ]`) next to items in the shared pool.

## 4. Asciify Engine Integration (asciify.org/kit)
- **Decode (`decode`):** Use for the main Hero headline on the Overview page.
- **Beam (`beam`):** Use for the "Cooking" status on KDS tickets and "Processing Payment" state.
- **Cursor Trail (`cursorTrail`):** A subtle `trail` style on the Overview and Menu background.
