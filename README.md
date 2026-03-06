# Dark Roast: Black Label

OLED-optimized design system with 16 base colors, multi-layer phosphor glows, and four-tier typography. Built for data-dense interfaces that need to look beautiful during 12-hour shifts.

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

Tokens load on `:root` automatically. Add `class="dark-roast"` to your body for base styles (background, text color, scrollbars, selection highlight).

### CSS (multi-theme apps)

```html
<link rel="stylesheet" href="node_modules/dark-roast-theme/css/dark-roast-scoped.css">
<body data-theme="dark-roast">
```

Tokens scoped to `[data-theme="dark-roast"]` — safe alongside other themes.

### JavaScript (ES modules)

```js
// Import everything
import { void_, crema, amber, glowTeal, fontBody, spaceLg } from 'dark-roast-theme';

// Import by category
import { colors, opacityVariants } from 'dark-roast-theme/tokens/colors';
import { fontStacks, typeScale } from 'dark-roast-theme/tokens/typography';
import { glows } from 'dark-roast-theme/tokens/glows';
import { spacing, radii, durations } from 'dark-roast-theme/tokens/spacing';

// Use in JS-driven styling
element.style.backgroundColor = void_;
element.style.color = crema;
element.style.boxShadow = glowTeal;
```

### JSON (build tools, Figma plugins, etc.)

```js
import tokens from 'dark-roast-theme/tokens.json' assert { type: 'json' };
console.log(tokens.colors.void); // '#120C06'
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

## Token Summary

| Category | Count | Module |
|----------|-------|--------|
| Base colors | 16 | `tokens/colors.js` |
| Opacity variants | 15 + 1 divider | `tokens/colors.js` |
| Glow effects | 11 | `tokens/glows.js` |
| Severity mappings | 5 color + 5 glow + 5 bg | CSS only |
| Status states | 5 | CSS only |
| CExE component tokens | 15 | CSS only |
| Font stacks | 4 | `tokens/typography.js` |
| Type scale | 7 | `tokens/typography.js` |
| Letter spacing | 6 | `tokens/typography.js` |
| Spacing | 7 | `tokens/spacing.js` |
| Border radii | 6 | `tokens/spacing.js` |
| Animation timing | 4 durations + 3 easings | `tokens/spacing.js` |

## Color Palette

### Backgrounds
| Name | Hex | Role |
|------|-----|------|
| void | `#120C06` | Deepest layer (OLED-safe, 1.6ms wake) |
| obsidian | `#160E08` | Elevated content floor |
| grain | `#2A1C13` | Card/panel surfaces |
| grain-hover | `#382818` | Interactive lift state |

### Foregrounds
| Name | Hex | Role |
|------|-----|------|
| crema | `#FFF7EE` | Primary text (17.08:1 on void) |
| mocha | `#8B7355` | Secondary/caption text |

### Geological
| Name | Hex | Role |
|------|-----|------|
| crater | `#3C2A21` | Borders, dividers |
| crater-lt | `#4D3B31` | Depth gradients |
| bone | `#EBE1D7` | Reduced-contrast text |
| asparagus | `#465945` | Tertiary metadata |
| rustic | `#480404` | Atmospheric bleed |
| rose | `#480607` | Error background tint |

### Action & State
| Name | Hex | Role |
|------|-----|------|
| amber | `#E69A4C` | Primary accent, CTA |
| amber-hot | `#D2691E` | Gradient terminal, worsening |
| gold | `#DAA520` | Success, stable |
| scarlet | `#C44C4C` | Warning, error, critical |
| teal | `#4CC4B4` | Live data, resolved |

## Utility Classes

Available in both CSS files:

| Class | Effect |
|-------|--------|
| `.dr-glass-panel` | Gradient card with crater border and deep shadow |
| `.dr-geo-stripe` | Geological sediment stripe at bottom edge |
| `.dr-severity-critical` | Scarlet severity badge |
| `.dr-severity-worsening` | Amber-hot severity badge |
| `.dr-severity-improving` | Amber severity badge |
| `.dr-severity-stable` | Gold severity badge |
| `.dr-severity-resolved` | Teal severity badge |
| `.dr-pulse-teal` | Pulsing teal ring (live data) |
| `.dr-grain-overlay` | Fractal noise grain texture |
| `.dr-fade-up` | Fade-up entrance animation |
| `.dr-slide-in` | Slide-in entrance animation |
| `.dr-glow-breathe` | Amber breathing glow |

## Accessibility

- Focus ring: 2px solid teal (9.12:1 contrast on void)
- `prefers-reduced-motion`: all animations disabled
- `prefers-contrast: more`: decorative text shadows stripped
- 6 of 16 colors pass WCAG AA for normal text on void

## Editor & Terminal Themes

Pre-built themes for consistent Dark Roast colors across your entire workflow:

| App | File | Install |
|-----|------|---------|
| **VS Code / Cursor** | `vscode/themes/dark-roast-color-theme.json` | Copy `vscode/` → `~/.vscode/extensions/dark-roast-theme/` and reload |
| **Xcode** | `xcode/Dark Roast Black Label.dvtcolortheme` | Copy to `~/Library/Developer/Xcode/UserData/FontAndColorThemes/`, restart Xcode |
| **Textastic** | `textastic/Dark-Roast-Black-Label.tmTheme` | Copy to `#Textastic` folder, Settings → Reload Customizations |
| **Warp** | `warp/dark-roast.yaml` | Copy to `~/.warp/themes/`, Settings → Appearance → Theme |
| **Tabby** | `tabby/dark-roast.yaml` | Merge into `config.yaml` under `terminal:`, select in Settings |
| **Terminal.app** | `terminal-app/generate-terminal-profile.py` | Run with `/usr/bin/python3`, then open the generated `.terminal` file |
| **iTerm2** | `iterm2/Dark Roast.itermcolors` | Double-click to import, or Preferences → Profiles → Colors → Color Presets → Import |

All editors share the canonical "12-hour ergonomics" syntax mapping (see `docs/SYNTAX-COLOR-SPEC.md`):
- **mauve** `#AD7FA8` → keywords, storage, self/super (gentle structure)
- **sage** `#8AAC6B` → strings, characters (organic data)
- **gold** `#DAA520` → types, classes, CSS selectors (stable blueprints)
- **slate** `#6E8FAD` → functions, JSON/YAML keys, CSS properties (cool contrast)
- **amber-hot** `#D2691E` → numbers, constants, decorators (fixed values)
- **teal** `#4CC4B4` → operators, cursor, links (kinetic)
- **scarlet** `#C44C4C` → errors only, HTML tags, diff deleted (reserved alarm)

Terminal themes (Warp, Tabby, Terminal.app, iTerm2, VS Code integrated) share the same ANSI-16 palette including three warm terminal-extension colors: sage `#8AAC6B`, slate `#6E8FAD`, mauve `#AD7FA8`. Bright cyan uses `#6DD4C8` (a lighter variant of teal `#4CC4B4`) so "bright" is visibly brighter than normal across all four emulators.

## Files

```
css/dark-roast.css         — Standalone (tokens on :root)
css/dark-roast-scoped.css  — Scoped ([data-theme="dark-roast"])
tokens/tokens.json         — Machine-readable token definitions
tokens/colors.js           — Color hex + opacity variant exports
tokens/typography.js       — Font stack + type scale exports
tokens/glows.js            — Box-shadow glow exports
tokens/spacing.js          — Spacing, radii, timing exports
swift/                     — SwiftUI reference implementation
xcode/                     — Xcode .dvtcolortheme
textastic/                 — Textastic .tmTheme
warp/                      — Warp terminal YAML theme
tabby/                     — Tabby terminal YAML theme
terminal-app/              — macOS Terminal.app profile generator (Python + PyObjC)
iterm2/                    — iTerm2 .itermcolors color scheme
vscode/                    — VS Code / Cursor extension
spec/                      — Interactive HTML visual spec
docs/DESIGN-SYSTEM.md      — Full design system reference
```

## License

MIT
