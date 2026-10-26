# AI Agent Design & Engineering Guidelines (Live Kitchen)

Always adhere to the following core design standards and rules:

## 1. Taste & Art Direction (Zero-Slop UI)
- Never use cheesy emojis (🍔🍕🍟) as decorative crutches or icons in UI cards.
- Replace generic AI templates with intentional art direction. Use authentic culinary typography, rich semantic structure, and intentional color palettes.
- Follow the guidelines in `.agents/skills/taste/SKILL.md` (tasteskill v2).
- Follow `.agents/skills/better-ui/`, `.agents/skills/better-typography/`, and `.agents/skills/better-colors/`.

## 2. Apple Design & Human Interface Guidelines (lintapple)
- Comply with `ui-policy.json` and Apple Human Interface Guidelines.
- Sentence-case typography in interfaces. Clean sans-serif headings with high legibility.
- Strict contrast ratios: minimum 4.5:1 for normal text and 3:1 for large text.
- Full responsive support (mobile-first layout fitting within horizontal viewport without overflow).

## 3. Data Integrity & Verification
- Adhere strictly to verified project facts in `live-kitchen-facts.md`. Do not invent information or prices.
- Never hardcode or expose secret keys (`sb_secret_`). Use only the publishable key on the client side.
- Verify every backend integration (Supabase, Cloudflare) thoroughly with actual live testing.
