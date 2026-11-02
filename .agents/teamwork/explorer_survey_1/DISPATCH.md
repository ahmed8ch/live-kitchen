## 2026-11-02T18:35:25Z

You are teamwork_explorer instance 1 for Phase 0 (Survey).
Your metadata working directory: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/explorer_survey_1/
You must read the original user request at: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/ORIGINAL_REQUEST.md
Also review AGENTS.md at the project root for strict project rules.

YOUR MISSION:
Perform an in-depth survey of the consumer-facing screens and flows (Screens 1 to 4):
1. Menu Page (`/menu?table=T-04`): category pills, search bar, dietary filters, dish cards, touch customization modal (`DishModal.tsx`), floating cart pill (`FloatingCartBar.tsx`), slide-in cart drawer (`CartDrawer.tsx`), sticky table lobby bar (`TableLobbyBar.tsx`), loyalty profile modal (`AccountModal.tsx`).
2. Companion Flow (`/companion`): joining table session via 4-digit PIN, companion-attributed dish selection, ready toggle, distributed personal share payment.
3. Live Order Tracker (`/tracker` & `/order/:id`): thermal chit perforation, stage indicators, server bump alerts.
4. Table Bill & Settlement (`/settlement`): itemized diner split, equal split, tipping, post-payment rating, thermal receipt print/PDF.

INVESTIGATE:
- Examine the relevant source files under `src/` (components, pages, state hooks, types).
- Identify first-principles UX issues: redundant questions (e.g. asking party size to seated diners), showing QR codes to mobile users who already scanned a table QR, back-office leaks in consumer UI, tap target sizes (<44x44px), card clickability.
- Check Table Host authority vs Companion Distributed Settlement logic: does the host retain exclusive order submission? Can companions mark ready and settle individual shares?
- Review styling against Light Vellum palette (#FFFFFF, #F9F9F9, #E5E7EB, #262626, #FF0055).
- List all components, file paths, state stores, and missing/deficient features needed to satisfy R1, R2, R3.

DELIVERABLE:
Write your comprehensive survey report to `/Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/explorer_survey_1/survey_report.md` and a self-contained handoff to `/Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/explorer_survey_1/handoff.md`.
Update `progress.md` in your directory.
When finished, notify me using send_message with a brief summary and the file paths. Do NOT modify any source code files.
