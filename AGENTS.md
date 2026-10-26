# Live Kitchen (Order Management & Digital Dine-In Platform)
## Core Product Blueprint & AI Guidelines

Live Kitchen digitizes the restaurant dine-in experience and seamlessly merges it with the speed, visibility, and tracking of modern online ordering.

---

### 1. Dual-Interface Architecture
The platform consists of two seamlessly connected real-time interfaces:

1. **The Operations Dashboard (Staff / Kitchen / Owner)**:
   - Inspired by world-class SaaS restaurant management systems (such as Orderio).
   - **Left Navigation Rail**: Quick access to Dashboard, Kitchen Live Orders, Digital Menu Manager, Analytics, Tables, and Settings.
   - **Top Navigation Bar**: Global search, Quick action (`+ New Order`), Store/Branch picker, Live Notification Bell, and Staff profile.
   - **KPI Metrics Ribbon**: Real-time counters for Total Orders, New Orders, Total Served, Average Prep Time, and Completed Orders.
   - **Order Lifecycle Kanban / Filter Matrix**: Filters for All Orders, New, Confirmed, Preparing, Ready, Served, and Completed.
   - **Rich Order Cards**: Clean presentation with Order ID, Dine-In (Table Number) vs. Takeaway tag, customer details, elapsed time ticker, itemized order list, subtotal, and one-click workflow actions (e.g., "Start Prep", "Mark Ready", "Mark Served").

2. **The Diner Digital Menu (Customer / Table)**:
   - Accessible via table QR code or `/menu`.
   - **Zero Friction**: Customers do NOT need to create an account or log in to order at their table. (Optional login for repeat history).
   - Fast category navigation, dietary tags, price in local currency, instant cart drawer, and table confirmation.
   - **Real-Time Live Status Tracker**: When submitted, the diner watches their order update from "Received" to "Preparing" to "Ready for Table" in real-time via WebSockets (Supabase Realtime).

---

### 2. Design Standards & Strict Prohibitions
- **NO ACADEMIC/WORKSHOP MENTIONS**: Never show "DEBI", "Port Said", "workshop", or "assignment" in the user interface. It must look and feel like an enterprise, production-ready SaaS product.
- **NO CHEESY EMOJIS**: Never use emojis (🍔, 🍕, 🍟) as icons or decorations. Use polished SVG icons, clean badges, and intentional typography.
- **Apple HIG & Taste Skill Compliance**: Follow `ui-policy.json`, strict contrast (>= 4.5:1), refined typography (`Readex Pro` + SF Pro/system stack), clean radii, and responsive layout.

---

### 3. Data & Security Integrity
- **100% Managed Stack**: Frontend communicates directly with Supabase via `@supabase/supabase-js`.
- **Zero Secrets in Code**: Never commit or expose `sb_secret_` or any service credentials. Use only the `sb_publishable_` key on the client side with PostgreSQL Row Level Security (RLS).
- Ensure `.gitignore` ignores all `.env*`, `*.secret*`, and credentials.
