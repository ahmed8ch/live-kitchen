# FlameLink — Master Design System & Interactive Blueprint (Firecrawl Edition)
> Industrial Kitchen Precision meets Technical Blueprint on Warm Vellum. A real-time restaurant synchronization platform built on near-white Vellum surfaces (`#f9f9f9`), stitched together by `1px` hairline gridlines (`#e5e7eb`), driven by a single burning Ember Orange signal (`#ff4d00`), tactile thermal paper shapes, and live ASCII telemetry.

---

## 0. Absolute Anti-Slop Laws (Zero Exceptions)
1. **NO EMOJIS ANYWHERE:** Never render Unicode emojis (`🔥`, `🍔`, `⚡`, `✔`, `🏠`, `⏱️`) anywhere in the DOM, toasts, buttons, KDS tickets, or sidebar labels. Use crisp `1.5px`-stroke geometric inline SVGs (`16px` or `18px` square viewBox) or bracketed `Geist Mono` tags (`[ LIVE ]`, `[ +45 EGP ]`).
2. **NO AI-SLOP GRADIENTS:** Never use blurry background color blobs, rainbow text gradients, or multi-stop button gradients. Depth comes strictly from flat surface layering (`Vellum #f9f9f9` vs. `Paper #ffffff`), `1px solid #e5e7eb` hairline borders, and solid 6px outer glow rings (`0 0 0 6px #fcddcc`).
3. **NO TOP NAVBAR:** Navigation lives exclusively in the collapsible Left Structural Sidebar Rail.
4. **SINGLE CHROMATIC SIGNAL ON PUBLIC/DINER VIEWS:** On Overview, Menu, Tracker, Bill, and QR Studio views, `--color-ember-orange` (`#ff4d00`) is the system's sole chromatic accent (follows the **60-30-10 Rule**: 60% Vellum/Paper, 30% Ink/Slate, 10% Ember Orange). Multi-color status bands (`Amber`, `Emerald`, `Crimson`) are restricted strictly to the `/kds` Kitchen Display tickets and active tracker step dots.

---

## 1. Tokens — Color System

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ember Orange | `#ff4d00` | `--color-ember-orange` | Primary CTA fill, `Link` wordmark accent, active sidebar bar, ASCII heat pulse, badge dots |
| Ember Glow Ring | `#fcddcc` | `--color-ember-glow-light` | Solid outer bloom ring (`0 0 0 6px #fcddcc`) on primary pill CTAs and active focal triggers |
| Ember Wash | `#febec2` | `--color-ember-wash-deep` | Secondary outer ring on active interactive sandboxes |
| Vellum Canvas | `#f9f9f9` | `--color-vellum` | Main page background, quiet inset panels, structural table background |
| Paper Surface | `#ffffff` | `--color-paper` | Elevated dish cards, modals, itemized tax receipts, and QR stand surface |
| Gridline | `#e5e7eb` | `--color-gridline` | Dominant `1px` hairline skeleton: structural columns, card borders, input strokes, dividers |
| Ink | `#262626` | `--color-ink` | Primary headings, dish titles, prices, SVG icon strokes, primary body text (AAA contrast) |
| Graphite | `#616161` | `--color-graphite` | Supporting body paragraphs, dish ingredient descriptions |
| Slate | `#727272` | `--color-slate` | Secondary labels, inactive sidebar links, modifier subtitles |
| Ash | `#949494` | `--color-ash` | Monospace metadata, calorie tags, timestamps, helper captions |
| Stone | `#c7c7c7` | `--color-stone` | Input placeholders, disabled control text |
| Mist | `#b5b5b5` | `--color-mist` | Hairline crosshairs (`+`) at grid intersections, dashed receipt rules |
| **KDS Obsidian** | `#0d0f12` | `--color-kds-canvas` | High-contrast dark room background used **exclusively** on the `/kds` Kitchen Display view |
| **KDS Gridline** | `#1f242d` | `--color-kds-gridline` | Hairline structural dot/grid matrix on the dark KDS canvas |
| **Chit Paper** | `#fcfbf7` | `--color-chit-paper` | Warm physical thermal paper surface for KDS order tickets |
| **Status: New** | `#ff4d00` | `--color-kds-new` | KDS Ticket Header Band — State 1: Order Received / New |
| **Status: Cooking**| `#d97706` | `--color-kds-cooking` | KDS Ticket Header Band — State 2: Firing on Grill / Cooking |
| **Status: Ready** | `#15803d` | `--color-kds-ready` | KDS Ticket Header Band — State 3: Ready for Pass / Plating |
| **Status: Delayed**| `#dc2626` | `--color-kds-delayed` | KDS Ticket Header Band — Urgent (>10 min elapsed) |

---

## 2. Tokens — Typography & Numeric Discipline

- **Primary Interface & Display (`--font-suisse`):** `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
  - Weights: `400` (Regular), `450`/`500` (Medium — used for all headings, dish titles, and buttons for calm engineered authority rather than heavy cartoon bold).
- **Technical & Telemetry Mono (`--font-geist-mono`):** `'Geist Mono', 'JetBrains Mono', monospace`
  - Used for order IDs (`#ORD-104`), table codes (`TABLE T-04`), calorie tags (`540 KCAL`), EGP prices, 14% VAT breakdowns, ASCII streams, and KDS elapsed timers (`02:14`).
- **Mandatory Tabular Numerals:** Every element displaying a price, quantity, percentage, timer, or order ID MUST apply `font-variant-numeric: tabular-nums` (`data-ui-number`).

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | Geist Mono | 400 | `11px` | `1.45` | `+0.02em` | `--text-caption` |
| body-sm | Suisse | 400 | `13px` | `1.50` | `+0.01em` | `--text-body-sm` |
| body | Suisse | 400 | `14px` | `1.50` | `0em` | `--text-body` |
| heading-sm | Suisse | 500 | `18px` | `1.33` | `-0.005em` | `--text-heading-sm` |
| heading | Suisse | 500 | `24px` | `1.20` | `-0.01em` | `--text-heading` |
| heading-lg | Suisse | 500 | `40px` | `1.10` | `-0.015em` | `--text-heading-lg` |
| display | Suisse | 500 | `52px` | `1.06` | `-0.02em` | `--text-display` |

---

## 3. Tokens — Spacing, Concentric Radii & Shadows

- **Base Unit:** `4px` (`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 96`)
- **Page Max-Width:** `1200px` inside content frame; `24px` card padding; `12px` element gap.
- **Concentric Radius Law (`lintapple` compliant):**
  - $\text{Radius}_{\text{outer}} = \text{Radius}_{\text{inner}} + \text{Padding}$
  - **Pill Controls (`buttons`, `tags`, `category-pills`, `floating-cart-pill`):** `999px`
  - **Outer Cards (`dish-card`, `bento-panel`, `modal-dialog`):** `16px` outer radius with `8px` inner frame inset -> `8px` inner image/panel radius.
  - **Inputs & Technical ASCII Windows:** `8px` radius.
  - **KDS Thermal Paper Chits:** `4px` crisp paper corners.

```css
:root {
  --shadow-ember-pill: 0px 0px 0px 6px #fcddcc;
  --shadow-vellum-ring: 0px 0px 0px 6px #f9f9f9;
  --shadow-card-quiet: 0px 1px 2px rgba(0, 0, 0, 0.03), 0px 12px 24px -8px rgba(0, 0, 0, 0.02);
  --shadow-float-elevated: 0px 24px 32px -12px rgba(0, 0, 0, 0.06), 0px 0px 0px 1px #e5e7eb;
}
```

---

## 4. Signature Visual Craft: ASCII Telemetry, Blueprint Micro-Textures & Physical Shapes

To make FlameLink feel alive, tactile, and memorable without breaking the flat Firecrawl blueprint aesthetic or exceeding `<450KB`, implement these 4 signature design patterns:

### 4.1 Live ASCII & Dot-Matrix Kitchen Telemetry (Zero Emojis)
In a restaurant context, monospace ASCII patterns mimic thermal kitchen receipt printers and LED pass boards:
1. **Interactive "Thermal Flame" ASCII Matrix (Overview Hero):**
   - Render a lightweight `<pre>` / `<canvas>` block framed in `1px solid var(--color-gridline)` with `#ffffff` background that animates a subtle rising heat-wave or QR matrix using strictly monospace characters (`[ . : + * # ]`) in `--color-ink` (`#262626`) with peak wave characters highlighted in `--color-ember-orange` (`#ff4d00`). Responds subtly to cursor X/Y coordinates.
2. **Live WebSocket ASCII Conduit Bar:**
   - Between the Diner Menu preview and the Kitchen Pass preview on the Overview page, render a live horizontal ASCII conduit:
     `TABLE T-04 ──[ ··:++*##*++:·· 142MS ]──> FLAME PASS`
   - Clicking `"Fire Demo Order"` accelerates the ASCII stream and flashes the border with `--shadow-ember-pill`.
3. **Thermal Print-Head Text Decode (220ms):**
   - When a new ticket appears on the KDS or Order Tracker, briefly decode the dish title from monospace symbols (`#%*+-=`) into crisp text (`1x Angus Smash Burger`) over `220ms`—mimicking a thermal receipt printer striking paper.

### 4.2 Blueprint Hairline Grid & Structural Crosshairs (No Blurry Shaders)
1. **24px Architectural Dot Matrix:**
   - Apply a clean `1px` dot matrix (`radial-gradient(#d4d4d8 1px, transparent 1px)` at `24px × 24px`) on `--color-vellum` structural sections.
2. **Corner Registration Crosshairs (`+`):**
   - At major Bento Grid intersections on the Overview page, place tiny `9px` `--color-mist` (`#b5b5b5`) `+` crosshair marks to reinforce the technical blueprint aesthetic.
3. **Hover Border Ring Illumination:**
   - When hovering interactive cards or dish items, transition the border from `1px solid #e5e7eb` to `1px solid #ff4d00` with `box-shadow: 0 0 0 4px #fcddcc` over `150ms cubic-bezier(0.16, 1, 0.3, 1)`.

### 4.3 Three Signature Physical Restaurant Shapes
Move beyond generic rectangles by introducing shapes from physical restaurant operations:
1. **Perforated Thermal Ticket Shape (Order Tracker & KDS Chits):**
   - Give receipt cards and KDS tickets physical punch-hole side notches (`16px` half-circle cutouts on left and right edges at the header divider line) and a `1px dashed #cbd5e1` tear line:
   ```css
   .thermal-ticket {
     position: relative;
     background: var(--color-paper);
     border: 1px solid var(--color-gridline);
     border-top: 4px solid var(--color-ember-orange);
     border-radius: 8px;
   }
   .thermal-ticket::before,
   .thermal-ticket::after {
     content: "";
     position: absolute;
     top: 56px;
     width: 14px;
     height: 14px;
     background: var(--color-vellum); /* Or --color-kds-canvas on KDS */
     border: 1px solid var(--color-gridline);
     border-radius: 999px;
   }
   .thermal-ticket::before { left: -8px; }
   .thermal-ticket::after { right: -8px; }
   ```
2. **Isometric 3D Acrylic Tent Stand Shape (QR Stand Studio & Overview):**
• Render the 4×6" Acrylic Table Stand with tactile 3D perspective (transform: perspective(1000px) rotateY(-10deg) rotateX(4deg)) and a crisp 1px solid #e5e7eb double-walled acrylic edge frame that straightens smoothly to rotateY(0deg) rotateX(0deg) translateY(-4px) on hover.
3. Asymmetric Bento Blueprint Grid (Overview):
	• Stitch the Overview showcase into a 1px solid #e5e7eb exposed-hairline Bento Grid (gap: 1px; background: #e5e7eb; where each inner cell has background: #ffffff or #f9f9f9), linked by animated SVG dashed connector paths showing the path of an order.


5. Core Component & Layout Laws

1. Brand Wordmark (FlameLink):
	• Single horizontal baseline (inline-flex items-center gap-2). Geometric 16px SVG flame mark in #ff4d00 + Flame in #262626 + Link in #ff4d00 (weight: 500, letter-spacing: -0.02em). Never stacked on two lines.
2. Left Structural Sidebar Rail (No Top Navbar):
	• Fixed left column (220px expanded, 64px collapsed icon rail) on --color-vellum with border-right: 1px solid var(--color-gridline). Active route displays a 2px left indicator in #ff4d00, #ffffff pill/row fill, and #262626 text.
3. Bottom-Center Floating Cart Pill:
	• position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 40;
	• Radius 999px, background #262626, text #ffffff, item count pill in #ff4d00, monospace EGP total (tabular-nums), wrapped in 0 0 0 6px rgba(38, 38, 38, 0.08).
4. Top-Right Toast Notification:
	• position: fixed; top: 24px; right: 24px; z-index: 50;
	• Radius 8px, background #ffffff, 1px solid #e5e7eb, left bar 3px solid #ff4d00, 13px crisp human copy.
5. Unsectioned KDS Thermal Paper Chit Grid (/kds):
	• Canvas #0d0f12 with 24px dark dot grid (#1f242d). Single auto-fill grid (repeat(auto-fill, minmax(320px, 1fr)))—never cramped vertical status columns.
	• Paper surface #fcfbf7, text #111827, 44px solid status top band (#ff4d00 New, #d97706 Cooking, #15803d Ready, #dc2626 Delayed), 22px Geist Mono Table & Order ID, live ticking timer (02:14), 18px dish titles, and all selected modifiers (+ Extra Angus Patty) printed in full view.