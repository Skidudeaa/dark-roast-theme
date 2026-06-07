# Dark Roast: Black Label -- Design System Reference

**Version**: 5.0.0
**Status**: CANONICAL
**Date**: 2026-04-20
**Applies to**: somaCURA (web, clinical data), Song Expanse (iOS, music visualization)

> **Reading notes for v4.1.0 / v5.0.0.** This reference was authored at v4.0.0.
> Two later releases affect it: **v4.1.0** added 3 clinical-severity hue
> primitives — `magenta #C25F90`, `harvest #D4A040`, `olive #879A39` (see §6) —
> bringing the totals to **26 colors / 30 opacity variants / 13 glows**; the
> per-section matrices below (§2) still enumerate the original 22 and have not
> yet been expanded. **v5.0.0** is a structural release: no token values
> changed; the package is now generated from `src/tokens.json` and import paths
> moved under `dist/` (see README "v4 → v5 Migration" and `docs/REORG-PLAN.md`).

---

## 0. v4.0.0 Migration Notes (from v3 / v2)

v4 is a breaking rename + expansion. **Hex values are unchanged.** Only token names change, plus additive new primitives and new primitive categories.

### Renamed tokens (hex unchanged)

| v3 name | v4 name | Hex | CSS var |
|---|---|---|---|
| `grain` | `espresso` | `#2A1C13` | `--dr-espresso` |
| `grainHover` | `espressoHover` | `#382818` | `--dr-espresso-hover` |
| `crater` (dark) | `craterDeep` | `#3C2A21` | `--dr-crater-deep` |
| `craterLt` | `crater` (top of surface scale) | `#4D3B31` | `--dr-crater` |

Deprecated v3 CSS vars (`--dr-grain`, `--dr-grain-hover`, `--dr-crater-lt`) are retained as aliases pointing at the v4 names. They will be removed in v5. Note: `--dr-crater` in v3 meant `#3C2A21`; in v4 it means `#4D3B31`. Audit direct uses.

### New primitives

| Name | Hex | Role |
|---|---|---|
| `darkCacao` | `#1E140E` | Elevated surfaces (modals, sheets, popovers) |
| `roastedBean` | `#3C2A1E` | Borders, dividers |
| `amberMuted` | `#C07A4A` | Reader contexts, Mystic2 parity |
| `brass` | `#BFA162` | Warning, caution |
| `burntSienna` | `#C75B39` | Terminal error, UI error (ANSI red) |
| `warmWhite` | `#F0E6D0` | Bright callouts, ANSI 15 |

### Semantic role aliases (pointers into primitives)

Prefer in new code for portability; color-name primitives remain canonical.

| Role | Points at |
|---|---|
| `accent` | `amber` |
| `accentHot` | `amberHot` |
| `accentMuted` | `amberMuted` |
| `success` | `teal` |
| `warning` | `brass` |
| `error` | `burntSienna` |
| `critical` | `scarlet` |
| `stable` | `gold` |
| `live` | `teal` |

### New primitive categories

All additive. See `src/tokens.json` for full detail.

- `opacity` -- 12-step alpha scale (0/4/5/8/10/12/15/24/40/60/85/100)
- `spacing` -- expanded to 15 steps (`0` -> `24` in px increments; numeric keys + legacy aliases)
- `radii` -- 8 steps (`none, xs, sm, md, lg, xl, 2xl, full`)
- `elevation` -- 5 variants (`flat/raised/floating/critical/live`) pairing shadow + border + optional glow
- `typography.scale` -- 10 steps (`xs -> 5xl`) each with size/line-height/letter-spacing/weight
- `typography.roles` -- 12 semantic roles (hero, pageTitle, cardTitle, labValue, vitalSign, etc.)
- `motion.keyframes` -- named breatheAmber / pulseScarlet / pulseTeal / shimmerSkeleton / fadeUp / slideIn / glow / grainDrift
- `zIndex` -- named scale (`base -> debug`, 0 -> 9999)
- `icon` -- size scale (`xs -> 3xl`) + stroke widths
- `stateVariants` -- hover/active/focus/disabled/selected overlay specs
- `accessibility.contrastTargets` -- per-role WCAG minimums + measured actuals
- `printExport` -- substrate-inversion mappings for paper output

### What didn't change

- All hex values for existing tokens
- Font stacks (Playfair Display / Instrument Sans / DM Sans / Fira Code)
- OLED wake-delay science (void 1.6ms, obsidian 1.8ms, crater 2.1ms)
- Glow structure (3-layer phosphor: white hotspot + color midband + color wash)
- somaCURA severity mapping semantics
- Song Expanse chrome-vs-content token separation

### Editor theme files

Hex values in editor themes (vscode/xcode/textastic/warp/tabby/terminal-app/iterm2) are unchanged. Header palette references were updated to v4 names; inline comments that use v3 names (e.g., `-- crater-lt barely visible passive indent guides`) were left alone -- they describe color *role*, which is orthogonal to the rename.

---

## 1. Overview and Design DNA

Dark Roast: Black Label is the unified design system for the soma product family. It fuses three distinct visual identities into a single production-locked token system:

- **Dark Roast** -- Computational velocity. The deep espresso foundation that enables data-dense clinical interfaces with zero eye strain during 12-hour shifts.
- **Crater Brown** -- Geological sedation. A warm accent sediment layer drawn from volcanic earth tones that provides spatial hierarchy without competing with action states.
- **Kinetic Teal** -- Live data flow. A cool-spectrum indicator that instantly separates real-time compute (SSE streams, NER processing, live telemetry) from the warm palette.

### System at a Glance

| Attribute | Value |
|-----------|-------|
| Theme name | Dark Roast: Black Label |
| Version | 5.0.0 |
| Status | CANONICAL (production-locked) |
| Color primitives | 6 surface + 4 foreground + 4 geological + 8 action + 3 severity = 26 colors |
| Opacity variants | 30 (3 tiers x 10 colors) |
| Glows | 13 multi-layer box-shadows |
| Typography | 4 families, 10-step scale, 12 semantic roles |
| Primitive categories | 11 (color, opacity, spacing, radii, elevation, typography, motion, z-index, icon, state, accessibility) |
| App targets | 2 (somaCURA, Song Expanse) |
| OLED optimized | Yes (two-tier floor strategy) |

### Two App Targets

**somaCURA / somaNotes** (Web): Longitudinal clinical intelligence platform. Census patient views, note generation rail, problem-based documentation, SSE streaming, diagnostic charts. The design system drives patient cards, severity badges, fragment evaluation, chart reference bands, and the Clinical Expression Engine (CExE).

**Song Expanse** (iOS/SwiftUI): Music visualization and metadata management. Vinyl renderer, marquee overlay, interactive timeline. The theme provides **chrome/UI shell** tokens only -- song-derived `TextColors` handle content areas. These two color systems must never be conflated.

---

## 2. Token Matrix

All 22 color primitives organized by functional layer. Every token is production-locked -- changes require a version bump.

### 2.1 Surface Scale (6 steps, monotonic dark -> light)

| Token | CSS Variable | Hex | Role |
|-------|-------------|-----|------|
| void | `--dr-void` | `#120C06` | Deepest background layer. OLED-safe floor (1.6ms wake) |
| obsidian | `--dr-obsidian` | `#160E08` | Content area background (1.8ms wake) |
| darkCacao | `--dr-dark-cacao` | `#1E140E` | Elevated: modals, sheets, popovers |
| espresso | `--dr-espresso` | `#2A1C13` | Card / panel surfaces (v4: was `grain`) |
| espressoHover | `--dr-espresso-hover` | `#382818` | Warm lift on hover/focus (v4: was `grainHover`) |
| roastedBean | `--dr-roasted-bean` | `#3C2A1E` | Borders, dividers |
| crater | `--dr-crater` | `#4D3B31` | Top of surface scale (v4: was `craterLt`, 2.1ms wake) |

### 2.2 Foregrounds

| Token | CSS Variable | Hex | Role |
|-------|-------------|-----|------|
| crema | `--dr-crema` | `#FFF7EE` | Hero text, brand chrome, highest contrast (18.31:1 on void) |
| warmWhite | `--dr-warm-white` | `#F0E6D0` | Bright callouts, ANSI 15 |
| bone | `--dr-bone` | `#EBE1D7` | Body reading, codex ink |
| mocha | `--dr-mocha` | `#8B7355` | Muted secondary, captions, labels |

### 2.3 Geological Accent Layer

| Token | CSS Variable | Hex | Role |
|-------|-------------|-----|------|
| craterDeep | `--dr-crater-deep` | `#3C2A21` | Geological accent, darker (v4: was `crater`) |
| asparagus | `--dr-asparagus` | `#465945` | Tertiary text / metadata / timestamps |
| rustic | `--dr-rustic` | `#480404` | Grounded interactive state -- atmospheric bleed only |
| rose | `--dr-rose` | `#480607` | Contextual error background tint |

### 2.4 Action and State (color-name primitives)

| Token | CSS Variable | Hex | Role |
|-------|-------------|-----|------|
| amber | `--dr-amber` | `#E69A4C` | Primary accent, cursor, CTAs |
| amberHot | `--dr-amber-hot` | `#D2691E` | Gradient terminal, escalation/hover (no longer severity, see Option C) |
| amberMuted | `--dr-amber-muted` | `#C07A4A` | Reader contexts, Mystic2 parity (new in v4) |
| gold | `--dr-gold` | `#DAA520` | True gold accent |
| brass | `--dr-brass` | `#BFA162` | Warning, caution (new in v4) |
| scarlet | `--dr-scarlet` | `#C44C4C` | Clinical critical severity |
| burntSienna | `--dr-burnt-sienna` | `#C75B39` | Terminal error, UI error (ANSI red, new in v4) |
| teal | `--dr-teal` | `#4CC4B4` | Success, live data, kinetic teal |
| magenta | `--dr-magenta` | `#C25F90` | Worsening severity, hue 333° (new in v4.1.0, Option C) |
| harvest | `--dr-harvest` | `#D4A040` | Improving severity, hue 39° (new in v4.1.0, Option C) |
| olive | `--dr-olive` | `#879A39` | Stable severity, hue 72° (new in v4.1.0, Option C) |

### 2.5 Semantic Role Aliases

Pointers into color primitives. Prefer in new code.

| Role | CSS Variable | Points at |
|------|-------------|-----------|
| accent | `--dr-accent` | `--dr-amber` |
| accentHot | `--dr-accent-hot` | `--dr-amber-hot` |
| accentMuted | `--dr-accent-muted` | `--dr-amber-muted` |
| success | `--dr-success` | `--dr-teal` |
| warning | `--dr-warning` | `--dr-brass` |
| error | `--dr-error` | `--dr-burnt-sienna` |
| critical | `--dr-critical` | `--dr-scarlet` |
| stable | `--dr-stable` | `--dr-gold` |
| live | `--dr-live` | `--dr-teal` |

### 2.6 Derived Tokens: Opacity Variants

Each action color has three opacity tiers for layered UI states:

| Tier | Opacity | Use |
|------|---------|-----|
| dim | 40% | Focused borders, active rings |
| subtle | 10% | Hover backgrounds, light fills, severity badge bg |
| ghost | 5% | Skeleton loads, faint state indicators |

v4 extends the tier system to `brass` (warning) and `burntSienna` (error) in addition to the original 5 action colors. v4.1.0 adds the three severity hues (`magenta`, `harvest`, `olive`) with the same dim/subtle/ghost tiers.

### 2.7 Derived Tokens: Multi-Layer Glow System

Glows are `box-shadow` values (not colors). Each has three phosphor layers: white hotspot, color midband, color wash.

14 glow tokens: amber, amber-intense, teal, teal-intense, scarlet, scarlet-intense, gold, gold-intense, amber-hot, magenta, harvest, olive, teal-ghost, glass-gradient. The three severity glows (magenta/harvest/olive) were added in v4.1.0 — magenta carries the scarlet urgency profile, harvest/olive the calm gold profile.

---

## 3. Typography System

Four locked font faces, each with a distinct role. No substitutions.

| Role | CSS Variable | Stack | Weights |
|------|-------------|-------|---------|
| Display | `--dr-font-display` | `'Playfair Display', Georgia, serif` | 700, 900 |
| Heading | `--dr-font-heading` | `'Instrument Sans', -apple-system, sans-serif` | 400, 500, 600, 700 |
| Body | `--dr-font-body` | `'DM Sans', -apple-system, sans-serif` | 400, 500, 700 |
| Mono | `--dr-font-mono` | `'Fira Code', 'SF Mono', monospace` | 400, 500, 600 |

### Type Scale (v4 -- 10 steps, 1.25 minor-third ratio)

| Token | Size | Use |
|-------|------|-----|
| `--dr-text-xs` | 0.625rem (10px) | Badges, micro-labels, legal |
| `--dr-text-sm` | 0.75rem (12px) | Metadata, timestamps, captions |
| `--dr-text-base` | 0.875rem (14px) | Body copy, UI default |
| `--dr-text-md` | 1rem (16px) | Primary content |
| `--dr-text-lg` | 1.125rem (18px) | Card titles, subsection headers |
| `--dr-text-xl` | 1.375rem (22px) | Section headers |
| `--dr-text-2xl` | 1.75rem (28px) | Page titles |
| `--dr-text-3xl` | 2.25rem (36px) | Hero subheads |
| `--dr-text-4xl` | 3rem (48px) | Hero display (Playfair) |
| `--dr-text-5xl` | 4rem (64px) | Marketing hero only |

Each step carries matching `--dr-leading-*` line-height values tuned for dense clinical/technical reading (see `src/tokens.json` `typography.scale`). Semantic typography *roles* (`hero`, `cardTitle`, `labValue`, `vitalSign`, `timestamp`, etc.) map role -> family + scale + color, see `typography.roles`.
| `--dr-text-lg` | 1.125rem (18px) | Subheadings |
| `--dr-text-xl` | 1.5rem (24px) | Section headers |
| `--dr-text-2xl` | 2rem (32px) | Page titles |
| `--dr-text-huge` | 4.5rem (72px) | Hero display |

### Letter Spacing

| Token | Value | Use |
|-------|-------|-----|
| `--dr-tracking-tight` | -0.01em | Headings, display text |
| `--dr-tracking-normal` | 0 | Body text |
| `--dr-tracking-wide` | 0.05em | UI labels |
| `--dr-tracking-wider` | 0.10em | Badge text |
| `--dr-tracking-widest` | 0.20em | Uppercase labels |
| `--dr-tracking-display` | 0.15em | Section labels, uppercase metadata |

---

## 4. OLED Science

### The Problem with Pure Black

Absolute black (`#000000`) forces OLED pixels into a full power-off state. When adjacent pixels need to reactivate during scrolling, the delay is measurable:

| Background | Hex | Pixel Wake Delay | Status |
|------------|-----|-----------------|--------|
| Pure Black | `#000000` | 18.5ms | **Purple smearing artifacts** |
| **Obsidian** | **`#160E08`** | **1.8ms** | **System floor** |
| **The Void** | **`#120C06`** | **1.6ms** | **Deepest safe layer** |

Both `void` and `obsidian` keep OLED pixels energized above the power-off threshold, eliminating purple-smearing artifacts during high-speed scrolling. The warm brown undertone prevents the cold, clinical feel of neutral dark grays.

---

## 5. Color Layers

### Layer 1: Dark Roast Primary
**Purpose**: Depth hierarchy and text legibility.

`void → obsidian → grain → grain-hover` (deepest to interactive surface).

### Layer 2: Crater Brown Geological
**Purpose**: Warm accent sediment for spatial structure. Never carries semantic meaning.

### Layer 3: Action and State
**Purpose**: Interactive elements and clinical state communication. Amber (CTA), gold (success), scarlet (error), teal (live data).

---

## 6. Clinical Severity System

Consumed via the `--dr-severity-*` indirection layer (`--dr-severity-worsening`,
`--dr-severity-improving`, `--dr-severity-stable`, plus `-bg` and
`--dr-glow-severity-*` companions). Reference these, **not** the underlying
color primitives — the indirection is the migration seam.

| Severity | Token | Hex | Hue | Icon (SF Symbol) | Sparkline | Clinical Meaning |
|----------|-------|-----|-----|------------------|-----------|------------------|
| Critical | scarlet | `#C44C4C` | 0° | `exclamationmark.triangle.fill` | — | Immediate attention required |
| Worsening | magenta | `#C25F90` | 333° | `arrow.down.right` | slope_down | Deteriorating trend |
| Improving | harvest | `#D4A040` | 39° | `arrow.up.right` | slope_up | Positive trajectory |
| Stable | olive | `#879A39` | 72° | `arrow.right` | flat | No significant change |
| Resolved | teal | `#4CC4B4` | 172° | `checkmark.seal.fill` | — | Problem resolved |

Five distinct hue families: catastrophe → struggle → climbing → holding →
recovered. **Directional states (worsening/improving/stable) MUST render the
paired icon + sparkline** — color carries category, icon carries direction,
sparkline carries magnitude. Renderers that omit iconography still degrade
acceptably (hues are now distinct), but the documented contract is the full
pattern. Severity renders as a bare 8px dot in dense census rows, which is why
hue separation is enforced strictly here (see §6.1).

### 6.1 Palette Rules

These three rules govern how color tokens may be assigned to semantic roles.
They exist so the Option C remediation is not silently "normalized" back to a
single amber family by a future maintainer.

**Rule 1 — Hue family separation.** Colors representing semantically distinct
roles within the same group must occupy different hue families: ≥ 30° hue gap
**and** ≥ 25 ΔE between any two roles in one group. Under cognitive load,
peripheral vision, or display variation, colors within 30° blur into one.
*Exempt when* roles are variants of the same token (`accent`/`accentHot`),
differentiated by paired iconography/animation, or never co-occur in one frame.
*Violation that triggered Option C:* `improving #E69A4C` (28°) vs
`worsening #D2691E` (25°) — a 3° gap that collapsed at census scanning speed.
*Compliant:* `critical #C44C4C` (0°) vs `resolved #4CC4B4` (172°) — cannot blend.

**Rule 2 — No cross-group exact reuse.** One hex used as the primary signal in
two semantic groups creates channel ambiguity (e.g. the same amber as both a
clinical severity and a pipeline stage — the viewer cannot tell which channel
is reporting). Remediate with distinct tokens per group, channel-distinguishing
iconography, or animating one channel so motion disambiguates.

**Rule 3 — Directional states need iconography.** Direction is a vector; color
is a scalar. An amber dot cannot say "getting better" vs "getting worse"
without an arrow, slope sparkline, or label. Compliant pattern: hue carries the
intermediate-state category, a paired SF Symbol carries direction, a number
carries magnitude.

---

## 7. Spacing and Geometry

| Token | Value |
|-------|-------|
| `--dr-space-xs` | 4px |
| `--dr-space-sm` | 8px |
| `--dr-space-md` | 12px |
| `--dr-space-lg` | 16px |
| `--dr-space-xl` | 24px |
| `--dr-space-2xl` | 32px |
| `--dr-space-3xl` | 48px |

### Border Radii

| Token | Value |
|-------|-------|
| `--dr-radius-none` | 0 |
| `--dr-radius-sm` | 4px |
| `--dr-radius-md` | 8px |
| `--dr-radius-lg` | 12px |
| `--dr-radius-xl` | 16px |
| `--dr-radius-2xl` | 24px |

---

## 8. Animation Library

| Animation | Utility Class | Duration | Use |
|-----------|--------------|----------|-----|
| `dr-pulse-teal` | `.dr-pulse-teal` | 2.5s infinite | Live data indicator |
| `dr-fadeUp` | `.dr-fade-up` | 0.7s ease-out | Content entrance |
| `dr-slideIn` | `.dr-slide-in` | 0.5s ease-out | Lateral entrance |
| `dr-glow` | `.dr-glow-breathe` | 3s infinite | Amber breathing glow |
| `dr-grain-drift` | `.dr-grain-overlay` | 8s infinite | Grain texture movement |

### Timing Tokens

| Token | Value |
|-------|-------|
| `--dr-duration-fast` | 150ms |
| `--dr-duration-normal` | 300ms |
| `--dr-duration-theatrical` | 500ms |
| `--dr-duration-entrance` | 600ms |
| `--dr-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--dr-easing-dramatic` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `--dr-easing-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

---

## 9. Accessibility

### Contrast Ratios on Void (#120C06)

| Token | Ratio | WCAG AA Normal | WCAG AA Large |
|-------|-------|----------------|---------------|
| crema | **18.31:1** | PASS | PASS |
| bone | **15.06:1** | PASS | PASS |
| teal | **9.12:1** | PASS | PASS |
| gold | **8.68:1** | PASS | PASS |
| amber | **8.41:1** | PASS | PASS |
| amber-hot | **5.35:1** | PASS | PASS |
| mocha | **4.33:1** | FAIL | PASS |
| scarlet | **4.15:1** | FAIL | PASS |
| asparagus | **2.57:1** | FAIL | FAIL |

The CSS includes `prefers-reduced-motion`, `prefers-contrast: more`, and visible focus rings (teal, 9.12:1 contrast).

---

## 10. Component Patterns

### Glass Panel
```css
.dr-glass-panel {
    background: var(--dr-glass-gradient);
    border: 1px solid var(--dr-crater);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    border-radius: var(--dr-radius-lg);
}
```

### Geo-Stripe
```css
.dr-geo-stripe::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: var(--dr-stripe-height);
    background: linear-gradient(90deg, var(--dr-crater), var(--dr-crater-lt), transparent);
    opacity: var(--dr-stripe-opacity);
}
```

### Section Label
```css
.section-label {
    font-family: var(--dr-font-mono);
    font-size: 10px;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    color: var(--dr-asparagus);
}
```

---

## 11. Package File Reference

| File | Purpose |
|------|---------|
| `src/tokens.json` | **Source of truth** — hand-edited canonical token definitions |
| `src/css-templates/*.css` | Hand-authored CSS (app-layer vars, utilities, base) with `@generated` markers |
| `scripts/build-tokens.js` | Generator: `src/tokens.json` → `dist/` (`npm run build` / `npm test`) |
| `dist/css/dark-roast.css` | GENERATED standalone CSS — tokens on `:root`, base styles via `.dark-roast` |
| `dist/css/dark-roast-scoped.css` | GENERATED scoped CSS — tokens on `[data-theme="dark-roast"]` |
| `dist/tokens/colors.js` | GENERATED — named color hex + opacity variant + role exports |
| `dist/tokens/typography.js` | GENERATED — font stack + type scale exports |
| `dist/tokens/glows.js` | GENERATED — box-shadow string exports |
| `dist/tokens/spacing.js` | GENERATED — spacing/radii/motion/z-index/icon/elevation exports |
| `dist/tokens/index.js` | GENERATED — barrel re-export of all token modules |
| `platforms/swift/EnhancedDarkRoastTheme.swift` | SwiftUI reference implementation |
| `spec/dark-roast-spec.html` | Interactive visual spec with Chart.js |
| **This document** | Full design system reference |

---

## Appendix A: SwiftUI Quick Reference

**Environment injection**:
```swift
.environment(\.appTheme, .enhancedDarkRoast)
```

**View modifiers**:
```swift
.darkRoastCard(elevated: false)
.darkRoastBackground()
```

**Token access**:
```swift
@Environment(\.appTheme) private var theme
Text("Patient Name")
    .foregroundColor(theme.primaryText)    // crema
    .font(.custom("Instrument Sans", size: 18))
```

**Critical rule**: `TextColors` (song-derived) drive content areas. `AppTheme` tokens drive chrome. Never conflate.
