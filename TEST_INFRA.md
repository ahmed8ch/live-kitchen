# E2E Test Infra: FlameLink Live Kitchen Redesign

## Test Philosophy
- Requirement-driven, opaque-box, static, and runtime simulation verification of FlameLink design tokens, persona isolation, touch targets, state persistence, and build integrity.
- Methodology: Category-Partition + Boundary Value Analysis + Persona Separation + AI Slop Verification.
- Zero external test dependencies: pure Node.js ES module test runner.

## Feature Inventory & Test Coverage Matrix
| # | Feature | Source | Tier 1 (Feature) | Tier 2 (Boundary) | Tier 3 (Cross) | Tier 4 (Scenario) | Total Tests |
|---|---------|--------|:----------------:|:-----------------:|:--------------:|:-----------------:|:-----------:|
| 1 | AI Anti-Pattern (0 flags) | ORIGINAL_REQUEST §Acceptance | 5 (T1.1.1-T1.1.5) | 5 (T2.1.1-T2.1.5) | 1 (T3.3) | 1 (T4.4) | 12 |
| 2 | Zero Unicode Emojis | AGENTS.md §2 | 5 (T1.2.1-T1.2.5) | 5 (T2.2.1-T2.2.5) | 1 (T3.5) | 1 (T4.4) | 12 |
| 3 | Persona Separation in Shell | AGENTS.md §1 | 5 (T1.3.1-T1.3.5) | 5 (T2.3.1-T2.3.5) | 1 (T3.3) | 1 (T4.4) | 12 |
| 4 | Light Vellum Tokens & Radii | AGENTS.md §2 | 5 (T1.4.1-T1.4.5) | 5 (T2.4.1-T2.4.5) | 1 (T3.5) | 1 (T4.4) | 12 |
| 5 | Menu Page & Touch Ergonomics | ORIGINAL_REQUEST §R1.1 | 5 (T1.5.1-T1.5.5) | 5 (T2.5.1-T2.5.5) | 1 (T3.8) | 1 (T4.1) | 12 |
| 6 | Companion Flow & Settlement | ORIGINAL_REQUEST §R1.2 | 5 (T1.6.1-T1.6.5) | 5 (T2.6.1-T2.6.5) | 1 (T3.1) | 1 (T4.2) | 12 |
| 7 | Live Order Tracker & Chits | ORIGINAL_REQUEST §R1.3 | 5 (T1.7.1-T1.7.5) | 5 (T2.7.1-T2.7.5) | 1 (T3.11) | 1 (T4.1) | 12 |
| 8 | Table Bill & Split Modes | ORIGINAL_REQUEST §R1.4 | 5 (T1.8.1-T1.8.5) | 5 (T2.8.1-T2.8.5) | 2 (T3.4, T3.9) | 1 (T4.2) | 13 |
| 9 | Cashier POS & Void Retention | ORIGINAL_REQUEST §R1.5 | 5 (T1.9.1-T1.9.5) | 5 (T2.9.1-T2.9.5) | 2 (T3.2, T3.7) | 1 (T4.3) | 13 |
| 10 | Kitchen Pass KDS Light Theme | ORIGINAL_REQUEST §R1.6 | 5 (T1.10.1-T1.10.5) | 5 (T2.10.1-T2.10.5) | 2 (T3.7, T3.11) | 1 (T4.3) | 13 |
| 11 | Table Stand Offline SVG QR | ORIGINAL_REQUEST §R1.7 | 5 (T1.11.1-T1.11.5) | 5 (T2.11.1-T2.11.5) | 1 (T3.6) | 1 (T4.6) | 12 |
| 12 | Supabase Message Persistence | ORIGINAL_REQUEST §R3 | 5 (T1.12.1-T1.12.5) | 5 (T2.12.1-T2.12.5) | 1 (T3.10) | 1 (T4.5) | 12 |
| 13 | Clean TypeScript Build | ORIGINAL_REQUEST §Acceptance | 5 (T1.13.1-T1.13.5) | 5 (T2.13.1-T2.13.5) | 1 (T3.12) | 1 (T4.4) | 12 |
| **Totals** | **13 Features** | | **65 Tests** | **65 Tests** | **12 Tests** | **6 Tests** | **148 Tests** |

## Test Tier Architecture
- **Tier 1: Feature Coverage (65 Tests)**: Validates primary behavior (happy paths), structural existence, interface contracts, and acceptance criteria across all 13 features.
- **Tier 2: Boundary & Corner Cases (65 Tests)**: Exercises limits, null/empty cases, numeric overflows, complex UTF-8 sequences, error fallbacks, and security boundaries.
- **Tier 3: Cross-Feature Interactions (12 Tests)**: Pairwise integration tests validating multi-module synchronization (e.g. Host order submission + companion attribution, Cashier void + KDS sync, payment gate).
- **Tier 4: Real-World Scenarios (6 Tests)**: End-to-end full user journeys simulating complete diner visits, kitchen rushes, offline production, and platform inquiries.

## Test Runner Usage
```bash
# Run complete test suite (all 4 tiers, 148 tests)
node tests/e2e_suite.mjs

# Run a specific tier (1, 2, 3, or 4)
node tests/e2e_suite.mjs --tier=1
node tests/e2e_suite.mjs --tier=2
node tests/e2e_suite.mjs --tier=3
node tests/e2e_suite.mjs --tier=4

# Run tests for a specific feature (1 to 13)
node tests/e2e_suite.mjs --feature=2
node tests/e2e_suite.mjs --feature=6
node tests/e2e_suite.mjs --feature=13

# Fail fast on first error
node tests/e2e_suite.mjs --bail

# Verbose test diagnostics
node tests/e2e_suite.mjs --verbose
```

## Directory Structure
```
tests/
|-- e2e_suite.mjs                   # Main standalone test suite runner
`-- helpers/
    |-- ast_helpers.mjs             # Source AST, emoji scanner, file inspection & CLI execution
    `-- store_simulation.mjs        # Financial math, VAT, equal split, void retention & stopwatch
```
