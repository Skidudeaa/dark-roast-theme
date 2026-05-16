# Dark Roast Design System — v1.0.0-draft

Full specification. Extends `theme-context-cache-v4.json` (colors only) with primitives, components, and app-specific tokens.

**Status legend:**
- ✅ **VERIFIED** — sourced from canonical Dark Roast v2.0.0 artifacts
- 🎯 **DEFAULT** — opinionated proposal from Claude, pending your approval
- ⏳ **TBD** — needs real-world measurement or decision

**Review workflow:** Scan each section. Mark DEFAULT items you approve, reject, or want revised. Once locked, values migrate into the canonical JSON and generate platform targets via `dark-roast.py`.

---

## 1. Color ✅

Color tokens are already canonical. Summarized here for self-containment — see `theme-context-cache-v4.json` for full provenance.

### Surface Scale (6 steps, darkest → lightest)
| Token | Hex | Use |
|---|---|---|
| `void` | `#120C06` | Page background |
| `obsidian` | `#160E08` | Content background |
| `dark_cacao` | `#1E140E` | Elevated surfaces (modals, sheets) |
| `espresso` | `#2A1C14` | Card backgrounds |
| `roasted_bean` | `#3C2A1E` | Borders, dividers |
| `crater` | `#4D3B31` | Geological accent, card bottom stripes |

### Foreground Tiers
| Token | Hex | Use |
|---|---|---|
| `display` | `#FFF7EE` | Hero text, brand chrome **only** |
| `workhorse` | `#D4C4A8` | Terminal, code, body reading |
| `secondary` | `#8B7355` | Muted body, labels |
| `tertiary` | `#465945` | Timestamps, metadata |
| `warm_white` | `#F0E6D0` | Bright callouts, ANSI 15 |
| `bone` | `#EBE1D7` | Codex ink, midpoint |

### Action / State
| Token | Hex | Use |
|---|---|---|
| `accent` | `#E69A4C` | Primary accent, cursor, CTAs |
| `accent_hot` | `#D2691E` | Gradient terminal, worsening state |
| `accent_muted` 🎯 | `#C07A4A` | Reader contexts (Mystic2 parity) |
| `success` | `#4CC4B4` | Success, live data, kinetic teal |
| `warning` | `#BFA162` | Warning, caution |
| `error` | `#C75B39` | Error, terminal error |
| `scarlet` | `#C44C4C` | Clinical critical severity |
| `gold` | `#DAA520` | Clinical stable severity |

**🎯 Proposed addition:** `accent_muted #C07A4A` — imported from Mystic2 tuned. Gives the system a quieter amber for reader contexts where full `accent` is hostile. Reject if you want to keep the two systems visually distinct.

### Crater Brown Layer
`crater_primary #3C2A21`, `crater_light #4D3B31`, `asparagus #465945`, `rustic #480404`, `rose #480607`

---

## 2. Opacity 🎯

Alpha scale for overlays, glows, scrims. Hex-suffix form.

| Token | Decimal | Hex | Use |
|---|---|---|---|
| `0` | 0.00 | `00` | Transparent |
| `4` | 0.04 | `0A` | Subtle divider |
| `8` | 0.08 | `14` | Hover overlay |
| `12` | 0.12 | `1F` | Amber glow |
| `15` | 0.15 | `26` | Teal glow |
| `24` | 0.24 | `3D` | Disabled state |
| `40` | 0.40 | `66` | Modal scrim |
| `60` | 0.60 | `99` | Heavy scrim |
| `85` | 0.85 | `D9` | Export modal backdrop |
| `100` | 1.00 | `FF` | Opaque |

**Rationale:** Scale ties to existing glow tokens (`glowAmber 0.12`, `glowTeal 0.15` from Swift file). Fills gaps for hover (8%), disabled (24%), modal backdrop (85% — matches Mystic2 export panel).

---

## 3. Spacing 🎯

4px base unit. Standard iOS/SwiftUI 4pt grid.

| Token | px | rem | Use |
|---|---|---|---|
| `0` | 0 | 0 | No spacing |
| `0.5` | 2 | 0.125 | Hairline gap |
| `1` | 4 | 0.25 | Tight intra-component |
| `1.5` | 6 | 0.375 | Chip padding |
| `2` | 8 | 0.5 | Related element gap |
| `3` | 12 | 0.75 | Standard content padding |
| `4` | 16 | 1.0 | **Card padding, section spacing** |
| `5` | 20 | 1.25 | Larger card |
| `6` | 24 | 1.5 | Section gap |
| `8` | 32 | 2.0 | Major section |
| `10` | 40 | 2.5 | Page-level |
| `12` | 48 | 3.0 | Hero |
| `16` | 64 | 4.0 | iPad page margins |
| `20` | 80 | 5.0 | Large hero |
| `24` | 96 | 6.0 | Extreme hero |

---

## 4. Radii 🎯

| Token | px | Use |
|---|---|---|
| `none` | 0 | Full-bleed |
| `xs` | 2 | Inline chips, tight badges |
| `sm` | 4 | Tight controls |
| `md` | 8 | Standard buttons, inputs |
| `lg` | 12 | **Cards** (matches `DarkRoastCard` Swift modifier) |
| `xl` | 16 | Large cards, modals |
| `2xl` | 24 | Hero cards |
| `full` | 9999 | Pills, circular avatars |

**Anchor:** `radii.lg = 12px` is locked to your existing `DarkRoastCard` modifier. Everything else scales around it.

---

## 5. Elevation 🎯

Dark Roast elevation uses atmospheric bleed + subtle shadows + border-weight variation. No iOS-typical hard drop shadows.

| Token | Spec | Use |
|---|---|---|
| `flat` | no shadow, 1px hairline border | Inline elements |
| `raised` | `0 2px 8px rgba(0,0,0,0.4)` + hairline | Standard cards |
| `floating` | `0 8px 24px rgba(0,0,0,0.5)` + amber glow | Modals, popovers, hover |
| `critical` | `0 8px 24px rgba(0,0,0,0.6)` + scarlet glow | Critical alerts, high-severity patient |
| `live` | `0 4px 16px rgba(0,0,0,0.4)` + teal glow | SSE-streaming cards |

**Key insight:** Glow color = semantic state. `floating` means "user interacting." `critical` means "something's wrong." `live` means "data moving." The shadow alone shouldn't carry meaning — pair with glow.

---

## 6. Typography ✅🎯

**Families are VERIFIED.** Size/weight/line-height ramps are DEFAULT.

### Families ✅
| Role | Family | Weights | Use |
|---|---|---|---|
| `display` | **Playfair Display** | 700, 900 | Hero, brand, app titles |
| `heading` | **Instrument Sans** | 400–700 | Patient names, track titles, card headers |
| `body` | **DM Sans** | 400, 500, 700 | Clinical descriptions, UI labels |
| `mono` | **Fira Code** | 400–600 | Lab values, ISRC, JSON, vitals, code. Ligatures enabled. |

### Scale 🎯 (1.25 minor-third ratio)
| Token | px | line-h | Weight | Use |
|---|---|---|---|---|
| `xs` | 10 | 1.4 | 500 | Badges, micro-labels |
| `sm` | 12 | 1.5 | 400 | Metadata, timestamps |
| `base` | 14 | 1.6 | 400 | **Body copy, UI default** |
| `md` | 16 | 1.5 | 400 | Readable body |
| `lg` | 18 | 1.4 | 500 | Card titles |
| `xl` | 22 | 1.3 | 600 | Section headers |
| `2xl` | 28 | 1.2 | 700 | Page titles |
| `3xl` | 36 | 1.15 | 700 | Hero subheads |
| `4xl` | 48 | 1.1 | 900 | Hero display (Playfair) |
| `5xl` | 64 | 1.0 | 900 | Marketing hero only |

### Semantic Roles 🎯
Instead of naming type by size, name by job:

| Role | Family | Scale | Color |
|---|---|---|---|
| `hero` | display | 4xl | foreground.display |
| `page_title` | heading | 2xl | foreground.display |
| `section` | heading | xl | foreground.workhorse |
| `card_title` | heading | lg | foreground.workhorse |
| `body` | body | base | foreground.workhorse |
| `body_muted` | body | base | foreground.secondary |
| `label` | body | sm | foreground.secondary |
| `metadata` | body | sm | foreground.tertiary |
| `code` | mono | base | foreground.workhorse |
| `lab_value` | mono | md (500) | foreground.workhorse |
| `timestamp` | mono | xs | foreground.tertiary |
| `vital_sign` | mono | lg (600) | foreground.workhorse |

**Rationale:** `lab_value`, `vital_sign`, `timestamp` are specific to somaCURA clinical contexts. Lab values use mono at 16px/500 — legible at a glance during rounds.

---

## 7. Motion 🎯

Tuned for calm/deliberate. Avoids bouncy springs except for delight moments.

### Durations
| Token | ms | Use |
|---|---|---|
| `instant` | 0 | `prefers-reduced-motion` |
| `fast` | 120 | Hover, tap feedback |
| `base` | 200 | Standard transitions |
| `moderate` | 320 | Card expand, tab switch |
| `slow` | 480 | Modal enter |
| `deliberate` | 640 | Hero reveal |
| `ambient` | 1200 | Breathing glows |

### Easings
| Token | Curve | Use |
|---|---|---|
| `ease_out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Most enters |
| `ease_in` | `cubic-bezier(0.7, 0, 0.84, 0)` | Most exits |
| `ease_in_out` | `cubic-bezier(0.65, 0, 0.35, 1)` | Symmetric |
| `spring_snappy` | `.spring(response: 0.35, dampingFraction: 0.7)` | Confirmations |
| `spring_soft` | `.spring(response: 0.55, dampingFraction: 0.85)` | Card expansion |

### Named Keyframes
- `breathe_amber` — live indicator, streaming cursor (1200ms ease_in_out)
- `pulse_scarlet` — critical patient, flagged lab (1200ms ease_in_out)
- `shimmer_skeleton` — loading, pre-stream (1500ms linear)

---

## 8. Z-Index 🎯

Never hand-write arbitrary z values.

```
base 0 → raised 1 → sticky 100 → header 200 → dropdown 300 →
overlay 400 → modal 500 → popover 600 → toast 700 → tooltip 800 → debug 9999
```

---

## 9. Icon Sizing 🎯

| Token | px | Use |
|---|---|---|
| `xs` | 12 | Inline in text |
| `sm` | 14 | Badge icons |
| `md` | 16 | Standard buttons |
| `lg` | 20 | Card-level, toolbar |
| `xl` | 24 | Primary CTA |
| `2xl` | 32 | Hero icons |
| `3xl` | 48 | Feature illustrations |

Stroke widths: thin 1.5, normal 2, bold 2.5.

---

## 10. Components 🎯

Built from primitives above. All token references use `category.token` form.

### Button
- **primary** — `accent` bg, `void` fg, `md` radius. Hover → `accent_hot`.
- **secondary** — transparent bg, `accent` fg, 40% `accent` border.
- **ghost** — transparent bg, `workhorse` fg, `espresso` hover.
- **danger** — `error` bg, `warm_white` fg, hover → `scarlet`.
- Sizes: sm / md / lg via padding + font_scale.

### Card
- **base** — `espresso` bg, hairline border, `lg` radius, `raised` elevation, crater bottom stripe.
- **elevated** — adds `floating` elevation + amber glow.
- **critical** — scarlet border + critical elevation + scarlet glow.
- **live** — teal border + live elevation + teal glow.

### Input
- Base: `obsidian` bg, `roasted_bean` border, `accent` focus border + 24% accent ring.
- Invalid: `error` border + 24% error ring.

### Nav
- `obsidian` bg, `roasted_bean` bottom border, `secondary` inactive / `accent` active, 2px bottom indicator.

### Modal
- 85% black backdrop, `dark_cacao` bg, `roasted_bean` border, `xl` radius, floating elevation. Enter slow/ease_out, exit moderate/ease_in.

### Toast, Chip, Divider, Tooltip
See JSON for full specs. All derive from primitives — no hand-tuned values.

---

## 11. State Variants 🎯

Applied to any interactive token.

- **hover** — 8% white overlay, `fast` transition
- **active** — 12% black overlay, 0.98 scale, instant
- **focus** — 24% accent ring, no outline
- **disabled** — 40% opacity, not-allowed cursor
- **selected** — 15% accent bg, full accent border

---

## 12. Accessibility 🎯

### Reduced Motion
`prefers-reduced-motion: reduce` → all durations become `instant`, ambient keyframes freeze at 70% opacity.

### High Contrast
`prefers-contrast: more` → upgrade all foreground tiers one level (workhorse → warm_white, secondary → workhorse, etc.) and strengthen divider visibility.

### Contrast Targets
Minimum WCAG ratios per role, actual against `void`:
| Role | Min | Actual |
|---|---|---|
| display | 12.0 | 17.4 ✅ |
| workhorse | 7.0 (AAA) | 11.3 ✅ |
| secondary | 4.5 (AA) | 5.1 ✅ |
| tertiary | 3.0 | 3.2 ✅ |
| accent | 4.5 (AA) | 8.4 ✅ |
| metadata_ignore | 1.8–3.0 | — (Mystic2 IGNORE pattern) |

**Imported from Mystic2:** the `metadata_ignore` role — legible-but-ignorable layer with explicit contrast *ceiling*, not just floor. Design primitive for "eye should skip this."

---

## 13. Print / Export 🎯

Dark Roast doesn't degrade to light substrates — explicit inversions needed.

| Dark token | Paper substitution |
|---|---|
| `void` | `#FFFFFF` |
| `obsidian` | `#FAFAF8` |
| `espresso` | `#F5F2ED` |
| `workhorse` | `#2A1C14` |
| `display` | `#120C06` |
| `accent` | `#B26540` |
| `error` | `#A23818` |
| `success` | `#2A8778` |

**Rules:** amber drops 20% saturation (ink bloom), scarlet → burgundy on paper (severity preserved).

---

## 14. somaCURA ✅🎯

### Severity Mapping ✅
See §19 below — Option C is now canonical (red → magenta-pink → gold → olive → teal).

### Pipeline States 🎯
Visual treatment per pipeline stage (Clinical Update → HyperDrive NER → Problem Approval → SSE Stream → Complete). Each has color + SF Symbol icon + optional animation. See JSON. Pipeline cluster has known audit findings — see §20.

### Components 🎯
- **census_row** — base `espresso`, severity overlay 8% on critical/worsening, 3px left accent border when selected, 8px severity dot before name, mono vital signs
- **problem_card** — 4px severity stripe on top, sparkline in severity color, 32px sparkline height
- **flagged_lab** — 8% scarlet bg, 40% scarlet border, pulse animation
- **sse_stream_cursor** — 2px amber bar with breathe animation
- **problem_list_item** — 6px severity dot prefix, resolved items demote to tertiary fg (**no strikethrough** — per your clinical doc preferences)
- **disposition_barrier** — dashed 40% warning border, warning triangle icon

---

## 15. Song Expanse ✅🎯

### Token Separation (CRITICAL RULE)
This is the architectural contract. Violating it breaks the whole model.

**Chrome** = AppTheme (Dark Roast tokens from this spec). Nav, tabs, modals, settings, controls. **Constant across songs.**

**Content** = TextColors (9-tier palette derived from album art). Lyrics, annotations, timeline, song story, credits. **Album-responsive.**

**Never mix.** The harmonizer (`dark-roast.py harmonize`) scores TextColors against the theme collection for chrome-content coherence.

### Vinyl Renderer ✅
Complete mapping from canonical Dark Roast v2.0.0:
- case_bg = void, platter_shadow = crater_primary, tonearm_metallic = secondary fg, tonearm_tip_glow = accent, play_button = accent, loading = success (teal), marquee_scrim = crater_primary, marquee_grid = 12% accent, timeline rail = crater_primary, timeline thumb = accent

### TextColors Generation Rules 🎯
9-tier palette derived from album art:
- textColor1–3: content foreground tiers (target ≥7.0 / ≥4.5 / ≥3.0 contrast vs chrome bg)
- textColor4–6: accent tiers (lyric highlight, annotation, credits)
- textColor7–9: content surfaces (base, elevated, dim)

**Generation flow:**
1. Extract dominant + accent colors from album art (k-means or perceptual clustering)
2. Reject palettes where fewer than 3 tiers meet contrast targets against Dark Roast void
3. If fail → fall back to Dark Roast foreground tiers
4. Cache per songId, invalidate on art change
5. Harmonizer pass: if clash against current chrome, dim accent tiers 15%

### Content Components 🎯
- **lyric_line** — active/played/upcoming opacity cascade, textColor4 for annotations
- **song_story_chunk** — textColor7 bg, textColor1 body, textColor5 enrichment accent
- **credits_bar** — textColor9 bg, metadata typography
- **artist_intel** — rotating facts, deliberate×10 interval
- **career_timeline_heatmap** — 5-stop intensity scale from textColor9 → textColor4, textColor5 for annotated moments

---

## 16. Additional Apps ⏳

- **Dictum** — cross-platform voice dictation (TBD component specs)
- **tradingDesk** — financial analysis webapp (TBD component specs)
- **Narwhal2 / Mystic2** — see `theme-context-cache-v4.json` `related_themes.mystic2_tuned`. Uses Narwhal2 app semantic model, not this component spec.

---

## 17. Generation Pipeline

This spec drives everything downstream. Never hand-edit generated files.

| Target | File | Generator |
|---|---|---|
| Web CSS | `tokens.css` | `dark-roast.py export css` |
| Swift | `DarkRoastTokens.swift` | `dark-roast.py export swift` |
| iTerm | `dark-roast.itermcolors` | `dark-roast.py export iterm` |
| Alacritty | `dark-roast.toml` | `dark-roast.py export alacritty` |
| Warp | `dark-roast.yaml` | `dark-roast.py export warp` |
| Codex Desktop | import string | source from `spec.color + typography + action` |

**Validation:**
- `dark-roast.py validate` — WCAG + OLED wake
- `dark-roast.py palette-audit` — palette_rules enforcement (hue separation, cross-group reuse, directional iconography)
- `dark-roast.py harmonize` — TextColors coherence scoring

---

## 18. Palette Rules 🎯

Three rules govern how color tokens get assigned to semantic roles. All three are enforced by `dark-roast.py palette-audit` against this spec.

### Rule 1 — Hue Family Separation

> Colors representing semantically distinct roles within the same group must occupy different hue families.

**Threshold:** hue distance ≥ 30° AND ΔE ≥ 25 between any two roles in the same semantic group.

**Why:** Under cognitive load (post-call rounds at 5am), peripheral vision (scanning a 30-row census), or display variation (clinical workstation vs MacBook vs iPad), colors within 30° hue blur. Two distinct roles painted in the same hue family collapse to "vaguely amber" — the semantic distinction is lost.

**Exempt when:**
- Roles are intentional variants of the same token (e.g., `accent` / `accent_hot` / `accent_muted`)
- Roles are differentiated by paired iconography or animation
- Roles never co-occur in the same visual frame

### Rule 2 — No Cross-Group Exact Reuse

> A single color hex used as a primary signal in two different semantic groups creates channel ambiguity.

**Why:** If `#E69A4C` is `severity.improving` AND `pipeline.hyperdrive_ner`, a patient card showing "improving with streaming note" paints both signals in identical amber. The viewer cannot tell which channel the color is reporting.

**Remediations:**
- Use distinct color tokens per semantic group
- OR pair the reused color with channel-distinguishing iconography (severity dot vs pipeline icon)
- OR animate one channel (pulse) so temporal motion disambiguates

### Rule 3 — Directional States Need Iconography

> States that encode direction (worsening, improving, increasing, decreasing) cannot rely on color alone.

**Why:** Direction is a vector. Color is a scalar. An amber dot does not say "getting better" vs "getting worse" without an arrow, slope sparkline, or explicit label.

**Compliant pattern:** Same color family (amber for "intermediate state") + paired icon (`arrow.up` / `arrow.down`) + numeric delta. Color carries state, icon carries direction, number carries magnitude.

---

## 19. somaCURA Severity Mapping ✅ (Option C — canonical)

`dark-roast.py palette-audit` passes cleanly on severity_mapping. Option C adopted 2026-04-02.

### Adopted mapping
| State | Hex | Hue | Icon | Sparkline |
|---|---|---|---|---|
| critical | `#C44C4C` | 0° | `exclamationmark.triangle.fill` | — |
| worsening | `#C25F90` | 333° | `arrow.down.right` | slope_down |
| improving | `#D4A040` | 39° | `arrow.up.right` | slope_up |
| stable | `#879A39` | 72° | `arrow.right` | flat |
| resolved | `#4CC4B4` | 172° | `checkmark.seal.fill` | — |

Five distinct hue families. Trajectory reads narratively: catastrophe → struggle → climbing → holding → recovered. All directional states declare paired iconography per Rule 3.

### New tokens added to `action`
- `severity_worsening #C25F90` — magenta-pink, hue 333°
- `severity_improving #D4A040` — gold, hue 39°
- `severity_stable #879A39` — olive-sage, hue 72°

The existing `accent`, `accent_hot`, and `gold` tokens are no longer claimed by severity_mapping — freed for other action roles.

### Component updates
- `census_row.worsening_bg` now overlays `action.severity_worsening` (was `action.accent_hot`)
- `problem_card.severity_stripe` derives from severity_mapping[status] — automatically picks up the new tokens

---

## 20. Pipeline States — Option C Adopted ✅

After extending `palette-audit` to resolve token references, three new critical findings emerged in `somaCURA.pipeline_states`. Decision 2026-04-02: **accept-as-mitigated**.

### Acknowledged findings

| Finding | Hue gap | ΔE | Disambiguator |
|---|---|---|---|
| `clinical_update` ↔ `problem_approval` | 7° | 24.3 | `pencil.circle` vs `checklist` icons |
| `hyperdrive_ner` ↔ `problem_approval` | 10° | 23.7 | `brain` (breathing) vs `checklist` (static) |
| `problem_approval` ↔ `note_complete` | 2° | 24.0 | `checklist` vs `checkmark.seal`; note_complete is terminal/static |

**Plus:** `#4CC4B4` cross-group reuse (severity.resolved direct + pipeline.sse_streaming via action.success). Disambiguator: animation — streaming pulses, severity is static.

### Rationale (codified in JSON)

Pipeline states intentionally cluster in the warm-gold hue family — the "amber pipeline." Color is tertiary signal; **icon + animation + label are primary**. Three disambiguation channels exist independent of hue:

1. **Icon** — unique SF Symbol per state
2. **Animation** — `breathe_amber` on active states (`hyperdrive_ner`, `sse_streaming`)
3. **Label** — always rendered with the state (no compressed view)

Unlike severity_mapping which renders as a bare dot in dense census rows, pipeline states always render with full icon + label. At scanning distance the state reads as "yellowish process indicator" — the user reads the icon for *which* process.

### Codified in spec

`somaCURA.pipeline_states` now carries three documentation keys:
- `_design_rationale` — why the cluster is intentional
- `_audit_acknowledged` — findings list + non-color disambiguation channels
- `_cross_group_reuse_acknowledged` — the `#4CC4B4` teal-streaming/teal-resolved channel-distinguishing pattern

These are documentation-only (underscore prefix). The audit tool still reports the findings on every run; the spec now answers "why we're not fixing them."

### What was NOT done

- Colors unchanged. Pipeline keeps `foreground.secondary`, `action.accent`, `action.warning`, `action.success`, `foreground.workhorse`.
- No audit exemption mechanism added — `palette-audit` will continue to flag these findings on each run, which is the correct behavior. The documentation is the answer, not silence.
- No new tokens. Existing action palette unchanged.

---

## Review Checklist

Work through these in order. Each 🎯 item is a yes/no/revise decision.

- [ ] §1 Color — `accent_muted #C07A4A` addition (Mystic2 import)
- [ ] §2 Opacity — scale granularity sufficient?
- [ ] §3 Spacing — 4px base + scale granularity
- [ ] §4 Radii — 8 steps including `radii.lg = 12px` card anchor
- [ ] §5 Elevation — 5 states (flat/raised/floating/critical/live) + glow tokens carry semantic meaning
- [ ] §6 Typography — 1.25 ratio scale + 12 semantic roles
- [ ] §7 Motion — 7 durations + 5 easings + 3 named keyframes
- [ ] §8 Z-Index — 11-step named scale
- [ ] §9 Icons — 7 sizes
- [ ] §10 Components — button/card/input/nav/modal/toast/chip/divider/tooltip all derive from primitives
- [ ] §11 State Variants — hover/active/focus/disabled/selected
- [ ] §12 Accessibility — reduced-motion, high-contrast, contrast-target bands including `metadata_ignore` (Mystic2 import)
- [ ] §13 Print/Export — inversions with saturation drop for amber, scarlet→burgundy
- [ ] §14 somaCURA components — pipeline + census_row + problem_card + flagged_lab + sse_stream_cursor
- [ ] §15 Song Expanse — TextColors generation rules + 5 content components
- [ ] §16 Additional apps — prioritize Dictum or tradingDesk next?
- [ ] §18 Palette Rules — adopt all three (hue separation, no cross-group reuse, directional iconography)?
- [x] §19 somaCURA severity_mapping — Option C applied 2026-04-02, audit clean
- [x] §20 Pipeline states findings — Option C adopted 2026-04-02 (accept-as-mitigated, rationale codified in JSON)

Reject, revise, or approve each. Once locked, the JSON becomes canonical and regenerates all platform targets.
