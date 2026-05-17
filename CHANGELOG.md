# Changelog

All notable changes to `dark-roast-theme` are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/); this project
treats token-value changes as evolving under minor releases and reserves major
releases for token renames/removals (see the v3 → v4 migration).

## [4.1.0] — 2026-05-16

Clinical severity remediation ("Option C"). `worsening`, `improving`, and
`stable` previously aliased `amberHot` / `amber` / `gold` — a 3° hue spread
that collapses to "vaguely amber" at census scanning distance, peripheral
vision, or on a clinical workstation display. The three severity states now
occupy distinct hue families.

### Added
- Three color-name primitives: `magenta #C25F90` (worsening, hue 333°),
  `harvest #D4A040` (improving, hue 39°), `olive #879A39` (stable, hue 72°).
- `--dr-magenta`, `--dr-harvest`, `--dr-olive` plus full `dim`/`subtle`/`ghost`
  opacity variants and `--dr-glow-*` triples (both CSS files).
- JS exports in `tokens/colors.js` (`magenta`/`harvest`/`olive` + variants) and
  `tokens/glows.js` (`glowMagenta`/`glowHarvest`/`glowOlive`).
- `docs/DESIGN-SYSTEM.md` §6.1 "Palette Rules" — the three palette laws
  (hue-family separation, no cross-group reuse, directional iconography) that
  justify and protect this change.
- Severity iconography/sparkline contract documented in §6 (color is category,
  icon is direction, sparkline is magnitude).

### Changed
- `--dr-severity-worsening` / `-improving` / `-stable` (and their `-bg` and
  `--dr-glow-severity-*` companions) now resolve to magenta / harvest / olive
  instead of amber-hot / amber / gold.
- `appTargets.somaCURA.severityMapping` in `tokens.json` repointed accordingly.
- `amberHot` and `gold` are no longer claimed by severity — freed for
  escalation/hover and general gold-accent roles. Their hex values are
  unchanged; no primitive value was mutated and no token was removed.

### ⚠️ ACTION REQUIRED — somaCURA (and any consumer reading concrete tokens)

This is backward compatible at the **package** level (every old variable still
exists and `--dr-amber-hot` / `--dr-amber` / `--dr-gold` are unchanged). It is
**not** transparent if you reference those concrete primitives directly for
clinical severity:

- If clinical severity is rendered from `--dr-amber-hot` / `--dr-amber` /
  `--dr-gold` (or the JS `amberHot`/`amber`/`gold`) directly, those call sites
  will **not** pick up the accessibility fix and will keep showing the
  collapsed amber cluster.
- **Migrate severity rendering to the `--dr-severity-*` indirection layer**
  (or to the new `--dr-magenta` / `--dr-harvest` / `--dr-olive` primitives).
  After migration, severity hues are distinct automatically.
- Directional severity (worsening/improving/stable) must also render the paired
  icon + sparkline from §6 — color alone no longer encodes direction by
  contract, even though the hues are now separable.

Treated as a minor release: additive tokens + an indirection repoint, no
renames or removals (the v3→v4 migration remains the precedent for what counts
as breaking). The consumer-side work above is a semantic migration, not a
broken package API.

## [4.0.1] — 2026-05-02

Accuracy pass + accessibility additions + README overhaul. This release was
shipped in git history (commit `5d398c1`) but the `version` field in
`package.json` and `tokens/tokens.json` was never advanced from `4.0.0`. This
entry reconciles the recorded version with the shipped state; there is no token
change in this release beyond what `5d398c1` already contained.

### Fixed
- `version` field synced to the actually-shipped `4.0.1` in `package.json` and
  `tokens/tokens.json`.
</content>
</invoke>
