# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Dark Roast: Black Label is a multi-platform design token system (npm package `dark-roast-theme` v3.0.0). It provides 16 base colors, opacity variants, phosphor-style glows, four-tier typography, and spacing/animation tokens. Targets: CSS (standalone and scoped), ES modules, JSON, SwiftUI, plus editor/terminal themes for VS Code, Xcode, Textastic, Warp, Tabby, Terminal.app, and iTerm2.

No build step, no test suite, no bundler. The package ships source files directly.

## Architecture

### Token Source of Truth

`tokens/tokens.json` is the canonical machine-readable definition. CSS variables and JS exports must match it exactly. The JSON uses camelCase; CSS uses `--dr-kebab-case` (note: `craterLight` → `--dr-crater-lt` abbreviated).

### Token Modules (ES modules, `"type": "module"`)

- `tokens/colors.js` — 16 base hex colors + 15 opacity variants (dim/subtle/ghost at 40%/10%/5%) + divider
- `tokens/glows.js` — 11 multi-layer `box-shadow` strings (not colors). Each glow has 3 layers: white hotspot, color midband, color wash
- `tokens/typography.js` — 4 font stacks (Playfair Display, Instrument Sans, DM Sans, Fira Code), 7-step type scale, 6 letter-spacing values
- `tokens/spacing.js` — 7 spacing steps, 6 radii, 4 durations, 3 easing curves
- `tokens/index.js` — barrel re-export
- `index.js` — re-exports barrel

### CSS Files

- `css/dark-roast.css` — standalone, tokens on `:root`, utilities unscoped, base styles via `.dark-roast` class
- `css/dark-roast-scoped.css` — tokens scoped to `[data-theme="dark-roast"]` for multi-theme apps

Both CSS files contain sections beyond what the JS modules export: clinical severity mappings (5 colors + 5 glows + 5 backgrounds), clinical workflow status states (5), CExE component tokens (15), keyframe animations, and utility classes.

### Editor Themes

All editor themes must conform to `docs/SYNTAX-COLOR-SPEC.md` — this is the single authoritative spec. When a theme file and the spec disagree, the spec wins.

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

Tokens are production-locked. Changes require a version bump. When adding or modifying tokens:
1. Update `tokens/tokens.json` first
2. Update the corresponding JS module in `tokens/`
3. Update both CSS files (`dark-roast.css` and `dark-roast-scoped.css`)
4. Update `docs/DESIGN-SYSTEM.md`
5. If syntax-related, update `docs/SYNTAX-COLOR-SPEC.md` and all affected editor themes
