# Dark Roast Theme Family

## Product decision

Black Label is not being replaced, renamed, or silently lightened. It remains the default root export, `dark-roast-theme/css`, `.dark-roast`, `[data-theme="dark-roast"]`, and the first VS Code contribution.

The family adds two independent companions:

| Theme | Intent | Canvas | Validated surface |
|-------|--------|--------|-------------------|
| House Blend | Recommended daily driver | `#241810` | Every informational foreground is at least 4.5:1 on `espressoHover` (`#49362B`) |
| Copper Roast | Brighter-room, richly chromatic | `#34251C` | Every informational foreground is at least 4.5:1 on `espresso` (`#47352A`) |

The validated surface is deliberately not the darkest canvas. This prevents the old failure mode where a caption passes on the page background but becomes unreadable inside a card or interactive row.

## What stays consistent

- Warm espresso surfaces rather than neutral charcoal.
- Teal for user-code functions, actions, links, focus, and live state.
- Slate for SDK/default-library symbols and external structure.
- Gold for types; sage for strings; mauve for keywords and markup.
- Scarlet for invalid/error states, not frequent syntax.
- Magenta/harvest/olive for worsening/improving/stable clinical severity, always paired with iconography.
- The existing typography, spacing, radii, motion, elevation, component variables, and `--dr-*` vocabulary.

## What is intentionally different

The companions are semantic recalibrations, not mathematical lifts:

- Core and platform accent groups carry explicit average OKLab chroma floors, preventing a bright-room palette from drifting back into tinted whites.
- Copper, lacquer, bottle teal, malachite, mineral blue, and amethyst replace the old milk-washed direction.
- `structural` is a new foreground role for punctuation, CodeLens, inlay hints, placeholders, and inactive chrome. Geological border colors no longer do double duty as small text.
- Main text, muted text, action colors, syntax colors, ANSI colors, and severity colors are independently tuned for each assigned surface.
- Bright semantic fills use the theme canvas as inverse text.
- Editor selection uses 15% amber; find highlights and word highlights are reduced so they do not obscure the weakest syntax colors.
- AI/ghost text uses an opaque readable metadata color. Disabled state remains a separate opacity treatment.
- Companion keyframes are namespaced, so multiple scoped themes can coexist without animation collisions.

## Surface and foreground contracts

Use semantic exports for new work:

```js
import { semantic } from 'dark-roast-theme/themes/house-blend';

semantic.background.canvas;
semantic.background.surface;
semantic.background.elevated;
semantic.background.panel;
semantic.background.interactive;

semantic.foreground.primary;
semantic.foreground.reading;
semantic.foreground.secondary;
semantic.foreground.tertiary;
semantic.foreground.structural;
semantic.foreground.inverse;

semantic.border.subtle;
semantic.border.default;
semantic.border.strong;
semantic.border.focus;
```

`semantic.severity.stable` is olive. `semantic.status.ready` is gold. This removes the historical ambiguity of a bare `stable` role without breaking Black Label's old root exports.

## CSS usage

Standalone files put the selected companion on `:root` and activate base styles with a class:

```html
<link rel="stylesheet" href="dark-roast-theme/dist/css/dark-roast-house-blend.css">
<body class="dark-roast-house-blend">
```

Scoped files are safe in a multi-theme app:

```html
<link rel="stylesheet" href="dark-roast-theme/dist/css/dark-roast-house-blend-scoped.css">
<main data-theme="dark-roast-house-blend">...</main>
```

Copper Roast uses `dark-roast-copper-roast` in the same positions. Package subpath imports are documented in the README.

## Generated platform coverage

`scripts/build-variants.js` produces complete companion artifacts for:

- CSS standalone and scoped files
- JavaScript semantic palettes and machine-readable token JSON
- VS Code/Cursor UI, semantic tokens, TextMate scopes, and ANSI terminal colors
- Warp and Tabby
- iTerm2 and Terminal.app
- Textastic and Xcode
- A conflict-free SwiftUI palette family

The VS Code companions also cover current interaction surfaces such as toolbar actions, multiple cursors, inline edits, multi-file diffs, chat request states, AI lightbulbs, terminal sticky scroll, Markdown alerts, and agent status. The role names follow the official [VS Code Theme Color reference](https://code.visualstudio.com/api/references/theme-color).

## Source and generation rules

- `src/tokens.json` remains the Black Label source and is not changed by a companion release.
- `src/variants/*.json` contains the complete companion color intent.
- Each companion pins both the Black Label token version and SHA-256 fingerprint. A base change stops generation until someone reviews the companion explicitly.
- Never edit files under `dist/themes/`, companion CSS in `dist/css/`, or generated companion platform files by hand.
- Generation prunes retired banner-owned companion artifacts; check mode fails if an unexpected generated file would ship.
- Run `npm run build` after changing a variant.

## Acceptance gates

`npm test` checks:

1. Variant identity, base fingerprint, palette completeness, and hex validity.
2. Strictly increasing surface and subtle/default/strong border luminance.
3. Assigned-surface informational contrast.
4. Average OKLab chroma floors for core and platform accent groups.
5. Inverse text on amber, teal, and scarlet fills.
6. Severity hue-family separation.
7. Black Label generated-file drift.
8. Companion generated-file drift.
9. CSS selectors, utilities, and keyframe namespaces.
10. VS Code JSONC, semantic mappings, modern role coverage, and duplicate keys.
11. Editor/terminal/native artifact parseability and cross-platform ANSI parity.
12. Gallery companion identity plus platform, syntax, and ANSI extension-token fidelity.

Use `spec/theme-gallery.html` for visual acceptance. It reads the three built CSS bundles directly and provides 13-token opaque palette proofs, aligned surface ramps, identical editor workbenches, canonical syntax roles, five-state semantics, ANSI-16, selectable A/B pairs, and a stationary wipe across the family.
