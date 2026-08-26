# Changelog

All notable changes to `dark-roast-theme` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); this project
treats token-value changes as evolving under minor releases and reserves major
releases for breaking changes — token renames/removals (see the v3 → v4
migration) or changes to the package's public import paths (see v5.0.0).

## [5.7.0] — 2026-08-26

Distribution and architecture release. **Dark Roast: Black Label is unchanged**,
and no palette moves. Four companions become importable for the first time, the
first product skin ships, and the Operational Interface Doctrine gains a
machine-readable contract.

### Fixed

- **Night Shift generated output was stale.** `9a40e50` widened Night Shift's
  espresso from `#21160F` to `#251A11` in `src/variants/night-shift.json` but
  never ran `build:variants`, so four generated files kept the old value and rode
  through three subsequent commits with `npm test` failing on `master`.
- **`package-lock.json` was pinned at 5.3.0** against a 5.6.0 `package.json`.
- **Eight stylesheets and four theme modules were unreachable.** Night Shift,
  Cascara, Flash Chilled, and Nitro were built and shipped inside the tarball but
  had no `exports` entry, and Node's `exports` field is an allowlist — so
  `import 'dark-roast-theme/css/night-shift'` threw. This was not cosmetic: it is
  the reason a downstream product had hand-copied a palette instead of importing
  it. All twelve paths are now declared.

### Added

- **`src/system/contract.json`** — the machine-readable Operational Interface
  Doctrine contract (doctrine v0.1.0, versioned independently of the package).
  Declares the nine orthogonal state axes, 43 semantic roles, the ten structural
  primitives with the axes each consumes, `compact-monitor` with its full slot
  order, axis stability for semver protection, and forbidden domain terms for
  lower-layer source scans.
- **`dist/system/`** — generated adapters: frozen constants and an axis→attribute
  map, `Oi*` TypeScript unions, and the published manifest with documentation
  stripped. Exported at `dark-roast-theme/system/contract`.
  `assertAxisValue()` throws in development and returns `false` in production,
  so an unknown value surfaces loudly while developing and degrades to neutral
  presentation in production rather than crashing an operational surface.
  `requiresProvenanceDisclosure()` guards against inferred, stale, or partial
  information wearing the visual authority of confirmed data.
- **`src/skins/`** — product skins, a layer between a companion theme and one
  application. `somacura-night-shift.css` is the first: 20 properties whose values
  the theme owns now reference `var(--dr-*)`, while the 20 genuinely
  product-specific values (ledger fields, severity rails, label tints) stay
  literal and documented. Published skins carry no build-tool directives, so they
  parse under any toolchain.
- **`docs/SYSTEM-ARCHITECTURE.md`** — an implementation record distinct from the
  doctrine specification: what is built, the dependency direction, what each
  validator guards, what is not built yet, and every deliberate deviation from
  doctrine §15.
- **CI** — `.github/workflows/ci.yml` runs `npm test` on every push to `master`
  under pinned Node 22. Its absence is precisely why the espresso drift above
  survived three commits.

### Validation

`npm test` grows from eight checks to thirteen.

- `validate-exports.js` proves three invariants: every consumer-facing artifact
  has an export entry, every entry resolves on disk, and every target is covered
  by `files`. It also catches dangling `types` paths, which break TypeScript
  consumers silently.
- `validate-skins.js` fails when a skin hardcodes a value its theme already owns,
  or references a `--dr-*` variable the target theme does not declare. It earned
  its place immediately by finding `#0d0906` inside an atmosphere gradient, where
  a by-hand review of the `:root` block had missed it.
- `validate-contract.js` layers JSON Schema (§17.5, via `ajv`) over the
  cross-references a schema cannot express: required and optional slots must
  partition `slotOrder` exactly, primitive and truth axes must resolve against
  declared axes, stability must sit on the ladder, anything above `candidate`
  needs a study that exists on disk, and the contract must not contain its own
  forbidden domain terms.
- `build-system.js --check` proves byte-identical rebuilds (§17.6).

### Changed

- `npm run build` now also runs `build:system`.
- `ajv` added as a devDependency — the only new dependency. Runtime dependencies
  remain zero.
- `CLAUDE.md` and `README.md` document the two-system split, the skins layer, and
  which four variant sources are generator-owned rather than hand-edited.

### Migration note

Nothing in this release changes a color. If you consume a companion by raw
`dist/` path, nothing changes either; the new export subpaths are additive. If you
vendored a pre-v4 copy of this package, read the v3 → v4 table below before
upgrading — `crater` exists in both with different values, so a partial migration
shifts colors silently instead of failing.

## [5.6.0] — 2026-07-26

Adds **Dark Roast: Blue Mountain**, the family's first cold-canvas companion.
**Dark Roast: Black Label is unchanged**, and no existing companion's palette
moves.

### Added

- **Dark Roast: Blue Mountain** (`displayOrder` 9) — a deep navy canvas
  (`#000B1D` void through `#38526F` crater at hue `252`) under a cool ivory
  foreground. Hand-authored rather than brewed: the brew engine's dark ramp
  seeds bottom out at `L=0.10`, roughly `#020405`, which reads black rather than
  blue, and its accent placement overshoots to `L=0.82` neon against so dark a
  surface. Blue Mountain instead mirrors Velvet Noir's proven dark lift profile
  re-hued to navy, and validates against `espressoHover` — the stricter
  multi-surface test House Blend uses — rather than the terminal-only canvas.
- Blue Mountain is the family's highest-chroma companion at `0.146` core /
  `0.136` platform, clearing 4.5:1 informational contrast at `4.56:1`, severity
  hue separation at `44.7°`, and inverse-text actions at `6.66:1`.

### Design note

Every other companion varies along the espresso axis, so warm accents sit on
warm ground. Blue Mountain inverts that: the canvas carries the only cool mass.
Its cool accent family is therefore pushed cyan-ward — `slate` at hue `225`
instead of the family's usual `240` — so it separates from the ground rather
than dissolving into it, the same failure mode Velvet Noir's `e499ec6` note
recorded when accents were raised uniformly.

## [5.5.0] — 2026-07-25

Brew-engine correctness release. **Dark Roast: Black Label is unchanged.**
Cascara, Flash Chilled, and Nitro are re-brewed and now pass validation for the
first time; `npm test` is green across all eight companions.

### Fixed

- **Cold Brew regression** — `src/recipes/cold-brew.json` duplicated a companion
  that `scripts/build-cold-brew.js` already compiles from
  `src/cold-brew.seeds.json`, and `reconcile-recipes.js` overwrote the shipped
  v5.2.0 registry with a weaker generated palette. The duplicate recipe is
  removed and Cold Brew is restored from its seeds. Because the seeds correctly
  declare Cold Brew `web`-only, the editor and terminal artifacts the recipe had
  wrongly generated are pruned.
- **Registry ownership** — brewed registries now record `generator:
  "brew-engine"`, and `reconcile-recipes.js` refuses to overwrite any registry it
  does not own, exiting non-zero. Hand-authored companions (House Blend, Copper
  Roast, Velvet) and seed-compiled ones (Cold Brew) can no longer be clobbered by
  a recipe that happens to share their id. `--adopt` claims registries brewed
  before provenance tracking existed.
- **Gamut-starved accents** — the engine mirrored lightness for light polarity,
  so an accent seeded at L=0.68 landed at L=0.32, where sRGB has little chroma to
  give. Core accent averages capped at 0.089 against a declared floor of 0.120 no
  matter what `chroma_scale` asked for. Chromatic roles are now *placed* at the
  lightness carrying the most colour while still clearing the contrast target,
  which is where Cold Brew's hand-authored accents already sat (L≈0.43).
- **Unreachable quality floors** — the engine published floors it never checked.
  Floors are now polarity-aware (light palettes declare 0.11/0.09, matching what
  Cold Brew delivers) and solved for, and every guarantee is re-asserted before
  the palette is returned, so the engine throws with a diagnostic instead of
  emitting a registry its own quality block would fail.
- **Severity separation measured in the wrong space** — separation was specified
  in OKLCH hue while `validate-themes.js` measures HSL, so a 30° OKLCH gap
  collapsed to 20.4° and sat under the 25° minimum. Separation is now solved
  against the *delivered* HSL hue after placement; the three brewed palettes
  report 29.2°–30.1°.
- **Missing Textastic identity** — brewed registries had no `textasticUuid`. They
  now derive a stable UUIDv5 from the recipe id, so re-brewing never churns the
  committed registry or its generated `.tmTheme`.

### Changed

- `npm run brew` compiles recipes; `npm run build` runs it, and `npm test` gates
  brewed-registry drift with `reconcile-recipes.js --check`.
- **Published package contains the theme, not the toolchain.** `scripts/` and
  `lib/` are no longer in `files`. They shipped as source that could not run,
  because the generators need devDependencies (`culori`) that consumers never
  install, and `reconcile-recipes.js` additionally imported a `lib/` that was not
  packaged at all. The build tooling lives in the repository; the package keeps
  its zero-runtime-dependency surface (`dist/`, `src/`, `platforms/`, `docs/`,
  `spec/`).
- Cascara, Flash Chilled, and Nitro are added to `spec/theme-gallery.html`.

## [5.4.0] — 2026-07-24

Additive theme-family release. **Dark Roast: Black Label is unchanged** — its
17-file contract remains byte-for-byte identical to v5.0.0.

### Added

- **Blink Shell platform** — `platforms/blink/` ships hterm-format themes for
  Blink on iOS/iPadOS. `platforms/blink/Dark Roast.js` is the hand-authored
  Black Label source; every companion file is generated by
  `scripts/build-variants.js` from the same terminal color map that drives Warp,
  Tabby, iTerm2, and Terminal.app, so the ANSI-16 palette stays identical across
  all five emulators. Cursors are teal at 65% alpha because hterm paints the
  cursor over the glyph instead of inverting it.
- **Dark Roast: Velvet** — a mahogany-wine terminal companion (`#190605`) with
  roughly 2x Black Label's surface chroma and a softened `L=0.944` foreground.
- **Dark Roast: Velvet Noir** — the deepest companion (`#14030C`), a plum-black
  canvas at ~2.4x Black Label surface chroma and `L=0.931` foreground, tuned for
  low-light work. Both velvets are `targets: ["terminal"]` and validate every
  informational foreground at 4.5:1 or better on the terminal canvas.

### Fixed

- **Target-aware plist validation** — `validate-platforms.js` requested Textastic
  and Xcode plists from every variant that shipped to *either* the editor or
  terminal group, so a terminal-only companion failed on editor artifacts the
  generator was never meant to write. Textastic/Xcode are now requested only for
  `editor` targets and iTerm2 only for `terminal` targets.

### Validation

- `validate-platforms.js` now evaluates each Blink theme against a stub hterm
  and asserts all 16 ANSI slots against the variant registry, plus foreground,
  background, and a translucent teal cursor.

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
