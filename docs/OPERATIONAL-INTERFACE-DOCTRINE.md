# Operational Interface Doctrine

**Version:** 0.1.0  
**Status:** APPROVED ARCHITECTURE  
**Date:** 2026-08-25  
**Repository role:** Dark Roast is the first reference implementation; the doctrine is theme-neutral.  
**Compatibility:** Additive to the existing Dark Roast token, theme, editor, terminal, and platform contracts.

---

## 1. Purpose

Operational software is an instrument, not a brochure. Every surface must preserve context, expose meaningful state, represent uncertainty honestly, and make the next safe action legible.

A successful operational interface lets the user answer four questions without reconstructing the application in their head:

1. Where am I?
2. What changed?
3. What matters now?
4. What can I do about it?

This doctrine governs the architecture beneath Dark Roast product interfaces. It is not another palette, theme variant, component catalog, or product-specific widget. It defines the semantic contracts, structural primitives, composition recipes, state model, truth model, validation system, and promotion rules that make visual patterns portable across somaNotes, somaCURA, MailMind, investment tooling, transfer-center systems, and future products.

Dark Roast supplies one excellent visual implementation. Products may replace that implementation without replacing the architecture.

---

## 2. Normative language

The terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

- **MUST / MUST NOT:** enforced invariant or required acceptance gate.
- **SHOULD / SHOULD NOT:** default rule; exceptions require an explicit reason in code review or the pattern study.
- **MAY:** permitted but not required.

A rule that cannot be enforced is guidance, not law. Stable doctrine rules MUST have at least one executable check, generated contract, behavioral test, or visual proof fixture.

---

## 3. Scope

The doctrine owns:

- Theme-neutral semantic UI roles
- Orthogonal state axes
- Truth, provenance, freshness, certainty, and completeness semantics
- Layout and surface primitives
- Composition recipes
- Responsive and density contracts
- Interaction, keyboard, focus, and motion rules
- Async rendering states
- Adapter boundaries for frameworks and native platforms
- Static, behavioral, accessibility, contrast, and visual validation
- Pattern-study provenance and promotion
- Versioning of public interface contracts

The doctrine does not own:

- Business logic
- Clinical definitions or thresholds
- Product navigation architecture
- Data fetching
- Domain wording
- Patient, email, investment, agent, or transfer semantics
- A generic component library for every HTML element
- A global CSS reset
- Runtime dependence on React or another framework
- Product identity, illustration, mascots, or copied source assets

---

## 4. Architectural layers

The dependency direction is one-way:

```text
Doctrine
  -> Contract manifest
    -> Semantic contracts
      -> Structural primitives
        -> Composition recipes
          -> Domain adapters
            -> Product assemblies
              -> Proof system
```

Dark Roast participates as a reference mapping:

```text
Dark Roast palette primitives
  -> Dark Roast semantic mapping
    -> Operational Interface semantic contract
      -> Theme-neutral primitives and recipes
```

Higher layers MUST NOT leak into lower layers. A primitive cannot contain product terminology. A recipe cannot consume clinical concepts. A semantic contract cannot depend on a React component.

---

## 5. Prime laws

### 5.1 Meaning precedes pigment

Color, shadow, radius, and motion may express meaning. They MUST NOT define meaning.

Recipes and primitives consume semantic roles such as:

```css
--oi-surface-raised
--oi-text-primary
--oi-status-positive
--oi-status-critical
```

They MUST NOT consume palette primitives such as:

```css
--dr-espresso
--dr-crema
--dr-teal
--dr-scarlet
```

The Dark Roast mapping may consume `--dr-*` primitives to assign `--oi-*` semantic roles. Nothing above the mapping layer may do so.

### 5.2 Hierarchy is structural

Hierarchy is created through order, grouping, persistence, surface containment, contrast, spacing, typography, and disclosure. Font size alone is not information architecture.

Operational scan order SHOULD follow:

```text
Context
  -> Current signal
    -> Primary measure or action
      -> Explanation and contributing factors
        -> History
          -> Configuration
```

Critical information MUST NOT exist only behind disclosure. Collapse the tail, never the head.

### 5.3 State is orthogonal

The generic `data-state` attribute is prohibited in stable doctrine code. It collapses unrelated dimensions and inevitably becomes a semantic junk drawer.

State MUST be represented on named axes. Loading is not severity. Staleness is not warning. Selection is not emphasis. Certainty is not freshness.

### 5.4 Truth is visible

Interfaces that synthesize, infer, transform, or generate information MUST represent source, freshness, certainty, and completeness when those properties affect interpretation or action.

A polished inferred answer MUST NOT visually masquerade as confirmed source data.

Color may reinforce truth semantics but MUST NOT carry them alone. Text, iconography, position, labels, accessible names, or interaction MUST provide redundant encoding.

### 5.5 Surface depth encodes relationship

Surface levels are semantic:

```text
canvas       application environment
base         primary working surface
raised       independently responsible contained region
interactive  selectable or actionable surface
inset        recessed focus, evidence, visualization, or inspection region
overlay      temporarily elevated interaction requiring attention
scrim        temporary context-preserving occlusion
```

Rules:

- Tonal separation and borders precede shadows.
- Generic surfaces MUST NOT glow.
- Glow is reserved for focus, active computation, live status, or exceptional severity.
- Translucency is used only when underlying context must remain perceptible.
- Visible surface nesting SHOULD NOT exceed three levels.
- Every surface MUST have one clear responsibility.

### 5.6 Density is engineered

Density is a coordinated mode, not scattered local padding.

Supported density values are `compact`, `standard`, and `spacious`. Components declare which values they support.

Density controls spacing, type scale, control chrome, disclosure, information count, and visible geometry. Physical pointer and touch targets MUST remain adequate even when visual chrome is compact.

Local variants named `tiny`, `mini`, `extra-compact`, or equivalent are prohibited unless promoted into the contract as a new system density.

### 5.7 Parents own layout

Parents own relationships between children. Children MUST NOT position themselves in unknown parents through external margins.

Layout primitives own `gap`, alignment, wrapping, tracks, and region relationships. Components own internal geometry only.

Every layout decision must have one owner.

### 5.8 Responsiveness is local

Recipes and primitives respond to their allocated container, not the global viewport. Container queries are the default mechanism.

Every stable recipe declares:

- Minimum viable width
- Preferred width
- Wide-layout threshold
- Overflow behavior
- Truncation behavior
- Optional-slot collapse behavior
- Density behavior

Viewport breakpoints belong to application shells. Component adaptation belongs to the component.

### 5.9 Interaction is explicit

Every interactive primitive defines default, hover, focus-visible, pressed, selected, disabled, busy, and error behavior when applicable.

Interaction state uses native semantics wherever possible:

- `:hover`
- `:focus-visible`
- `:active`
- `aria-selected`
- `aria-current`
- `aria-expanded`
- `aria-disabled`
- `aria-busy`

Selection and focus MUST NOT be conflated. Busy and disabled MUST NOT be conflated. A loading action MUST preserve its geometry. Focus MUST survive asynchronous rerenders.

### 5.10 Motion earns every frame

Motion is allowed only for orientation, causality, continuity, or urgency.

Default duration bands:

```text
micro interaction      100-180 ms
structural transition  180-320 ms
ambient live process   explicit, bounded, and state-dependent
```

Infinite animation is allowed only for a genuinely active or live process. Critical animation MUST NOT pulse forever at maximum intensity.

Reduced-motion mode MUST preserve the communicated state through static indicators, instant transitions, contrast, iconography, or text.

### 5.11 Async state is architecture

Every data-bearing surface defines the applicable subset of:

```text
unrequested
loading
partial
ready
refreshing
stale
failed
unavailable
empty
```

Rules:

- Refreshing preserves existing data.
- Stale data remains visible and is marked stale.
- Partial data never presents as complete.
- Failure is localized to the smallest responsible region.
- Recovery is visible and actionable.
- Loading avoids preventable layout collapse.
- Empty is not loading.
- Missing is not zero.
- Unknown is not normal.
- Optimistic updates are allowed only when rollback is safe and intelligible.

### 5.12 Domain semantics stay at the edge

The doctrine understands severity, freshness, certainty, completeness, activity, emphasis, selection, and priority. It does not understand deteriorating patients, critical potassium, urgent email, portfolio drawdown, Claude usage, or transfer acceptance.

Domain adapters translate product meaning into doctrine axes. The product owns the mapping and the doctrine owns representation.

### 5.13 Primitives describe responsibility

A primitive qualifies only when it owns a stable responsibility. Repeated CSS is not sufficient justification.

A new primitive requires evidence that existing primitives cannot express the responsibility cleanly.

### 5.14 Recipes encode composition

Recipes are the primary unit of reusable design intelligence. A recipe defines region order, slot anatomy, relationships, density, responsive transformation, surface nesting, optionality, overflow, and disclosure.

A recipe MUST NOT define business logic, product actions, data fetching, domain language, or palette selection.

### 5.15 Stable contract, replaceable implementation

Public contracts include semantic token names, primitive names, recipe names, slot names, state axes, attribute values, keyboard behavior, and accessibility behavior.

Private implementation includes exact gradients, shadow formulas, internal selectors, animation internals, and layout algorithms.

Consumers must be able to upgrade private implementation without rewriting product semantics or domain mappings.

### 5.16 Doctrine is executable

Stable laws MUST be represented by generated contracts, validators, tests, or proof fixtures. Prose without enforcement is not sufficient for stable status.

---

## 6. Public naming contract

The doctrine uses the neutral `oi` namespace.

```text
CSS classes          .oi-*
CSS variables        --oi-*
HTML data axes       data-oi-*
Recipe slots         data-oi-slot="*"
TypeScript types     Oi*
Swift types          OI*
```

Examples:

```html
<section
  class="oi-surface oi-recipe-compact-monitor"
  data-oi-activity="refreshing"
  data-oi-severity="warning"
  data-oi-freshness="stale"
  data-oi-certainty="inferred"
  data-oi-completeness="partial"
  data-oi-emphasis="strong"
  data-oi-density="compact"
  aria-busy="true"
>
```

```css
.oi-root {
  --oi-surface-canvas: var(--dr-void);
  --oi-surface-base: var(--dr-obsidian);
  --oi-surface-raised: var(--dr-dark-cacao);
  --oi-surface-interactive: var(--dr-espresso);
  --oi-surface-hover: var(--dr-espresso-hover);
  --oi-surface-inset: var(--dr-void);

  --oi-text-primary: var(--dr-crema);
  --oi-text-body: var(--dr-bone);
  --oi-text-muted: var(--dr-mocha);

  --oi-border-subtle: var(--dr-divider);
  --oi-border-default: var(--dr-crater-deep);
  --oi-border-strong: var(--dr-crater);

  --oi-accent: var(--dr-amber);
  --oi-status-live: var(--dr-teal);
  --oi-status-positive: var(--dr-teal);
  --oi-status-warning: var(--dr-brass);
  --oi-status-negative: var(--dr-burnt-sienna);
  --oi-status-critical: var(--dr-scarlet);
}
```

The semantic contract and the Dark Roast mapping are separate artifacts. Products may provide their own mapping without importing Dark Roast colors.

---

## 7. Canonical state axes

### 7.1 Activity

```text
idle
loading
refreshing
live
complete
failed
```

Activity describes process state only. `loading` and `refreshing` SHOULD also set `aria-busy="true"` on the responsible region.

### 7.2 Severity

```text
neutral
informational
positive
warning
negative
critical
```

Severity describes consequence or urgency. It does not describe freshness, certainty, process state, or selection.

### 7.3 Freshness

```text
live
recent
stale
unknown
```

Freshness MUST be accompanied by a timestamp, age, or accessible textual label when it can alter a user decision.

### 7.4 Certainty

```text
confirmed
inferred
uncertain
disputed
```

`disputed` means authoritative inputs conflict. It is not equivalent to low model confidence.

### 7.5 Completeness

```text
complete
partial
missing
unavailable
```

`missing` means expected data is absent. `unavailable` means the source cannot currently be accessed or evaluated.

### 7.6 Emphasis

```text
quiet
normal
strong
```

Emphasis controls visual priority within a surface. It MUST NOT change semantic severity.

### 7.7 Density

```text
compact
standard
spacious
```

Density is inherited unless a recipe explicitly creates a density boundary.

### 7.8 Unknown values

Stable runtime adapters MUST reject unknown values during development. Production CSS MUST fall back to neutral presentation rather than accidentally assigning warning or critical semantics.

---

## 8. Truth and provenance contract

Information that is synthesized or operationally consequential SHOULD expose the applicable subset of:

```text
source
  direct
  derived
  generated
  user-entered
  external

freshness
  live
  recent
  stale
  unknown

certainty
  confirmed
  inferred
  uncertain
  disputed

completeness
  complete
  partial
  missing
  unavailable
```

A truth-bearing primitive MUST provide a non-color channel for any truth property it renders. Acceptable channels include visible text, icon plus accessible name, tooltip paired with persistent marker, or expandable provenance detail.

Tooltips alone are insufficient for critical truth state.

---

## 9. Initial structural primitives

The first implementation contains exactly ten primitives.

| Primitive | Responsibility | Required semantics |
|---|---|---|
| `surface` | Containment, background, border, elevation, clipping | Surface level and optional emphasis/severity |
| `stack` | Vertical rhythm | Parent-owned gap and alignment |
| `cluster` | Inline grouping and wrapping | Gap, alignment, and wrap policy |
| `rail` | Fixed/fluid column relationship | Rail side, minimum content width, collapse rule |
| `inset` | Recessed focus/evidence/visualization region | Surface level `inset`; overflow policy |
| `divider` | Structural separation | Orientation and semantic/decorative status |
| `metric` | Label, value, unit, trend, provenance alignment | Tabular value option; truth axes where applicable |
| `meter` | Normalized quantitative progress | Accessible minimum, maximum, current value, label |
| `disclosure` | Expandable content structure | Button ownership, `aria-expanded`, focus behavior |
| `history-strip` | Compact temporal distribution | Accessible summary and temporal ordering |

Primitive CSS MUST remain domain-neutral. Primitive JavaScript is allowed only where native HTML cannot satisfy the interaction contract.

---

## 10. Recipe model

### 10.1 Recipe contract

Every recipe declares:

- Stability: `study`, `candidate`, `experimental`, `proven`, `stable`, or `deprecated`
- Required and optional slots
- Slot order
- Supported state axes
- Supported densities
- Minimum viable width
- Preferred width
- Wide-layout threshold
- Overflow and truncation behavior
- Async-state behavior
- Keyboard and focus behavior
- Proof fixtures

### 10.2 Compact monitor

`compact-monitor` is the first experimental recipe.

Slot order:

```text
context      optional
 actions     optional, shares header region with context
 focus       optional
 status      required
 primary     required
 details     optional
 history     optional
 settings    optional, not part of the default scan path
```

DOM contract:

```html
<section class="oi-recipe-compact-monitor" data-oi-density="compact">
  <header class="oi-recipe-compact-monitor__chrome">
    <div data-oi-slot="context"></div>
    <div data-oi-slot="actions"></div>
  </header>

  <div class="oi-inset" data-oi-slot="focus"></div>
  <div data-oi-slot="status"></div>
  <div data-oi-slot="primary"></div>
  <div data-oi-slot="details"></div>
  <div data-oi-slot="history"></div>
  <div data-oi-slot="settings"></div>
</section>
```

Invariants:

- `status` and `primary` are always visible.
- `details` and `history` may use disclosure.
- `settings` is separated from the operational scan path.
- Missing optional slots collapse without empty spacing.
- The recipe does not prescribe domain labels or data sources.
- Narrow layout is one column.
- Wide layout may place primary metrics in multiple columns while retaining DOM order.
- Refreshing retains primary data and marks freshness/activity.
- Failed detail regions do not erase healthy primary regions.

The recipe remains experimental until it survives one real product integration and the complete proof matrix. Stable promotion requires a second materially different use or an explicit architecture review accepting one high-stakes consumer as sufficient evidence.

### 10.3 Candidate recipes

The following names are reserved as candidates but are not public contracts until separately designed and proven:

- `dense-inspector`
- `operational-summary`
- `contextual-sidebar`

Reserved names prevent competing implementations while avoiding premature API promises.

---

## 11. CSS architecture

The system uses cascade layers:

```css
@layer oi.mapping;
@layer oi.contracts;
@layer oi.primitives;
@layer oi.recipes;
@layer oi.utilities;
@layer product;
```

Dependency rules:

```text
mapping    may reference palette/foundation tokens
contracts  may reference semantic variables only
primitives may reference contracts
recipes    may reference contracts and primitives
utilities  may reference contracts and primitives
product    may override semantic contracts and documented recipe hooks
```

Additional rules:

- The kernel ships no global reset.
- `!important` is prohibited outside forced-colors and explicit accessibility overrides.
- ID selectors are prohibited.
- Selectors coupled to DOM depth are prohibited.
- Public selectors are documented and versioned.
- Recipes expose a small documented set of override variables; arbitrary internal hooks are not public API.
- Raw color literals are prohibited outside token sources, semantic mappings, test fixtures, and documented source studies.
- External margins on primitives are prohibited.

---

## 12. Runtime and adapter boundary

CSS and semantic DOM contracts are canonical for web. Framework adapters provide typed convenience only.

```text
CSS owns visual implementation and responsive layout.
HTML owns semantic structure.
Small headless helpers own behavior not provided by native HTML.
React wrappers own typed composition, not design truth.
SwiftUI adapters implement the same manifest natively.
```

The initial runtime is limited to:

- Disclosure coordination when native `<details>` is insufficient
- Roving focus for composite widgets
- Development-only contract assertions

No runtime network dependency is allowed.

React adapters MUST remain removable without changing the CSS, slot, state, or accessibility contract.

SwiftUI generation begins only after the web contract survives a real integration. Native implementation MUST use generated semantic tokens and enums, not runtime CSS translation.

---

## 13. Contract manifest

`src/system/contract.json` is the machine-readable source of truth for:

- Doctrine contract version
- Stable and experimental state axes
- Semantic role names
- Primitive names and supported axes
- Recipe names, stability, slots, and densities
- Public attribute names
- Generated adapter type names

`src/system/contract.schema.json` validates the manifest itself.

Illustrative shape:

```json
{
  "name": "operational-interface-doctrine",
  "version": "0.1.0",
  "axes": {
    "activity": ["idle", "loading", "refreshing", "live", "complete", "failed"],
    "severity": ["neutral", "informational", "positive", "warning", "negative", "critical"],
    "freshness": ["live", "recent", "stale", "unknown"],
    "certainty": ["confirmed", "inferred", "uncertain", "disputed"],
    "completeness": ["complete", "partial", "missing", "unavailable"],
    "emphasis": ["quiet", "normal", "strong"],
    "density": ["compact", "standard", "spacious"]
  },
  "recipes": {
    "compact-monitor": {
      "stability": "experimental",
      "requiredSlots": ["status", "primary"],
      "optionalSlots": ["context", "actions", "focus", "details", "history", "settings"],
      "supportedDensities": ["compact", "standard"]
    }
  }
}
```

Generated artifacts include:

- TypeScript string-literal unions and interfaces
- Swift enums after native adoption begins
- Development assertions
- Reference tables for documentation
- Fixture matrices
- Published contract JSON

CSS layout remains hand-authored. The generator produces contracts and repetitive bindings, not opaque generated layout code.

---

## 14. Repository architecture

```text
docs/
  OPERATIONAL-INTERFACE-DOCTRINE.md

src/system/
  contract.json
  contract.schema.json

  mappings/
    dark-roast.css

  contracts/
    surfaces.css
    text.css
    interaction.css
    state.css
    truth.css
    density.css
    motion.css

  primitives/
    surface.css
    stack.css
    cluster.css
    rail.css
    inset.css
    divider.css
    metric.css
    meter.css
    disclosure.css
    history-strip.css

  recipes/
    compact-monitor.css

  runtime/
    disclosure.js
    roving-focus.js
    contract-assertions.js

  studies/
    claude-usage-monitor.md

src/adapters/
  react/
  swiftui/

scripts/
  build-system.js
  validate-contract.js
  validate-system-css.js
  validate-system-dom.js
  generate-system-types.js

spec/system/
  primitives.html
  compact-monitor.html
  state-matrix.html
  truth-matrix.html
  async-matrix.html
  responsive-matrix.html
  cross-theme.html
```

Generated output:

```text
dist/system/
  contract.json
  contract.d.ts
  contracts.css
  primitives.css
  recipes.css
  index.css
  mappings/dark-roast.css
  recipes/compact-monitor.css
```

Potential React and Swift outputs are added only when their adapters exist.

---

## 15. Package surface

Existing exports remain unchanged. New exports are additive:

```json
{
  "./system/contract": "./dist/system/contract.json",
  "./system/types": "./dist/system/contract.d.ts",
  "./system/css": "./dist/system/index.css",
  "./system/contracts": "./dist/system/contracts.css",
  "./system/primitives": "./dist/system/primitives.css",
  "./system/recipes": "./dist/system/recipes.css",
  "./system/recipes/compact-monitor": "./dist/system/recipes/compact-monitor.css",
  "./system/mappings/dark-roast": "./dist/system/mappings/dark-roast.css"
}
```

The package remains `dark-roast-theme`. A separate package or monorepo is prohibited until at least two independent repositories require doctrine artifacts without Dark Roast assets and the split demonstrably reduces, rather than increases, maintenance.

---

## 16. Enforcement and proof system

### 16.1 Static contract checks

The build fails on:

- Invalid contract manifest
- Generated contract drift
- Unknown public state values
- Raw color literals outside approved locations
- Direct `--dr-*` use in contracts, primitives, or recipes
- Product or domain vocabulary in primitives
- ID selectors
- DOM-depth-dependent selectors
- External margins on primitives
- Undocumented public selectors
- Unsupported recipe slots
- Missing required recipe slots in fixtures
- Infinite animation without an activity/live contract
- Electron-only properties outside a dedicated adapter
- Unscoped global styles
- `!important` outside approved accessibility rules

CSS validation MUST use an AST parser rather than regular-expression-only parsing.

### 16.2 Behavioral checks

Interactive primitives prove:

- Keyboard operation
- Visible focus
- Focus retention after async updates
- Pressed and selected separation
- Disabled and busy separation
- Escape behavior where applicable
- Disclosure state synchronization
- Pointer and touch operation
- Accessible names and state announcements

### 16.3 Async checks

Data-bearing fixtures prove:

- Loading
- Partial
- Ready
- Refreshing with retained data
- Stale
- Failed
- Unavailable
- Empty

### 16.4 Visual proof matrix

Every stable recipe renders across:

```text
Themes
  Black Label
  Night Shift
  House Blend
  Alien semantic reference mapping

Widths
  narrow
  standard
  wide

Densities
  every supported density

States
  neutral
  live
  warning
  critical
  disabled
  stale
  uncertain
  partial

Accessibility
  reduced motion
  increased contrast
  forced colors
  keyboard focus
```

The alien mapping is intentionally cold, flat, and unrelated to Dark Roast. It proves that recipes consume semantic contracts rather than warm-palette assumptions.

### 16.5 Tooling

The implementation uses:

- Existing Dark Roast Node build scripts as the orchestration model
- JSON Schema validation for the contract manifest
- PostCSS AST parsing for CSS contract enforcement
- Existing APCA tooling for assigned-surface contrast checks
- Playwright for responsive, keyboard, forced-color, and screenshot fixtures
- Axe integration within Playwright for automated accessibility checks

All checks join `npm test`. Generated-file checks support `--check` and never rewrite during CI.

---

## 17. Pattern study and promotion

External designs do not move directly into stable infrastructure.

```text
study
  -> candidate
    -> experimental
      -> proven
        -> stable
          -> deprecated
```

### Study

Captures source URL, source commit or date, useful relationships, rejected source-specific elements, provenance, and legal boundary.

### Candidate

Removes source nouns and proposes a theme-neutral primitive or recipe.

### Experimental

Has a public-looking contract but no compatibility guarantee. Must be used in one real product surface.

### Proven

Survives the full proof matrix and one real product integration without product-specific leakage.

### Stable

Requires either a second materially different use or explicit architecture review accepting one high-stakes consumer as sufficient evidence. Stable contracts receive semantic-version protection.

### Deprecated

Requires a replacement, migration instructions, and a removal version before deletion.

No stable primitive or recipe is created without a real consumer.

---

## 18. Versioning

The doctrine contract has an independent semantic version recorded in `contract.json`.

For stable contracts:

- **Major:** rename or remove an axis, axis value, semantic role, primitive, recipe, slot, attribute, or required behavior; add a required slot; change meaning.
- **Minor:** add a new optional primitive, recipe, slot, semantic role, or non-breaking generated artifact.
- **Patch:** documentation clarification, validator correction, visual bug fix that preserves public behavior, or generated-output correction.

Adding a value to a stable closed axis is major because domain adapters may be exhaustive.

Experimental contracts may change without a doctrine major version but MUST be marked experimental in the manifest and release notes.

Existing Dark Roast package versioning remains authoritative for package releases. A release that changes both systems records both the package version and doctrine contract version.

---

## 19. Failure behavior

- Unknown axis values trigger development assertions and render neutral in production.
- Missing optional slots collapse without residue.
- Missing required slots fail fixtures and development assertions.
- Contract validation failure aborts generation.
- Generated drift aborts `npm test`.
- A recipe without semantic mapping remains visibly unthemed rather than silently borrowing palette defaults.
- Accessibility failures block stable promotion.
- Visual diffs require explicit baseline review; snapshots are never auto-accepted in CI.

---

## 20. Source study: Clauddy

Initial design study:

- Repository: `https://github.com/renatoaug/claude-usage-monitor`
- Reference commit: `205121163c47cda83548dde87ddba71f0ec3be5f`
- Study target: compact operational hierarchy and visual infrastructure

Extracted relationships:

- Context and compact controls precede operational content
- Recessed focal region separates live or illustrative content from metrics
- Status precedes quantitative detail
- Primary meters precede categorized breakdowns
- Progressive disclosure protects scan speed
- Compact temporal history closes the information ladder
- Tabular numerics, low-profile tracks, hairline dividers, and restrained state motion support dense reading
- Narrow, self-contained geometry demonstrates recipe portability

Explicitly excluded:

- Pixel pet and mascot identity
- SVG illustrations and scene assets
- Electron dragging, tray, window, OAuth, and source data behavior
- Source IDs, class names, application terminology, and fixed 252px geometry
- Line-for-line CSS or JavaScript copying
- Decorative source colors as semantic definitions

The study ports relationships and behavior through an independent implementation using doctrine contracts and Dark Roast tokens.

---

## 21. Agent decision protocol

Before modifying doctrine-owned UI, an agent must answer:

1. What user decision or action does this surface support?
2. Is the change a semantic contract, primitive, recipe, domain adapter, or product assembly?
3. Which existing owner already covers the responsibility?
4. Which state axes actually apply?
5. What are the source, freshness, certainty, and completeness semantics?
6. What happens while loading, refreshing, stale, partial, failed, unavailable, and empty?
7. Who owns spacing and layout?
8. What is the minimum viable container width?
9. What are the keyboard and focus contracts?
10. Which proof fixtures must change?

Hard stops:

- Do not create a primitive merely to share styling.
- Do not add a boolean when a semantic axis already expresses the state.
- Do not use palette names in reusable primitives or recipes.
- Do not hide critical information behind disclosure.
- Do not erase stale data during refresh.
- Do not express truth or certainty through color alone.
- Do not make product behavior depend on a theme.
- Do not make a framework the canonical architecture layer.
- Do not call an abstraction stable before real use and proof.

---

## 22. Named anti-patterns

### Token soup

Recipes consume palette colors and arbitrary dimensions directly.

### Variant explosion

A component accumulates overlapping booleans and local density adjectives instead of using contract axes.

### State collapse

Loading, warning, stale, selected, and critical are stuffed into one state property.

### Card lasagna

Nested surfaces substitute for meaningful grouping and hierarchy.

### Breakpoint imperialism

A component assumes the global viewport belongs to it.

### Skeleton amnesia

Refreshing discards useful existing information and replaces it with placeholders.

### Decorative urgency

Red, pulsing, or glow attracts attention without semantic justification.

### Framework captivity

The architecture exists only inside framework components.

### Generic component landfill

Small abstractions are created without a stable responsibility.

### Copy-paste theming

An attractive source is transplanted intact rather than decomposed into relationships and contracts.

---

## 23. Initial implementation tranche

The first implementation is additive and contained within `dark-roast-theme`:

1. Add `contract.json` and its schema.
2. Generate TypeScript contract types and published contract JSON.
3. Add semantic contract CSS and the separate Dark Roast mapping.
4. Add cascade-layer orchestration.
5. Implement the ten initial structural primitives.
6. Implement `compact-monitor` as experimental.
7. Add the state, truth, async, responsive, and cross-theme proof fixtures.
8. Add AST-based CSS validation, contract validation, Playwright, and axe gates.
9. Add additive package exports.
10. Integrate all new checks into `npm test` without weakening existing Black Label, variant, platform, contrast, or generated-drift gates.

No consumer repository is changed in this tranche. Product adoption is a separate implementation with its own repository inspection and public-interface review. `compact-monitor` remains experimental until that adoption succeeds.

---

## 24. Acceptance criteria

The architecture is implemented when:

- Existing Dark Roast tests remain green.
- Existing exports and visual outputs remain compatible.
- The doctrine manifest validates and generated artifacts are in sync.
- Reusable CSS contains no direct Dark Roast palette references outside the mapping file.
- All ten primitives render under Dark Roast and the alien mapping.
- `compact-monitor` satisfies required-slot, narrow/wide, density, async, state, keyboard, accessibility, contrast, and screenshot fixtures.
- Reduced motion preserves meaning.
- Forced colors remains operable.
- Unknown state values fail in development and fall back neutrally in production.
- The package tarball resolves every new subpath export without development dependencies at runtime.
- No source-specific Clauddy asset, selector, application behavior, or fixed widget geometry is shipped.

---

## 25. Locked decisions

- The doctrine is theme-neutral.
- Dark Roast is the first reference implementation.
- The public namespace is `oi`, not `dr`.
- Generic `data-state` is prohibited.
- State axes are orthogonal and closed when stable.
- Interaction uses native pseudo-classes and ARIA before custom data state.
- CSS and semantic DOM are canonical for web.
- Framework adapters are optional and subordinate.
- No global reset is added.
- No monorepo or new package is created in the first implementation.
- `compact-monitor` is experimental, not prematurely stable.
- SwiftUI follows successful web integration.
- Product adoption is separate from the kernel implementation.
- External designs enter through documented studies, not direct transplantation.
