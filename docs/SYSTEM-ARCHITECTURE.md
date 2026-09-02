# System Architecture

**Status:** implementation record, updated as tranches land
**Last updated:** 2026-09-02 (package 5.12.0, doctrine contract 0.5.0)

`docs/OPERATIONAL-INTERFACE-DOCTRINE.md` is the *specification*. This document
records what is **actually built**, where it lives, and how the pieces depend on
each other. When the two disagree, that is a bug in one of them — the whole point
of the doctrine is that prose without enforcement is not law (§5.17).

---

## 1. Two systems in one package

The repository ships two related but distinct things. Keeping them straight
prevents most confusion:

**The theme family** answers *what color is this?* It is mature and in
production: `src/tokens.json` is canonical for Black Label, `src/variants/*.json`
define ten companions, and generators emit CSS, ES modules, JSON, and eleven
platform targets. Its public namespace is `--dr-*`.

**The operational interface system** answers *what does this element mean?* It is
new and partially built. Its public namespace is `--oi-*` and it is deliberately
theme-neutral: Dark Roast is its first reference mapping, not its definition.

They meet at exactly one seam — a mapping file that reads `--dr-*` and assigns
`--oi-*`. That file is the only place the two vocabularies may touch.

---

## 2. Dependency direction

One-way, per doctrine §4. Higher layers must not leak into lower ones.

```
docs/OPERATIONAL-INTERFACE-DOCTRINE.md   the specification
  └─> src/system/contract.json           machine-readable contract      [BUILT]
        └─> semantic contract CSS        --oi-* role declarations       [BUILT]
              └─> structural primitives  the ten building blocks        [BUILT]
                    └─> recipes          compact-monitor composition     [BUILT]
                          └─> domain adapters   product meaning -> axes
                                └─> product assemblies / skins
```

The proof system evaluates every layer and is never a runtime dependency of any
of them.

**Where the palette attaches:**

```
src/tokens.json  ->  src/variants/*.json  ->  dist/css/dark-roast-*.css
                                                     |
                                                     v
                           src/system/mappings/dark-roast.json -> generated CSS
                                                     |
                                                     v
                                              --oi-* semantic roles
```

Only the mapping layer may read `--dr-*`. Anything above it consuming a palette
token directly is the "token soup" anti-pattern (§23) and is an AST validation
failure.

---

## 3. What is built

### `src/system/contract.json` — the contract manifest

Hand-edited source of truth (§14). It declares:

- **Nine orthogonal axes** (§7): surface, activity, severity, freshness,
  certainty, completeness, source, emphasis, density. There is deliberately no
  `interaction` axis — native pseudo-classes, native attributes, and ARIA own
  interaction state (§7.10). There is deliberately no generic `data-state`; it
  collapses unrelated dimensions into a junk drawer (§5.3).
- **54 semantic roles** across ten required categories (§8): the slice B roles
  plus six mapped typography size/line roles required by real primitives.
- **The ten experimental structural primitives** with root elements, exact
  owner-qualified parts, cardinality/parentage, allowed tags, required and
  forbidden attributes, accessible-name obligations, axes, and public hooks.
- **`compact-monitor`** as proven, with axes, root/part/slot anatomy and
  manifest-owned status semantics, repository-only maturity evidence,
  20/36/52rem proof widths, overflow/truncation/collapse, density, async,
  keyboard/focus, declared proof matrices, and owner-scoped hooks (§11.1).
- **`governance/compact-monitor-promotion.json`** records immutable consumer
  SHAs, package hash, owner acceptance, and manual-gate dispositions. It is
  schema-checked by the contract validator and forbidden from npm package bytes,
  avoiding a self-referential artifact hash.
- **Reserved recipe names**, including `conversation-shell` and
  `context-composer` proposed by `src/system/studies/phind-extension.md`.
- **Axis stability**, so semver protection is machine-readable: adding a value to
  a stable closed axis is a MAJOR bump because adapters may switch exhaustively
  (§19).
- **Forbidden domain terms** for lower-layer source scans (§5.13). The list is
  deliberately conservative — `note`, `chart`, and `transfer` are excluded
  because substring collisions would produce false failures.

### `src/system/contract.schema.json`

JSON Schema (draft-07) validating the manifest's shape. Structural rules only;
cross-reference integrity is not expressible in JSON Schema and lives in the
validator instead.

### `dist/system/` — generated, committed, never hand-edited

| File | Contents |
|---|---|
| `contract.js` | Frozen constants, axis→attribute map, semantic role variable names, and three runtime helpers |
| `contract.d.ts` | `Oi*` unions/interfaces, including primitive-specific part maps and DOM contracts |
| `contract.json` | The manifest with documentation keys stripped |
| `conformance.js`, `conformance.d.ts` | The public conformance checker, copied byte-for-byte from `src/system/runtime/` |
| `index.js`, `index.d.ts` | Package-level runtime and type barrels (contract plus conformance) |
| `contracts.css` | Ordered, theme-neutral semantic contract CSS; no palette is implicit |
| `primitives.css` | The ten structural primitives in manifest order |
| `recipes.css`, `recipes/compact-monitor.css` | Aggregate and focused recipe bundles |
| `index.css` | Contracts, primitives, then recipes under the canonical cascade order |
| `mappings/dark-roast.css` | Generated `--dr-*` to `--oi-*` mapping seam |

Three runtime helpers are worth knowing:

- **`assertAxisValue(axis, value)`** — throws in development, returns `false` in
  production. This implements §20 directly: unknown values must surface loudly
  while developing and degrade to neutral presentation in production rather than
  crashing an operational surface.
- **`missingRequiredSlots(recipe, provided)`** — returns the required slots a
  caller failed to supply.
- **`requiresProvenanceDisclosure(state)`** — true when source, certainty,
  freshness, or completeness is outside direct/confirmed/live-or-recent/complete.
  Guards against "truth laundering" (§23): generated, inferred, stale, or partial
  information wearing the visual authority of confirmed data.

### `src/system/runtime/conformance.js` — the shipped checker

The first adoption had to re-implement the recipe DOM rules in its own
repository (`validate-dark-roast-adoption.mjs` in Project Control) before it
could trust its template. That is exactly the kind of duplicated rule that rots,
so the check now ships. `checkConformance(tree)` judges every primitive and
recipe root against the generated contract: root element and classes, required
and forbidden attributes, accessible names, consumed axes and closed values,
part parent/element/cardinality/order, slot declaration/parent/visibility/order,
required and optional slot rules, conditional chrome, status-slot semantics,
busy state, metric provenance and textual missing values, meter native/visual
agreement, disclosure summary ownership, history chronology and intensity,
divider orientation, undeclared `oi-*` classes, orphaned parts and slots,
inline `--oi-*` hooks outside their owner, and `--dr-*` leakage on operational
elements. Each finding carries a stable kebab-case code, a message, and the
subject element with line and column when parsed from a file.

Two adapters feed it: `fromDom(node)` for a live browser DOM and
`fromParse5(node)` for Node. Passing an element judges only that subtree while
ancestors and ID references still resolve document-wide. The module has zero
dependencies and never throws for markup problems; it returns findings.

It is not the exhaustive fixture gate. `validate-system-dom.js` and
`validate-system-recipe-dom.js` remain the in-repo validators with their
fixture-specific obligations (stylesheet order, dual mappings, proof roots).
`validate-system-conformance.js` proves the two agree: the canonical fixtures
produce zero findings and 39 mutations the kernel rejects are rejected by the
shipped checker with the expected codes. `tests/system/conformance.spec.js`
proves the same in a real Chromium DOM across every async scenario and slot
mode, including runtime mutations the static fixture never contains. That
browser proof is what found three latent defects in 5.12.0: the fixture leaked
recipe activity onto metrics, the `missing`/`unavailable` scenarios rendered
numeric substitutes on secondary metrics, and the history strip became an
inline scroll region with no keyboard access below its preferred width.

### `bin/dark-roast-theme.js` and `starter/` — the drop-in path

`dark-roast-theme init <dir>` copies `starter/` (a complete `compact-monitor`
page, a product stylesheet under `@layer product`, and a README of the rules)
and runs `assets` into `<dir>/theme`. `assets` copies the palette, system, and
mapping stylesheets with a hash manifest; `--check` fails when they drift.
`check <html>` runs the shipped checker with parse5 resolved from the consumer's
project. `validate-starter.js` runs all three exactly as a consumer would on
every `npm test`, and holds `starter.css` to the fixture discipline: one product
layer, `--oi-*` roles only, no raw colors, no domain vocabulary. `starter/theme/`
is generated, gitignored, and excluded from the tarball. `docs/ADOPTION.md` is
the consumer-facing guide.

### `src/system/studies/` — the intake pipeline

External designs enter through documented studies, never direct transplantation
(§18). `phind-extension.md` extracts conversation/context/proposal relationships.
`codecompanion-ai.md` records a sanitized proprietary-source study of workbench,
mutation-gate, checkpoint, and recovery behavior; it explicitly justifies zero
new public manifest entries in this tranche.

The Clauddy study that motivated `compact-monitor` is recorded inline as doctrine
§21. §15 reserves `studies/claude-usage-monitor.md` for a standalone extraction;
that file is not yet written, so the manifest references the doctrine section
that does exist rather than a placeholder.

### Slice B semantic infrastructure

- `src/system/mappings/dark-roast.json` maps all 54 roles to canonical Dark Roast
  foundations. The generator rejects missing/extra roles and any `--dr-*`
  reference that cannot be derived from `src/tokens.json`.
- `spec/system/mappings/alien.css` is a complete cold, flat, light-polarity proof
  mapping. It ships with the existing spec fixtures but is deliberately not a
  supported mapping export.
- `src/system/layers.css` fixes the public order: mapping, contracts,
  primitives, recipes, utilities, product. There is no reset layer.
- `src/system/contracts/*.css` implements surface, text, interaction, state,
  truth, density, and motion contracts using public `--oi-*` roles and private
  `--_oi-*` implementation variables.
- `scripts/validate-system-css.js` uses PostCSS plus selector/value ASTs to
  enforce layer ownership, mapping completeness, selector and state contracts,
  logical properties, raw-color boundaries, motion ownership, domain neutrality,
  and `--dr-*` quarantine.
- `scripts/validate-package.js` packs and extracts the actual npm artifact,
  resolves every JS/type/JSON/CSS export, rejects private/toolchain paths, and
  proves zero runtime dependencies.

### Slice C structural primitives

- `src/system/primitives/*.css` implements `surface`, `stack`, `cluster`,
  `rail`, `inset`, `divider`, `metric`, `meter`, `disclosure`, and
  `history-strip`. Layout is intrinsic and logical; primitive roots carry no
  nonzero external margins, palette references, product nouns, or motion.
- Native semantics are canonical: `dl` for metrics, a visually hidden native
  `meter` synchronized with semantic visual track/fill parts, `details/summary`
  for disclosure, `ol/li/time` for ordered history, and `hr` for dividers.
- `primitiveContracts` and `primitivePartClasses` are generated and deeply
  frozen. Types expose `OiPart`, `OiPrimitivePartMap`, and
  `OiPrimitiveContract` while preserving the earlier runtime exports.
- `scripts/validate-system-dom.js` parses `spec/system/primitives.html` with
  parse5 and enforces root/part anatomy, ordering, ID references, accessible
  names, meter bounds plus visual-value parity, disclosure native behavior,
  conditional metric provenance, and chronological history.
- The fixture renders all ten primitives under Dark Roast and the cold alien
  mapping in one document. Wide, 720px, and 390px browser smoke renders are
  clean; this is not the Slice D Playwright/axe/screenshot matrix.

### Slice D compact monitor and proof system

- `src/system/recipes/compact-monitor.css` implements a one-column baseline,
  two primary tracks at 36rem, and three at 52rem using a named container.
  Required status/primary regions never enter disclosure or disappear at narrow
  widths; only focus/history own local scrolling.
- `spec/system/compact-monitor.html` is a static valid baseline. Its fixture
  module applies only manifest-declared mappings, widths, densities, optional
  omission, async/state, direction, and stress cases. Metrics it renders carry
  only the axes the metric primitive consumes, and every metric under
  `missing` or `unavailable` completeness renders a textual value.
- `scripts/validate-system-recipe-dom.js` enforces the parse-time root, chrome,
  eight flattened slots, manifest-owned accessibility relationships, required
  visibility, optional collapse, and busy-state semantics. Its mutation suite
  proves role, ID, root reference, and visible status text fail closed.
- Playwright 1.62.1 runs 111 Chromium tests: exhaustive four-mapping × three-width
  × two-density layout, all async/state/stress values, native disclosure,
  DOM-order keyboard focus, focus retention, overflow, reduced motion,
  increased contrast, forced colors, RTL, 200%-equivalent reflow, axe WCAG
  scans without suppression at every contracted width, live-DOM conformance of
  every scenario and slot mode plus the starter page, and nine reviewed locator
  screenshots.
- The history strip wraps to further rows when its container cannot fit every
  item at the preferred size, instead of scrolling inline. A scroll region
  without keyboard access failed axe at the 20rem allocation once axe ran there;
  wrapping keeps bars equal-width and comparable and removes the region.
- The dedicated localhost server accepts GET/HEAD only, confines real paths to
  the repository, disables caching, rejects traversal, and never shares an
  unrelated listener. Browser artifacts and tests are excluded from the package.

---

## 4. The skins layer

`src/skins/` is an addition not named in the doctrine, so it needs an explicit
place. A **skin** is a product assembly: the concrete look of one application,
consuming a theme.

`somacura-night-shift.css` is the first. It exists because the somaCura census UI
had duplicated the entire Night Shift palette as literals — including a stale
espresso value — and so stopped tracking its own theme. The skin now references
`var(--dr-*)` for the 20 properties whose values are owned by the theme, and
keeps literal only the 20 that are genuinely product-specific.

**Known transitional deviation.** A skin sits above the mapping layer, so under
§5.1 it should ultimately consume `--oi-*` rather than `--dr-*`. The published
somaCura skin still references `--dr-*`: migrating its five clinical severity
hues is product adoption with visual/clinical acceptance, not a safe kernel
sweep. It remains outside system CSS validation and must migrate with the
version-correct somaCura adoption recorded in `docs/SOMACURA-MIGRATION.md`.

---

## 5. The validator suite

`npm test` runs twenty-two static gates followed by 111 Chromium tests. Each gate
exists because something either did go wrong or provably could.

**Theme family**
1. `check-black-label-contract.js` — 17 canonical files pinned by SHA-256 against
   5.0.0. Companion work cannot mutate the flagship.
2. `reconcile-recipes.js --check` — brewed registries match their recipes, and no
   generator overwrites a registry it does not own.
3. `validate-themes.js` — per-theme contrast, chroma floors, severity hue
   separation, monotonic elevation.
4. `build-tokens.js --check` — Black Label generated output matches source.
5. `build-cold-brew.js --check` — Cold Brew registry matches its OKLCH seeds.
6. `build-variants.js --check` — all 101 companion artifacts match source.
7. `validate-platforms.js` — every editor and terminal target parses and matches
   its registry.
8. `validate-gallery.js` — the gallery cannot drift from source palettes.

**Product assembly**
9. `validate-skins.js` — a skin may own product-specific values but never a copy
   of a theme token, and every `var(--dr-*)` must resolve.

**Doctrine and semantic CSS**
10. `validate-contract.js` — JSON Schema (§17.5) plus the cross-references a
    schema cannot express: required and optional slots must partition `slotOrder`
    exactly, primitive and truth axes must resolve, stability must sit on the
    ladder, anything above `candidate` needs a study that exists, generated type
    names must be present and unique, and the contract must not contain its own
    forbidden domain terms.
11. `validate-contract-regressions.js` — adversarial mutations prove promotion
    and stable maturity claims cannot bypass pinned consumer, owner, manual-gate,
    and repository-local evidence requirements.
12. `build-system.js --check` — every generated runtime, type, mapping, and CSS
    artifact is byte-identical to source (§17.6).
13. `validate-system-runtime.js` — development/production/browser assertions,
    required slots, and provenance predicates behave as specified.
14. `validate-system-dom.js` — executable native DOM/ARIA anatomy for both
    mappings and all ten primitives.
15. `validate-system-recipe-dom.js` — compact-monitor root/part/slot order,
    accessibility, visibility, collapse, and busy-state semantics.
16. `validate-system-recipe-dom-regressions.js` — mutated fixtures prove status
    role, ID, visible content, and root-reference failures are detected.
17. `validate-system-css.js` — AST enforcement and complete Dark Roast/alien
    mappings across all 54 roles.
18. `validate-system-conformance.js` — the shipped checker produces zero
    findings on both canonical fixtures and rejects 22 recipe and 17 primitive
    mutations with stable codes; it never throws on hostile markup.
19. `validate-starter.js` — runs the shipped CLI as a consumer would: assets
    written and `--check`ed, the starter page checked, `init` scaffolded into
    an empty directory and checked, overwrite refused without `--force`, and
    the product stylesheet held to one `@layer product`, roles only, no raw
    colors, no domain vocabulary.

**Distribution**
20. `validate-exports.js` — recursively proves every generated artifact is
    reachable, resolvable, typed where declared, and covered by `files`.
21. `validate-package.js` — validates the actual packed/extracted tarball and
    zero runtime dependencies; the packed SHA must match every current-version
    adoption artifact pin; generated starter assets never ship.
22. `validate-package-regressions.js` — stale package versions and mismatched
    artifact hashes are rejected against the real deterministic tarball.

`npm run verify:promotion-consumer -- project-control=../../project-control` is an explicit
cross-repository promotion-review gate. It proves the recorded consumer commit
exists and contains the exact vendor bytes, dependency/lock integrity, and
contract-version pins. Portable kernel CI cannot inspect another repository's
Git object database, so this check is intentionally separate rather than faked.

**Browser proof**

- `playwright test` executes 111 Chromium assertions and axe scans after the
  static chain. Nine locator baselines are platform-qualified for Darwin and
  Linux Chromium with a bounded 1% pixel-difference allowance; CI never updates
  them.

CI (`.github/workflows/ci.yml`) runs the suite on every push to `master` under
pinned Ubuntu 24.04 and Node 22. It exists because commit `9a40e50` edited a
variant source without regenerating `dist/`, and the stale output survived three
further commits because nothing ran the gate.

---

## 6. Adoption and promotion status

Tranche 2 first landed in `/Users/thomasamosson/jan25/project-control` at
consumer commit `f6a8563`. The current live Source Health cards consume the
packed 5.11.0 package through the public palette, system, and Dark Roast mapping
exports. Product code
derives activity, severity, freshness, certainty, and completeness from persisted
collector execution state; it classifies provenance as direct and applies
surface/density presentation policy separately. The visible "Collection result"
explicitly does not claim immutable-ledger completeness.

Evidence at the adoption boundary:

- the isolated consumer commit passed 379 Python tests, 17 desktop/iPad-viewport
  browser workflows, Ruff, and Pyright;
- axe ran without suppression across healthy, degraded, stale, failed, missing,
  long-label, forced-color, increased-contrast, and reduced-motion cases;
- real 20/36/52rem allocations render one, two, and three primary tracks, with
  Darwin visual baselines and a working JavaScript-disabled scan transition;
- a signed XCUITest on a physical iPad Pro found a hybrid-pointer touch target
  below 44 points. Package 5.10.2 and the consumer assembly repair the geometry;
  a repeat physical run reaches a 48-point target, submits Scan, exposes
  `Scan started`, and retains prior values. The owner then repeated that action
  with a finger and passed the separate human gate;
- package 5.10.3 repairs two manual-gate failures without changing palette or
  doctrine version: busy refresh entry now announces outside the busy subtree,
  and history uses explicit scale text plus full-range patterned proportional
  tracks. The repaired grayscale artifact passed exact human interpretation.
  The pre-fix VoiceOver finding remains internal kernel evidence; Project
  Control makes no VoiceOver or screen-reader certification claim, so that gate
  is evidence-linked not applicable for this adoption;
- package 5.11.0 and doctrine 0.5.0 record the completed proof matrix and advance
  `compact-monitor` to `proven`. Actual iPad touch, actual 200% zoom, Safari,
  Firefox, and human no-color interpretation passed. VoiceOver/screen-reader
  certification, NVDA, and Windows High Contrast are adoption-specific N/A
  outcomes that reopen before any corresponding support claim;
- after the concurrent evidence-ledger migration, live loopback and private
  tailnet probes passed `/`, `/health`, and all three package-derived CSS routes;
  the ledger database was at `c4a72e91f6b3` with integrity `ok`. Current mutable
  database counts and full consumer-suite totals live in Project Control's own
  status record and repository-only promotion evidence rather than package prose.

This is a real consumer without kernel palette leakage. Owner acceptance of its
hierarchy, terminology, and density was recorded on 2026-08-29.
`compact-monitor` is `proven`. Remaining boundaries:

- **Stable basis:** `stable` still requires a materially different second
  consumer or an explicit architecture review accepting the existing
  high-stakes consumer as sufficient evidence.
- **Adapters:** React/SwiftUI adapters remain separate, deliberately selected
  work; proven web evidence does not silently authorize them.
- **Distribution:** a public-registry lookup currently resolves no package.
  Project Control uses a repository-local packed tarball; first publication is
  an explicit owner decision, not a completed release step.
- **Fresh adoption:** 5.12.0 ships the drop-in path (`init`, `assets`,
  `check`, the conformance runtime, and `starter/`) so a second consumer no
  longer starts by re-implementing the kernel's rules. It supplies the path,
  not the evidence; a second consumer's own gates still decide `stable`.

---

## 7. Deviations from doctrine §15

Recorded deliberately, since undocumented drift between spec and implementation
is the failure mode this system exists to prevent.

**Type generation is folded into `build-system.js`.** §15 lists
`scripts/generate-system-types.js` as a separate script. Both would read the same
manifest and write to the same directory, so splitting them would add a file and
a second parse for no benefit. If type generation later grows independent
concerns — Swift enums after native adoption begins — splitting is the right
call then.

**The Dark Roast mapping source is JSON, not hand-authored CSS.** §15 sketches
`src/system/mappings/dark-roast.css`, but JSON lets the generator prove exact
role coverage and canonical token references before emitting CSS. Layout CSS
remains hand-authored as required.

**Pixel baselines are Chromium canaries, not device acceptance.** Font and browser
rasterization differ across platforms, so geometry/DOM/axe assertions carry the
exhaustive matrix and screenshots remain a bounded representative drift signal.

---

## 8. Changing things safely

**To change the doctrine contract:** edit `src/system/contract.json`, run
`npm run build:system`, run `npm test`. Adding a value to a stable axis, renaming
anything public, or adding a required slot is a MAJOR contract bump (§19) —
bump `version` in the manifest, which is independent of the package version.

**To change semantic CSS:** edit `src/system/contracts/*.css`; edit
`src/system/mappings/dark-roast.json` only for a mapping relationship. Run
`npm run build:system`, then `npm test`. Never hand-edit `dist/system/`.

**To change a primitive:** change its DOM/part/hook contract in
`src/system/contract.json` before changing `src/system/primitives/<name>.css` or
the fixture. Regenerate and run the full suite; undeclared parts and hooks fail.

**To change a recipe:** change the manifest contract before recipe CSS or
fixtures. Run `npm run build:system`, both DOM validators, and the full static +
browser suite. Never update screenshots in CI or hide an axe contrast failure.

**To change a theme token:** unchanged from before — see `CLAUDE.md`. Black Label
is production-locked behind a SHA-256 contract; companions are edited only in
`src/variants/`.

**To add a skin:** create `src/skins/<name>.css` where the filename contains its
target variant id, add the export, reference `var(--dr-*)` for anything the theme
owns, and run `npm test`. The skin validator will name any literal that
duplicates a token.

**To bring in an external design:** write a study in `src/system/studies/` first
(§18). Cite real files, state what is explicitly rejected, and record the legal
boundary. Nothing skips the study stage.
