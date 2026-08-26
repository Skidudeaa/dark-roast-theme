# Source study: Phind VS Code extension

**Stage:** study
**Doctrine reference:** `docs/OPERATIONAL-INTERFACE-DOCTRINE.md` §18 (pattern study and promotion), §21 (study format precedent: Clauddy)
**Date:** 2026-08-26

---

## 1. Source and provenance

- Product: Phind.com "Chat with your Codebase" VS Code extension
- Publisher: phind (marketplace publisher ID `98ecb0a9-0cd4-462a-a468-5b608fcdab44`)
- Version studied: `0.25.4`, built 2024-09-05, installed from the marketplace 2024-09-05 (`installedTimestamp: 1725528892253`)
- Local reference artifact: `~/jan25/ollama-sentinel/phind.phind-0.25.4/` (installed extension directory, retained as archive)
- Evidence files examined:
  - `package.json` — command, keybinding, menu, and view contributions
  - `README.md` — interaction affordance documentation
  - `media/phind.css` — extension-specific webview styles (hand-written, unminified)
  - `media-shared/styles.css`, `media-shared/darkmode.css` — shared phind.com styles
  - `media-shared/theme.bundle.css` — the site's compiled Bootstrap 5 theme (typographic and geometric system)
  - `media-shared/theme.bundle.css.modified` — a locally edited copy predating this study; evidence of earlier informal mining, superseded by this document
- Application logic (`out-bundle/main.js`, `compiled-react/webview.bundle.js`) is minified and was NOT decompiled or studied beyond dependency inspection of `package.json`.

## 2. Study target

Two things, deliberately separated:

1. **Interaction grammar** — the context-flow, proposal, and streaming behavior model that made this one of the earliest coherent AI-assistant editor UIs (September 2024, predating much of what later became standard).
2. **Compact operational chat anatomy** — the structural skeleton of a conversation surface embedded in a working tool: density, hierarchy without labels, attention budget.

This is not a palette study. Dark Roast owns pigment; Phind's colors appear below only as evidence of *restraint*, not as values to adopt.

## 3. Extracted relationships

Each relationship is stated theme-neutrally and mapped to doctrine concepts.

### 3.1 Context flows toward one conversation surface

Every context source in the host environment has an explicit one-action route INTO the conversation: editor selection (context menu + keybinding), terminal output (terminal context menu + keybinding), files (`@file` inline mention), web (`@web_search` inline mention).
Evidence: `package.json` `menus.terminal/context`, `menus.editor/context`, `phind.searchTerminalOutput`, `phind.searchSelection`; `README.md` `@`-mention documentation.
Doctrine mapping: product-adapter responsibility; the recipe only guarantees a `composer` slot capable of representing attached context.

### 3.2 "New conversation with X" and "add X to current conversation" are distinct intents

Bound separately (`phind.newSearchSelection` vs `phind.searchSelection`; Cmd+I vs Cmd+Shift+I) and both surfaced. Collapsing them forces users to either pollute an existing thread or lose accumulated context.
Doctrine mapping: interaction contract of a future conversation recipe — two adjacent, symmetric affordances. Exact keybindings are NOT contract (see §5).

### 3.3 Machine-proposed changes follow a proposal contract with partial resolution

Accept all, reject all, partial accept, partial reject are four distinct commands (`phind.acceptCodeChanges`, `phind.rejectCodeChanges`, `phind.partialAcceptCodeChanges`, `phind.partialRejectCodeChanges`), bound symmetrically. Proposals never auto-apply.
Doctrine mapping: this generalizes beyond code. Any generated content applied to user-owned state is `data-oi-source="generated"` + `data-oi-certainty="inferred"` until the user resolves it; resolution granularity must include partial acceptance. Candidate interaction contract (§6.2).

### 3.4 Streaming is visible but never competes with reading

Two-stage signal: a three-dot flashing loader before first token; during generation, a 2px outline pulse on the live region cycling 0 → 0.1 → 0 alpha over ~1s. No spinner overlays content; no layout shift at first token.
Evidence: `phind.css` `@keyframes streaming`; `styles.css` `.dot-flashing`.
Doctrine mapping: `data-oi-activity="live"` presentation. Conforms to §5.6 (one live animation per region) and §5.11 (infinite animation only for genuinely live process; bounded intensity). The pre-token and mid-stream states are distinct async scenarios per §5.12.

### 3.5 One exceptional treatment marks the primary input, and nothing else

The composer carries the interface's only gradient (a 3px warm-to-cool border); a documented "no-gradient" variant exists for secondary inputs. Everything else is flat tonal surfaces.
Evidence: `styles.css` `.search-bar-input-group` / `.search-bar-no-gradient`.
Doctrine mapping: attention budget (§5.6) — a bounded region has one dominant accent, and it is spent on the point of action. In Dark Roast terms this role belongs to `--oi-accent-primary` emphasis, not literally a gradient.

### 3.6 Capabilities are taught at the point of need

`@`-mentions, `@web_search`, and shortcuts are documented in the input placeholder and inline affordances, not settings panes.
Doctrine mapping: recipe-level guidance for a `composer` slot; supports the doctrine's "next safe action is legible" purpose statement.

### 3.7 Hierarchy is structural, labels are absent

Conversation roles are distinguished by surface containment (answers on cards, user turns plain), not by per-message role captions. Content sits in a bounded measure (`#content-wrapper { max-width: 800px }`).
Evidence: `phind.css` `#content-wrapper`; absence of role-label styling anywhere in the CSS.
Doctrine mapping: §5.2 hierarchy is structural. Maps to `surface` (raised for answers) + `stack` rhythm.

### 3.8 A real typographic system does the quality lifting

DM Sans at 1.125rem body / 1.6 line-height; heading scale 2.25 / 1.75 / 1.25 / 1.125 / 1 / .875rem; `small` at 88%; SFMono-family monospace stack; radii .5rem (workhorse) and 1rem (hero), pills at 50rem.
Evidence: `theme.bundle.css` `:root` `--bs-body-*`, heading rules, radius frequency analysis.
Convergence: DM Sans is already a Dark Roast typography token (`dist/tokens/typography.js`), making this relationship natively expressible.
Doctrine mapping: semantic contract `typography` and `geometry` categories.

### 3.9 Selection state, hover state, and severity never share a channel

Sidebar history items have distinct rest/hover/selected treatments (background + text color pairs); context pills have five explicit states (rest, hover, active, selected, disabled); additive actions alone use green.
Evidence: `styles.css` `.chat-history-sidebar-item*`; `phind.css` `.context-button*`, `.dropdown-add-phind`.
Doctrine mapping: §5.3 orthogonal state; native interaction semantics (§7.10); severity axis unused for selection — as it should be.

### 3.10 Container-level adaptation, not viewport imperialism

The webview CSS adapts at 500px and 300px of its own panel width (progressively dropping optional columns and revealing compact headers), because a sidebar panel cannot assume the viewport.
Evidence: `phind.css` `@media (max-width: 500px)`, `@media (max-width: 300px)` and `.phind-context-table-*` collapse rules.
Doctrine mapping: §5.9 responsiveness is local. In doctrine implementation this becomes container queries, which did not yet exist for this 2024 artifact.

### 3.11 Failure is contained and recoverable

Errors render in a dedicated dismissible region with scrollable detail, not as content replacement.
Evidence: `phind.css` `#error-container`, `#error-flex`, `#error-x`.
Doctrine mapping: §5.12 failure localized to the smallest responsible region; recovery visible.

## 4. Rejected source-specific elements

- All minified application code (`out-bundle/`, `compiled-react/`) — never decompiled, never ported
- Phind branding, logos, sidebar icon, and product name
- Bootstrap 5 framework dependency and its utility-class architecture (contradicts doctrine CSS layers and no-reset rule)
- `!important`-laden overrides, magic-number positioning (`left: -0.7vw`), and duplicated rules between `styles.css` and `darkmode.css` — documented flaws, not patterns
- Phind's palette values (`#171719`, `#5b74e3`, gradient `#ED6E61 → #6359E1`, Dracula code blocks) — evidence of restraint only; Dark Roast mappings own pigment
- Exact keybindings (Cmd+I etc.) — the *distinction between intents* is contract; the bindings are host-environment convention
- Mixpanel telemetry, auth flow, account/history retention behavior
- `data-theme` light/dark switch mechanism (Dark Roast theming supersedes it)

## 5. Legal boundary

The extension is proprietary marketplace software (`"private": true`, no license grant). This study ports **relationships and behavior semantics** through independent implementation. No source file, selector name, asset, or code fragment ships in any doctrine artifact. CSS values quoted above are uncopyrightable facts cited as evidence. The reference artifact remains local and unredistributed.

## 6. Candidate proposals

Names reserved per doctrine §11.2 practice; nothing here is a public contract until separately designed and proven.

### 6.1 `conversation-shell` (candidate recipe)

A rail of prior conversations + a bounded-measure turn stream + a pinned composer region. Slot sketch: `history` (optional, collapsible), `turns` (required), `live` (optional, streaming presentation), `composer` (required), `hints` (optional, shortcut education). Builds on `rail`, `stack`, `surface`, `inset`, `cluster`. Async behavior: live streaming per §3.4; refresh retains turns.

### 6.2 Proposal-resolution interaction contract (candidate)

For `data-oi-source="generated"` content applied to user-owned state: render as proposal; require explicit resolution; resolution operations MUST include accept-all, reject-all, and partial accept/reject; resolution affordances are adjacent and symmetric. Generalizes §3.3 beyond code diffs (clinical note edits, email drafts, portfolio actions).

### 6.3 Composer emphasis rule (doctrine note, not artifact)

Within a conversation recipe, the composer is the single permitted point of maximum persistent visual emphasis. Candidate refinement to §5.6.

## 7. Promotion conditions

This study advances to candidate when `conversation-shell` receives a theme-neutral slot specification, and to experimental only when a real product surface (MailMind chat, somaNotes assistant, or equivalent) consumes it. Per doctrine §18, no stable status without real use and the full proof matrix.

## 8. Related prior work

An informal extraction of this source exists as the personal `phind-ux` agent skill (`~/.agents/skills/phind-ux/`), which bundles a standalone `--px-*` token sheet. That skill is a delivery vehicle, not doctrine: its tokens intentionally violate §5.1 (palette baked into components) because it predates this study. When doctrine primitives and a `conversation-shell` recipe exist, the skill should defer to them and keep only the interaction grammar.
