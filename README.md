# Dark Roast Theme Family

> **Returning to this project and don't remember it? Read [`START-HERE.md`](START-HERE.md).**
> Current status lives in the Current State block at the top of [`CLAUDE.md`](CLAUDE.md).
> Before touching CSS in the somaNotes repo, read [`docs/SOMACURA-MIGRATION.md`](docs/SOMACURA-MIGRATION.md).

A warm espresso design system for every room, not one brightness setting. The original **Dark Roast: Black Label** remains unchanged; v5.1 adds two independent companions with the same semantic DNA and deliberately recalibrated contrast.

| Theme | Canvas | Best for | Informational contrast guarantee |
|-------|--------|----------|----------------------------------|
| **Black Label** | `#120C06` | OLED and very low light | Original v5 behavior, unchanged |
| **House Blend** | `#241810` | Daily use and ordinary room light | ≥ 4.5:1 through the hover surface |
| **Copper Roast** | `#34251C` | Moderate-to-bright rooms without washed-out color | ≥ 4.5:1 through the common panel surface |
| **Velvet** | `#190605` | Terminals, when Black Label reads too flat | ≥ 4.5:1 on the terminal canvas |
| **Velvet Noir** | `#14030C` | Terminals in dark rooms, lowest glare | ≥ 4.5:1 on the terminal canvas |
| **Blue Mountain** | `#000B1D` | Dark rooms, when the warm canvases read too close | ≥ 4.5:1 through the hover surface |

House Blend is the recommended “less dark Dark Roast.” Copper Roast is the high-ambient option. Both use saturated kiln-enamel pigments while keeping the same severity hue families, warm/cool syntax grammar, typography, spacing, motion, and component API.

Blue Mountain is the family's one cold canvas. Every other companion moves along the espresso axis; this one inverts the relationship, putting the only cool mass on the ground so the warm pigments read as warm against it. Its cool accent family is pushed cyan-ward (`slate` at hue `225`, not the usual `240`) so it separates from a navy surface instead of dissolving into it. It carries the family's highest accent chroma (`0.146` core, `0.136` platform) while still clearing 4.5:1 through the hover surface.

Velvet and Velvet Noir are terminal-targeted companions. Where Black Label runs a near-neutral canvas (surface chroma `0.021`) under a stark `L=0.98` white, they raise surface chroma to `0.045`/`0.051`, pull the canvas toward mahogany-wine and plum-black, and soften the foreground to `L=0.944`/`0.931`. The extra saturation is carried by the warm pigments; cool accents stay deliberately dusty so the espresso identity still dominates.

## Quick Start

### CSS (simplest)

```html
<link rel="stylesheet" href="node_modules/dark-roast-theme/dist/css/dark-roast.css">
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
<link rel="stylesheet" href="node_modules/dark-roast-theme/dist/css/dark-roast-scoped.css">
<body data-theme="dark-roast">
```

Tokens scoped to `[data-theme="dark-roast"]` — safe to use alongside other themes on the same page.

### Companion CSS

Each companion is a complete stylesheet, not a fragile override on Black Label:

```html
<!-- House Blend: recommended less-dark companion -->
<link rel="stylesheet" href="node_modules/dark-roast-theme/dist/css/dark-roast-house-blend-scoped.css">
<body data-theme="dark-roast-house-blend">

<!-- Or Copper Roast -->
<link rel="stylesheet" href="node_modules/dark-roast-theme/dist/css/dark-roast-copper-roast-scoped.css">
<body data-theme="dark-roast-copper-roast">
```

Every companion is importable by subpath, standalone or scoped:

| Companion | Import | Scoped import |
|---|---|---|
| House Blend | `dark-roast-theme/css/house-blend` | `.../house-blend/scoped` |
| Copper Roast | `dark-roast-theme/css/copper-roast` | `.../copper-roast/scoped` |
| Cold Brew | `dark-roast-theme/css/cold-brew` | `.../cold-brew/scoped` |
| Velvet | `dark-roast-theme/css/velvet` | `.../velvet/scoped` |
| Velvet Noir | `dark-roast-theme/css/velvet-noir` | `.../velvet-noir/scoped` |
| Blue Mountain | `dark-roast-theme/css/blue-mountain` | `.../blue-mountain/scoped` |
| Night Shift | `dark-roast-theme/css/night-shift` | `.../night-shift/scoped` |
| Cascara | `dark-roast-theme/css/cascara` | `.../cascara/scoped` |
| Flash Chilled | `dark-roast-theme/css/flash-chilled` | `.../flash-chilled/scoped` |
| Nitro | `dark-roast-theme/css/nitro` | `.../nitro/scoped` |

Night Shift, Cascara, Flash Chilled, and Nitro became importable in v5.7.0. They were built and shipped before that but had no export entry, so Node's `exports` allowlist rejected them — which is worth knowing if you ever hand-copied one to work around it.

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

Companion palettes are namespaced, leaving the root Black Label API intact:

```js
import houseBlend, { semantic, syntax, ansi } from 'dark-roast-theme/themes/house-blend';
import copperRoast from 'dark-roast-theme/themes/copper-roast';

panel.style.background = houseBlend.semantic.background.panel;
caption.style.color = houseBlend.semantic.foreground.secondary;
```

### JSON (build tools, Figma plugins, Style Dictionary)

```js
import tokens from 'dark-roast-theme/tokens.json' assert { type: 'json' };
console.log(tokens.colors.void);     // '#120C06'
console.log(tokens.colors.espresso); // '#2A1C13'
```

### Product skins

A **skin** is the concrete look of one application built on a companion theme. It references theme tokens rather than copying their values, so the product tracks the theme instead of drifting from it.

```css
/* Your app's entry stylesheet. Load the theme first — the skin resolves --dr-* from it. */
@import 'dark-roast-theme/css/night-shift';
@import 'dark-roast-theme/skins/somacura-night-shift';
```

Skins deliberately contain no build-tool directives, so they parse under any toolchain. If you use Tailwind, keep `@tailwind base/components/utilities` in your own entry file above the imports.

### Operational interface contract

The theme answers *what color is this?* The doctrine contract answers *what does this element mean?* It is theme-neutral — nine orthogonal state axes, 54 semantic roles, ten structural primitives, and the proven `compact-monitor` recipe — and is specified in `docs/OPERATIONAL-INTERFACE-DOCTRINE.md`, with implementation status in `docs/SYSTEM-ARCHITECTURE.md`.

Load a palette, the ordered semantic contracts, and one explicit mapping:

```css
@import 'dark-roast-theme/css';
@import 'dark-roast-theme/system/css';
@import 'dark-roast-theme/system/mappings/dark-roast';
```

```html
<body class="dark-roast oi-root" data-oi-surface="canvas" data-oi-density="standard">
```

The system CSS contains no implicit palette. Only the generated mapping reads
`--dr-*`; semantic contracts consume `--oi-*`. The cold alien mapping under
`spec/system/` is a proof fixture, not a supported export or product theme.

Primitive anatomy is public and generated from the manifest. Parts use only
declared owner-qualified classes:

```html
<dl
  class="oi-metric"
  data-oi-source="generated"
  data-oi-freshness="stale"
  data-oi-certainty="inferred"
  data-oi-completeness="partial"
  aria-describedby="metric-provenance"
>
  <dt class="oi-metric__label">Current measure</dt>
  <dd class="oi-metric__value">37.5</dd>
  <dd id="metric-provenance" class="oi-metric__provenance">
    Generated, inferred, stale, partial.
  </dd>
</dl>
```

The complex primitives are native-first: `dl`, `meter`, `details/summary`,
`ol/li/time`, and `hr` retain browser accessibility semantics. The proof
fixture checks each meter's visual track against its hidden native value;
product adapters must derive both from the same measurement because
browser-native meter pigment does not honor semantic mappings.

`compact-monitor` preserves the operational scan path while adapting to its own
container: one primary track below 36rem, two at 36rem, and three at 52rem.
Required status and primary regions never enter disclosure or disappear at
narrow widths:

```html
<section
  class="oi-surface oi-recipe-compact-monitor"
  data-oi-surface="raised"
  data-oi-density="compact"
  aria-labelledby="monitor-title"
  aria-describedby="monitor-status"
>
  <header class="oi-recipe-compact-monitor__chrome">
    <div data-oi-slot="context"><h2 id="monitor-title">Current context</h2></div>
    <div data-oi-slot="actions"><button type="button">Refresh</button></div>
  </header>
  <p id="monitor-status" data-oi-slot="status" role="status">Ready</p>
  <div data-oi-slot="primary">Required primary content</div>
</section>
```

```js
import {
  severity, axisAttributes, assertAxisValue, requiresProvenanceDisclosure,
} from 'dark-roast-theme/system/contract';

severity;                                  // ['neutral','informational','positive','warning','negative','critical']
axisAttributes.severity;                   // 'data-oi-severity'

// Throws in Node/bundler development, returns false in production so the
// surface degrades to neutral presentation instead of crashing. Native browser
// ESM defaults to the safe production behavior; pass { development: true } to
// opt into development assertions without a Node environment global.
assertAxisValue('severity', 'critical');   // true

// Anything not direct + confirmed + live-or-recent + complete must show provenance,
// so inferred or stale data never wears the authority of confirmed data.
requiresProvenanceDisclosure({ source: 'generated' });   // true
requiresProvenanceDisclosure({ freshness: 'stale' });    // true
```

TypeScript types ship alongside (`OiSeverity`, `OiState`, `OiRecipeContract`, and the rest). Import the barrel from `dark-roast-theme/system`; the raw manifest remains available at `dark-roast-theme/system/contract.json`.

Tranche 1 is built, and Project Control Source Health is the first live
nonclinical adoption. It consumes package `5.11.0` through public exports from a
pinned local tarball because the package has not been published to npm. The
consumer is source/static/browser/live green; owner acceptance of hierarchy,
terminology, and density is recorded. Every in-scope manual gate is passed or
evidence-linked not applicable, so `compact-monitor` is proven. VoiceOver and
general screen-reader certification are outside this consumer's committed
acceptance boundary and reopen before any such support claim.

Contributor validation requires the pinned browser once per machine:

```bash
npm ci
npx playwright install chromium
npm test
```

### SwiftUI

Copy `platforms/swift/EnhancedDarkRoastTheme.swift` for the legacy Black Label implementation. Add `platforms/swift/DarkRoastThemeFamily.swift` for side-by-side palette selection:

```swift
@Environment(\.darkRoastPalette) private var palette

Text("Patient Name")
    .foregroundColor(palette.crema)
    .font(.custom("Instrument Sans", size: 18))

ContentView()
    .darkRoastPalette(.houseBlend) // or .blackLabel / .copperRoast
```

The existing `\.darkRoastTheme` environment API in `EnhancedDarkRoastTheme.swift` remains unchanged.

---

## Black Label Color System

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

The VS Code/Cursor extension contributes all three themes. Companion files are also generated for every terminal/editor target:

| App | File | How to install |
|-----|------|----------------|
| **VS Code / Cursor** | `platforms/vscode/themes/dark-roast-*-color-theme.json` | Copy `platforms/vscode/` to `~/.vscode/extensions/dark-roast-theme/` and reload window |
| **Xcode** | `platforms/xcode/Dark Roast Black Label.dvtcolortheme` | Copy to `~/Library/Developer/Xcode/UserData/FontAndColorThemes/`, restart Xcode |
| **Textastic** | `platforms/textastic/Dark-Roast-Black-Label.tmTheme` | Copy to `#Textastic` folder, Settings → Reload Customizations |
| **Warp** | `platforms/warp/dark-roast.yaml` | Copy to `~/.warp/themes/`, Settings → Appearance → Theme |
| **Tabby** | `platforms/tabby/dark-roast.yaml` | Merge into `config.yaml` under `terminal:`, then select in Settings |
| **Terminal.app** | `platforms/terminal-app/generate-terminal-profile.py` | Run `python3 generate-terminal-profile.py`, then open the generated `.terminal` file |
| **iTerm2** | `platforms/iterm2/Dark Roast.itermcolors` | Double-click to import, or Preferences → Profiles → Colors → Color Presets → Import |
| **Blink Shell** (iOS/iPadOS) | `platforms/blink/Dark Roast.js` | Host the file over HTTPS (raw GitHub file or a gist), then in Blink: `config` → Appearance → Themes → New Theme → paste the URL |

House Blend and Copper Roast use the same filenames with their theme name appended. Generated companions cover modern VS Code surfaces including inline edits, multi-file diffs, chat, terminal sticky scroll, Markdown alerts, multi-cursor states, and agent status.

### Syntax Color Mapping

The companions enforce the authoritative "12-hour ergonomics" mapping (see `docs/SYNTAX-COLOR-SPEC.md`). Black Label's existing files are preserved for compatibility.

| Role token | Black Label hex | Used for |
|------------|-----------------|----------|
| mauve | `#AD7FA8` | Keywords, storage, `self`/`super` |
| sage | `#8AAC6B` | Strings, characters |
| gold | `#DAA520` | Types, classes, CSS selectors |
| slate | `#6E8FAD` | SDK/default-library symbols, JSON/YAML keys, CSS properties |
| amberHot | `#D2691E` | Numbers, constants, decorators |
| teal | `#4CC4B4` | User-code functions, operators, cursor, links |
| scarlet | `#C44C4C` | Errors only — never keywords |

House Blend and Copper Roast retain these semantic assignments with richer, independently validated color values.

### Terminal ANSI Palette

All terminal targets (Warp, Tabby, iTerm2, Terminal.app, and VS Code integrated) share the same ANSI-16 palette. Bright cyan is `#6DD4C8` — visibly lighter than normal teal `#4CC4B4` so "bright is actually brighter."

---

## Files

```
src/tokens.json             SOURCE OF TRUTH — hand-edited canonical token definitions
src/variants/*.json         ADDITIVE companion palettes, pinned to the Black Label fingerprint
                            (cascara/flash-chilled/nitro are brewed; cold-brew is seed-compiled)
src/recipes/*.json          Brew-engine recipes for the brewed companions
src/cold-brew.seeds.json    OKLCH seeds Cold Brew is compiled from
src/black-label-contract.json Frozen hashes for Black Label's public 5.0 surface
src/css-templates/          Hand-authored CSS (app-layer vars, utilities, base) + @generated markers
src/skins/*.css             Product skins consuming a companion theme by reference, not by copy
src/system/contract.json    SOURCE OF TRUTH — Operational Interface Doctrine contract manifest
src/system/contract.schema.json JSON Schema for the manifest
src/system/mappings/dark-roast.json SOURCE — generated semantic mapping relationships
src/system/layers.css       SOURCE — public cascade order, no reset
src/system/contracts/*.css  SOURCE — theme-neutral semantic CSS
src/system/primitives/*.css SOURCE — ten native-first structural primitives
src/system/recipes/*.css    SOURCE — composition recipes
src/system/studies/*.md     Pattern studies — the only intake path for an external design
spec/system/mappings/alien.css Cold, flat mapping proof fixture; not an export
spec/system/primitives.html Dual-mapping primitive DOM and rendered proof fixture
spec/system/compact-monitor.html Dynamic compact-monitor proof fixture
tests/system/              Playwright/axe tests and reviewed visual baselines (not packaged)

scripts/build-tokens.js     Black Label generator (unchanged)
scripts/build-variants.js   Companion generator: CSS, JS, editor, terminal, native palettes
scripts/build-cold-brew.js  Cold Brew OKLCH seed compiler
scripts/build-system.js     Doctrine runtime/types/mapping/semantic-CSS generator
scripts/reconcile-recipes.js Brew engine; refuses to overwrite registries it does not own
scripts/check-black-label-contract.js Byte-for-byte additive-change guard
scripts/validate-themes.js  Luminance, contrast, perceptual chroma, severity, fingerprint, and identity checks
scripts/validate-platforms.js Generated-platform parity and parseability checks
scripts/validate-gallery.js Gallery identity plus platform/syntax color-fidelity checks
scripts/validate-exports.js Export reachability, resolution, and packaging checks
scripts/validate-skins.js   Fails when a skin duplicates a theme token value
scripts/validate-contract.js Doctrine manifest schema + cross-reference integrity
scripts/validate-system-runtime.js Browser/runtime contract predicates
scripts/validate-system-dom.js parse5 primitive DOM/ARIA contract enforcement
scripts/validate-system-recipe-dom.js Recipe root/part/slot DOM enforcement
scripts/validate-system-css.js PostCSS selector/value AST enforcement
scripts/validate-package.js Actual npm tarball and zero-runtime-dependency integrity
scripts/serve-system-fixtures.js Hardened localhost browser-test server
playwright.config.js        Exclusive Chromium proof configuration

dist/css/dark-roast.css         GENERATED — standalone, tokens on :root, utilities unscoped
dist/css/dark-roast-scoped.css  GENERATED — scoped to [data-theme="dark-roast"]
dist/css/dark-roast-*.css       GENERATED — independent companion stylesheets (10 companions)
dist/themes/                    GENERATED — namespaced companion JS + JSON contracts
dist/tokens/colors.js           GENERATED — color hex + opacity variants + roles
dist/tokens/typography.js       GENERATED — font stacks + type scale
dist/tokens/glows.js            GENERATED — box-shadow phosphor glows
dist/tokens/spacing.js          GENERATED — spacing, radii, motion, z-index, icon, elevation
dist/tokens/index.js            GENERATED — barrel re-export
dist/system/contract.js         GENERATED — frozen axis constants + runtime assertions
dist/system/contract.d.ts       GENERATED — Oi* TypeScript unions and interfaces
dist/system/contract.json       GENERATED — published manifest, documentation stripped
dist/system/index.{js,d.ts}     GENERATED — package runtime/type barrels
dist/system/{contracts,index}.css GENERATED — ordered semantic contracts
dist/system/primitives.css       GENERATED — ten structural primitives
dist/system/recipes.css          GENERATED — aggregate recipe CSS
dist/system/recipes/compact-monitor.css GENERATED — focused compact-monitor CSS
dist/system/mappings/dark-roast.css GENERATED — sole --dr-* / --oi-* seam

platforms/swift/            SwiftUI reference implementation
platforms/xcode/            Xcode .dvtcolortheme
platforms/textastic/        Textastic .tmTheme
platforms/warp/             Warp terminal YAML
platforms/tabby/            Tabby terminal YAML
platforms/terminal-app/     macOS Terminal.app profile generator (Python + PyObjC)
platforms/iterm2/           iTerm2 .itermcolors
platforms/blink/            Blink Shell (iOS/iPadOS) hterm themes
platforms/vscode/           VS Code / Cursor extension
spec/theme-gallery.html     Self-contained theme comparison / acceptance gallery
spec/dark-roast-spec.html   Legacy Black Label visual specification
docs/DESIGN-SYSTEM.md       Full design system reference
docs/THEME-FAMILY.md        Companion family rationale and acceptance
docs/SYNTAX-COLOR-SPEC.md   Syntax highlighting color rules
docs/OPERATIONAL-INTERFACE-DOCTRINE.md  Doctrine specification (theme-neutral)
docs/SYSTEM-ARCHITECTURE.md  What is actually built, and how the layers depend
docs/SOMACURA-MIGRATION.md   Cross-repo adoption state, measured version gap, sequence
docs/REORG-PLAN.md          v5 restructure plan / rationale (complete)
START-HERE.md               Orientation map for returning to this project cold
.github/workflows/ci.yml    Runs npm test on every push to master
```

Bundler imports use the package subpath exports and don't need the `dist/` prefix:
`import 'dark-roast-theme/css'`, `import { amber } from 'dark-roast-theme/tokens/colors'`.

---

## v4 → v5 Migration

v5 is a **structural** release — no token values changed. The package is now generated from a single source of truth (`src/tokens.json`) and import paths moved under `dist/`. If you import via the package name + subpath (`dark-roast-theme/css`, `dark-roast-theme/tokens/colors`, `dark-roast-theme`), **nothing changes**. Only update if you referenced files by raw path:

| v4 raw path | v5 raw path |
|-------------|-------------|
| `dark-roast-theme/css/dark-roast.css` | `dark-roast-theme/dist/css/dark-roast.css` |
| `dark-roast-theme/tokens/colors.js` | `dark-roast-theme/dist/tokens/colors.js` |
| `dark-roast-theme/swift/…`, `…/vscode/…`, etc. | `dark-roast-theme/platforms/swift/…`, `…/platforms/vscode/…` |

`dark-roast-theme/tokens.json` still resolves (now to `src/tokens.json`). Editor/terminal themes moved under `platforms/`.

## v3 → v4 Migration

v4 renamed several tokens and expanded the surface scale. Deprecated aliases remain in CSS for compatibility but will be removed in a future release.

| v3 name | v4 name | Note |
|---------|---------|------|
| `grain` / `--dr-grain` | `espresso` / `--dr-espresso` | Card surfaces |
| `grainHover` / `--dr-grain-hover` | `espressoHover` / `--dr-espresso-hover` | Hover lift |
| `craterLt` / `--dr-crater-lt` | `crater` / `--dr-crater` | Top of surface scale |
| `crater` / `--dr-crater` | `craterDeep` / `--dr-crater-deep` | Geological accent |

New in v4: `darkCacao`, `roastedBean`, `warmWhite`, `amberMuted`, `brass`, `burntSienna`, 6-layer surface scale, elevation shadows, z-index scale, icon scale.

> **Upgrading from v3 deserves care.** Note the third and fourth rows: `crater` exists in both versions with *different values*. In v3 it was the geological accent; in v4 it became the top of the surface scale, and the old value moved to `craterDeep`. A partial upgrade therefore shifts colors silently rather than failing loudly. If you vendored a v3 copy, migrate the names in one pass and check the result visually.

---

## License

MIT © 2026 skidudeaa
