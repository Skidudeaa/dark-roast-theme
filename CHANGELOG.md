# Changelog

All notable changes to `dark-roast-theme` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); this project
treats token-value changes as evolving under minor releases and reserves major
releases for breaking changes — token renames/removals (see the v3 → v4
migration) or changes to the package's public import paths (see v5.0.0).

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
