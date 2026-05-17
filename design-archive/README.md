# design-archive — historical design-decision records

**NOT canonical. Do not consume tokens from here. Do not edit these files.**

Canonical source of truth lives in `../tokens/`, `../css/`, and
`../docs/DESIGN-SYSTEM.md`. These documents record the *deliberation* that led
to canonical decisions through 2026-04-02 — primarily the clinical severity
"Option C" remediation and the palette rules — which were integrated into the
shipped package in v4.1.0.

| File | Why kept |
|---|---|
| `dark-roast-system-v1.md` | The Option A/B/C deliberation, palette-rule derivation, Mystic2 cross-system mapping. The *why*, not recoverable from canonical files. |
| `WEAK-POINTS-ANALYSIS.md` | The 23-issue audit that triggered the v4.0.x accuracy pass and Option C. |
| `AGENT-UPDATE-2026-04-02.md` | Superseded session handoff, retained for provenance. |
| `dark-roast.py` | Validation/export CLI. The "adopt a Python toolchain" decision was **punted, not rejected** — frozen here until that conversation happens. Not wired into the package (which is intentionally no-build). |

**Frozen by convention.** Future design work happens in canonical files or a
new `system-v2` spec — never by editing v1 here. Dropped at integration time:
`dark-roast-system-v1.json` (values now owned by canonical `tokens.json`),
`dark-roast-v4.json` (was byte-identical to `../theme-context-cache-v4.json`),
`dark-roast-system-v1.pdf` (regenerable from the `.md`).
</content>
</invoke>
