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

## Phases (commit per phase)

- [ ] **P0 Hygiene** — untrack `theme-context-cache-v4.json` + `vscode/*.vsix`;
      tighten `.gitignore`. No structure change.
- [ ] **P1 Complete tokens.json** — add `glows`, `glassGradient`, legacy keys so
      it fully describes every derived output. Still at old paths.
- [ ] **P2 Generator** — `scripts/build-tokens.js` emits JS modules + CSS
      `@generated` regions; `--check` diffs. Iterate to token-set equivalence
      against current files (in place).
- [ ] **P3 Restructure** — `git mv` to src/ + dist/ + platforms/; rewrite
      package.json (version 5.0.0, exports → ./dist/*, files, scripts); point
      index.js at dist.
- [ ] **P4 Docs/consistency** — fix CLAUDE.md (v5, 23 colors, new modify-token
      workflow), README paths, CHANGELOG 5.0.0, vscode/package.json, CSS header.
- [ ] **P5 Verify** — `npm run build` clean, `npm test` (--check) green, ESM
      import smoke test, final git diff review.

## Open decisions (flag, don't silently resolve)

- **Deprecated v3 aliases** (`--dr-grain`, `--dr-grain-hover`, `--dr-crater-lt`):
  docs promised removal "in v5". Default = KEEP one more cycle to avoid
  compounding breakage with the path change; revisit. Do not remove silently.
- **Shipping docs/spec to npm:** `files` currently ships 64K spec HTML + docs.
  Default = drop from `files` (keep in repo). Confirm.
