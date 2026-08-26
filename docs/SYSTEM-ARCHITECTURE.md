# System Architecture

**Status:** implementation record, updated as tranches land
**Last updated:** 2026-08-26 (package 5.7.0, doctrine contract 0.1.0)

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
        └─> semantic contract CSS        --oi-* role declarations       [pending]
              └─> structural primitives  the ten building blocks        [pending]
                    └─> recipes          composition, e.g. compact-monitor
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
                                        src/system/mappings/dark-roast.css  [pending]
                                                     |
                                                     v
                                              --oi-* semantic roles
```

Only the mapping layer may read `--dr-*`. Anything above it consuming a palette
token directly is the "token soup" anti-pattern (§23) and is a validation
failure once slice B lands.

---

## 3. What is built

### `src/system/contract.json` — the contract manifest

Hand-edited source of truth (§14). It declares:

- **Nine orthogonal axes** (§7): surface, activity, severity, freshness,
  certainty, completeness, source, emphasis, density. There is deliberately no
  `interaction` axis — native pseudo-classes, native attributes, and ARIA own
  interaction state (§7.10). There is deliberately no generic `data-state`; it
  collapses unrelated dimensions into a junk drawer (§5.3).
- **43 semantic roles** across the nine required categories (§8).
- **The ten structural primitives** with the responsibility each owns and the
  axes each consumes (§10).
- **`compact-monitor`** as experimental, with its full slot order (§11.1).
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
| `contract.d.ts` | `Oi*` string-literal unions, `OiState`, `OiRecipeContract` |
| `contract.json` | The manifest with documentation keys stripped |

Three runtime helpers are worth knowing:

- **`assertAxisValue(axis, value)`** — throws in development, returns `false` in
  production. This implements §20 directly: unknown values must surface loudly
  while developing and degrade to neutral presentation in production rather than
  crashing an operational surface.
- **`missingRequiredSlots(recipe, provided)`** — returns the required slots a
  caller failed to supply.
- **`requiresProvenanceDisclosure(state)`** — true when source, certainty,
  freshness, or completeness is anything other than direct/confirmed/live/complete.
  Guards against "truth laundering" (§23): generated, inferred, stale, or partial
  information wearing the visual authority of confirmed data.

### `src/system/studies/` — the intake pipeline

External designs enter through documented studies, never direct transplantation
(§18). Currently one: `phind-extension.md`, which extracts eleven theme-neutral
relationships from the Phind VS Code extension with file-level provenance, and
proposes `conversation-shell` plus a proposal-resolution interaction contract.

The Clauddy study that motivated `compact-monitor` is recorded inline as doctrine
§21. §15 reserves `studies/claude-usage-monitor.md` for a standalone extraction;
that file is not yet written, so the manifest references the doctrine section
that does exist rather than a placeholder.

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
§5.1 it should consume `--oi-*` rather than `--dr-*`. It consumes `--dr-*` today
because the `--oi-*` layer does not exist yet. When slice B lands, the skin
should migrate. This is recorded rather than quietly tolerated, because an
undocumented exception is how a doctrine becomes decorative.

---

## 5. The validator suite

`npm test` runs thirteen checks in order. Each one exists because something
either did go wrong or provably could.

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

**Distribution**
9. `validate-exports.js` — every generated artifact is reachable, every export
   resolves on disk, every target ships under `files`, and no `types` path
   dangles. Added after 8 stylesheets and 4 theme modules were found shipping
   with no export entry, which is why a consumer had hand-copied a palette.
10. `validate-skins.js` — a skin may own product-specific values but never a copy
    of a theme token, and every `var(--dr-*)` must resolve.

**Doctrine**
11. `validate-contract.js` — JSON Schema (§17.5) plus the cross-references a
    schema cannot express: required and optional slots must partition `slotOrder`
    exactly, primitive and truth axes must resolve, stability must sit on the
    ladder, anything above `candidate` needs a study that exists, generated type
    names must be present and unique, and the contract must not contain its own
    forbidden domain terms.
12. `build-system.js --check` — `dist/system/` matches the manifest byte for byte
    (§17.6).

CI (`.github/workflows/ci.yml`) runs the suite on every push to `master` under
pinned Node 22. It exists because commit `9a40e50` edited a variant source
without regenerating `dist/`, and the stale output survived three further commits
because nothing ran the gate.

---

## 6. Not built yet

Tranche 1 continues (§24). In dependency order:

- **Slice B** — semantic contract CSS, the Dark Roast mapping generated from
  existing token source, the deliberately cold "alien" mapping that proves
  theme-neutrality, cascade-layer orchestration, and an AST-based CSS validator
  (PostCSS, per §17.5 — regex parsing is explicitly insufficient).
- **Slice C** — the ten primitives as real CSS, each rendering under both
  mappings.
- **Slice D** — `compact-monitor`, plus the state / truth / async / responsive /
  content-stress / cross-theme proof matrices with Playwright and axe.

Tranche 2 is first real adoption, which promotes `compact-monitor` from
experimental toward proven. Tranche 3 adds the remaining reserved recipes,
framework adapters, and — only after the web contract survives real use —
SwiftUI generation.

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

**`dist/system/` currently holds only the contract.** §15's fuller listing
(`index.js`, `contracts.css`, `primitives.css`, `recipes.css`, `index.css`,
`mappings/`) arrives with slices B through D.

---

## 8. Changing things safely

**To change the doctrine contract:** edit `src/system/contract.json`, run
`npm run build:system`, run `npm test`. Adding a value to a stable axis, renaming
anything public, or adding a required slot is a MAJOR contract bump (§19) —
bump `version` in the manifest, which is independent of the package version.

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
