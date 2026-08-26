# Getting Dark Roast into somaCura

**Status:** not started. Measured 2026-08-26 against `Skidudeaa/somaNotes` at
`HEAD`, and against this package at 5.7.0.
**Read this before changing any CSS in the somaNotes repository.**

somaCura is a clinical documentation system used daily by a practicing
hospitalist. Every recommendation below is shaped by that. A wrong-but-valid
color passes every automated check in existence and is read at 3am on a census
screen.

---

## 1. What is actually true right now

**The skin is adopted nowhere.** `somacura-night-shift` appears in exactly one
file in the somaNotes repository, and that file is the warning written on
2026-08-26. Nothing imports it. This is a first adoption, not a migration of
something live — which is good news for risk, and means the skin work in this
repo is preparation rather than deployment.

**There is no Tailwind.** It appears only in planning documents and agent
prompts, never in a config or dependency. The `@tailwind` directives in the
original hand-copied skin were aspirational. (They have since been removed from
the published skin, so this no longer matters, but it explains the confusion.)

**somaCura runs five competing token systems**, per its own
`.planning/dark-roast-rollout/01-css-audit.md`:

| System | References |
|---|---|
| `--term-*` (phosphor terminal theme) | 2,314 |
| `--sol-*` (Solarized/SOL layout) | 2,228 |
| `variables.css` generics | 1,496 |
| component micro-tokens | 1,372 |
| `--dr-*` (Dark Roast) | 268 |

Dark Roast is the smallest of the five. That audit also ranks 8 files as EXTREME
difficulty (31,577 lines, 2,951 hardcoded colors) and 17 more as HARD.

**There are three copies of Dark Roast in play**, which is the root problem:

1. `packages/dark-roast/` — a vendored snapshot pinned at **v3.0.0**.
2. `static/css/dark-roast-tokens.css` — an app-local hand-copy of unknown
   provenance, and the file the existing rollout plan actually loads.
3. npm — **v5.7.0**, the canonical package.

---

## 2. The measured v3.0.0 → v5.x gap

Computed by diffing the vendored `packages/dark-roast/tokens/tokens.json`
against `src/tokens.json`.

**One token changed value while keeping its name. This is the landmine.**

`crater` is `#3C2A21` in v3.0.0 and `#4D3B31` in v5.x, because v4 promoted it to
the top of the surface scale and moved the old value to `craterDeep`. Both values
are valid colors. Nothing errors. A partial migration therefore **shifts colors
silently instead of failing loudly** — the worst available failure mode for a
clinical display.

**Three tokens were renamed and no longer exist:**

| v3.0.0 | v5.x |
|---|---|
| `grain` | `espresso` |
| `grainHover` | `espressoHover` |
| `craterLight` | `crater` |
| (old `crater`) | `craterDeep` |

**Twelve tokens do not exist in v3.0.0 at all:** `darkCacao`, `espresso`,
`espressoHover`, `roastedBean`, `warmWhite`, `craterDeep`, `amberMuted`, `brass`,
`burntSienna`, `magenta`, `harvest`, `olive`.

Five of those — `magenta`, `harvest`, `olive`, `brass`, `burntSienna` — are what
the somaCura Night Shift severity system is built on. **The skin cannot render
against the vendored copy.** That is the concrete blocker, not a preference.

Thirteen tokens are unchanged across both versions.

Expect one intended visual change even when the migration is done perfectly:
Night Shift's espresso widens `#21160F` → `#251A11`, a low-light readability fix
the vendored copy never received.

---

## 3. Prior work that already exists — read it before planning anything

`.planning/dark-roast-rollout/` in the somaNotes repository contains four
documents, dated 2026-02-26, with **zero completion markers**. Fully scoped,
entirely unstarted.

- **`01-css-audit.md`** — the five-system inventory, hardcoded-value counts, and
  per-file migration difficulty rankings.
- **`02-token-mapping.md`** — a complete `--term-*` → `--dr-*` mapping, section by
  section, including a severity-color reconciliation.
- **`03-theme-wiring.md`** — how `census.html` loads CSS, where `data-theme` is
  set and why it is on both `<html>` and `<body>`, and the three active
  namespaces.
- **`04-rollout-plan.md`** — 781 lines, marked "DEFINITIVE — execute from this
  document."

**The plan is structurally sound.** Phase 0 is explicitly zero-visual-change,
gated behind a `dark_roast_enabled` flag, introduces a `dr-compat.css` bridge
file, adds a "no new hardcoded colors" lint, and documents instant rollback by
removing one `<link>`. That is the right shape for this kind of work.

---

## 4. The correction the plan needs

**The plan mentions no version anywhere.** No `npm install`, no reference to
`packages/dark-roast/`, no pin. Phase 0A loads
`static/css/dark-roast-tokens.css` — the app-local copy.

Phase 0's entire purpose is building `dr-compat.css`, a bridge mapping roughly
4,500 `--term-*` and `--sol-*` references onto Dark Roast token *names*. If those
are v3 names, then v3 vocabulary gets baked into the bridge and then inherited by
every file downstream of it. The `crater` collision propagates through all of it.

Doing the version upgrade *after* Phase 0 means rewriting the bridge plus
everything built on top of it. Doing it *before* costs almost nothing, because
there are only 268 `--dr-*` references today.

**So one step goes in front of the existing plan. Nothing else about it changes.**

---

## 5. Sequence

1. **Establish provenance.** Determine whether
   `static/css/dark-roast-tokens.css` exists and which version it was copied
   from. Three copies is the actual problem; identify them all before moving.
2. **Collapse to one source.** `npm install dark-roast-theme@^5.7.0`; delete
   `packages/dark-roast/` and the app-local token CSS. This must precede Phase 0.
3. **Fix the renames across the 268 `--dr-*` references in one pass.** Do not
   ship a partial rename. 268 is the entire window in which this is cheap.
4. **Add CI to somaNotes.** It has none. Thousands of color values are about to
   move in a clinical application, currently on trust alone.
5. **Execute Phase 0 as written**, with tokens resolved from `node_modules`
   rather than a copy.
6. **Continue with Phases 1–3** from the existing plan.
7. **Adopt the skin separately and later.** It is referenced nowhere, so it is
   purely additive and low-risk — but it requires the v5 severity tokens from
   step 2 to exist. Load order matters: the theme resolves the skin's `--dr-*`
   references, so `dark-roast-theme/css/night-shift` must come first, then
   `dark-roast-theme/skins/somacura-night-shift`.

---

## 6. Constraints that are not negotiable

- **Verify visually on a real census screen**, with attention to severity rails,
  ledger rows, and the critical and worsening states. No automated check can
  catch a color that is wrong but valid.
- **Never do this unattended**, and never in a session where a census screen is
  not available to look at.
- **Never ship a partial rename.** Half-migrated `crater` is worse than
  unmigrated `crater`, because unmigrated is at least consistent.
- **The rail note is the production daily driver.** somaNotes' own `CLAUDE.md`
  says never break the rail; all of this must stay feature-flagged and coexist,
  exactly as the existing Phase 0 already assumes.

---

## 7. Where the warnings live

Because this spans two repositories, the hazard is recorded on both sides:

- **This repo:** the Current State block in `CLAUDE.md`, and this document.
- **somaNotes:** a `⚠️ Vendored Dark Roast is Two Majors Stale (CRITICAL BEFORE
  THEME/CSS WORK)` section in the root `CLAUDE.md`, which loads automatically in
  every session there including on the droplet, plus a banner at the top of
  `packages/dark-roast/README.md` where the stale copy physically sits.
- **Upstream reference:** the v3 → v4 table in this repo's `README.md`, and the
  `_migration` block in `dist/themes/night-shift/tokens.json`.
