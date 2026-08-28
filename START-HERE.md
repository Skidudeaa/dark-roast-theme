# START HERE

You are coming back to this cold and you do not remember it. That is expected and
it is fine. Nothing here requires memory.

## What this repository is

Two systems that share a package.

1. **The theme family** answers *what color is this?* Ten companion palettes across
   eleven platforms, generated from `src/tokens.json`. Namespace `--dr-*`. Mature,
   in production, published to npm.
2. **The operational interface system** answers *what does this element mean?*
   Nine orthogonal state axes, 54 semantic roles, and ten implemented structural
   primitives plus the experimental `compact-monitor` recipe. Namespace
   `--oi-*`, deliberately theme-neutral. Static, Playwright, axe, and visual
   proof are built; first product adoption remains unfinished.

## The three things to do when you sit down

1. **Run `npm test`.** Every failure names the file and tells you the command to
   fix it. You do not need to remember the rules — the build
   re-teaches you the relevant one at the moment it matters. After a fresh
   machine setup, run `npx playwright install chromium` once before the browser
   half of the suite.
2. **Read the "Current State" block at the top of `CLAUDE.md`.** That is where
   project state lives: what is done, what is next, what is blocked and why.
   Agents load that file automatically, so you can also just ask.
3. **If you are touching the `--oi-*` system, read `docs/SYSTEM-ARCHITECTURE.md`
   first.** It records what is actually built versus merely specified.

## State lives in exactly one place

`CLAUDE.md`. Not here.

This file is a map; it does not repeat status, because two copies of the same
status drift and then both become untrustworthy. That failure mode is the entire
reason the validator suite exists. When something lands, update the block in
`CLAUDE.md` and leave this file alone.

## The one hazard that spans repositories

**`docs/SOMACURA-MIGRATION.md`.** Read it before changing any CSS in the somaNotes
repository. The short version: somaCura runs five competing token systems and a
vendored copy of this package two majors behind, and one token name — `crater` —
exists in both versions with different values. A partial migration therefore
shifts colors on a clinical display *silently* rather than failing. That document
records the measured gap, the prior planning work that already exists in that
repo, and the ordering correction it needs.

## What to read, for what

| Question | Document |
|---|---|
| Where does this project stand? | `CLAUDE.md`, Current State block |
| How do I use the themes? | `README.md` |
| What color should this be, and why? | `docs/DESIGN-SYSTEM.md` |
| Why do the companions exist? | `docs/THEME-FAMILY.md` |
| What are the syntax highlighting rules? | `docs/SYNTAX-COLOR-SPEC.md` |
| What *should* an operational interface do? | `docs/OPERATIONAL-INTERFACE-DOCTRINE.md` |
| What of that is actually built? | `docs/SYSTEM-ARCHITECTURE.md` |
| How do I get Dark Roast into somaCura? | `docs/SOMACURA-MIGRATION.md` |
| What changed and when? | `CHANGELOG.md` |

## Things that belong to this work but live elsewhere

- **`~/.agents/skills/phind-ux/`** — an agent skill holding the interaction
  grammar salvaged from the Phind VS Code extension: context flow, the
  accept/reject-with-partials contract, calm streaming. Symlinked into
  `~/.claude/skills/`. It triggers on any chat or AI-assistant UI work without
  being asked for. The formal, evidence-cited version of that extraction is in
  this repo at `src/system/studies/phind-extension.md`; the doctrine wins where
  they disagree.
- **`Skidudeaa/somaNotes`** — carries a `CRITICAL` warning in its root `CLAUDE.md`
  and a banner on `packages/dark-roast/README.md` about the stale vendored copy.
  That repo has no CI.

## The rule worth keeping

Nothing is trusted because it is written down. It is trusted because a check
fails when it stops being true. If you add a rule, add the check — otherwise you
have added an opinion, and opinions rot quietly.
