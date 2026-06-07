# v5.0.0 Restructure & Generator — Execution Plan

> Canonical plan for the `chore/v5-restructure` branch. During execution this
> doc wins over session memory. Update it as phases complete.

## Goals

1. **One real source of truth.** `src/tokens.json` drives every derived file.
   Today `tokens.json` is *declared* canonical but `colors.js`, `glows.js`,
   `typography.js`, `spacing.js`, and both CSS files are hand-maintained copies —
   and have already drifted (standalone CSS was missing elevation/icon/z vars).
2. **Generator + drift test.** `scripts/build-tokens.js` regenerates outputs;
   `--check` mode fails if committed files drift from source. Wired to
   `npm run build` / `npm test`. Zero runtime deps; no install-time build.
3. **src/ + dist/ separation** (chosen layout → v5.0.0 major).
4. **Fix accumulated rot:** stale versions (CLAUDE.md v3, CSS header v4.0.0,
   vsix 3.0.0), tracked-but-ignored artifacts, flat platform sprawl.

## Target layout

```
src/
  tokens.json              SOURCE OF TRUTH (only hand-edited token file)
  css-templates/
    dark-roast.css         hand-authored: app-layer vars, utils, base + @generated marker
    dark-roast-scoped.css
scripts/
  build-tokens.js          generator + --check
dist/                      GENERATED, committed (no install build)
  tokens/{colors,glows,typography,spacing,index}.js
  css/{dark-roast,dark-roast-scoped}.css
platforms/                 swift vscode xcode textastic warp tabby terminal-app iterm2
docs/  spec/  design-archive/
index.js  package.json  README  CHANGELOG  CLAUDE.md  LICENSE
```

## Generator scope (what is derived vs hand-authored)

**Generated from `tokens.json` (universal token layer):**
- JS modules: colors, glows, typography, spacing, index (FULLY generated)
- CSS `@generated` region in each template: surface scale, foregrounds, geo
  accents, action colors, severity hues, semantic + fg role aliases, opacity
  variants, divider, glows + glass gradient, elevation, fonts, type scale,
  line-heights, tracking, spacing, radii, stripe, icon sizes, motion
  (durations + easings), z-index.

**Hand-authored (stays in css-templates, consumes generated vars):**
- App-layer vars: severity indirection (`--dr-severity-*`, `-bg`,
  `--dr-glow-severity-*`), clinical workflow states (`--dr-status-*`), CExE
  component tokens, grain texture, deprecated v3 aliases.
- Everything after the `:root` block: keyframes, utility classes, base styles,
  accessibility media queries.

**tokens.json must gain (it is currently incomplete):**
- `glows` section (structured layers) — glows live ONLY in glows.js today.
- `glassGradient` — same.
- Legacy JS-only tokens captured so generation is loss-free: typography
  `textHuge`/legacy rem tokens, etc. (encode under explicit `_legacy` keys).

## Fidelity standard

Generator output need not be byte-identical to today's hand-formatted files, but
must be **token-set equivalent** (same names, same resolved values). Verify with
a token-extraction diff, not raw diff. Known *intentional* corrections applied on
top (called out in CHANGELOG):
- standalone CSS gains the elevation/icon/z vars it was missing (drift fix).

## Phases (commit per phase) — ALL COMPLETE

- [x] **P0 Hygiene** — untracked `theme-context-cache-v4.json` + the stale v3
      `vscode/*.vsix`. (commit a6415ef)
- [x] **P1 Complete tokens.json** — added `glows`, glass gradient, `_build`
      config, `typography._legacyRem`; reconciled font fallbacks; regrouped
      `craterDeep`. (commit ea8b7cf)
- [x] **P2 Generator** — `scripts/build-tokens.js` emits JS modules + CSS
      `@generated` regions; `--check` drift test. Verified value-equivalent:
      203 JS exports, both CSS files at 233 vars. (commit 0bc0641)
- [x] **P3 Restructure** — moved to src/ + dist/ + platforms/; package.json
      (5.0.0, exports → ./dist/*, files, scripts); index.js → dist. (0bc0641)
- [x] **P4 Docs/consistency** — CLAUDE.md, README paths + v4→v5 migration,
      CHANGELOG 5.0.0, DESIGN-SYSTEM, vscode/package.json. (commit f7466e1)
- [x] **P5 Verify** — `npm run build` idempotent, `npm test` green, ESM import
      smoke across all subpaths, path-reference scan.

## Open decisions — RESOLVED

- **Deprecated v3 aliases** (`--dr-grain`, `--dr-grain-hover`, `--dr-crater-lt`):
  KEPT (in `src/css-templates/`, app-layer block) to avoid compounding breakage
  with the path change. Removal deferred to a future major.
- **Shipping docs/spec to npm:** DROPPED from `files` (kept in repo).
- **Font-stack modernization** (heading/body → `system-ui`, mono →
  `ui-monospace`): DEFERRED — `tokens.json` fallbacks pinned to shipped values
  to keep v5 value-neutral. Future minor.
- **CSS elevation/icon/z "drift"** claimed in the initial review: FALSE ALARM
  (line-count artifact). The two files were in sync; the generator now makes
  drift structurally impossible.

## Known remaining (not blocking v5)

- `docs/DESIGN-SYSTEM.md` §2 matrices still enumerate the original 22 colors;
  the v4.1.0 severity hues are flagged in the new reading note + at-a-glance
  counts but not yet woven into every per-section table. Content audit, not a
  restructure task.
- The `--term-*` beachhead migration comment lives only in the scoped CSS
  template (asymmetry inherited from the old files). Candidate to move to docs.
- Editor/terminal themes under `platforms/` are still hand-maintained (not
  generated from `tokens.json`). A future generator target.
