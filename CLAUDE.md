# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Current State — update this block when something lands

**As of 2026-09-02. Package 5.12.0, doctrine contract 0.5.0. `npm test` is green; CI runs static gates plus Chromium/axe/visual proof on every push to `master`.**

The maintainer is a solo physician who codes on the side and will not remember the details below. Do not ask him to recall context. Read this block, then `docs/SYSTEM-ARCHITECTURE.md`, and tell him where things stand. `START-HERE.md` is the human-facing map of the same territory.

**Done:** theme family (10 companions, 11 platforms); export map repaired so all companions are importable; `src/skins/` with the somaCura Night Shift skin; doctrine tranche 1 slices A through D — contract/runtime, 54 semantic roles, Dark Roast/companion/alien mappings, layered contracts, all ten native-first primitives, proven `compact-monitor`, executable DOM/ARIA, PostCSS policy, deterministic generation, actual-tarball integrity, and Playwright/axe/visual proof. Tranche 2 source/static/browser/live adoption landed in Project Control Source Health at consumer commit `f6a8563`, using real collector state and public package exports from a pinned local tarball. Owner acceptance of its hierarchy, terminology, and density is recorded; status-slot semantics and maturity governance are fail-closed. Package 5.10.2 repaired hybrid touch-pointer sizing found on a physical iPad; 5.10.3 added an out-of-busy refresh announcer and made history interpretable without hue; 5.11.0 / doctrine 0.5.0 records the evidence-backed promotion to `proven`. **5.12.0 (tranche 3, the adoption kit)** ships the drop-in path chosen from the owner's "can I drop this into a fresh project quickly" weighting: `npx dark-roast-theme init <dir>` scaffolds a checked starter page, `assets` copies the three stylesheets with a drift check, `check` runs the new zero-dependency conformance checker (`dark-roast-theme/system/conformance`, also usable in a browser against a live DOM), and `docs/ADOPTION.md` is the guide. Building the live-DOM proof exposed and fixed three latent kernel defects (history strip scroll region without keyboard access at 20rem, fixture axis leakage, numeric substitutes under missing completeness). Project Control was re-verified against the 5.12.0 tarball.

**Next:** use the adoption kit on a real second consumer. The obvious candidate is one of the owner's own fresh projects (`mailMind` has a chat/assistant UI where the Phind study applies). A materially different second consumer with its own recorded gates is what unlocks `stable`; the alternative remains an explicit architecture review, or one deliberately scoped framework adapter. Project Control makes no VoiceOver or general screen-reader certification claim; that adoption-specific gate is evidence-linked N/A and reopens before such a support claim. Do not begin the blocked somaCura clinical migration. The package is still unpublished; first npm publication remains an owner decision.

**Blocked, and it is not this repo's fault — full detail in `docs/SOMACURA-MIGRATION.md`, read it before touching somaNotes CSS:** somaCura cannot adopt the doctrine or the skin yet. It does not install this package — it vendors **dark-roast-theme v3.0.0** at `packages/dark-roast/` inside the `Skidudeaa/somaNotes` repo, two majors behind, plus a third app-local copy at `static/css/dark-roast-tokens.css`. The skin is referenced in **zero** app files, so this is a first adoption rather than a live migration. `magenta`, `harvest`, `olive`, `brass`, and `burntSienna` do not exist in 3.0.0, and the night-shift skin's severity system needs all five. Worse, **`crater` exists in both versions with different values** (`#3C2A21` then, `#4D3B31` now; the old value became `craterDeep`), so a partial migration shifts colors silently instead of failing. That app also runs five competing token systems totalling ~8,700 references, of which `--dr-*` is the smallest at 268. It already has a four-document rollout plan at `.planning/dark-roast-rollout/` — sound in structure, but version-blind, so the npm consolidation must happen *before* its Phase 0 bridge bakes v3 token names into everything. This is a clinical display: do not migrate it unattended, and never ship a partial rename. That repo has no CI either.

**Deferred by choice:** the inline `rgba()` literals in `src/skins/somacura-night-shift.css` still hardcode alpha-blended token colors. Converting them would change values, so it needs visual review rather than a sweep.

**Housekeeping, 2026-09-01:** this repo was moved from `~/jan25/darkRoastTheme/dark-roast-theme/` to `~/jan25/dark-roast-theme/`. The CodeCompanion Electron extraction that used to sit at that path is now `~/jan25/codecompanion-src/`; the `codecompanion-src` symlink in this repo points there and is the source behind `src/system/studies/codecompanion-ai.md`. `~/jan25/darkRoastTheme/` is now only the pre-repo archive plus the unrelated Python `darkroast/` generator — read-only history, its own `CLAUDE.md` says so. The Warp codebase index and Claude Code's per-project history were keyed to the old path; neither affects the code. Working tree was clean before and after the move; nothing in-repo hardcoded the old path.

**Owner's stated direction (same date, verbatim intent):** Dark Roast is his color theme plus the skins he likes on his apps. The Phind and CodeCompanion studies are the *new* bits he is trying to salvage and make "more modern but stable feeling" so he has a UI structure he can trot out with new projects. That is the `--oi-*` system's purpose: a reusable operational-interface kernel, not a second theme. When choosing the next tranche (below), weigh "can I drop this into a fresh project quickly" heavily — that is the actual job to be done. **Night Shift is his featured skin as of 2026-09-02:** lead with the `night-shift` companion for previews, screenshots, and new adoptions (`init --theme night-shift`). Black Label remains the contract-locked package default.

**If you are unsure whether something is safe to change, run `npm test`.** The failures are written to tell you what to do.

## What This Is

This repository holds **two related systems**. Know which one you are touching before you edit anything.

**1. The theme family** (npm package `dark-roast-theme`, currently v5.12.0) answers *what color is this?* The original Black Label remains the unchanged default; ten additive companions serve different ambient conditions. Targets: CSS, ES modules, JSON, SwiftUI, VS Code, Xcode, Textastic, Warp, Tabby, Terminal.app, iTerm2, and Blink. Namespace: `--dr-*`.

**2. The operational interface system** (`src/system/`, doctrine contract v0.5.0) answers *what does this element mean?* It is theme-neutral by design — Dark Roast is its first reference mapping, not its definition. Namespace: `--oi-*`. Specified in `docs/OPERATIONAL-INTERFACE-DOCTRINE.md`; **implementation status is recorded in `docs/SYSTEM-ARCHITECTURE.md` — read that before working on the system layer.** Tranche 1 is built, the first web adoption is live in Project Control, and `compact-monitor` is proven. Stable promotion and framework adapters remain future work.

The two meet at exactly one seam: a mapping file that reads `--dr-*` and assigns `--oi-*`. Nothing above that seam may read a palette token.

**Separated sources of truth.** `src/tokens.json` is canonical for Black Label. `src/variants/*.json` defines additive companions and pins the exact Black Label base fingerprint. `src/system/contract.json` is canonical for doctrine state, primitive/recipe DOM anatomy, slots, widths, async/focus behavior, proof matrices, parts, and public hooks; `src/system/mappings/dark-roast.json`, `src/system/contracts/*.css`, `src/system/primitives/*.css`, and `src/system/recipes/*.css` own the web implementation. `governance/` owns mutable promotion evidence and is forbidden from package bytes. `scripts/build-system.js` owns `dist/system/`. Do not hand-edit generated files or auto-accept snapshots in CI. `npm test` runs 22 static gates followed by 111 Chromium tests covering axe, container layout, state/truth/async, keyboard/focus, media emulation, hybrid touch, RTL/reflow, live-DOM conformance, the starter page, visual drift, exports, and actual package contents. Every release must be re-verified against Project Control (`npm run verify:promotion-consumer -- project-control=../project-control`) because the package gate pins the packed SHA to consumer evidence; see the "Releasing" note under Tooling.

## Architecture

### Token Source of Truth

`src/tokens.json` is the canonical Black Label definition. Its root exports, values, selectors, and platform theme must not change as a side effect of companion work. Companion palette files under `src/variants/` contain complete color assignments plus quality thresholds and a base fingerprint.

### Repository Layout

**Theme family**
- `src/tokens.json` — source of truth for Black Label (hand-edited)
- `src/variants/*.json` — companion sources, fingerprint-pinned. Mostly hand-edited, **but four are generator-owned**: `cascara`, `flash-chilled`, and `nitro` are brewed from `src/recipes/*.json`, and `cold-brew` is compiled from `src/cold-brew.seeds.json`. `npm run build` rewrites those four; edit their recipes or seeds instead. Each brewed registry records `generator: "brew-engine"`, and `reconcile-recipes.js` refuses to overwrite a registry it does not own.
- `src/css-templates/*.css` — hand-authored CSS: app-layer vars, keyframes, utilities, base styles, with a `@generated:tokens` marker region the generator fills
- `dist/tokens/*.js`, `dist/css/*.css`, `dist/themes/` — GENERATED (do not edit)
- `platforms/` — editor/terminal/native targets (swift, vscode, xcode, textastic, warp, tabby, terminal-app, iterm2, blink)

**Operational interface system**
- `src/system/contract.json` — the doctrine contract manifest (hand-edited source of truth)
- `src/system/contract.schema.json` — JSON Schema for the manifest
- `src/system/mappings/dark-roast.json` — semantic-to-Dark-Roast alias map; generated CSS never copies palette values
- `src/system/layers.css`, `src/system/contracts/*.css`, `src/system/primitives/*.css`, `src/system/recipes/*.css` — hand-authored cascade order and web implementation
- `src/system/runtime/conformance.{js,d.ts}` — hand-authored public conformance checker, copied verbatim into `dist/system/` by the generator
- `src/system/studies/*.md` — pattern studies; the only legitimate intake path for an external design
- `spec/system/mappings/alien.css`, `spec/system/primitives.html`, `spec/system/compact-monitor.html` — mapping, primitive, and recipe fixtures
- `tests/system/` — Playwright/axe assertions and reviewed visual baselines; never packaged
- `dist/system/*` — GENERATED runtime/types, contracts, primitives, recipes, conformance checker copy, and Dark Roast mapping (do not edit)

**Adoption kit**
- `bin/dark-roast-theme.js` — CLI: `init`, `assets [--check]`, `check`, `themes`
- `starter/` — what `init` copies into a fresh project; `starter/theme/` is generated by `validate-starter.js`, gitignored, and excluded from the tarball
- `docs/ADOPTION.md` — the consumer-facing drop-in guide

**Product skins**
- `src/skins/*.css` — hand-authored per-product skins consuming a companion theme. Filename must contain the target variant id (`somacura-night-shift` → `night-shift`). A skin may own product-specific values but must never re-declare a theme token's value.

**Tooling**
- `scripts/build-tokens.js` — Black Label generator (`--check` for drift)
- `scripts/build-variants.js` — companion generator; prunes retired generator-owned artifacts
- `scripts/build-system.js` — doctrine runtime, mapping, and semantic CSS generator (`--check` for drift)
- `scripts/validate-*.js` — static quality gates including primitive/recipe DOM, AST CSS, exports, and actual tarball integrity
- `playwright.config.js`, `scripts/serve-system-fixtures.js` — exclusive Chromium proof runner and hardened localhost fixture server
- `.github/workflows/ci.yml` — runs `npm test` on push to `master`, pinned Node 22
- **Releasing:** any change to packaged bytes changes the tarball SHA, and `validate-package.js` requires a governance pin for the current version with that exact SHA. The loop is: bump `package.json`/`package-lock.json`, `npm pack`, copy the tarball into `../project-control/vendor/`, update its `package.json` dependency, `npm install`, update the version and SHA strings in its `docs/STATUS.md`, run its `npm test`, commit there, then record `verifiedCommit`, `packageVersion`, `artifactPath`, `artifactSha256` (bytes vendored by the consumer), and `artifactTarSha256` (sha256 of the gunzipped tar stream, the only digest reproducible across macOS and Linux) in `governance/compact-monitor-promotion.json` and the header of `governance/compact-monitor-manual-evidence.md`. Bump the version before `npm run build`, because brewed variant registries embed it, and build before packing. If the vendored tarball is replaced under the same filename, `npm uninstall` then reinstall it so the consumer lockfile hashes the new bytes. Visual baselines exist for Darwin and Linux; regenerate Linux ones in the `mcr.microsoft.com/playwright:v<version>-noble` image (podman) rather than accepting CI output blind.

### Generated Token Modules (ES modules, `"type": "module"`)

- `dist/tokens/colors.js` — 26 named colors + 30 opacity variants (dim/subtle/ghost at 40%/10%/5%) + divider + semantic roles
- `dist/tokens/glows.js` — 13 multi-layer `box-shadow` strings (not colors) + glass gradient. Each glow has 2–3 layers: white hotspot, color midband, color wash
- `dist/tokens/typography.js` — 4 font stacks (Playfair Display, Instrument Sans, DM Sans, Fira Code), 10-step type scale, letter-spacing, semantic roles
- `dist/tokens/spacing.js` — spacing scale, radii, durations, easings, z-index, icon sizes, elevation
- `dist/tokens/index.js` — barrel re-export; `index.js` re-exports it

### CSS Files (generated)

- `dist/css/dark-roast.css` — standalone, tokens on `:root`, utilities unscoped, base styles via `.dark-roast` class
- `dist/css/dark-roast-scoped.css` — tokens scoped to `[data-theme="dark-roast"]` for multi-theme apps
- `dist/css/dark-roast-{house-blend,copper-roast}.css` — independent companion stylesheets
- `dist/css/dark-roast-{house-blend,copper-roast}-scoped.css` — independent scoped companions
- `dist/themes/` — namespaced companion semantic palettes and effective token JSON

The CSS templates (`src/css-templates/`) contain sections beyond the generated token vars: clinical severity mappings (5 colors + 5 glows + 5 backgrounds), clinical workflow status states (5), CExE component tokens (15), keyframe animations, and utility classes. These are hand-authored and consume the generated variables.

### Editor Themes

Black Label editor themes remain hand-maintained for compatibility. Companion editor and terminal files are generated from `src/variants/*.json`; never edit them directly. Companions resolve the old spec drift by using teal for user-code functions, slate for SDK/default-library symbols, structural foregrounds for punctuation, mauve for markup, and scarlet only for invalid/error states.

### Two App Targets

The token system serves two apps with different token boundaries:
- **somaCURA** (web): Uses the full design system including severity mappings, CExE tokens, and status states
- **Song Expanse** (iOS/SwiftUI): Uses only chrome/UI shell tokens (`AppTheme`). Song-derived `TextColors` handle content areas — these two color systems must never be conflated

## Key Design Rules

### OLED Science
`void` (#120C06) and `obsidian` (#160E08) keep OLED pixels at 1.6ms/1.8ms wake delay. Pure black (#000000) causes 18.5ms purple-smearing. Never use `#000000` as a background.

### Syntax Highlighting Anti-Patterns (from SYNTAX-COLOR-SPEC.md)
- **Never use scarlet for keywords** — scarlet is error-only. Keywords use mauve (#AD7FA8)
- **Never use gold for strings** — gold is for types/classes. Strings use sage (#8AAC6B)
- **Never use amber for types** — amber is the UI accent. Types use gold (#DAA520)
- **Never use teal for keywords or strings** — teal is kinetic (functions, operators, links)
- **Punctuation must be low-contrast** — use crater-lt (#4D3B31), never brighter than mocha

### Token Naming Convention
- JS exports: camelCase (`grainHover`, `amberHot`, `craterLt`)
- CSS variables: `--dr-kebab-case` (`--dr-grain-hover`, `--dr-amber-hot`, `--dr-crater-lt`)
- `void` is a JS reserved word, so the JS export is `void_`

### Opacity Variant System
Each action color (amber, amber-hot, gold, scarlet, teal) has three tiers:
- `dim` (40%) — focused borders, active rings
- `subtle` (10%) — hover backgrounds, light fills
- `ghost` (5%) — skeleton loads, faint state indicators

### Glow Structure
Every glow is a 3-layer `box-shadow` value: white hotspot → color midband → color wash. Each color has a normal and intense variant. They are box-shadow values, not color values.

## Modifying Tokens

Tokens are production-locked. Changes require a version bump (in both `package.json` and `src/tokens.json`). The JS modules and CSS variable blocks are generated — never hand-edit `dist/`.

1. Edit `src/tokens.json` (the only token source). For app-layer CSS that isn't token data — severity mapping, CExE, workflow states, utilities, keyframes — edit `src/css-templates/*.css` instead.
2. Run `npm run build` to regenerate `dist/`.
3. Run `npm test` to confirm nothing is out of sync (CI/`prepublishOnly` enforce this).
4. Bump the version in `package.json` and `src/tokens.json`; update `CHANGELOG.md` and `docs/DESIGN-SYSTEM.md`.
5. If syntax-related, update `docs/SYNTAX-COLOR-SPEC.md` and all affected editor themes under `platforms/` (these are hand-maintained, not generated).

## Modifying Companion Themes

1. Edit only `src/variants/<id>.json` — unless it is brewed (`cascara`, `flash-chilled`, `nitro`) or seed-compiled (`cold-brew`), in which case edit `src/recipes/<id>.json` or `src/cold-brew.seeds.json`.
2. Keep Black Label `src/tokens.json`, root exports, and existing platform files visually unchanged.
3. Run `npm run build:variants`.
4. Run `npm test`; do not weaken assigned-surface contrast thresholds to make a palette pass.
5. Review `spec/theme-gallery.html` at narrow and wide viewports.
6. If Black Label legitimately changes, update each variant fingerprint only after reviewing its generated CSS, syntax, ANSI, and contrast results.

## Modifying the Doctrine Contract

Read `docs/SYSTEM-ARCHITECTURE.md` first — it records what is actually built versus what the doctrine specifies.

1. Edit `src/system/contract.json`.
2. Run `npm run build:system`, then `npm test`.
3. The contract carries its own semantic version, independent of the package version. Renaming or removing a stable axis, value, role, primitive, part, recipe, or slot — tightening stable DOM/cardinality/attribute obligations, adding a required slot, or adding a stable closed-axis value — is a MAJOR bump because adapters may be exhaustive.
4. Never add a primitive merely to share styling; a primitive must own a stable responsibility no existing primitive can express.
5. Study-derived recipes need a real study before moving past `candidate`; no primitive or recipe reaches `proven` without a real consumer and its proof gates.

## Adding a Skin

1. Create `src/skins/<product>-<variant-id>.css`; the basename must contain a real variant id.
2. Reference `var(--dr-*)` for anything the theme owns. Keep literals only for genuinely product-specific values, grouped and commented.
3. Add the `./skins/<name>` entry to `package.json` exports.
4. Do not put `@tailwind` directives or other build-tool syntax in a published skin — the consumer's entry stylesheet owns those.
5. Run `npm test`. `validate-skins.js` will name any literal that duplicates a token and any `var(--dr-*)` that does not resolve.
