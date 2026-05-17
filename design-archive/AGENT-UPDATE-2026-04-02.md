> **⚠️ SUPERSEDED 2026-05-16.** This handoff described the spec-track files as
> the system. They are no longer canonical — severity Option C and the palette
> rules were integrated into the shipped package in v4.1.0. Source of truth is
> now `../tokens/`, `../css/`, `../docs/DESIGN-SYSTEM.md`, and `../CHANGELOG.md`.
> Retained for provenance only. Do not act on the instructions below as current.

# Dark Roast — Agent Context Update 2026-04-02

Drop this into a fresh Dark Roast agent session. Self-contained delta + current state.

## CANONICAL FILES

| File | Role | Version |
|---|---|---|
| `dark-roast-v4.json` | Color/theme data (11 themes + Mystic2 related) | 4.1.0 |
| `dark-roast-system-v1.json` | Design system spec (primitives + components + app tokens + palette_rules) | 1.0.0-draft |
| `dark-roast-system-v1.md` | Human review of system-v1.json, tracks 🎯 DEFAULTs awaiting approval | — |
| `dark-roast.py` | CLI: validate, inspect, compare, audit, harmonize, palette-audit, export, preview | v2 |
| `man-on-the-moon-hazy-v3.jsonc` | Cursor settings override (Kid Cudi VS Code theme aligned to DR severity tokens) | v3 |

**Legacy / regeneratable (DO NOT EDIT):**
- `enhanced-dark-roast-v2.json` — superseded
- `EnhancedDarkRoastTheme.swift` — regen via `export swift --theme dark_roast`
- `termius_theme_context_cache_v3.{json,md,csv}` — superseded by v4
- `enhanced-dark-roast-master-spec-v2.html` — superseded by system-v1.md

## DELTA from prior agent state

### Adopted decisions
| Section | Decision | Date |
|---|---|---|
| §18 palette_rules | Three rules formalized + audit tool enforcement | 2026-04-02 |
| §19 severity_mapping | Option C: hue redistribution + iconography | 2026-04-02 |
| §20 pipeline_states | Option C: accept-as-mitigated, rationale codified | 2026-04-02 |

### Theme cache v4.1.0 additions
- `related_themes.mystic2_base` and `related_themes.mystic2_tuned` (Narwhal2 iPad Reddit reader)
- `cross_system_mapping` documenting Mystic2 ↔ Dark Roast DNA (body text ΔE 6.8, divergent substrates)
- 5-patch Mystic2 tuning sequence preserved as design decision record

## CANONICAL SEVERITY MAPPING (somaCURA)

```json
{
  "critical":  { "hex": "#C44C4C", "hue":   0, "icon": "exclamationmark.triangle.fill" },
  "worsening": { "hex": "#C25F90", "hue": 333, "icon": "arrow.down.right",     "sparkline": "slope_down" },
  "improving": { "hex": "#D4A040", "hue":  39, "icon": "arrow.up.right",       "sparkline": "slope_up" },
  "stable":    { "hex": "#879A39", "hue":  72, "icon": "arrow.right",          "sparkline": "flat" },
  "resolved":  { "hex": "#4CC4B4", "hue": 172, "icon": "checkmark.seal.fill" }
}
```

Five distinct hue families. Trajectory reads: catastrophe → struggle → climbing → holding → recovered.

### New action tokens (added to color.action)
- `severity_worsening: #C25F90`
- `severity_improving: #D4A040`
- `severity_stable:    #879A39`

### IMPORTANT: tokens no longer claimed by severity
- `action.accent` (#E69A4C) — now reserved for primary CTA/accent role only
- `action.accent_hot` (#D2691E) — now reserved for escalation/hover, not "worsening severity"
- `action.gold` (#DAA520) — now reserved for general gold accent, not "stable severity"

Any prior code that mapped these to severity needs updating.

### Component update
- `somaCURA.components.census_row.worsening_bg` now overlays `action.severity_worsening` (was `action.accent_hot`)
- `somaCURA.components.problem_card.severity_stripe` derives from severity_mapping[status] — auto-picks new tokens

## PIPELINE STATES (somaCURA.pipeline_states)

**Colors UNCHANGED. Documentation added.**

Pipeline cluster intentionally lives in warm-gold hue family ("amber pipeline"). Acknowledged audit findings:

| Pair | Hue gap | Disambiguator |
|---|---|---|
| clinical_update ↔ problem_approval | 7° | icon (pencil.circle vs checklist) |
| hyperdrive_ner ↔ problem_approval | 10° | icon + animation (brain breathing vs static checklist) |
| problem_approval ↔ note_complete | 2° | icon + terminal-state (checklist vs static checkmark.seal) |
| severity.resolved ↔ pipeline.sse_streaming (both #4CC4B4) | cross-group | animation (streaming pulses, severity static) |

Disambiguation channels: icon (unique SF Symbol per state) + animation (`breathe_amber` on active) + label (always rendered).

JSON keys documenting this:
- `pipeline_states._design_rationale`
- `pipeline_states._audit_acknowledged`
- `pipeline_states._cross_group_reuse_acknowledged`

`palette-audit` still flags these findings on every run. That's intentional — the documentation is the answer, not silence.

## PALETTE RULES (now enforced)

1. **Hue family separation** — same-group roles need ≥30° hue gap AND ≥25 ΔE
2. **No cross-group exact reuse** — single hex as primary signal in two semantic groups = ambiguity
3. **Directional states need iconography** — color is scalar, direction is vector

Spec location: `dark-roast-system-v1.json` → `palette_rules`

## CLI

```bash
cd /Users/thomasamosson/jan25/darkRoastTheme

# Theme/color operations (reads dark-roast-v4.json by default)
python dark-roast.py validate                              # WCAG + OLED wake
python dark-roast.py inspect dark_roast                    # Full profile + metrics
python dark-roast.py compare dark_roast movember           # ΔE + L/a/b DNA
python dark-roast.py audit                                 # Capture quality + queue
python dark-roast.py harmonize "#8B4513,#D2691E,#F4A460"  # Score palette vs collection
python dark-roast.py export swift --theme dark_roast       # css|swift|iterm|alacritty|warp
python dark-roast.py preview                               # HTML preview page

# Design system operations (requires --json)
python dark-roast.py --json dark-roast-system-v1.json palette-audit
```

### Audit exit codes
- `0` — all rules pass
- `1` — critical findings (hue gap <15° between distinct roles in same group)
- `2` — medium findings only (hue gap <30° or cross-group reuse)

Current state: exits `1` because pipeline_states findings are documented-but-not-silenced (intentional per Option C).

## OLED WAKE MODEL

Built into `dark-roast.py`. Empirical interpolation from luminance:
- `#000000` → 18.5ms (worst)
- `#120C06` → 1.6ms (void, OLED-safe)
- `#160E08` → 1.8ms (obsidian, OLED-safe)
- `#4D3B31` → 2.1ms (crater, OLED-safe)
- Threshold: 5ms (smear risk above)

## OPEN 🎯 ITEMS

Items in `dark-roast-system-v1.md` review checklist awaiting yes/no:

- §1 Color — `accent_muted #C07A4A` addition (Mystic2 import)
- §2 Opacity scale (10 steps)
- §3 Spacing (4px base, 15 steps)
- §4 Radii (8 steps, lg=12px anchor)
- §5 Elevation (5 states with semantic glow colors)
- §6 Typography (1.25 ratio scale + 12 semantic roles)
- §7 Motion (7 durations + 5 easings + 3 keyframes)
- §8 Z-index (11 steps)
- §9 Icons (7 sizes)
- §10 Components (button/card/input/nav/modal/toast/chip/divider/tooltip)
- §11 State variants (hover/active/focus/disabled/selected)
- §12 Accessibility (reduced-motion, high-contrast, `metadata_ignore` role from Mystic2)
- §13 Print/export inversions
- §16 Additional apps (Dictum, tradingDesk component specs)
- §18 Palette rules adoption (the three rules themselves)

## CLOSED ✅
- §19 severity_mapping (Option C)
- §20 pipeline_states (Option C accept-as-mitigated)
- v4.1 theme cache Mystic2 inclusion

## KEY ARCHITECTURAL CONTRACTS

### Song Expanse: Chrome vs Content separation
- **Chrome** = AppTheme (Dark Roast tokens). Never derived from album art. Constant across songs.
- **Content** = TextColors (9-tier album-art-derived). Lyrics, annotations, timeline, song story, credits.
- Bridge: `dark-roast.py harmonize` scores TextColors against theme collection.
- Spec: `songExpanse.token_separation` in system-v1.json

### somaCURA: severity is bare-dot rendering
- Severity color renders as 8px dot in dense census rows — no icon at that scale
- This is why severity_mapping must pass hue family separation strictly
- Pipeline states never compress to a dot (always icon + label) — that's why they can cluster

### Foreground tier ladder
- `display #FFF7EE` — hero/brand ONLY (contrast 17.4 vs void)
- `workhorse #D4C4A8` — terminal, code, body reading (contrast 11.3, AAA)
- `secondary #8B7355` — labels (contrast 5.1, AA)
- `tertiary #465945` — timestamps (contrast 3.2)
- NEVER use `accent #E69A4C` as default foreground

## REFERENCES

- Full design philosophy: `dark-roast-system-v1.json` → `_meta` + section `_note` keys
- Theme provenance: `dark-roast-v4.json` → `evidence_tiers` + per-theme `tracks[]`
- Mystic2 tuning sequence: `dark-roast-v4.json` → `related_themes.mystic2_tuned.tuning_sequence`
- Cross-system mapping: `dark-roast-v4.json` → `cross_system_mapping`
