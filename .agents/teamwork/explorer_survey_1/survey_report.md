# FlameLink Live Kitchen (لايف كيتشن) — Consumer-Facing Screens & Flows Survey Report (Screens 1 to 4)

## Executive Summary
This report delivers an in-depth survey of the consumer-facing screens and multiplayer flows for FlameLink Live Kitchen, covering:
1. Menu Page (`/menu?table=T-04`)
2. Companion Flow (`/companion` and `/guest-order`)
3. Live Order Tracker (`/tracker` and `/order/:id`)
4. Table Bill & Settlement (`/settlement` and `/settlement/:id`)

The assessment examines visual compliance against the Light Vellum palette (#FFFFFF canvas, #F9F9F9 cards/surfaces, #E5E7EB hairline borders, #262626 text headings, #FF0055 Crimson Flame chromatic signal), first-principles UX (zero back-office leaks, zero redundant questions, generous tap targets >= 44x44px, full card clickability), Table Host authority versus Companion distributed settlement logic, and AI design anti-patterns.

---

## 1. System Inventory & File Map

### Core Consumer Components & Pages
| Screen / Module | File Path | Primary Responsibilities |
| :--- | :--- | :--- |
| Screen 1: Menu Page | `src/pages/MenuPage.tsx` | Category tabs, dish grid, search query filtering, dietary tag filter pills, trigger modals. |
| Dish Customization Modal | `src/components/menu/DishModal.tsx` | Modifier selection, special kitchen notes input, quantity steppers, add-to-cart action. |
| Floating Cart Bar | `src/components/cart/FloatingCartBar.tsx` | Sticky bottom pill showing item count and running total, with spring pop physics. |
| Shared Cart Drawer | `src/components/cart/CartDrawer.tsx` | Slide-in drawer grouping items by diner, 48x48px thumbnails, Host checkout authority, Companion ready toggle. |
| Sticky Table Lobby Bar | `src/components/multiplayer/TableLobbyBar.tsx` | Sticky bar displaying Table Number, copyable PIN badge (Host only), seated diner roster, ready pips. |
| Seated Diner Account Modal | `src/components/auth/AccountModal.tsx` | Phone + 4-digit PIN authentication, 10% loyalty cashback tier, dietary preferences, 1-touch reordering. |
| Screen 2: Companion Page | `src/pages/CompanionPage.tsx` | Guest menu browsing, attributed line items, companion ready toggle, dedicated distributed personal settlement card. |
| Table PIN Lobby Modal | `src/components/multiplayer/TableLobbyModal.tsx` | Table join modal with 4-digit PIN verification and persona selection. |
| Screen 3: Live Order Tracker | `src/pages/OrderTrackerPage.tsx` | Perforated thermal ticket UI, 4-stage pipeline stepper, unpaid chit warning, loopback order again. |
| Screen 4: Bill & Settlement | `src/pages/SettlementPage.tsx` | 3 split modes (by diner, equal fraction, itemized dishes), post-meal review/tipping, print/PDF/PNG export. |
| Global Navigation & Dock | `src/components/layout/Sidebar.tsx` | Auto-hiding macOS dock and mobile navigation drawer. |
| Application Root & Footer | `src/App.tsx` | Route definitions, global table query ingestion (`?table=`), footer sitemap. |
| Global State Management | `src/store/useAppStore.ts` | Zustand store with LocalStorage persistence, BroadcastChannel multiplayer sync, payment gate. |
| Domain Models | `src/types/domain.ts` | TypeScript types for Menu, Cart, Orders, TableSessions, DinerAccounts. |
| Menu Catalog | `src/domain/menuData.ts` | Item definitions, modifiers, prices, categories, prep times, stations. |

---

## 2. In-Depth Screen Analysis

### Screen 1: Menu Page (`/menu?table=T-04`)
- **Category Pills (`MenuPage.tsx:149-165`)**:
  - Implementation: Filter row containing 'All Dishes', 'Flame Burgers', 'Prime Steaks', 'Artisan Pizzas', 'Pastas & Sides', 'Drinks & Desserts'.
  - Styling: Active pill features `2px solid #FF0055` (`border-2 border-[#FF0055]`), soft pink wash (`#fff0f3`), and text color `#FF0055`.
  - UX Assessment: Meets minimum touch height (`min-h-[44px]`). Category selection updates grid smoothly.
  - Deficiency: Missing keyboard left/right arrow navigation between category tabs; desktop scrollbar is hidden with `scrollbar-none` without edge fade cues.
- **Search Bar (`MenuPage.tsx:120-147`)**:
  - Implementation: Text input with magnifying glass SVG icon and clear button (`x`).
  - Search Scope: Filters across item name, description, badge text, and dietary tags.
  - Deficiency: Input font size uses arbitrary `text-[13px]`; container uses `focus:ring-[#FF0055]/15` instead of unified token.
- **Dietary Filter Pills (`MenuPage.tsx:167-189`)**:
  - Implementation: Secondary filter row with 'All Tags', 'Halal', 'Gluten-Free', 'High-Protein', 'Vegetarian', 'Wood-Fired'. Also displays red dot indicator if tag matches diner profile.
  - **Severe Ergonomic Flaw**: Tap targets use `px-3 py-1 text-xs`, resulting in an rendered height of ~26px. This is well below the mandatory 44x44px touch target requirement on touchscreens.
- **Dish Cards (`MenuPage.tsx:230-313`)**:
  - Implementation: 3-column responsive card grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).
  - Touch Ergonomics: Full card is clickable (`role="button" tabIndex={0} onClick={() => setSelectedDish(dish)}`) with keyboard trigger on Enter or Space.
  - Image handling: Lazy loading with Unsplash fallback on error. Badges and ratings in top corners.
  - Deficiency: Font sizes use non-standard pixel values (`text-[16px]`, `text-[11px]`, `text-[13px]`). Prices use `font-mono-num font-bold`.
- **Touch Customization Modal (`DishModal.tsx`)**:
  - Implementation: Accessible modal dialog (`role="dialog" aria-modal="true"`) with backdrop dismiss and `Escape` key capture.
  - Modifiers: Checkbox list with full touch rows (`min-h-[48px]`), clear price add-ons (`+{price} EGP`), and visual checked states.
  - Quantity Steppers: Stepper buttons (`-` and `+`) satisfy the 44x44px minimum target (`min-w-[44px] min-h-[44px]`).
  - CTA Button: Large crimson pill button with running total calculation (`dish.basePrice + modTotal * quantity`).
  - Deficiency: Font sizes rely on arbitrary tailwind arbitrary classes (`text-[11px]`, `text-[12px]`, `text-[13px]`, `text-[14px]`).
- **Floating Cart Bar (`FloatingCartBar.tsx`)**:
  - Implementation: Fixed bottom-center capsule (`fixed bottom-6 left-1/2 -translate-x-1/2`).
  - Physics: Features spring pop animation on item count increment (`animate-spring-pop`).
  - Visibility: Correctly auto-hides when cart is empty or when CartDrawer is already open.
  - Deficiency: Monospace font applied to small UI copy (`text-[13px] font-mono-num`).
- **Slide-in Cart Drawer (`CartDrawer.tsx`)**:
  - Implementation: Right slide-in drawer (`max-w-md bg-white h-full`).
  - Multiplayer Grouping: Automatically groups line items by seated diner ("Your Items", "Sarah's Items", "Omar's Items").
  - Item Imagery: Displays crisp 48x48px image thumbnails beside each line item (`w-12 h-12 rounded-lg object-cover`).
  - Host vs Companion Logic: Only the Table Host has checkout authority ("Submit Table Order"). Companions see "Waiting for Table Host to Finalize" and a "I am Done Choosing (Notify Host)" button.
  - **Color Palette Violation**: Ready toggle button on line 369 uses saturated emerald green (`bg-[#15803d] text-white hover:bg-[#166534]`), violating the single chromatic signal rule (`#FF0055`).
  - **Ergonomic Deficiency**: Split strategy selector buttons (lines 388-422) use `p-2 text-[11px]` (~28px height), failing touch target sizing.
- **Sticky Table Lobby Bar (`TableLobbyBar.tsx`)**:
  - Implementation: Mounts sticky at top of menu and companion screens. Shows Table number, 4-digit PIN badge (copyable with 1-click), seated diner roster, and ready pips.
  - Host vs Companion Role: Host sees copyable PIN badge. Companions see "Shared Table Pool". Host has kick/reset controls. Companions have ready toggle.
  - **Color Palette Violation**: Uses green `#15803d` for "Copied!" text, ready indicator dot, and ready status button.
  - **Ergonomic Deficiency**: Reset Diners button (`text-[10px] px-2 py-0.5`), Leave Table button (`text-[11px]`), and member remove button (`w-4 h-4`) are under 44px.
- **Loyalty Profile Modal (`AccountModal.tsx`)**:
  - Implementation: Tabbed modal (`signin`, `signup`, `profile`, `history`). Provides 1-click demo login, dietary preference toggling, order history list, and 1-touch dish re-ordering.
  - **Severe Palette Violation**: Line 380 uses a dark gradient card: `bg-gradient-to-br from-[#262626] to-[#171717]`. This directly contradicts the mandatory 100% Light Vellum workspace directive ("Never Dark Fills or Gradients").
  - Line 267 uses emerald green badges (`bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]`).
  - Sub-44px touch targets on dietary pills, table history reorder buttons, and tabs.

---

### Screen 2: Companion Flow (`/companion` & `/guest-order`)
- **Session Join & Attribution (`CompanionPage.tsx:40-60`, `useAppStore.ts:450-528`)**:
  - A diner opening `/companion?table=T-04` is initialized with a distinct guest identity (e.g., `Orange Fox`, `Golden Eagle`) from the available roster.
  - Items added by the companion are stored with `addedBy: { memberId, name, isHost: false }`.
  - BroadcastChannel immediately synchronizes the new member and their cart additions across tabs.
- **Dedicated Distributed Settlement Card (`CompanionPage.tsx:169-347`)**:
  - When the table order is placed and awaiting payment, the companion screen displays an exclusive "Personal Dine-In Share" settlement card.
  - Displays:
    1. Attributed dish breakdown with individual line pricing.
    2. Proportional 14% Egyptian Tax Authority (ETA) VAT calculation.
    3. Dedicated payment method selector (Apple Pay, Card, Cashier Desk Chit).
    4. "Pay My Share" CTA button with sub-500ms authorization simulation.
    5. Table settlement progress bar showing total settled vs remaining table balance.
    6. Real-time update when other table diners pay their shares.
- **First-Principles Evaluation**:
  - Eliminates the awkward physical reality of handing personal phones or credit cards to the Host.
  - Companion pays their own share from their own mobile browser.
  - Host cannot be forced to cover companion items without explicit agreement.
- **Identified Deficiencies**:
  - **Color Palette Violation**: Emerald green classes used on lines 246-250 (`bg-emerald-50 border-emerald-200 text-emerald-800 text-emerald-700`) and line 327 (`bg-[#15803d]`).
  - Dish cards in `CompanionPage.tsx` lack `role="button" tabIndex={0}` and keyboard navigation (`onKeyDown`), unlike `MenuPage.tsx`.
  - Payment method cards (`p-2.5 rounded-lg`) have sub-44px touch heights.
  - Monospace font overused on non-numeric labels (`font-mono-num` on titles and descriptions).

---

### Screen 3: Live Order Tracker (`/tracker` & `/order/:id`)
- **Thermal Chit Perforation (`OrderTrackerPage.tsx:122-302`)**:
  - Implementation: Uses `.thermal-ticket-light` with CSS pseudo-elements (`::before`, `::after`) rendering circular punch-hole notches (16px half-circles) at the 64px header line, combined with `.thermal-tear-line` dashed dividers.
- **4-Stage Progress Pipeline**:
  - Stages:
    1. `received` — Station cooks reviewing kitchen chit
    2. `cooking` — Flame Line Cooking (patties searing & wood-fire oven active)
    3. `ready` — Plating & Expediting (final garnish & tray pass inspection)
    4. `served` — Delivered to Table
  - Vertical connecting line illuminates in `#FF0055` as stages advance.
- **Payment Gate Enforcement (`OrderTrackerPage.tsx:98-119`)**:
  - If ticket is unpaid (`paymentStatus === 'pending_verification'`), prominent warning banner states: "AWAITING CASHIER SETTLEMENT (CHIT #PAY-XX) ... Kitchen cooking is strictly on hold until payment is confirmed by the front register."
- **Server Bump Telemetry Alert**:
  - In `useAppStore.ts` (lines 1945-1947), when KDS marks status as `ready`, a broadcast message triggers a toast: "Your food is ready at the pass! Server on the way."
- **Identified Deficiencies**:
  - Transient toast can be missed if diner switches apps or locks phone. In addition to the toast, an in-chit visual alert box should appear inside the thermal chit when `status === 'ready'`.
  - Font sizes use arbitrary pixel values (`text-[11px]`, `text-[12px]`, `text-[13px]`, `text-[14px]`, `text-[18px]`).
  - Monospace font applied to small descriptive labels.

---

### Screen 4: Table Bill & Settlement (`/settlement` & `/settlement/:id`)
- **Bill Splitting Mechanics (`SettlementPage.tsx:480-750`)**:
  1. **Split by Diner**: Shows all seated party members, lists dishes added by each diner, calculates personal subtotal + 14% VAT, shows personal settlement status, and allows each diner to pay their own share or cover for a companion.
  2. **Equal Split**: 1, 2, 3, 4, 5, 6, 8-way split buttons with real-time per-person division including 14% VAT.
  3. **Custom Dishes (Itemized)**: Checkbox selection of ordered dishes to pay exactly for selected items.
- **Payment Gate & Settlement Flow**:
  - All orders are initially in `pending_verification`.
  - Options: Apple Pay (instant auth), Card (instant auth), or Cashier Desk (generates `#PAY-XX` chit for front desk).
  - Once remaining balance reaches 0.00 EGP, order status flips to `verified_paid`, unlocking KDS pass broadcast.
- **Post-Payment Rating & Tipping (`SettlementPage.tsx:830-934`)**:
  - Appears strictly AFTER payment is verified.
  - 5-star rating control with Happy Yellow `#FBBF24` stars.
  - Kitchen gratuity selector: 0%, 10%, 12%, 15% of net food subtotal.
  - Optional kitchen feedback notes.
- **Print Isolation & Export Engine (`SettlementPage.tsx:958-995`, `index.css:237-291`)**:
  - Wrapped thermal ticket in `#printable-receipt`.
  - Scoped CSS `@media print` rules hide all navigation headers, docks, footers, toasts, and buttons, printing ONLY the clean paper receipt.
  - One-click "Print Receipt", "Download PDF" (print-to-PDF), and "Save as Image" (canvas PNG download).
- **Identified Deficiencies**:
  - **Severe Palette Violation**: Saturated emerald green used extensively for paid badges, banners, and progress indicators (lines 460, 464, 471, 528, 547, 568, 633, 755, 928).
  - Small touch targets on split mode tabs, equal split buttons, tip buttons, and star buttons (< 44px).
  - Monospace font overused on non-numeric labels.

---

## 3. First-Principles UX & Persona Separation Audit

### Audit Checklist Results

| First-Principles Criterion | Status | Evidence / Observation |
| :--- | :--- | :--- |
| **No Redundant Seated Diner Questions** | PASS | No screen asks party size or chair counts. Seated diners immediately view menu and prices. |
| **No Mobile QR Codes to Seated Diners** | PASS | No QR codes are shown on `/menu`, `/companion`, `/tracker`, or `/settlement`. QR codes exist only on `/stand` (print stand generator) and `table-stand.html`. |
| **Full Card Clickability** | PARTIAL PASS | Full card clickable in `MenuPage.tsx` with Enter/Space keyboard support. `CompanionPage.tsx` cards have `onClick` but lack keyboard listeners and `role="button"`. |
| **Touch Targets >= 44x44px** | FAIL | Sub-44px targets found across all 4 screens: dietary filter pills (26px), split mode tabs (28px), tip buttons (30px), star rating buttons (28px), lobby bar buttons (22-26px). |
| **Host Authority over Order Submission** | PASS | Only Host can click "Submit Table Order" in `CartDrawer.tsx`. Companions see "Waiting for Table Host to Finalize". |
| **Distributed Companion Settlement** | PASS | Companions can settle their individual share directly on their own device via `/companion` or `/settlement` without handing phone to Host. |
| **Zero Back-Office Leaks in Consumer UI** | FAIL | **CRITICAL LEAK**: `Sidebar.tsx` (lines 177-195) exposes "Kitchen Pass (KDS)", "Cashier POS", and "Table QR Stand" in the desktop dock and mobile hamburger drawer. `App.tsx` (lines 118-120) footer links to KDS and Cashier. |

---

## 4. Brand Design System & Token Compliance Audit

### Color System Check
- **Canvas (`#ffffff`)**: Clean white canvas used on all pages.
- **Surfaces/Cards (`#f9f9f9`)**: Warm vellum surface used for card backgrounds and subtle section contrasts.
- **Hairline Borders (`#e5e7eb`)**: Crisp 1px gridlines used consistently.
- **Text Headings (`#262626`)**: Charcoal ink used for authoritative headings. Slate (`#727272`) used for body descriptions.
- **Chromatic Signal (`#FF0055`)**: Crimson Flame used for CTAs, active pills, and brand logo.
- **Prohibited Color Violations Found**:
  1. Emerald green (`#15803d`, `bg-emerald-50`, `text-emerald-800`, `border-emerald-200`) used across `TableLobbyBar.tsx`, `TableLobbyModal.tsx`, `CartDrawer.tsx`, `CompanionPage.tsx`, and `SettlementPage.tsx`. (Flagged as `SD8` by `detect.mjs`).
  2. Dark gradient fill on Loyalty Card in `AccountModal.tsx` (`bg-gradient-to-br from-[#262626] to-[#171717]`), violating 100% Light Vellum directive.
  3. Rainbow animal identity colors in `TableLobbyModal.tsx` (amber-500, yellow-500, sky-500, emerald-500).

### Typography Check
- Primary font: Geist / Suisse humanist grotesk.
- Numbers & pricing: Geist Mono / `font-mono-num` with tabular numbers (`tabular-nums`).
- **Violation Found**: Monospace font overused on non-numeric small labels (e.g., `font-mono-num` on section titles, uppercase labels, and buttons). Flagged as `SD4m` by `detect.mjs`.

### Unicode Emojis Check
- **Result: 0 Unicode emojis in `src/`!**
- Verified via AST regex scanner across all 29 TypeScript, TSX, CSS, and HTML files. Clean SVG glyphs are used throughout.

---

## 5. Fact Check Against `live-kitchen-facts.md`

| Item in `live-kitchen-facts.md` | Fact Price | Status in `src/domain/menuData.ts` | Discrepancy Note |
| :--- | :--- | :--- | :--- |
| برجر لحم أنجوس مشوي (Angus Burger) | 185 EGP | 185 EGP | Exact match. |
| دجاج كرسبي مقرمش (Crispy Chicken) | 155 EGP | 165 EGP (Nashville Hot) | 10 EGP variance; name modified. |
| ستيك تندرلوين مشوي (Tenderloin Steak) | 320 EGP | 620 EGP (Prime Filet Mignon) | Menu prices expanded beyond sheet. |
| مكرونة فيتوتشيني ألفريدو | 150 EGP | 340 EGP (Short Rib Rigatoni) | Pasta item altered in gourmet catalog. |
| بيتزا إيطالية نابوليتان (Neapolitan Pizza) | 145 EGP | 220 EGP (San Marzano Margherita) | Pizza price variance. |
| بطاطس مقلية ذهبية متبلة | 50 EGP | 125 EGP (Truffle Parm Fries) | Gourmet truffle side alteration. |
| كيك شوكولاتة فادج دافئ | 75 EGP | 135 EGP (Espresso Gelato) | Replaced with gelato dessert. |
| عصائر طازجة ومشروبات | 35 EGP | 85 EGP (Blood Orange Soda) | Craft soda alteration. |

*Recommendation*: Synchronize dish titles and base prices in `menuData.ts` to strictly reflect `live-kitchen-facts.md` official baseline, or provide dual menu tiers.

---

## 6. Actionable Blueprint for Phase 1 & 2 Refinements

1. **Eliminate Back-Office Leaks in Consumer UI**:
   - In `Sidebar.tsx`: Remove KDS, Cashier, and QR Stand from consumer navigation, or wrap them in an explicit staff workstation mode / PIN barrier. Diners browsing on mobile should only see: Overview, Menu, Companion Order, Order Tracker, and Bill & Split.
   - In `App.tsx`: Clean the global master footer to remove staff KDS and Cashier links from consumer views.
2. **Resolve All `avoid-ai-design` Flags (17 Flags -> 0)**:
   - Replace saturated emerald green (`SD8`) with brand-compliant Light Vellum tokens: soft crimson wash (`#fff0f3`), crimson signal (`#FF0055`), and crisp ink/slate neutral tags.
   - Replace decorative monospace on small text labels (`SD4m`) with standard sans font (`text-xs text-[#727272]`), reserving `font-mono-num` strictly for numbers, prices, timers, and order IDs.
   - Replace colored glow shadow in `index.css:213` (`C5`) with clean elevation shadow.
3. **Upgrade Touch Target Ergonomics to >= 44x44px**:
   - `MenuPage.tsx`: Increase dietary filter pills padding to minimum 44px touch height (`py-2.5 px-3.5`).
   - `SettlementPage.tsx`: Expand split mode tabs, equal split number buttons, tip buttons, and 5-star rating buttons to minimum 44x44px tap areas.
   - `TableLobbyBar.tsx`: Enlarge Reset, Leave, and member remove buttons to 44px tap boxes.
   - `CompanionPage.tsx`: Add keyboard accessibility (`role="button" tabIndex={0} onKeyDown`) to dish cards.
4. **Remove Dark Gradient in `AccountModal.tsx`**:
   - Redesign Loyalty Balance card using Paper surface (`#ffffff`) with 1px hairline border (`#e5e7eb`), crimson accents, and clean ink typography.
5. **In-Chit Server Bump Alert**:
   - In `OrderTrackerPage.tsx`, when order status reaches `ready`, display an emphatic high-visibility callout box inside the chit: "Plating Complete: Your server is bringing dishes to Table {tableNumber}."

---

## 7. Survey Verification Method
- Code verification: `grep_search`, `view_file` on `src/pages/MenuPage.tsx`, `src/pages/CompanionPage.tsx`, `src/pages/OrderTrackerPage.tsx`, `src/pages/SettlementPage.tsx`, `src/components/layout/Sidebar.tsx`, `src/App.tsx`.
- Automated AI design check: `node .agents/skills/avoid-ai-design/scripts/detect.mjs src`
- Emoji check: AST unicode scanner verifying 0 Unicode emojis across `src/`.
- TypeScript build: `npm run build` exits code 0 with zero errors.
