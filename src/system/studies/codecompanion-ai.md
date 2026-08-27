# Source study: CodeCompanion.AI

**Stage:** study
**Doctrine reference:** `docs/OPERATIONAL-INTERFACE-DOCTRINE.md` §§5, 10–13, 18, and 21
**Date:** 2026-08-26
**Reference corpus:** local only; never packaged or redistributed

The classification labels used below are normative for this study:
`product behavior`, `reusable interaction contract`, `reusable composition
recipe`, `existing doctrine concept`, and `rejected implementation detail`.
They describe the disposition of a finding, not the licensing status of its
source.

## 1. Source identity, version, and provenance

- **[product behavior]** The studied product identifies itself as
  CodeCompanion.AI, a desktop coding agent, version 7.1.23. Evidence:
  reference corpus `app/package.json:1-6`.
- **[product behavior]** The corpus is an extracted application archive from a
  locally installed commercial application, not an authored source checkout.
  The extraction record and archive inventory remain beside the corpus, outside
  this repository. Evidence: reference corpus `CLAUDE.md:5-24` and
  `PROVENANCE.txt:1-7`.
- **[rejected implementation detail]** No claim in this study establishes that
  the extracted application can still run, that its services remain available,
  or that any observed source path was verified at runtime. The application was
  not executed.

## 2. Legal and redistribution boundary

The reference is proprietary commercial material with no shipped open-source
license grant. It remains local and untracked by Dark Roast. This document is an
independent description of relationships and interaction semantics; it contains
no copied source, prompts, selectors, assets, credential values, or substantial
product text.

- **[rejected implementation detail]** Authentication, licensing, updating,
  telemetry, notarization, and credential-bearing code or configuration are
  excluded. The environment file was not opened.
- **[rejected implementation detail]** Nothing from the reference corpus may be
  committed, packaged, published, uploaded, or used as a runtime dependency.
- **[reusable interaction contract]** A behavior may advance only after it has
  been restated without source nouns and independently implemented against the
  doctrine contract.

## 3. Study target and exclusions

The study target is the application-owned shell and its visible causal path:
conversation, context admission and inspection, task framing, research, tool
execution, approval, generated-change review, rollback, workspace modes, and
recovery.

- **[product behavior]** Evidence was limited to application-owned files under
  `app/`, principally the shell markup, renderer/controller code, chat context,
  planning, tabs, tool presentation, and checkpoint coordination.
- **[rejected implementation detail]** Dependencies, bundled fonts, secrets,
  source prompts, model credentials, vendor services, and platform packaging are
  outside scope.
- **[rejected implementation detail]** This is not a palette study and not an
  endorsement of the source architecture, security model, framework choices, or
  direct DOM implementation.

## 4. Application shell anatomy

- **[product behavior]** A persistent command band sits above both work regions
  and exposes configuration, model choice, approval policy, status, save, and
  history. Evidence: `app/index.html:25-78`.
- **[reusable composition recipe]** The primary shell is a two-region workbench:
  one region owns the conversation and composer; the other owns a switchable
  inspection/execution workspace. A draggable boundary changes their relative
  allocation. Evidence: `app/index.html:80-204` and
  `app/app/view_controller.js:277-314`.
- **[product behavior]** The workspace region presents task/context, terminal,
  code, and browser modes through one native tab surface. Evidence:
  `app/index.html:205-394`.
- **[rejected implementation detail]** Fixed viewport calculations, percentage
  widths, inline positioning, source framework utilities, and direct element
  mutation are not portable shell contracts.

## 5. User-visible information hierarchy

- **[product behavior]** The dominant reading path is chronological: completed
  turns, live output, action preview, approval or retry, then the anchored point
  of input. Evidence: `app/index.html:83-197` and
  `app/app/chat/chat.js:176-221`.
- **[product behavior]** Task framing and context inventory remain visible in the
  adjacent workspace without displacing the conversation. Evidence:
  `app/index.html:274-310` and `app/app/chat/tabs/task.js:13-105`.
- **[existing doctrine concept]** Native tabs and disclosures carry selection
  and expansion; these states do not require a new doctrine axis. Evidence:
  `app/index.html:205-310`; doctrine §7.10.
- **[existing doctrine concept]** Settings and saved history sit outside the
  default operational scan path. Evidence: `app/index.html:399-669`; this agrees
  with structural hierarchy and with Clauddy's separation of configuration from
  current signal.
- **[rejected implementation detail]** Initial tab accessibility attributes are
  internally inconsistent with the visually active tab. Evidence:
  `app/index.html:208-230`. Library repair is not an acceptable doctrine
  contract.

## 6. Context assembly and provenance presentation

- **[product behavior]** Model context is assembled from policy, project
  overview and instructions, the task, reduced conversation history, selected
  file contents, working directory, and project structure. Evidence:
  `app/app/chat/context/contextBuilder.js:15-105`.
- **[product behavior]** Files referenced during conversation and selected recent
  edits may become active context; historically co-edited files may be added as
  inactive suggestions. Evidence: `app/app/chat/context/contextFiles.js:75-174,283-295`
  and `app/app/lib/CoEditedFiles.js:44-130`.
- **[reusable interaction contract]** Suggested context is visually adjacent to
  the composer, remains inactive until admitted, and becomes inspectable after
  admission. Evidence: `app/app/chat/relevant_files_finder.js:6-40`.
- **[reusable interaction contract]** Active context has an explicit inventory,
  count, and per-item inclusion control. Evidence:
  `app/app/chat/tabs/task.js:19-84`.
- **[rejected implementation detail]** Automatic additions do not visibly state
  why an item was selected, and token-pressure reduction can disable files or
  summarize older turns without exposing the reduction event or fidelity.
  Evidence: `app/app/chat/context/contextFiles.js:200-280` and
  `app/app/chat/context/contextReducer.js:13-98`.
- **[existing doctrine concept]** Source, freshness, certainty, and completeness
  already own the missing provenance semantics. This evidence does not justify a
  new axis; it requires non-color labels and inspectable reduction history under
  doctrine §§5.4 and 9.

## 7. Planning and research presentation

- **[product behavior]** Initial task handling performs safety classification,
  derives a concise title, and focuses the task brief before execution.
  Evidence: `app/app/chat/planner/planner.js:10-36`,
  `app/app/chat_controller.js:288-297`, and
  `app/app/chat/tabs/task.js:86-105`.
- **[rejected implementation detail]** The source does not render an actionable
  plan, plan steps, dependencies, or plan status. Calling this a reusable
  `plan / execute / inspect / resolve` composition would overstate the evidence.
- **[product behavior]** Research runs as a subordinate multi-step process whose
  structured result feeds the main agent; the visible conversation generally
  receives a generic progress preview and selected summaries. Evidence:
  `app/app/chat/planner/researchAgent.js:30-78,116-147` and
  `app/app/tools/tools.js:181-183,460-510`.
- **[rejected implementation detail]** Research sources, intermediate steps,
  certainty, completeness, and failures are not presented as a persistent
  inspection surface. No research-workbench contract is demonstrated.

## 8. Tool-call lifecycle

- **[product behavior]** Tool requests are processed sequentially, receive an
  inline preview, and append completion, cancellation, or error feedback to the
  conversation. Evidence: `app/app/chat/agent.js:49-99,269-322` and
  `app/app/tools/tools.js:155-190`.
- **[reusable interaction contract]** A consequential action should expose intent
  before execution and retain its result in the causal reading path.
- **[reusable interaction contract]** Repeated identical action requests force a
  fresh decision even when the global approval policy is permissive. This is a
  useful loop-breaker, not a new state axis. Evidence:
  `app/app/chat/agent.js:226-237,264-267`.
- **[rejected implementation detail]** Preview, running, result, and cancellation
  are flattened into ordinary turns rather than a persistent lifecycle model.
  The source therefore does not demonstrate an `execution-lane` or
  `tool-run-inspector` recipe.
- **[reusable interaction contract]** Every proposed action must settle on
  cancellation or navigation. A pending decision that survives the global stop
  action is an unresolved effect boundary, not a paused action. Evidence:
  `app/app/chat/agent.js:240-255` and
  `app/app/chat_controller.js:196-208,314-351`.
- **[existing doctrine concept]** Activity, completeness, severity, and native
  interaction semantics can represent lifecycle combinations without another
  generic state bucket.

## 9. Approval and mutation boundaries

- **[product behavior]** The shell exposes a global approval policy, while gated
  actions present per-action reject, approve, and approve-then-pause choices.
  During the gate, input is disabled, focus moves to the decision region, and
  returns afterward. Evidence: `app/index.html:38-58,92-117` and
  `app/app/chat/agent.js:226-262`.
- **[reusable interaction contract]** Candidate mutation gate:
  `preview -> authorize or reject -> execute -> report`, with an optional
  authorize-one-and-stop branch for a multi-action response. A true pause would
  also require resumable queued state, which the source does not provide. Focus
  movement and cancellation outcome are part of the contract.
- **[existing doctrine concept]** Approval is interaction policy, not severity.
  Busy and disabled remain distinct, and responsible regions own their activity.
- **[rejected implementation detail]** Exact tool allowlists, button labels,
  keyboard choices, polling, and global policy storage belong to product
  adapters.

## 10. Diff and proposal-resolution behavior

- **[product behavior]** A generated file mutation is previewed as a change
  artifact before authorization. Evidence: `app/app/tools/tools.js:155-166`,
  `app/app/chat/agent.js:316-322`, and
  `app/app/components/code_block.js:9-48`.
- **[existing doctrine concept]** This corroborates the Phind
  proposal-resolution contract: generated content applied to user-owned state is
  a proposal, not an automatic mutation.
- **[rejected implementation detail]** Resolution is whole-operation only. It
  does not demonstrate partial accept and partial reject, so Phind's stronger
  granular contract remains authoritative.
- **[reusable interaction contract]** A proposal must carry an immutable base
  fingerprint and revalidate it immediately before application. If user-owned
  state changes after preview, the proposal becomes visibly stale or disputed
  rather than overwriting the newer state. Evidence:
  `app/app/tools/apply_changes.js:8-13,15-56` and
  `app/app/chat/tabs/code.js:177-219,392-400`.
- **[rejected implementation detail]** The source's proposal cache does not bind
  its identity to the base revision, and proposal preparation may occur before
  the relevant authorization boundary. Those mechanics are not portable or
  safe enough to adopt. Evidence: `app/app/chat/agent.js:52-53,101-120` and
  `app/app/tools/apply_changes.js:15-46`.
- **[rejected implementation detail]** A separate `generated-change-proposal`
  recipe would duplicate an existing candidate interaction contract.

## 11. Checkpoint and rollback behavior

- **[product behavior]** When enabled, the application attempts to capture a
  recoverable project boundary immediately before tool execution. A generated
  change artifact can expose rollback, confirmation, and causal conversation
  rewind. Evidence: `app/app/chat/agent.js:269-295`,
  `app/app/components/code_block.js:25-45,77-105`, and
  `app/app/lib/CheckpointManager.js:116-179`.
- **[reusable interaction contract]** Candidate checkpointed action: create the
  recovery boundary before mutation, bind rollback to the action that caused the
  change, disclose blast radius, confirm destructive rewind, and make the new
  causal state visible.
- **[rejected implementation detail]** The hidden repository, storage layout,
  project-size policy, destructive clean/reset sequence, and chat deletion
  mechanics are source-specific and unsafe to transplant. Evidence:
  `app/app/lib/CheckpointManager.js:17-24,82-110,144-179`.
- **[rejected implementation detail]** The visible rollback affordance may
  appear before checkpoint creation succeeds, and project-only recovery can be
  presented beside effects whose blast radius extends beyond the project. A
  kernel contract must never claim recoverability it has not proven. Evidence:
  `app/app/components/code_block.js:25-45,77-105`,
  `app/app/chat/agent.js:269-295`, and
  `app/app/tools/tools.js:255-283`.
- **[existing doctrine concept]** Doctrine §5.12 already permits optimistic
  behavior only when rollback is safe and intelligible. The candidate refines
  interaction, not state vocabulary.

## 12. Terminal and browser workspaces

- **[product behavior]** Terminal, code, and browser share the adjacent workspace
  while the conversation remains present. Evidence: `app/index.html:205-394`.
- **[reusable interaction contract]** A terminal selection and code selection can
  enter the current conversation in one action. Evidence:
  `app/app/tools/terminal_session.js:325-382` and
  `app/app/chat/tabs/code.js:50-109`.
- **[reusable interaction contract]** A browser screenshot can enter the same
  conversation, preserving the viewed page as context rather than requiring
  manual transcription. Evidence: `app/app/chat/tabs/browser.js:184-215`.
- **[product behavior]** Browser loading and failures are reflected within the
  browser mode, and readable page content can be returned to the agent. Evidence:
  `app/app/chat/tabs/browser.js:21-39,112-178,232-247`.
- **[rejected implementation detail]** Embedded-browser security settings,
  terminal protocol, editor library, screenshot encoding, raw terminal colors,
  and platform IPC are adapter concerns, not kernel architecture.

## 13. Async, partial, failure, cancellation, and recovery behavior

- **[product behavior]** Generated text renders incrementally in a separate live
  region. Evidence: `app/app/chat/chat.js:19-24,209-221`.
- **[product behavior]** A persistent interrupt action cancels model and terminal
  work; errors remain in the conversation and expose retry. Evidence:
  `app/index.html:118-127,181-190` and
  `app/app/chat_controller.js:183-258`.
- **[product behavior]** Saved sessions restore conversation, task, context-file
  inclusion, working directory, and model together. Evidence:
  `app/app/chat/chat_history.js:71-124`.
- **[rejected implementation detail]** One global loader represents several
  materially different phases, while the browser has a separate loader. Phase,
  locality, partial completion, and provenance are not modeled consistently.
  Evidence: `app/app/view_controller.js:238-248`,
  `app/app/chat_controller.js:214-258`, and
  `app/app/chat/tabs/browser.js:21-39`.
- **[rejected implementation detail]** Cancellation does not settle every
  in-flight region, and partial streamed output is cleared on some abort or
  error paths instead of surviving as explicitly partial evidence. Evidence:
  `app/app/chat/chat.js:176-205`,
  `app/app/chat_controller.js:196-208`, and
  `app/app/chat/tabs/browser.js:66-110`.
- **[rejected implementation detail]** Source code attempts to stop automatic
  tail-follow after user scrolling, but the streaming path resets that guard on
  each update. Runtime effect is **UNVERIFIED** because the application was not
  run. Evidence: `app/app/view_controller.js:17-21,138-146` and
  `app/app/chat/chat.js:209-221`.
- **[existing doctrine concept]** Local activity, retained data, visible partial
  completeness, failure containment, and actionable recovery are already laws in
  doctrine §5.12. No new async axis is justified.

## 14. Theme-neutral extracted relationships with file-level evidence

| Classification | Theme-neutral relationship | Evidence | Doctrine mapping |
|---|---|---|---|
| reusable composition recipe | A conversation may remain persistent beside a switchable work region, with a parent-owned resizable relationship. | `app/index.html:80-394`; `app/app/view_controller.js:277-314` | Compose `rail`, `surface`, `stack`, and the reserved `conversation-shell`; do not create a layout primitive. |
| reusable interaction contract | Every visible context source should have a one-action route into the current conversation. | `app/app/chat/tabs/code.js:50-109`; `app/app/tools/terminal_session.js:325-382`; `app/app/chat/tabs/browser.js:184-215` | Existing Phind context-flow contract. |
| reusable interaction contract | Suggested context and active context are distinct states; admission is explicit and reversible. | `app/app/chat/relevant_files_finder.js:6-40`; `app/app/chat/tabs/task.js:19-84` | Enrich reserved `context-composer`; represent source and inclusion without a new axis. |
| reusable composition recipe | Context inspection combines task framing, active inputs, excluded suggestions, budget, and provenance without replacing the conversation. | `app/index.html:274-310`; `app/app/chat/tabs/task.js:13-105`; `app/app/chat/context/contextFiles.js:257-295` | Candidate context-inspection recipe, only if kept distinct from admission in `context-composer`. |
| reusable interaction contract | Consequential actions expose intent and require an explicit decision before execution. | `app/index.html:92-117`; `app/app/chat/agent.js:226-295` | Candidate mutation gate using native focus and existing activity semantics. |
| existing doctrine concept | Generated changes are proposals requiring resolution. | `app/app/tools/tools.js:155-166`; `app/app/components/code_block.js:9-48` | Reuse Phind proposal resolution; retain partial operations as the stronger requirement. |
| reusable interaction contract | Recoverable mutations bind a pre-action checkpoint and a visible rollback affordance to the same causal artifact. | `app/app/chat/agent.js:269-295`; `app/app/components/code_block.js:77-105` | Candidate checkpointed action; doctrine §5.12 owns safe rollback. |
| existing doctrine concept | Async state and failure belong to the smallest responsible region, with persistent cancel or retry at the point of action. | `app/app/chat_controller.js:183-258`; `app/app/chat/tabs/browser.js:21-39,112-178` | Existing activity/completeness axes and async law. |
| product behavior | A saved work session restores conversational and context assembly state as one unit. | `app/app/chat/chat_history.js:71-124` | Evidence for recovery design, insufficient for a public session contract because workspace-mode state is incomplete. |

## 15. Explicitly rejected source-specific elements

- **[rejected implementation detail]** Product name, branding, application text,
  prompts, selectors, assets, and exact interaction labels.
- **[rejected implementation detail]** Source palette values, terminal palette,
  framework classes, icon library, fixed geometry, viewport calculations, inline
  styles, and ID-coupled DOM mutation. Evidence: `app/index.html:80-204,269-392`
  and `app/styles/styles.css:1-69`.
- **[rejected implementation detail]** Electron process/security choices,
  embedded browser, terminal and editor libraries, filesystem watchers, IPC, and
  direct filesystem writes.
- **[rejected implementation detail]** Credential-bearing configuration or code,
  authentication, licensing, updater, telemetry, notarization, and vendor service
  behavior.
- **[rejected implementation detail]** Hidden context reduction, global loading
  state, whole-operation-only proposal resolution, and repository-wide rollback
  mechanics.
- **[rejected implementation detail]** Any primitive created merely to share the
  source's styling or any recipe that embeds terminal, browser, code, or agent
  vocabulary into the kernel.

## 16. Candidate doctrine contracts or recipes

All items remain **study** or **candidate**. None is added to the manifest by this
study.

### 16.1 Workbench shell — candidate recipe

**[reusable composition recipe]** A domain-neutral replacement for the proposed
`agent-workbench`: required `conversation`, `workspace-navigation`, and
`workspace` regions; optional `context` and `status` regions. It composes the
existing `rail` primitive and reserved `conversation-shell`. Product adapters
name and populate workspace modes. The kernel must not prescribe terminal,
browser, editor, or agent navigation.

### 16.2 Context inspector — candidate responsibility

**[reusable composition recipe]** A context-inspection recipe is justified only
if it owns visibility and control of active, suggested, excluded or reduced
inputs, budget, and provenance. Admission remains the responsibility of the
reserved `context-composer`. A slot specification is required before reserving a
second public recipe name; `context-workbench` is therefore evaluated but not
adopted here.

### 16.3 Mutation gate — candidate interaction contract

**[reusable interaction contract]** Preview intent, expose explicit authorize and
reject operations, optionally authorize-one-and-stop a multi-action response,
localize activity and failure, preserve context during the decision, and return
focus predictably. Cancellation settles every pending decision. Irreversible
actions require product-owned policy and cannot inherit a generic approval
assumption.

### 16.4 Checkpointed action — candidate interaction contract

**[reusable interaction contract]** When recovery is real, capture it before the
mutation, disclose coverage and blast radius, attach rollback to the causal
artifact, confirm destructive rewind, and report the resulting state. This may
be an optional capability of the mutation gate rather than a separate recipe.
The affordance remains absent unless checkpoint creation and effect coverage are
both proven.

### 16.5 Candidates not supported

- **[rejected implementation detail]** `execution-lane` and
  `tool-run-inspector`: the source has no persistent structured lifecycle surface.
- **[rejected implementation detail]** `workspace-mode rail`: existing `rail`
  owns region layout and native tabs own mode selection.
- **[rejected implementation detail]** `generated-change proposal`: already
  covered by the Phind proposal-resolution candidate.
- **[rejected implementation detail]** `plan / execute / inspect / resolve`: the
  source displays a task brief, not an actionable plan.

## 17. Overlap and conflicts with Phind and Clauddy

### Phind

- **[existing doctrine concept]** Both sources converge on one conversation
  surface, one-action routes from nearby context, an anchored composer,
  incremental output, and explicit generated-change review.
- **[rejected implementation detail]** CodeCompanion exposes only add-to-current
  context; it does not demonstrate Phind's separate new-conversation-with-context
  intent.
- **[rejected implementation detail]** Its composer does not teach an inline
  context or command grammar at the point of need.
- **[rejected implementation detail]** Its global spinner and likely forced
  tail-follow are less calm and less local than Phind's live-region contract.
- **[existing doctrine concept]** Its whole-operation approval is weaker than
  Phind's partial proposal resolution. Phind and the doctrine win where they
  conflict.

### Clauddy

- **[existing doctrine concept]** The sources converge on context and compact
  controls before operational content, progressive disclosure of secondary
  detail, and configuration outside the primary scan path.
- **[rejected implementation detail]** The workbench is not a compact monitor. It
  does not demonstrate Clauddy's status-to-primary-measure-to-details-to-history
  ladder and must not be forced into `compact-monitor`.
- **[reusable composition recipe]** A future workbench shell is a separate
  candidate composition using the same lower-level primitives, not a variant of
  Clauddy's recipe.

## 18. Promotion conditions

The evidence justifies **zero current manifest change**. Existing axes,
primitives, async laws, reserved `conversation-shell` and `context-composer`, and
the Phind proposal-resolution candidate already own most responsibilities.

- **[reusable composition recipe]** Workbench shell promotion requires a
  theme-neutral slot contract, container behavior, DOM/focus order, overflow and
  collapse rules, async scenarios, proof fixtures, and one real consumer.
- **[reusable composition recipe]** Context inspector promotion requires a
  responsibility demonstrably distinct from `context-composer`, persistent
  provenance and reduction semantics, and proof that existing primitives cannot
  express the composition without a recipe.
- **[reusable interaction contract]** Mutation gate and checkpointed action
  promotion require reversible/irreversible action matrices, keyboard and focus
  behavior, cancellation and partial-failure behavior, truthful rollback
  coverage, and independent implementation in a real product.
- **[rejected implementation detail]** `execution-lane`, `tool-run-inspector`, and
  plan-stage composition require new evidence before even becoming candidates.
- **[product behavior]** Runtime behavior remains unverified; source inspection
  alone cannot satisfy experimental, proven, or stable promotion.
