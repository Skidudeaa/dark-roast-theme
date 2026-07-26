# Handoff — dark-roast-theme 5.6.0

**As of:** 2026-07-26
**Repo state:** `master @ 2cde109`, working tree clean apart from this handoff
**Test state:** `npm test` exits 0 — 9/9 companions passing
**Open items:** the Blue Mountain commit is unpushed; npm publish is blocked on an
interactive login.

---

## Two things left to do

### 1. Push Blue Mountain

`2cde109 feat(themes): add Dark Roast: Blue Mountain` is committed locally but **not on
origin**. It validates cleanly (info 4.56:1, chroma 0.146/0.136, severity 44.7°, actions
6.66:1) and picked up a Blink theme automatically from the generator.

```bash
git push origin master
```

### 2. Publish to npm

`dark-roast-theme` has **never been published** — the registry returns 404. Publishing is a
*first publish* that claims the name permanently; 5.0.0–5.5.0 will never exist on npm.
Unpublish is limited to 72 hours and a version number can never be reused. That decision is
the user's, not a routine step.

```bash
! npm login        # MUST be foreground — see gotcha below
npm whoami         # confirm it took
npm publish        # prepublishOnly runs the full suite automatically
```

With 2FA: `npm publish --otp=123456`. An earlier attempt cleared `prepublishOnly` and packed
cleanly, failing only at the auth handshake. Note the version to publish is now **5.6.0**.

---

## Gotchas

**`npm login` must run in the foreground.** It was backgrounded once and died with exit 1 at
the `Username:` prompt — it prints a browser URL, then falls back to reading stdin, which a
backgrounded process has no terminal for. Nothing was wrong with the account or the package.
In Claude Code, prefix with `!` so it stays interactive.

**Cold Brew is `web`-only by design.** Its registry is compiled by
`scripts/build-cold-brew.js` from `src/cold-brew.seeds.json` — *not* by the brew engine. A
`src/recipes/cold-brew.json` once duplicated it and silently overwrote the shipped v5.2.0
palette with a weaker one. That recipe is deleted and a guard now prevents recurrence, but
do not re-add a recipe with that id. If Cold Brew is ever wanted in a terminal, widen
`targets` in the **seeds** file.

**Registry ownership is enforced.** Brewed registries carry `generator: "brew-engine"`.
`scripts/reconcile-recipes.js` refuses to overwrite any registry it does not own and exits
non-zero. Hand-authored companions (House Blend, Copper Roast, Velvet, Velvet Noir, Blue
Mountain) and seed-compiled ones (Cold Brew) are protected. Use `--adopt` only for
registries brewed before provenance tracking existed.

**Black Label is frozen.** 17 canonical files are byte-identical to v5.0.0 and guarded by
`scripts/check-black-label-contract.js`. `src/tokens.json` stays at version `5.0.0` — every
companion pins its SHA-256 fingerprint, so bumping it invalidates all of them. Package
version and token version are deliberately different numbers.

**The brew engine asserts before returning.** It solves for its declared floors and throws
with a diagnostic rather than emitting a palette that would fail validation. If a new recipe
throws "sRGB delivers at most X", the recipe is asking for more chroma than the gamut has at
that lightness — lower the floor or relax the contrast target, don't weaken the validator.

**Severity separation is measured in HSL, not OKLCH.** `validate-themes.js` uses HSL hue. A
30° OKLCH gap can collapse to 20°. The engine solves against the *delivered* HSL hue after
placement.

**Blink themes are hterm JavaScript.** The cursor must stay translucent (65% alpha) — hterm
paints the cursor over the glyph instead of inverting it, so an opaque block hides the
character underneath. `validate-platforms.js` enforces this.

**A terminal-only companion needs target-aware validation.** Velvet was the first
`targets: ["terminal"]` variant and exposed a latent bug where `plistRequestsFor` demanded
Textastic/Xcode plists from any variant shipping to either the editor or terminal group.
Fixed, but worth knowing if another narrow target set is added.

---

## Optional follow-ups (none blocking)

1. **`npm pkg fix`** — npm auto-normalizes `repository.url` to `git+https://...` and warns on
   every publish. Cosmetic.
2. **Nitro sits at 4.08:1**, because `src/recipes/nitro.json` declares
   `contrast_target: 4.0` — below WCAG AA. Deliberately left as authored. Changing it to
   `4.5` makes the engine re-solve the palette to meet it.
3. **Velvet / Velvet Noir are `targets: ["terminal"]`** with `contrastSurface: "void"`, which
   is honest for a terminal-only companion. Widening them to editor/web would require
   re-validating against a lifted surface, and their accents would have to lighten.

---

## Recent history

**5.6.0 — Blue Mountain** (landed after the work below, hand-authored, all targets, dark
polarity, canvas `#000B1D`, the family's first cold canvas).

**5.5.0 — brew engine correctness.** Five defects; `npm test` went from 17 failures to green.
The engine mirrored lightness for light polarity, burying accents where sRGB has no chroma
to give (core averages capped at 0.089 against a declared 0.120 regardless of
`chroma_scale`), and it published floors it never verified. Chromatic roles are now *placed*
at the lightness carrying the most colour that still clears the contrast target. Also fixed
the Cold Brew overwrite, added registry ownership, deterministic UUIDv5 `textasticUuid`, and
HSL-space severity separation. Packaging: `scripts/` and `lib/` dropped from the published
`files`, so the artifact contains the theme, not the build toolchain, preserving zero runtime
dependencies.

**5.4.0 — Velvet, Velvet Noir, and the Blink Shell platform.** Terminal companions at ~2x and
~2.4x Black Label's surface chroma on mahogany-wine `#190605` and plum-black `#14030C`.
`platforms/blink/` ships hterm themes for iOS/iPadOS, ANSI-identical to
Warp/Tabby/iTerm2/Terminal.app; Black Label is hand-authored, companions generated, each
validated by executing it against a stub hterm.

Blink themes are served from the repo for iPad import (a temporary gist used during design
has been deleted):

```
https://raw.githubusercontent.com/Skidudeaa/dark-roast-theme/master/platforms/blink/Dark%20Roast%20Velvet.js
```
