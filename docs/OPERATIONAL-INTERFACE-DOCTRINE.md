# Operational Interface Doctrine

**Version:** 0.5.0
**Status:** APPROVED ARCHITECTURE  
**Date:** 2026-08-27
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

This doctrine governs the architecture beneath Dark Roast product interfaces. It is not another palette, theme variant, component catalog, or product-specific widget. It defines semantic contracts, structural primitives, composition recipes, state and truth models, adapter boundaries, and proof gates that make visual patterns portable across somaNotes, somaCURA, MailMind, investment tooling, transfer-center systems, and future products.

Dark Roast supplies one excellent implementation. A product may replace that implementation without replacing the architecture.

---

## 2. Normative language

The terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

- **MUST / MUST NOT:** enforced invariant or required acceptance gate.
- **SHOULD / SHOULD NOT:** default rule; an exception requires an explicit reason in code review or the pattern study.
- **MAY:** permitted but not required.

A rule that cannot be enforced is guidance, not law. Every stable doctrine rule MUST have at least one executable check, generated contract, behavioral test, or proof fixture.

---

## 3. Scope

The doctrine owns:

- Theme-neutral semantic UI roles
- Orthogonal state and truth axes
- Provenance, freshness, certainty, and completeness semantics
- Surface and layout primitives
- Composition recipes
- Responsive and density contracts
- Interaction, keyboard, focus, and motion rules
- Async rendering behavior
- Framework and native adapter boundaries
- Static, behavioral, accessibility, contrast, content-stress, and visual validation
- Pattern-study provenance and promotion
- Versioning of public interface contracts

The doctrine does not own:

- Business logic
- Clinical definitions or thresholds
- Product navigation architecture
- Data fetching
- Domain wording
- Patient, email, investment, agent, or transfer semantics
- A component wrapper for every HTML element
- A global CSS reset
- Runtime dependence on React or another framework
- Product identity, illustration, mascots, or copied source assets
- Compatibility shims for obsolete browsers

---

## 4. Architecture and dependency direction

The dependency direction is one-way:

```text
Doctrine
  -> Contract manifest
    -> Semantic contracts
      -> Structural primitives
        -> Composition recipes
          -> Domain adapters
            -> Product assemblies
```

The proof system evaluates every layer and is not itself a runtime dependency.

Dark Roast participates as a reference mapping:

```text
Dark Roast palette and foundation tokens
  -> Dark Roast semantic mapping
    -> Operational Interface semantic contract
      -> Theme-neutral primitives and recipes
```

Higher layers MUST NOT leak into lower layers. A primitive cannot contain product terminology. A recipe cannot consume clinical concepts. A semantic contract cannot depend on a React component.

---

## 5. Prime laws

### 5.1 Meaning precedes pigment

Color, shadow, radius, and motion may express meaning. They MUST NOT define meaning.

Primitives and recipes consume semantic roles such as:

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

The Dark Roast mapping may consume `--dr-*` tokens to assign `--oi-*` roles. Nothing above the mapping layer may do so.

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

The generic `data-state` attribute is prohibited in stable doctrine code. It collapses unrelated dimensions into a semantic junk drawer.

State MUST be represented on named axes. Loading is not severity. Staleness is not warning. Selection is not emphasis. Certainty is not freshness. Partial data is not a loading state.

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

### 5.6 Attention is budgeted

Attention is a finite operational resource.

- A bounded region SHOULD have one dominant accent.
- Persistent animation SHOULD be limited to one meaningful live process per visible region.
- Warning and critical treatments MUST correspond to actual consequence or urgency.
- Decorative urgency is prohibited.
- The default state SHOULD be visually calm enough that exceptional states remain exceptional.

### 5.7 Density is engineered

Density is a coordinated mode, not scattered local padding.

Supported density values are `compact`, `standard`, and `spacious`. Components declare which values they support.

Density controls spacing, type scale, control chrome, disclosure, information count, and visible geometry. Pointer targets MUST provide at least a 24 by 24 CSS pixel hit area. Touch-oriented adapters SHOULD provide at least a 44 by 44 CSS pixel hit area, even when the visible control is smaller.

Local variants named `tiny`, `mini`, `extra-compact`, or equivalent are prohibited unless promoted into the contract as a new system density.

### 5.8 Parents own layout

Parents own relationships between children. Children MUST NOT position themselves in unknown parents through external margins.

Layout primitives own `gap`, alignment, wrapping, tracks, and region relationships. Components own internal geometry only.

Every layout decision must have one owner.

### 5.9 Responsiveness is local

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

### 5.10 Interaction is explicit

Every interactive primitive defines default, hover, focus-visible, pressed, selected, disabled, busy, and error behavior when applicable.

Native semantics are authoritative:

- `:hover`
- `:focus-visible`
- `:active`
- native `disabled` and `:disabled` where supported
- `aria-selected`
- `aria-current`
- `aria-expanded`
- `aria-disabled` only when native disabling is unavailable or inappropriate
- `aria-busy`

Selection and focus MUST NOT be conflated. Busy and disabled MUST NOT be conflated. A loading action MUST preserve its geometry. Focus MUST survive asynchronous rerenders.

### 5.11 Motion earns every frame

Motion is allowed only for orientation, causality, continuity, or urgency.

Default duration bands:

```text
micro interaction      100-180 ms
structural transition  180-320 ms
ambient live process   explicit, bounded, and state-dependent
```

Infinite animation is allowed only for a genuinely active or live process. Critical animation MUST NOT pulse forever at maximum intensity.

Reduced-motion mode MUST preserve the communicated state through static indicators, instant transitions, contrast, iconography, or text.

### 5.12 Async behavior is architecture

Every data-bearing surface MUST define rendering behavior for the applicable scenarios below. These are scenario combinations, not a replacement state axis:

```text
initial request          activity=loading
successful data          activity=ready, completeness=complete
background refresh       activity=refreshing, prior data retained
live stream              activity=live
partial result           completeness=partial
stale result             freshness=stale
missing expected data    completeness=missing
source unavailable       completeness=unavailable
request failure          activity=failed
valid empty result       domain-defined empty presentation
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

### 5.13 Domain semantics stay at the edge

The doctrine understands surface, activity, severity, freshness, certainty, completeness, source, emphasis, density, and native interaction semantics. It does not understand deteriorating patients, critical potassium, urgent email, portfolio drawdown, Claude usage, or transfer acceptance.

Domain adapters translate product meaning into doctrine axes. The product owns the mapping and the doctrine owns representation.

### 5.14 Primitives describe responsibility

A primitive qualifies only when it owns a stable responsibility. Repeated CSS is not sufficient justification.

A new primitive requires evidence that existing primitives cannot express the responsibility cleanly.

### 5.15 Recipes encode composition

Recipes are the primary unit of reusable design intelligence. A recipe defines region order, slot anatomy, relationships, density, responsive transformation, surface nesting, optionality, overflow, and disclosure.

A recipe MUST NOT define business logic, product actions, data fetching, domain language, or palette selection.

### 5.16 Stable contract, replaceable implementation

Public contracts include semantic token names, primitive names, recipe names, slot names, state axes, attribute values, keyboard behavior, and accessibility behavior.

Private implementation includes exact gradients, shadow formulas, internal selectors, animation internals, and layout algorithms.

Consumers must be able to upgrade private implementation without rewriting product semantics or domain mappings.

### 5.17 Doctrine is executable

Stable laws MUST be represented by generated contracts, validators, tests, or proof fixtures. Prose without enforcement is not sufficient for stable status.

---

## 6. Public naming contract

The doctrine uses the neutral `oi` namespace.

```text
CSS classes          .oi-*
CSS variables        --oi-*
HTML contract axes   data-oi-*
Recipe slots         data-oi-slot="*"
TypeScript types     Oi*
Swift types          OI*
```

Example:

```html
<section
  class="oi-surface oi-recipe-compact-monitor"
  data-oi-surface="raised"
  data-oi-activity="refreshing"
  data-oi-severity="warning"
  data-oi-freshness="stale"
  data-oi-certainty="inferred"
  data-oi-completeness="partial"
  data-oi-source="generated"
  data-oi-emphasis="strong"
  data-oi-density="compact"
  aria-busy="true"
>
```

Unknown stable-axis values MUST trigger development assertions. Production CSS falls back to neutral presentation because only known values receive semantic selectors.

---

## 7. Canonical contract axes

### 7.1 Surface

```text
canvas
base
raised
interactive
inset
overlay
scrim
```

Public attribute: `data-oi-surface`.

### 7.2 Activity

```text
idle
loading
refreshing
live
ready
failed
```

Public attribute: `data-oi-activity`.

`loading` and `refreshing` SHOULD also set `aria-busy="true"` on the responsible region.

### 7.3 Severity

```text
neutral
informational
positive
warning
negative
critical
```

Public attribute: `data-oi-severity`.

Severity describes consequence or urgency. It does not describe freshness, certainty, process state, or selection.

### 7.4 Freshness

```text
live
recent
stale
unknown
```

Public attribute: `data-oi-freshness`.

Freshness MUST be accompanied by a timestamp, age, or accessible textual label when it can alter a user decision.

### 7.5 Certainty

```text
confirmed
inferred
uncertain
disputed
```

Public attribute: `data-oi-certainty`.

`disputed` means authoritative inputs conflict. It is not equivalent to low model confidence.

### 7.6 Completeness

```text
complete
partial
missing
unavailable
```

Public attribute: `data-oi-completeness`.

`missing` means expected data is absent. `unavailable` means the source cannot currently be accessed or evaluated.

### 7.7 Source

```text
direct
derived
generated
user-entered
external
```

Public attribute: `data-oi-source`.

Source describes provenance category, not trustworthiness. Trust depends on the domain adapter and accompanying provenance detail.

### 7.8 Emphasis

```text
quiet
normal
strong
```

Public attribute: `data-oi-emphasis`.

Emphasis controls visual priority within a surface. It MUST NOT change semantic severity.

### 7.9 Density

```text
compact
standard
spacious
```

Public attribute: `data-oi-density`.

Density is inherited unless a recipe explicitly creates a density boundary.

### 7.10 Interaction

Interaction is not a custom closed axis. Native pseudo-classes, native attributes, and ARIA own interaction state. Adapters MUST NOT mirror native interaction state into redundant `data-oi-*` attributes.

---

## 8. Semantic contract

The semantic contract separates portable interface meaning from any palette or product implementation.

Required categories:

```text
surfaces
  canvas, base, raised, interactive, hover, inset, overlay, scrim

text
  primary, body, muted, inverse, link

borders
  subtle, default, strong, focus

status
  informational, positive, warning, negative, critical, live

accent
  primary, active, muted

typography
  body, heading, display, mono, mapped label/body/title/display sizes,
  compact and reading line heights

geometry
  space scale, control radius, surface radius, overlay radius

elevation
  flat, raised, overlay, live, critical

motion
  fast, normal, slow, standard easing, emphasized easing

interaction
  focus ring width, focus offset, pointer target minimum, touch target minimum
```

The semantic contract and each palette mapping are separate artifacts.

Dark Roast mapping example:

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

  --oi-accent-primary: var(--dr-amber);
  --oi-status-live: var(--dr-teal);
  --oi-status-positive: var(--dr-teal);
  --oi-status-warning: var(--dr-brass);
  --oi-status-negative: var(--dr-burnt-sienna);
  --oi-status-critical: var(--dr-scarlet);
}
```

The complete mapping is generated from the existing token source so it does not invent parallel geometry, typography, or motion values.

A product may supply a different semantic mapping without importing Dark Roast colors. Mapping validation MUST prove that every required semantic variable resolves.

---

## 9. Truth and provenance contract

Information that is synthesized or operationally consequential SHOULD expose the applicable subset of source, freshness, certainty, and completeness.

A truth-bearing primitive MUST provide a non-color channel for every truth property it renders. Acceptable channels include visible text, icon plus accessible name, persistent marker plus accessible description, or expandable provenance detail.

Tooltips alone are insufficient for critical truth state.

Domain adapters MUST define:

- Which source values can be considered authoritative
- How freshness is calculated
- What evidence distinguishes confirmed, inferred, uncertain, and disputed
- What complete means for that domain
- Which truth changes alter user action and therefore require persistent display

---

## 10. Initial structural primitives

The first implementation contains exactly ten primitives.

| Primitive | Responsibility | Required semantics |
|---|---|---|
| `surface` | Containment, background, border, elevation, clipping | `data-oi-surface`; optional emphasis and severity |
| `stack` | Vertical rhythm | Parent-owned gap and alignment |
| `cluster` | Inline grouping and wrapping | Gap, alignment, and wrap policy |
| `rail` | Fixed/fluid column relationship | Rail side, minimum content width, collapse rule |
| `inset` | Recessed focus, evidence, or visualization region | Surface level `inset`; overflow policy |
| `divider` | Structural separation | Orientation and semantic or decorative status |
| `metric` | Label, value, unit, trend, and provenance alignment | Tabular value option; truth axes where applicable |
| `meter` | Bounded scalar measurement within a known range | Native meter, visible value, accessible minimum, maximum, current value, and label; task progress uses `progress` instead |
| `disclosure` | Expandable content structure | Native `details`/`summary`; `open` owns expansion state and the browser owns focus/announcement behavior |
| `history-strip` | Compact temporal distribution | Accessible summary, temporal ordering, and non-color intensity channel |

Primitive CSS MUST remain domain-neutral. Primitive JavaScript is allowed only where native HTML cannot satisfy the interaction contract.

Primitive roots and owner-qualified parts are public contract. Parts use the
manifest-declared form `.oi-<primitive>__<part>`; arbitrary BEM elements remain
prohibited. The contract records allowed root/part elements, parentage,
cardinality, order, required and forbidden attributes, accessible-name
obligations, consumed axes, and public hooks.

The first implementation is native-first:

- `metric` uses `dl` with `dt`/`dd` parts. Non-default truth state requires a
  visible provenance part referenced by `aria-describedby`.
- `meter` retains a labelled native `meter` as the accessibility source. Its
  semantic visual track/fill is a declared presentational part because native
  browser pigment does not reliably consume theme mappings; adapters MUST derive
  native value and visual percentage from the same measurement.
- `disclosure` uses `details` with the first `summary` child and MUST NOT mirror
  native state into authored `role`, `tabindex`, or `aria-expanded` attributes.
- `history-strip` uses an accessible chronological `ol` with `li`/`time`, a
  legible non-color value with its denominator or scale context, and a
  presentational intensity bar. The bar exposes a full-range track and encodes
  intensity by filled length; hue is never the sole channel.
- `divider` uses nonfocusable `hr`; a resizable separator is a different widget.

---

## 11. Recipe model

Every recipe declares:

- Stability: `study`, `candidate`, `experimental`, `proven`, `stable`, or `deprecated`
- Required and optional slots, plus any slot-owned semantic obligations
- Slot order
- Supported axes
- Supported densities
- Minimum viable width
- Preferred width
- Wide-layout threshold
- Overflow and truncation behavior
- Async scenario behavior
- Keyboard and focus behavior
- Proof fixtures
- Public override variables

### 11.1 Compact monitor

`compact-monitor` is the first proven recipe.

Slot order:

```text
context      optional
actions      optional, shares the header region with context
focus        optional
status       required
primary      required
details      optional
history      optional
settings     optional, outside the default operational scan path
```

DOM contract:

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
    <div data-oi-slot="actions"></div>
  </header>

  <div class="oi-inset" data-oi-slot="focus"></div>
  <p id="monitor-status" data-oi-slot="status" role="status">Ready</p>
  <div data-oi-slot="primary"></div>
  <div data-oi-slot="details"></div>
  <div data-oi-slot="history"></div>
  <div data-oi-slot="settings"></div>
</section>
```

`chrome` is the recipe's only BEM part. `context` and `actions` are its optional
children; the remaining slots are direct root children. The root is a named
`section`, composes `oi-surface`, is never focusable, and requires a supported
density boundary.

Proof container widths are:

```text
minimum viable   20rem   one primary track; tested support point, never a hard min-width
preferred        36rem   two primary tracks
wide             52rem   three primary tracks
```

The root is not a scroll container. Focus and history may scroll locally; text
wraps without ellipsis; numeric values remain visible. Populated optional slots
are never hidden because of width or density. Omission is the canonical collapse
mechanism; empty/hidden nodes are rejected by fixtures or treated only as a
defensive zero-residue fallback.

Public hooks:

```text
--oi-compact-monitor-gap
--oi-compact-monitor-primary-gap
--oi-compact-monitor-loading-min-block-size
```

Invariants:

- `status` and `primary` are always visible.
- `status` appears exactly once with nonempty visible text, a stable `id`, and
  `role="status"`; the root's `aria-describedby` references that ID. The status
  slot does not describe itself through a redundant child reference.
- `details` and `history` may use disclosure.
- `settings` is separated from the operational scan path.
- Missing optional slots collapse without empty spacing.
- The recipe does not prescribe domain labels or data sources.
- Narrow layout is one column.
- Wide layout may place primary metrics in multiple columns while retaining DOM order.
- Refreshing retains primary data and marks activity and freshness independently.
- Dynamic adapters create the visible status region before an update and mutate
  its contents in place. When the recipe root remains `aria-busy="true"`, entry
  into loading or refreshing is announced through a pre-existing polite,
  atomic live region outside the busy subtree. Full-page navigation does not
  depend on a live-region announcement.
- Failed detail regions do not erase healthy primary regions.
- DOM order remains the reading and keyboard order at every width.
- Loading and refreshing set `aria-busy`; refreshing and stale states retain the
  primary node/value. Detail failure remains localized and cannot erase healthy
  status or primary regions.
- Native focus order is authoritative. The recipe adds no shortcuts, roving
  focus, Escape behavior, or responsive reordering; async updates preserve the
  existing focused node.

The recipe is proven after the Project Control integration completed its
source, static, browser, deployment, owner, and adoption-scoped manual proof
matrix. Stable promotion still requires a materially different second use or an
explicit architecture review accepting one high-stakes consumer as sufficient
evidence.

### 11.2 Candidate recipe names

The following names are reserved as candidates but are not public contracts until separately designed and proven:

- `dense-inspector`
- `operational-summary`
- `contextual-sidebar`

Reserved names prevent competing implementations without promising premature APIs.

---

## 12. CSS architecture

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
mapping    may reference palette and foundation tokens
contracts  may reference semantic variables only
primitives may reference contracts
recipes    may reference contracts and primitives
utilities  may reference contracts and primitives
product    may override semantic contracts and documented recipe hooks
```

Rules:

- The kernel ships no global reset.
- `!important` is prohibited outside forced-colors and explicit accessibility overrides.
- ID selectors are prohibited.
- Logical properties are required for new spatial CSS unless a physical axis is intentional.
- Public selectors may address a root, one state attribute, or one direct named slot. Deeper descendant chains are prohibited.
- Public selectors are documented and versioned.
- Recipes expose a small documented set of override variables; arbitrary internal hooks are not public API.
- Raw color literals are prohibited outside token sources, semantic mappings, test fixtures, and documented source studies.
- External margins on primitives are prohibited.
- Container queries own recipe adaptation. Viewport media queries are reserved for accessibility, input modality, and product shells.

---

## 13. Runtime and adapter boundary

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

No runtime network dependency is allowed. Static primitives and recipes MUST work without JavaScript unless their interaction contract inherently requires behavior.

React adapters MUST remain removable without changing the CSS, slot, state, or accessibility contract.

SwiftUI generation begins only after the web contract survives a real integration. Native implementation MUST use generated semantic tokens and enums, not runtime CSS translation.

---

## 14. Contract manifest

`src/system/contract.json` is the machine-readable source of truth for:

- Doctrine contract version
- Stable and experimental axes
- Semantic role names
- Primitive names, stability, roots, parts, DOM/ARIA obligations, supported
  axes, and public hooks
- Recipe names, stability, slots, densities, and public hooks
- Public attribute names
- Generated adapter type names
- Forbidden domain terms for lower-layer source scans

`src/system/contract.schema.json` validates the manifest itself.

Normative shape:

```json
{
  "name": "operational-interface-doctrine",
  "version": "0.5.0",
  "axes": {
    "surface": ["canvas", "base", "raised", "interactive", "inset", "overlay", "scrim"],
    "activity": ["idle", "loading", "refreshing", "live", "ready", "failed"],
    "severity": ["neutral", "informational", "positive", "warning", "negative", "critical"],
    "freshness": ["live", "recent", "stale", "unknown"],
    "certainty": ["confirmed", "inferred", "uncertain", "disputed"],
    "completeness": ["complete", "partial", "missing", "unavailable"],
    "source": ["direct", "derived", "generated", "user-entered", "external"],
    "emphasis": ["quiet", "normal", "strong"],
    "density": ["compact", "standard", "spacious"]
  },
  "recipes": {
    "compact-monitor": {
      "stability": "proven",
      "_manualProofGates": [
        "actual-ipad-touch",
        "actual-zoom-200",
        "voiceover",
        "nvda",
        "safari",
        "firefox",
        "windows-high-contrast",
        "no-color-human"
      ],
      "_promotionEvidence": "governance/compact-monitor-promotion.json",
      "requiredSlots": ["status", "primary"],
      "optionalSlots": ["context", "actions", "focus", "details", "history", "settings"],
      "slotSemantics": {
        "status": {
          "requiredAttributes": { "role": ["status"] },
          "visibleText": "required",
          "rootReferenceAttribute": "aria-describedby"
        }
      },
      "supportedDensities": ["compact", "standard"]
    }
  }
}
```

Generated artifacts include:

- JavaScript constants and validators
- TypeScript string-literal unions and interfaces
- Published contract JSON
- Development assertions
- Reference tables for documentation
- Fixture matrices
- Swift enums after native adoption begins

CSS layout remains hand-authored. The generator produces contracts and repetitive bindings, not opaque generated layout code.

---

## 15. Repository architecture

Initial implementation paths:

```text
docs/
  OPERATIONAL-INTERFACE-DOCTRINE.md

src/system/
  contract.json
  contract.schema.json
  layers.css

  mappings/
    dark-roast.json

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

scripts/
  build-system.js
  validate-contract.js
  validate-system-runtime.js
  validate-system-css.js
  validate-system-dom.js
  validate-system-recipe-dom.js
  validate-package.js
  serve-system-fixtures.js

playwright.config.js

tests/system/
  compact-monitor-layout.spec.js
  compact-monitor-state.spec.js
  compact-monitor-accessibility.spec.js
  compact-monitor-accessibility.spec.js-snapshots/

spec/system/
  mappings/alien.css
  primitives.html
  compact-monitor.html
  compact-monitor-fixture.css
  compact-monitor-fixture.js
  state-matrix.html
  truth-matrix.html
  async-matrix.html
  responsive-matrix.html
  content-stress-matrix.html
  cross-theme.html
```

Framework adapters are future additive paths and are not created empty in the initial tranche.

Generated output:

```text
dist/system/
  index.js
  index.d.ts
  contract.js
  contract.d.ts
  contract.json
  contracts.css
  primitives.css
  recipes.css
  index.css
  mappings/dark-roast.css
  recipes/compact-monitor.css
```

---

## 16. Package surface

Existing exports remain unchanged. New exports are additive:

```json
{
  "./system": {
    "types": "./dist/system/index.d.ts",
    "default": "./dist/system/index.js"
  },
  "./system/contract": {
    "types": "./dist/system/contract.d.ts",
    "default": "./dist/system/contract.js"
  },
  "./system/contract.json": "./dist/system/contract.json",
  "./system/css": "./dist/system/index.css",
  "./system/contracts": "./dist/system/contracts.css",
  "./system/primitives": "./dist/system/primitives.css",
  "./system/recipes": "./dist/system/recipes.css",
  "./system/recipes/compact-monitor": "./dist/system/recipes/compact-monitor.css",
  "./system/mappings/dark-roast": "./dist/system/mappings/dark-roast.css"
}
```

The package remains `dark-roast-theme`. A separate package or monorepo is prohibited until at least two independent repositories require doctrine artifacts without Dark Roast assets and the split demonstrably reduces maintenance.

---

## 17. Enforcement and proof system

### 17.1 Static contract checks

The build fails on:

- Invalid contract manifest
- Generated contract drift
- Unknown public axis values
- Raw color literals outside approved locations
- Direct `--dr-*` use in contracts, primitives, or recipes
- Forbidden product or domain terms in lower layers
- ID selectors
- Selector chains deeper than the documented root, state, or direct-slot contract
- Physical spatial properties where logical properties are required
- External margins on primitives
- Undocumented public selectors or variables
- Unsupported recipe slots
- Missing required recipe slots in fixtures
- Infinite animation without an active or live contract
- Electron-only properties outside a dedicated adapter
- Unscoped global styles
- `!important` outside approved accessibility rules
- Incomplete semantic mappings

CSS validation MUST use an AST parser rather than regular-expression-only parsing.

### 17.2 Behavioral checks

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

### 17.3 Async scenario checks

Data-bearing fixtures prove:

- Initial loading
- Complete ready data
- Partial data
- Refreshing with retained data
- Live data
- Stale data
- Request failure
- Missing expected data
- Source unavailable
- Valid empty result

### 17.4 Visual and content proof matrix

Every proven or stable recipe, and every experimental recipe proposed for
product use, renders across:

```text
Mappings
  Black Label
  Night Shift
  House Blend
  Alien semantic reference mapping

Widths
  minimum viable
  preferred
  wide

Densities
  every supported density

State scenarios
  neutral
  live
  warning
  critical
  disabled
  stale
  uncertain
  partial
  refreshing
  failed

Accessibility and content stress
  reduced motion
  increased contrast
  forced colors
  keyboard focus
  200 percent zoom and reflow
  left-to-right and right-to-left direction
  long labels at twice expected length
  large and negative numeric values
  missing, unknown, and unavailable values
  no-color interpretation
```

The alien mapping is intentionally cold, flat, and unrelated to Dark Roast. It proves that recipes consume semantic contracts rather than warm-palette assumptions.

### 17.5 Tooling

The implementation uses:

- Existing Dark Roast Node build scripts as the orchestration model
- JSON Schema validation for the contract manifest
- PostCSS AST parsing for CSS contract enforcement
- Existing APCA tooling for assigned-surface contrast checks
- Playwright for responsive, keyboard, directionality, forced-color, zoom, and screenshot fixtures
- Axe integration within Playwright for automated accessibility checks

All checks join `npm test`. Generated-file checks support `--check` and never rewrite during CI.

### 17.6 Determinism and package integrity

- Repeated builds from the same source MUST produce byte-identical generated output.
- The package tarball MUST resolve every exported JavaScript, type, JSON, and CSS path.
- Runtime artifacts MUST NOT import development dependencies.
- Build output size is reported in CI. An unexplained increase greater than 10 percent in any system bundle blocks merge pending review.

---

## 18. Pattern study and promotion

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

Has a public-looking contract but no compatibility guarantee. It must enter one
real product surface before it can advance to proven.

### Proven

Survives the full proof matrix and one real product integration without product-specific leakage.

### Stable

Requires either a second materially different use or explicit architecture review accepting one high-stakes consumer as sufficient evidence. Stable contracts receive semantic-version protection.

### Deprecated

Requires a replacement, migration instructions, and a removal version before deletion.

No stable primitive or recipe is created without a real consumer.

---

## 19. Versioning

The doctrine contract has an independent semantic version recorded in `contract.json`.

For stable contracts:

- **Major:** rename or remove a stable axis, axis value, semantic role,
  primitive, primitive part, recipe, slot, attribute, or required behavior;
  tighten stable root/part/cardinality obligations; add a required slot; change
  meaning.
- **Minor:** add an optional primitive, recipe, slot, semantic role, or non-breaking generated artifact.
- **Patch:** clarify documentation, correct a validator, fix a visual defect without changing public behavior, or correct generated output.

Adding a value to a stable closed axis is major because domain adapters may be exhaustive.

Experimental contracts may change without a doctrine major version but MUST be marked experimental in the manifest and release notes.

Existing Dark Roast package versioning remains authoritative for package releases. A release that changes both systems records both the package version and doctrine contract version.

---

## 20. Failure behavior

- Unknown axis values trigger development assertions and render neutrally in production.
- Missing optional slots collapse without residue.
- Missing required slots fail fixtures and development assertions.
- Contract validation failure aborts generation.
- Generated drift aborts `npm test`.
- Missing semantic mapping triggers a development assertion; structural markup remains usable but receives no inferred severity styling.
- Accessibility failures block proven or stable promotion.
- Visual diffs require explicit baseline review; snapshots are never auto-accepted in CI.

---

## 21. Source study: Clauddy

Initial design study:

- Repository: `https://github.com/renatoaug/claude-usage-monitor`
- Reference commit: `205121163c47cda83548dde87ddba71f0ec3be5f`
- Study target: compact operational hierarchy and visual infrastructure
- Legal boundary: the referenced package metadata declares MIT. This study
  extracts relationships only; the kernel independently reimplements them and
  copies no upstream source, selectors, application behavior, or assets.

Extracted relationships:

- Context and compact controls precede operational content
- A recessed focal region separates live or illustrative content from metrics
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

## 22. Agent decision protocol

Before modifying doctrine-owned UI, an agent must answer:

1. What user decision or action does this surface support?
2. Is the change a semantic contract, primitive, recipe, domain adapter, or product assembly?
3. Which existing owner already covers the responsibility?
4. Which axes actually apply?
5. What are the source, freshness, certainty, and completeness semantics?
6. What happens during initial loading, refresh, stale data, partial data, failure, unavailability, and valid empty results?
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

## 23. Named anti-patterns

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

### Truth laundering

Generated, inferred, stale, or partial information is presented with the visual authority of direct confirmed data.

---

## 24. Initial implementation tranche

The first implementation is additive and contained within `dark-roast-theme`:

1. Add `contract.json` and its schema.
2. Generate JavaScript constants, runtime validators, TypeScript types, and published contract JSON.
3. Add semantic contract CSS and a separate Dark Roast mapping.
4. Add cascade-layer orchestration.
5. Implement the ten initial structural primitives.
6. Implement `compact-monitor` as experimental.
7. Add state, truth, async, responsive, content-stress, and cross-mapping proof fixtures.
8. Add AST-based CSS validation, contract validation, Playwright, and axe gates.
9. Add additive package exports and tarball integrity checks.
10. Integrate all new checks into `npm test` without weakening existing Black Label, variant, platform, contrast, or generated-drift gates.

No consumer repository is changed in this tranche. Product adoption is a separate implementation with its own repository inspection and public-interface review. `compact-monitor` remains experimental until that adoption succeeds.

---

## 25. Acceptance criteria

The architecture is implemented when:

- Existing Dark Roast tests remain green.
- Existing exports and visual outputs remain compatible.
- The doctrine manifest validates and generated artifacts are byte-stable and in sync.
- Reusable CSS contains no direct Dark Roast palette references outside the mapping file.
- Every required semantic variable resolves in the Dark Roast and alien mappings.
- All ten primitives render under Dark Roast and the alien mapping.
- `compact-monitor` satisfies required-slot, width, density, async, state, keyboard, accessibility, contrast, content-stress, and screenshot fixtures.
- Reduced motion preserves meaning.
- Forced colors remains operable.
- Unknown axis values fail in development and fall back neutrally in production.
- The package tarball resolves every new subpath export without runtime development dependencies.
- No source-specific Clauddy asset, selector, application behavior, or fixed widget geometry is shipped.

---

## 26. Locked decisions

- The doctrine is theme-neutral.
- Dark Roast is the first reference implementation.
- The public namespace is `oi`, not `dr`.
- Generic `data-state` is prohibited.
- Surface, activity, severity, freshness, certainty, completeness, source, emphasis, and density are separate axes.
- Interaction uses native pseudo-classes, native attributes, and ARIA before custom state.
- Async scenarios are combinations of orthogonal axes, not another overloaded state enum.
- CSS and semantic DOM are canonical for web.
- Framework adapters are optional and subordinate.
- No global reset is added.
- No monorepo or new package is created in the first implementation.
- `compact-monitor` is experimental, not prematurely stable.
- SwiftUI follows successful web integration.
- Product adoption is separate from the kernel implementation.
- External designs enter through documented studies, not direct transplantation.

---

## 27. First product adoption evidence

<a id="compact-monitor-project-control-evidence"></a>

<a id="evidence-project-control-source-health-automated"></a>

Project Control Source Health is the first real `compact-monitor` consumer
(`f6a8563`, 2026-08-27). It is a server-rendered nonclinical operational surface,
not a fixture or framework adapter.

Contract hardening and the reproducible 5.10.2 vendor pin are recorded in the
repository-only `governance/` record, never in package bytes, packaged prose, or
runtime exports.

- The product edge derives activity, severity, freshness, certainty, and
  collection-result completeness from actual collector execution records;
  source is a fixed direct-provenance classification, while surface and density
  are product presentation policy. A refreshing scan retains the previous
  primary values and exposes `aria-busy`.
- The required status and primary slots remain visible. Context and native scan
  form actions occupy the declared chrome; unused optional slots are omitted.
- The consumer loads the palette, system CSS, and explicit mapping through
  public package exports. Its Source Health CSS uses semantic roles and declared
  hooks only. The operational-interface contract is scoped to Source Health;
  the Dark Roast theme class remains product-wide.
- Static DOM/pigment checks, Python mapping/security checks, axe, no-JavaScript
  operation, 20/36/52rem allocation checks, media emulation, long-content stress,
  and reviewed Darwin screenshots are executable in the consumer repository.
- Localhost and private tailnet deployment probes cover the route, health, and
  all package-derived stylesheets. The consumer uses a pinned packed tarball
  because Dark Roast has not yet had a first npm publication.

The integration satisfies the one-real-consumer prerequisite. It becomes
eligible for a `proven` promotion review only after owner acceptance and the
applicable manual accessibility/device checks. Tests and deployment are
evidence; they are not owner judgment.

At promotion review, run
`npm run verify:promotion-consumer -- project-control=../../project-control`.
Each adoption declares its repository ID, artifact path, file assertions, and
clean-archive verification commands, so a second materially different consumer
can use its own repository and executable contract without kernel-specific
hardcoding. Portable
kernel CI validates evidence structure and local references; this explicit
cross-repository gate proves that the recorded external commit actually contains
the pinned package bytes and version locks. Human-authored manual evidence must
use the exact adoption-and-gate-specific anchor declared by the validator.

<a id="compact-monitor-owner-acceptance"></a>

<a id="evidence-project-control-source-health-owner-acceptance"></a>

### 27.1 Owner acceptance

On 2026-08-29, the owner accepted the Source Health hierarchy, terminology, and
density. Actual device and manual gates remain separately dispositioned in the
repository-only promotion evidence. Every gate applicable to Project Control is
passed; VoiceOver/screen-reader certification, NVDA, and Windows High Contrast
are evidence-linked not applicable under the consumer's committed support
boundary. Those gates reopen before any corresponding support claim. This
complete adoption record advances `compact-monitor` to `proven`, not `stable`.
