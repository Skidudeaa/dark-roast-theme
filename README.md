# Dark Roast: Black Label

OLED-optimized design token system. Warm espresso palette, 23 base colors, multi-layer phosphor glows, four-tier typography, and clinical severity states. Built for data-dense interfaces that need to look beautiful during 12-hour shifts.

## Quick Start

### CSS (simplest)

```html
<link rel="stylesheet" href="node_modules/dark-roast-theme/css/dark-roast.css">
<body class="dark-roast">
  <div class="dr-glass-panel">
    <h1 style="color: var(--dr-crema)">Hello Dark Roast</h1>
    <p style="color: var(--dr-mocha)">Tokens are on :root, ready to use.</p>
  </div>
</body>
```

All tokens land on `:root` automatically. Add `class="dark-roast"` to your `<body>` for base styles — background, text color, scrollbars, selection highlight, focus rings.

### CSS (multi-theme apps)

```html
<link rel="stylesheet" href="node_modules/dark-roast-theme/css/dark-roast-scoped.css">
<body data-theme="dark-roast">
```

Tokens scoped to `[data-theme="dark-roast"]` — safe to use alongside other themes on the same page.

### JavaScript (ES modules)

```js
// Import everything at once
import { void_, crema, amber, glowTeal, fontBody, spaceLg } from 'dark-roast-theme';

// Or import by category (better tree-shaking)
import { colors, roles, opacityVariants } from 'dark-roast-theme/tokens/colors';
import { fontStacks, typeScale } from 'dark-roast-theme/tokens/typography';
import { glows } from 'dark-roast-theme/tokens/glows';
import { spacing, radii, durations } from 'dark-roast-theme/tokens/spacing';

// Use in JS-driven styling
element.style.backgroundColor = void_;   // '#120C06'
element.style.color = crema;              // '#FFF7EE'
element.style.boxShadow = glowTeal;       // 3-layer phosphor glow

// Semantic roles — portable aliases you can use instead of color names
import { roles } from 'dark-roast-theme/tokens/colors';
element.style.color = roles.display;      // crema — hero text
element.style.color = roles.workhorse;    // bone — body reading
element.style.color = roles.secondary;    // mocha — captions
```

Note: `void` is a JS reserved word, so its export is `void_`.

### JSON (build tools, Figma plugins, Style Dictionary)

```js
import tokens from 'dark-roast-theme/tokens.json' assert { type: 'json' };
console.log(tokens.colors.void);     // '#120C06'
console.log(tokens.colors.espresso); // '#2A1C13'
```

### SwiftUI

Copy `swift/EnhancedDarkRoastTheme.swift` into your Xcode project:

```swift
@Environment(\.appTheme) private var theme

Text("Patient Name")
    .foregroundColor(theme.primaryText)    // crema #FFF7EE
    .font(.custom("Instrument Sans", size: 18))

VStack { ... }
    .darkRoastCard(elevated: true)
    .darkRoastBackground()
```

---

## Color System

### Surface Scale

Seven steps, monotonically increasing from OLED-safe void to geological accent. Use sequentially — skip steps at your own aesthetic risk.

| Token | CSS var | Hex | Role |
|-------|---------|-----|------|
| `void_` | `--dr-void` | `#120C06` | App/page background (OLED 1.6ms wake) |
| `obsidian` | `--dr-obsidian` | `#160E08` | Content floor, elevated background |
| `darkCacao` | `--dr-dark-cacao` | `#1E140E` | Modals, sheets, sidebar, input chrome |
| `espresso` | `--dr-espresso` | `#2A1C13` | Card and panel surfaces |
| `espressoHover` | `--dr-espresso-hover` | `#382818` | Warm lift on hover / focus |
| `roastedBean` | `--dr-roasted-bean` | `#3C2A1E` | Borders, structural dividers |
| `crater` | `--dr-crater` | `#4D3B31` | Top of surface scale, geological accent |

> **Why not `#000000`?** Pure black causes 18.5ms purple-smearing on OLED panels. `void` (#120C06) keeps wake delay at 1.6ms while reading as black.

### Foregrounds

Four tiers of legibility. Use `display` for headlines, `workhorse` for body copy.

| Token | CSS var | Hex | Contrast on void | Role |
|-------|---------|-----|-----------------|------|
| `crema` | `--dr-crema` | `#FFF7EE` | 18.31:1 | Hero text, brand chrome, highest contrast |
| `warmWhite` | `--dr-warm-white` | `#F0E6D0` | ~16.2:1 | Bright callouts, ANSI bright white |
| `bone` | `--dr-bone` | `#EBE1D7` | 15.1:1 | Body reading, reduced-contrast text |
| `mocha` | `--dr-mocha` | `#8B7355` | 4.33:1 | Secondary copy, captions, labels |

### Action & State

| Token | CSS var | Hex | Semantic role |
|-------|---------|-----|--------------|
| `amber` | `--dr-amber` | `#E69A4C` | Primary accent, CTAs, cursor |
| `amberHot` | `--dr-amber-hot` | `#D2691E` | Worsening state, gradient terminal |
| `amberMuted` | `--dr-amber-muted` | `#C07A4A` | Reader contexts, low-intensity accent |
| `gold` | `--dr-gold` | `#DAA520` | Stable severity, success |
| `brass` | `--dr-brass` | `#BFA162` | Warning, caution |
| `scarlet` | `--dr-scarlet` | `#C44C4C` | Critical severity (errors only — never keywords) |
| `burntSienna` | `--dr-burnt-sienna` | `#C75B39` | UI error, terminal error |
| `teal` | `--dr-teal` | `#4CC4B4` | Live data, success, resolved |

### Geological Accents

| Token | CSS var | Hex | Role |
|-------|---------|-----|------|
| `craterDeep` | `--dr-crater-deep` | `#3C2A21` | Deep geological accent |
| `asparagus` | `--dr-asparagus` | `#465945` | Tertiary metadata, timestamps |
| `rustic` | `--dr-rustic` | `#480404` | Grounded red atmospheric |
| `rose` | `--dr-rose` | `#480607` | Error background tint |

### Semantic Roles

Prefer these in new code — they're portable aliases that can survive future palette shifts.

```js
import { roles } from 'dark-roast-theme/tokens/colors';
// roles.display   → crema   (hero text)
// roles.workhorse → bone    (body reading)
// roles.secondary → mocha   (muted copy)
// roles.tertiary  → asparagus (timestamps)
// roles.accent    → amber   (CTA)
// roles.success   → teal
// roles.warning   → brass
// roles.error     → burntSienna
// roles.critical  → scarlet
// roles.stable    → gold
```

### Opacity Variants

Each action color has three tiers available as CSS variables and JS exports:

| Tier | Alpha | CSS pattern | Use |
|------|-------|-------------|-----|
| `dim` | 40% | `--dr-amber-dim` | Active rings, focused borders |
| `subtle` | 10% | `--dr-amber-subtle` | Hover backgrounds, light fills |
| `ghost` | 5% | `--dr-amber-ghost` | Skeleton loads, faint state |

Available for: amber, amberHot, gold, scarlet, teal, brass, burntSienna.

---

## Token Summary

| Category | Count | Module |
|----------|-------|--------|
| Surface scale colors | 7 | `tokens/colors.js` |
| Foreground colors | 4 | `tokens/colors.js` |
| Action colors | 8 | `tokens/colors.js` |
| Geological accents | 4 | `tokens/colors.js` |
| Opacity variants | 21 + 1 divider | `tokens/colors.js` |
| Glow effects (box-shadow) | 11 | `tokens/glows.js` |
| Clinical severity states | 5 color + 5 glow + 5 bg | CSS only |
| Workflow status states | 5 | CSS only |
| CExE component tokens | 15 | CSS only |
| Font stacks | 4 | `tokens/typography.js` |
| Type scale steps | 7 | `tokens/typography.js` |
| Letter spacing | 6 | `tokens/typography.js` |
| Spacing steps | 7 | `tokens/spacing.js` |
| Border radii | 6 | `tokens/spacing.js` |
| Animation timing | 4 durations + 3 easings | `tokens/spacing.js` |

---

## Glow Effects

Glows are 3-layer `box-shadow` values: white hotspot → color midband → color wash. Use on active elements, focused inputs, and live data indicators.

```js
import { glowAmber, glowAmberIntense, glowTeal, glowTealIntense } from 'dark-roast-theme/tokens/glows';

button.style.boxShadow = glowAmber;       // Soft amber phosphor
input.style.boxShadow = glowTealIntense;  // Bright live-data ring
```

Available: `glowAmber`, `glowAmberIntense`, `glowGold`, `glowGoldIntense`, `glowScarlet`, `glowScarletIntense`, `glowTeal`, `glowTealIntense`, `glowBrass`, `glowBrassIntense`, `glowCrema`.

---

## Utility Classes

| Class | Effect |
|-------|--------|
| `.dr-glass-panel` | Gradient card with roastedBean border and deep shadow |
| `.dr-geo-stripe` | Geological sediment stripe at bottom edge |
| `.dr-severity-critical` | Scarlet severity badge |
| `.dr-severity-worsening` | Amber-hot severity badge |
| `.dr-severity-improving` | Amber severity badge |
| `.dr-severity-stable` | Gold severity badge |
| `.dr-severity-resolved` | Teal severity badge |
| `.dr-pulse-teal` | Pulsing teal ring (live data indicator) |
| `.dr-shimmer-skeleton` | Warm shimmer skeleton loader |
| `.dr-grain-overlay` | Fractal noise grain texture |
| `.dr-fade-up` | Fade-up entrance animation |
| `.dr-slide-in` | Slide-in entrance animation |
| `.dr-glow-breathe` | Amber breathing glow |

---

## Accessibility

| Feature | Detail |
|---------|--------|
| Focus ring | 2px solid teal (9.12:1 on void) |
| `prefers-reduced-motion` | All animations disabled (including shimmer and glow) |
| `prefers-contrast: more` | Decorative shadows stripped, foreground tiers stepped up |
| `forced-colors: active` | System color keywords applied (Windows High Contrast Mode) |
| WCAG AA on void | crema ✓ warmWhite ✓ bone ✓ — mocha and asparagus are aspirational |

---

## Editor & Terminal Themes

Consistent Dark Roast colors across your entire development environment:

| App | File | How to install |
|-----|------|----------------|
| **VS Code / Cursor** | `vscode/themes/dark-roast-color-theme.json` | Copy `vscode/` to `~/.vscode/extensions/dark-roast-theme/` and reload window |
| **Xcode** | `xcode/Dark Roast Black Label.dvtcolortheme` | Copy to `~/Library/Developer/Xcode/UserData/FontAndColorThemes/`, restart Xcode |
| **Textastic** | `textastic/Dark-Roast-Black-Label.tmTheme` | Copy to `#Textastic` folder, Settings → Reload Customizations |
| **Warp** | `warp/dark-roast.yaml` | Copy to `~/.warp/themes/`, Settings → Appearance → Theme |
| **Tabby** | `tabby/dark-roast.yaml` | Merge into `config.yaml` under `terminal:`, then select in Settings |
| **Terminal.app** | `terminal-app/generate-terminal-profile.py` | Run `python3 generate-terminal-profile.py`, then open the generated `.terminal` file |
| **iTerm2** | `iterm2/Dark Roast.itermcolors` | Double-click to import, or Preferences → Profiles → Colors → Color Presets → Import |

### Syntax Color Mapping

All editors share the same "12-hour ergonomics" mapping (see `docs/SYNTAX-COLOR-SPEC.md` for full rules):

| Color | Hex | Used for |
|-------|-----|----------|
| mauve | `#AD7FA8` | Keywords, storage, `self`/`super` |
| sage | `#8AAC6B` | Strings, characters |
| gold | `#DAA520` | Types, classes, CSS selectors |
| slate | `#6E8FAD` | Functions, JSON/YAML keys, CSS properties |
| amberHot | `#D2691E` | Numbers, constants, decorators |
| teal | `#4CC4B4` | Operators, cursor, links |
| scarlet | `#C44C4C` | Errors only — never keywords |

### Terminal ANSI Palette

All four terminal emulators (Warp, Tabby, iTerm2, Terminal.app, VS Code integrated) share the same ANSI-16 palette. Bright cyan is `#6DD4C8` — visibly lighter than normal teal `#4CC4B4` so "bright is actually brighter."

---

## Files

```
css/dark-roast.css          Standalone — tokens on :root, utilities unscoped
css/dark-roast-scoped.css   Scoped — tokens on [data-theme="dark-roast"]
tokens/tokens.json          Machine-readable canonical token definitions
tokens/colors.js            Color hex + opacity variant exports
tokens/typography.js        Font stacks + type scale exports
tokens/glows.js             Box-shadow phosphor glow exports
tokens/spacing.js           Spacing, radii, duration, easing exports
tokens/index.js             Barrel re-export of all token modules
swift/                      SwiftUI reference implementation
xcode/                      Xcode .dvtcolortheme
textastic/                  Textastic .tmTheme
warp/                       Warp terminal YAML
tabby/                      Tabby terminal YAML
terminal-app/               macOS Terminal.app profile generator (Python + PyObjC)
iterm2/                     iTerm2 .itermcolors
vscode/                     VS Code / Cursor extension (v4.0.0)
spec/                       Interactive HTML visual specification
docs/DESIGN-SYSTEM.md       Full design system reference
docs/SYNTAX-COLOR-SPEC.md   Syntax highlighting color rules
```

---

## v3 → v4 Migration

v4 renamed several tokens and expanded the surface scale. Deprecated aliases remain in CSS for compatibility but will be removed in a future release.

| v3 name | v4 name | Note |
|---------|---------|------|
| `grain` / `--dr-grain` | `espresso` / `--dr-espresso` | Card surfaces |
| `grainHover` / `--dr-grain-hover` | `espressoHover` / `--dr-espresso-hover` | Hover lift |
| `craterLt` / `--dr-crater-lt` | `crater` / `--dr-crater` | Top of surface scale |
| `crater` / `--dr-crater` | `craterDeep` / `--dr-crater-deep` | Geological accent |

New in v4: `darkCacao`, `roastedBean`, `warmWhite`, `amberMuted`, `brass`, `burntSienna`, 6-layer surface scale, elevation shadows, z-index scale, icon scale.

---

## License

MIT © 2026 skidudeaa
