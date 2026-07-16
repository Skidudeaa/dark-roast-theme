# Changelog

All notable changes to `dark-roast-theme` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); this project
treats token-value changes as evolving under minor releases and reserves major
releases for breaking changes — token renames/removals (see the v3 → v4
migration) or changes to the package's public import paths (see v5.0.0).

## [5.2.0] — 2026-07-16

Additive theme-family release. **Dark Roast: Black Label is unchanged** — its
17-file contract is byte-for-byte identical to v5.0.0.

### Added

- **Dark Roast: Cold Brew** — the first positive-polarity (light) companion, for
  bright rooms. A warm cream canvas (`#FAF5EE`) that *darkens* with elevation,
  espresso ink, and dark saturated kiln-enamel accents that stay legible in
  daylight. Every informational foreground validates at 4.5:1 or better on the
  card surface (`obsidian`); actions clear 4.5:1 on the canvas.
- **OKLCH seed authoring** — Cold Brew is authored in perceptually-uniform OKLCH
  in `src/cold-brew.seeds.json` and compiled to the standard hex registry via
  `scripts/build-cold-brew.js`, using Culori for deterministic sRGB gamut
  mapping. `npm run build:cold-brew --check` guards seed → registry drift.
- **Polarity-aware validation** — `validate-themes.js` now enforces the
  surface/border elevation ramp by `polarity` (dark themes lighten with
  elevation, light themes darken). A `targets` field lets a companion ship to a
  subset of platforms; Cold Brew is `web`-only, deferring editor/native.
- **Manifest metadata** — `dist/themes/manifest.json` companions now record
  `polarity`, `targets`, `sourceVersion`, and `baseFingerprint`.
- **APCA report** — `npm run report:apca` emits `reports/apca.{json,md}` with
  signed Lc from the pinned `apca-w3`. Informational only; WCAG 2.x remains the
  shipping gate.

## [5.1.0] — 2026-07-15

Additive theme-family release. **Dark Roast: Black Label is unchanged**: its
tokens, root exports, CSS selectors, generated files, platform theme, and visual
appearance remain byte-for-byte compatible with v5.0.0.

### Added

- **Dark Roast: House Blend** — the recommended less-dark companion. Its warm
  canvas is roughly three times Black Label's luminance, and every informational
  foreground is validated at 4.5:1 or better through the hover surface.
- **Dark Roast: Copper Roast** — a clearly lighter high-ambient companion with
  saturated kiln-enamel signals instead of milk-washed pastels. Every
  informational foreground is validated at 4.5:1 or better through the common
  panel surface.
- Independent standalone and scoped CSS, namespaced JavaScript semantic
  palettes, effective token JSON, and package subpath exports for both themes.
- Generated companion artifacts for VS Code/Cursor, Xcode, Textastic, Warp,
  Tabby, Terminal.app, iTerm2, and a side-by-side SwiftUI palette family.
- Modern VS Code coverage for toolbars, multi-cursor state, AI lightbulbs,
  inline edits, multi-file diffs, current chat states, terminal sticky scroll,
  Markdown alerts, and agent status.
- `structural` foreground role separates readable punctuation, CodeLens, inlay
  hints, placeholders, and inactive chrome from lower-contrast border colors.
- Complete `.dr-shimmer-skeleton` and severity-pill utilities in companion CSS;
  companion keyframes are namespaced for safe multi-theme use.
- `scripts/validate-themes.js` for base fingerprint, palette completeness,
  monotonic luminance, assigned-surface contrast, inverse-fill contrast,
  perceptual chroma floors, and severity hue separation.
- `scripts/validate-platforms.js` for generated CSS/JS/editor/terminal/native
  contracts and parseability.
- `scripts/validate-gallery.js` prevents presentation-only syntax and ANSI
  extension colors from drifting away from companion source palettes.
- `spec/theme-gallery.html` and `docs/THEME-FAMILY.md` for presentation and
  acceptance.

### Architecture

- `src/variants/*.json` is the source of truth for companions. Each file pins
  the exact Black Label version and SHA-256 source fingerprint so a future base
  edit requires deliberate variant review.
- `scripts/build-variants.js` generates companion outputs without refactoring or
  mutating the established Black Label generator. Check mode rejects unexpected
  generator-owned artifacts; write mode prunes them after a rename or removal.
- `npm test` now validates both source palettes and all generated targets;
  `prepublishOnly` runs the full suite.

## [5.0.0] — 2026-06-06

Structural release: **no token values changed.** The package is now generated
from a single source of truth and its import paths moved under `dist/`.

### Added
- `scripts/build-tokens.js` — generator that emits every derived file (the five
  JS token modules and the CSS custom-property blocks) from `src/tokens.json`.
  `npm run build` regenerates; `npm test` (`--check`) fails on drift;
  `prepublishOnly` blocks publishing stale output. Zero runtime dependencies; no
  install-time build (generated files are committed in `dist/`).
- `src/tokens.json` now fully describes every output: added the `glows` section
  (13 phosphor box-shadows as structured layers) + glass gradient, a `_build`
  config block, and `typography._legacyRem`; reconciled font fallbacks to the
  shipped stacks.

### Changed (BREAKING — import paths)
- npm `exports` repointed to `./dist/*`. `./tokens.json` now resolves to
  `./src/tokens.json`. Package-name subpath imports
  (`dark-roast-theme`, `dark-roast-theme/css`, `dark-roast-theme/tokens/colors`)
  are **unchanged**; only raw file paths under `node_modules/` moved.
- Editor/terminal/native targets grouped under `platforms/` (was top-level
  `swift/`, `vscode/`, `xcode/`, `textastic/`, `warp/`, `tabby/`,
  `terminal-app/`, `iterm2/`).
- The hand-written JS modules and CSS files were replaced by generated output
  (`dist/`); the hand-authored CSS (app-layer vars, utilities, keyframes, base)
  now lives in `src/css-templates/` with a `@generated:tokens` marker region.
- `package.json` `files` trimmed: ships `dist/` + `src/tokens.json` +
  `platforms/`; no longer ships `docs/` or `spec/`.

### Fixed
- Untracked `theme-context-cache-v4.json` and a stale `vscode/*.vsix` (v3.0.0)
  that were committed despite matching `.gitignore`.
- `craterDeep` regrouped in `tokens.json` under geological accents (it was
  filed under the surface scale, which its own note excluded).
- Reconciled stale version stamps (CLAUDE.md said v3.0.0; CSS headers said
  v4.0.0; vsix/extension said 3.0.0/4.0.0) to the real version.

### Notes
- Generated output is value-equivalent to the prior hand-written files
  (verified: all 203 JS exports; both CSS files at 233 vars each). Numeric
  formatting in generated `rgba()`/box-shadow values is normalized (e.g. `0.40`
  → `0.4`) with no value change.
- Earlier reports of the two CSS files drifting on elevation/icon/z variables
  were a false alarm from a line-counting artifact; the files were in sync. The
  generator now makes such drift structurally impossible regardless.

## [4.1.0] — 2026-05-16

Clinical severity remediation ("Option C"). `worsening`, `improving`, and
`stable` previously aliased `amberHot` / `amber` / `gold` — a 3° hue spread
that collapses to "vaguely amber" at census scanning distance, peripheral
vision, or on a clinical workstation display. The three severity states now
occupy distinct hue families.

### Added
- Three color-name primitives: `magenta #C25F90` (worsening, hue 333°),
  `harvest #D4A040` (improving, hue 39°), `olive #879A39` (stable, hue 72°).
- `--dr-magenta`, `--dr-harvest`, `--dr-olive` plus full `dim`/`subtle`/`ghost`
  opacity variants and `--dr-glow-*` triples (both CSS files).
- JS exports in `tokens/colors.js` (`magenta`/`harvest`/`olive` + variants) and
  `tokens/glows.js` (`glowMagenta`/`glowHarvest`/`glowOlive`).
- `docs/DESIGN-SYSTEM.md` §6.1 "Palette Rules" — the three palette laws
  (hue-family separation, no cross-group reuse, directional iconography) that
  justify and protect this change.
- Severity iconography/sparkline contract documented in §6 (color is category,
  icon is direction, sparkline is magnitude).

### Changed
- `--dr-severity-worsening` / `-improving` / `-stable` (and their `-bg` and
  `--dr-glow-severity-*` companions) now resolve to magenta / harvest / olive
  instead of amber-hot / amber / gold.
- `appTargets.somaCURA.severityMapping` in `tokens.json` repointed accordingly.
- `amberHot` and `gold` are no longer claimed by severity — freed for
  escalation/hover and general gold-accent roles. Their hex values are
  unchanged; no primitive value was mutated and no token was removed.

### ⚠️ ACTION REQUIRED — somaCURA (and any consumer reading concrete tokens)

This is backward compatible at the **package** level (every old variable still
exists and `--dr-amber-hot` / `--dr-amber` / `--dr-gold` are unchanged). It is
**not** transparent if you reference those concrete primitives directly for
clinical severity:

- If clinical severity is rendered from `--dr-amber-hot` / `--dr-amber` /
  `--dr-gold` (or the JS `amberHot`/`amber`/`gold`) directly, those call sites
  will **not** pick up the accessibility fix and will keep showing the
  collapsed amber cluster.
- **Migrate severity rendering to the `--dr-severity-*` indirection layer**
  (or to the new `--dr-magenta` / `--dr-harvest` / `--dr-olive` primitives).
  After migration, severity hues are distinct automatically.
- Directional severity (worsening/improving/stable) must also render the paired
  icon + sparkline from §6 — color alone no longer encodes direction by
  contract, even though the hues are now separable.

Treated as a minor release: additive tokens + an indirection repoint, no
renames or removals (the v3→v4 migration remains the precedent for what counts
as breaking). The consumer-side work above is a semantic migration, not a
broken package API.

## [4.0.1] — 2026-05-02

Accuracy pass + accessibility additions + README overhaul. This release was
shipped in git history (commit `5d398c1`) but the `version` field in
`package.json` and `tokens/tokens.json` was never advanced from `4.0.0`. This
entry reconciles the recorded version with the shipped state; there is no token
change in this release beyond what `5d398c1` already contained.

### Fixed
- `version` field synced to the actually-shipped `4.0.1` in `package.json` and
  `tokens/tokens.json`.
