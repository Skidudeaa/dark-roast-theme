# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Dark Roast: Black Label is a multi-platform design token system (npm package `dark-roast-theme` v5.0.0). It provides 26 named colors (23 + 3 clinical severity hues), 30 opacity variants, multi-layer phosphor glows, four-tier typography, and spacing/elevation/motion/z-index/icon tokens. Targets: CSS (standalone and scoped), ES modules, JSON, SwiftUI, plus editor/terminal themes for VS Code, Xcode, Textastic, Warp, Tabby, Terminal.app, and iTerm2.

**Single source of truth.** `src/tokens.json` is canonical. The JS modules and the CSS variable blocks are GENERATED from it by `scripts/build-tokens.js` — do not hand-edit them. There is no bundler and no install-time build; the package ships generated source files in `dist/` (committed). `npm run build` regenerates; `npm test` (`--check`) fails if any committed output has drifted from `src/tokens.json`.

## Architecture

### Token Source of Truth

`src/tokens.json` is the canonical machine-readable definition and the ONLY hand-edited token file. The JSON uses camelCase; CSS uses `--dr-kebab-case`. `scripts/build-tokens.js` reads it and regenerates every derived file — so JS exports and CSS variables match it by construction, not by manual discipline. `tokens.json` also carries a `_build` block (which colors get opacity variants, tier alphas, divider source) that configures the generator.

### Repository Layout

- `src/tokens.json` — source of truth (hand-edited)
- `src/css-templates/*.css` — hand-authored CSS: app-layer vars, keyframes, utilities, base styles, with a `@generated:tokens` marker region the generator fills
- `dist/tokens/*.js` — GENERATED JS modules (do not edit)
- `dist/css/*.css` — GENERATED CSS (template + injected var region; do not edit)
- `scripts/build-tokens.js` — the generator (`npm run build` / `npm test --check`)
- `platforms/` — editor/terminal/native targets (swift, vscode, xcode, textastic, warp, tabby, terminal-app, iterm2)

### Generated Token Modules (ES modules, `"type": "module"`)

- `dist/tokens/colors.js` — 26 named colors + 30 opacity variants (dim/subtle/ghost at 40%/10%/5%) + divider + semantic roles
- `dist/tokens/glows.js` — 13 multi-layer `box-shadow` strings (not colors) + glass gradient. Each glow has 2–3 layers: white hotspot, color midband, color wash
- `dist/tokens/typography.js` — 4 font stacks (Playfair Display, Instrument Sans, DM Sans, Fira Code), 10-step type scale, letter-spacing, semantic roles
- `dist/tokens/spacing.js` — spacing scale, radii, durations, easings, z-index, icon sizes, elevation
- `dist/tokens/index.js` — barrel re-export; `index.js` re-exports it

### CSS Files (generated)

- `dist/css/dark-roast.css` — standalone, tokens on `:root`, utilities unscoped, base styles via `.dark-roast` class
- `dist/css/dark-roast-scoped.css` — tokens scoped to `[data-theme="dark-roast"]` for multi-theme apps

The CSS templates (`src/css-templates/`) contain sections beyond the generated token vars: clinical severity mappings (5 colors + 5 glows + 5 backgrounds), clinical workflow status states (5), CExE component tokens (15), keyframe animations, and utility classes. These are hand-authored and consume the generated variables.

### Editor Themes

All editor themes (under `platforms/`) must conform to `docs/SYNTAX-COLOR-SPEC.md` — this is the single authoritative spec. When a theme file and the spec disagree, the spec wins. These are NOT generated from `tokens.json` and must be updated by hand when token values change.

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
