---
name: first-principles-ux
description: Enforces first-principles product thinking, physical reality context, persona separation, and zero-friction UX before building any screen, flow, or user interface.
---

# First-Principles UX & Product Thinking

This skill prevents agents and developers from introducing illogical product flows, developer shortcuts, leaked administrative tools, or redundant friction into user interfaces.

Before writing a single line of frontend code or designing a screen, you **MUST** run the First-Principles Reality Check.

---

## 1. The Physical Reality Principle ("Where Am I?")

Every digital interface exists in a physical context. Always ask:
1. **Where is the user physically situated right now?**
   - Are they at home on a laptop?
   - Are they walking into a restaurant door?
   - Are they already sitting at Table 4 in a restaurant booth?
2. **What physical device are they using?**
   - Their personal mobile phone (scanned a physical QR code at the table).
   - A dedicated fixed tabletop tablet (mounted restaurant kiosk).
   - A wall-mounted kitchen monitor or cashier POS terminal.
3. **Never simulate physical artifacts redundantly on the physical device itself**:
   - If a customer scanned a table QR code with their mobile phone camera, **they are already on their phone**. 
   - Never display a giant QR code on a mobile web app saying *"Scan this QR code with your phone"*! The physical QR code lives on the wooden acrylic stand on the physical table, NOT inside the web app opened by that scan!
   - If designing a tabletop tablet kiosk, the user taps the screen to order. A QR code is only an optional secondary convenience for guests who prefer their personal phone.

---

## 2. Eliminate Irrelevant & Redundant Questions ("Why Are You Asking Me This?")

Before showing an input field or question to a user, evaluate if the system already knows it or if the question belongs to a completely different persona:

- **The Table Seating Fallacy**:
  - Asking a customer who is already sitting at Table 4: *"How many people are at this table?"* is a major UX flaw.
  - Table 4 already physically has 2 or 4 chairs, and the guests are already seated. 
  - **Who cares about party size?** The **Host / Cashier** at the restaurant entrance when seating walk-in guests (*"Table for two or four?"*), so the host can find an available table with matching capacity. The seated diner just wants to look at food and order!
- **The Mandatory Gatekeeper Fallacy**:
  - Never force users through a *"Continue as Guest vs. Create Account"* screen before they have seen a single product or menu item.
  - Users are hungry and task-driven. Show the value (the menu / products) **immediately**. Authentication and loyalty belong at checkout or as an unobtrusive top-right option.

---

## 3. Strict Persona & Domain Isolation ("Back-of-House vs. Front-of-House")

A consumer application must never expose internal back-office or staff management tools to a public user:

- **What a Customer at Table 4 MUST NEVER See**:
  - Kitchen Display System (KDS) order queues.
  - Internal floor seating maps and table management.
  - Developer viewport pickers (`Mobile | Tablet | Desktop`).
  - Step-by-step product walkthrough tabs (`01 / QR Stand`, `02 / Menu`, `03 / KDS`).
- **Domain & Route Segregation**:
  - Customer Dine-In Interface: `/` or `/?table=T-04` (Pure consumer dining app).
  - Staff / Kitchen Operations Portal: `/kds.html` or a separate subdomain/route protected by authentication or staff PIN.
  - Physical Table Stand Printout: `/table-stand.html` (A dedicated printable layout for the physical acrylic card on the table).

---

## 4. Touchscreen & Kinetic Ergonomics

When building for mobile devices, tablets, or kiosks:
- **Card-Level Hit Targets**: The entire card must be clickable (`onclick` on the whole card element). Users on touchscreens or with thumbs should never be forced to aim for a tiny 20px button.
- **Minimum Hit Target**: 44x44px for secondary buttons; 48px+ height for primary CTAs.
- **Physical Touch Feedback**: Use `:active` scaling (e.g. `transform: scale(0.985);`) to give instant tactile confirmation that a tap was registered.
- **Large Selection Controls**: Use wide touch rows for radio options and checkboxes, not tiny circular desktop inputs.

---

## 5. The Pre-Flight Reality Checklist (Run Before Coding)

Ask these 5 questions before generating any UI:
1. **Who is the single persona using this screen?** (Diner, Chef, Cashier, or Admin?)
2. **What is their urgent goal right now?** (Order food fast, prep ticket, seat guests?)
3. **Is any internal staff tool or developer artifact visible here?** (If yes, strip it out!)
4. **Is every piece of information requested from the user genuinely necessary at this moment?** (If it's already known or irrelevant, delete it!)
5. **Can the user accomplish their goal in the minimum number of taps?**
