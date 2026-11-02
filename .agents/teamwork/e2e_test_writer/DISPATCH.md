## 2026-11-02T19:07:04Z
You are teamwork_test_writer for the E2E Testing Track of FlameLink for Live Kitchen (لايف كيتشن).
Your metadata working directory: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/e2e_test_writer/
You must read the original user request at: /Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/ORIGINAL_REQUEST.md
Also read PROJECT.md and TEST_INFRA.md at the project root (/Users/apple/Downloads/dev/antigravity/port-said/).

YOUR MISSION:
Design and implement a comprehensive, standalone, automated E2E test suite in `tests/e2e_suite.mjs` (and any necessary test helpers in `tests/`) that validates all user requirements and acceptance criteria across the 4 tiers:
- Tier 1: Feature Coverage (>=5 test cases per feature across all 13 features in TEST_INFRA.md)
- Tier 2: Boundary & Corner Cases (>=5 per feature: limits, extremes, error handling)
- Tier 3: Cross-Feature Interactions (pairwise: host authority + companion checkout, cashier void + KDS sync, persona isolation between routes)
- Tier 4: Real-World Scenarios (full dining journey: table seating, menu customization, companion split, bill settlement, cashier audit, KDS ticket completion)

Specific Test Verifications the suite MUST perform:
1. AI Design Anti-Pattern Tool: Executes `node .agents/skills/avoid-ai-design/scripts/detect.mjs src` and verifies 0 flags.
2. Unicode Emojis: Scans all files in `src/` and verifies strict 0 Unicode emojis.
3. Persona Separation: Verifies that consumer routes (`/menu`, `/companion`, `/tracker`, `/settlement`) never expose KDS, Cashier, or Stand links in `Sidebar.tsx` or `App.tsx` footer.
4. Design Tokens & Palette: Verifies 100% Light Vellum palette (#FFFFFF, #F9F9F9, #E5E7EB, #262626, #FF0055), bans dark canvas `#0d0f12`, verifies 3-tier radii (rounded-full, rounded-2xl, rounded-lg).
5. Ergonomics: Verifies interactive buttons/pills (dietary filters, split selectors, tips) meet >=44x44px touch targets.
6. Cashier POS: Verifies voided orders are retained in state with `status: 'voided'`, `voidReason`, and `voidedAt` rather than deleted; verifies Audit Ledger presence.
7. Kitchen Pass KDS: Verifies light theme styling, stopwatch timer, batch totals footer.
8. Table Stand: Verifies inline vector SVG QR code (no external `qrserver.com` dependency) and bilingual "Live Kitchen (لايف كيتشن)" branding.
9. TypeScript & Build: Runs `npm run build` and verifies exit code 0.
10. Supabase Persistence: Verifies `Prefer: return=minimal` POST to `public.messages` table.

DELIVERABLES:
1. Create `tests/e2e_suite.mjs` that can be run with `node tests/e2e_suite.mjs` returning exit code 0 when all tests pass, and clear diagnostic failure output when tests fail.
2. Test runner output should clearly report test tiers and test counts.
3. Update `TEST_INFRA.md` with final test counts.
4. Publish `TEST_READY.md` at project root with runner command, tier breakdown, and feature checklist.
5. Write handoff report to `/Users/apple/Downloads/dev/antigravity/port-said/.agents/teamwork/e2e_test_writer/handoff.md`.
6. Notify orchestrator via send_message when complete. Do NOT modify implementation code under `src/`.
