# Enhanced Dark Roast: Black Label -- Design System Reference

**Version**: 2.0
**Status**: CANONICAL
**Date**: 2026-02-22
**Applies to**: somaCURA (web, clinical data), Song Expanse (iOS, music visualization)

---

## 1. Overview and Design DNA

Enhanced Dark Roast: Black Label is the unified design system for the soma product family. It fuses three distinct visual identities into a single production-locked token system:

- **Dark Roast** -- Computational velocity. The deep espresso foundation that enables data-dense clinical interfaces with zero eye strain during 12-hour shifts.
- **Crater Brown** -- Geological sedation. A warm accent sediment layer drawn from volcanic earth tones that provides spatial hierarchy without competing with action states.
- **Kinetic Teal** -- Live data flow. A cool-spectrum indicator that instantly separates real-time compute (SSE streams, NER processing, live telemetry) from the warm palette.

### System at a Glance

| Attribute | Value |
|-----------|-------|
| Theme name | Enhanced Dark Roast: Black Label |
| Version | 2.0 |
| Status | CANONICAL (production-locked) |
| Color tokens | 16 base + 15 opacity variants + 11 glows + 10 severity + 5 status + 14 CExE |
| Font faces | 4 |
| App targets | 2 (somaCURA, Song Expanse) |
| OLED optimized | Yes (two-tier floor strategy) |

### Two App Targets

**somaCURA / somaNotes** (Web): Longitudinal clinical intelligence platform. Census patient views, note generation rail, problem-based documentation, SSE streaming, diagnostic charts. The design system drives patient cards, severity badges, fragment evaluation, chart reference bands, and the Clinical Expression Engine (CExE).

**Song Expanse** (iOS/SwiftUI): Music visualization and metadata management. Vinyl renderer, marquee overlay, interactive timeline. The theme provides **chrome/UI shell** tokens only -- song-derived `TextColors` handle content areas. These two color systems must never be conflated.

---

## 2. Token Matrix

All 16 tokens organized by functional layer. Every token is production-locked -- changes require a version bump.

### 2.1 Dark Roast Primary (Depth and Text)

| Token | CSS Variable | Hex | Role | Notes |
|-------|-------------|-----|------|-------|
| void | `--dr-void` | `#120C06` | Deepest background layer | The Void -- OLED-safe floor |
| obsidian | `--dr-obsidian` | `#160E08` | Elevated background | Obsidian Espresso -- content area floor |
| grain | `--dr-grain` | `#2A1C13` | Card surfaces | Polished Grain |
| grain-hover | `--dr-grain-hover` | `#382818` | Interactive card lift | Warm shift on hover/focus |
| crema | `--dr-crema` | `#FFF7EE` | Primary text | Ivory Crema -- high legibility |
| mocha | `--dr-mocha` | `#8B7355` | Secondary text | Muted Mocha -- reduced emphasis |

### 2.2 Crater Brown Geological (Accent Sediment)

| Token | CSS Variable | Hex | Role | Notes |
|-------|-------------|-----|------|-------|
| crater | `--dr-crater` | `#3C2A21` | Geological primary | Border, stripe, divider base |
| crater-lt | `--dr-crater-lt` | `#4D3B31` | Spatial depth | Earth Taupe -- gradient terminal |
| bone | `--dr-bone` | `#EBE1D7` | Reduced-contrast text | Off-White -- used where crema is too bright |
| asparagus | `--dr-asparagus` | `#465945` | Tertiary text / labels | Desaturated green -- metadata, timestamps |
| rustic | `--dr-rustic` | `#480404` | Grounded interactive state | Deep red -- atmospheric bleed only |
| rose | `--dr-rose` | `#480607` | Contextual error state | Bulgarian Rose -- background tint for errors |

### 2.3 Action and State

| Token | CSS Variable | Hex | Role | Notes |
|-------|-------------|-----|------|-------|
| amber | `--dr-amber` | `#E69A4C` | Primary accent | Amber Gold -- buttons, links, highlights |
| amber-hot | `--dr-amber-hot` | `#D2691E` | Gradient terminal | High-Octane Amber -- gradient end point |
| gold | `--dr-gold` | `#DAA520` | Success state | True Gold -- confirmations, completed actions |
| scarlet | `--dr-scarlet` | `#C44C4C` | Warning/error/critical | Roasted Scarlet -- alerts, flagged labs |
| teal | `--dr-teal` | `#4CC4B4` | Live data flow | Kinetic Teal -- SSE, NER, real-time |

### 2.4 Derived Tokens: Opacity Variants

Each action color has three opacity tiers for layered UI states:

| Tier | Opacity | Use |
|------|---------|-----|
| dim | 40% | Focused borders, active rings |
| subtle | 10% | Hover backgrounds, light fills, severity badge bg |
| ghost | 5% | Skeleton loads, faint state indicators |

### 2.5 Derived Tokens: Multi-Layer Glow System

Glows are `box-shadow` values (not colors). Each has three phosphor layers: white hotspot, color midband, color wash.

11 glow tokens: amber, amber-intense, teal, teal-intense, scarlet, scarlet-intense, gold, gold-intense, amber-hot, teal-ghost, glass-gradient.

---

## 3. Typography System

Four locked font faces, each with a distinct role. No substitutions.

| Role | CSS Variable | Stack | Weights |
|------|-------------|-------|---------|
| Display | `--dr-font-display` | `'Playfair Display', Georgia, serif` | 700, 900 |
| Heading | `--dr-font-heading` | `'Instrument Sans', -apple-system, sans-serif` | 400, 500, 600, 700 |
| Body | `--dr-font-body` | `'DM Sans', -apple-system, sans-serif` | 400, 500, 700 |
| Mono | `--dr-font-mono` | `'Fira Code', 'SF Mono', monospace` | 400, 500, 600 |

### Type Scale

| Token | Size | Use |
|-------|------|-----|
| `--dr-text-xs` | 0.6875rem (11px) | Metadata labels, timestamps |
| `--dr-text-sm` | 0.8125rem (13px) | Captions, secondary info |
| `--dr-text-base` | 0.9375rem (15px) | Body text |
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

| Severity | Token | Hex | Clinical Meaning |
|----------|-------|-----|-----------------|
| Critical | scarlet | `#C44C4C` | Immediate attention required |
| Worsening | amber-hot | `#D2691E` | Deteriorating trend |
| Improving | amber | `#E69A4C` | Positive trajectory |
| Stable | gold | `#DAA520` | No significant change |
| Resolved | teal | `#4CC4B4` | Problem resolved |

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
| crema | **17.08:1** | PASS | PASS |
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
| `css/dark-roast.css` | Standalone CSS — tokens on `:root`, base styles via `.dark-roast` class |
| `css/dark-roast-scoped.css` | Scoped CSS — tokens on `[data-theme="dark-roast"]` for multi-theme apps |
| `tokens/tokens.json` | Machine-readable canonical token definitions |
| `tokens/colors.js` | ES module — named color hex exports |
| `tokens/typography.js` | ES module — font stack exports |
| `tokens/glows.js` | ES module — box-shadow string exports |
| `tokens/spacing.js` | ES module — spacing/radii/timing exports |
| `tokens/index.js` | Barrel re-export of all token modules |
| `swift/EnhancedDarkRoastTheme.swift` | SwiftUI reference implementation |
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
