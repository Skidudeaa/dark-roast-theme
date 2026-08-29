# Compact monitor manual acceptance evidence

Evidence date: 2026-08-29

Kernel: `a1930ed`, package `5.10.3`, doctrine `0.4.1`

Consumer: Project Control `f1e942f` (`46f3662` touch assembly, `d6516b1`
support boundary, `f1e942f` proven package pin)

Target: Project Control Source Health and the sanitized compact-monitor fixture

Promotion: package `5.11.0` / doctrine `0.5.0` carries this completed evidence
forward without changing the accepted palette, geometry, interaction, or
history presentation shipped in `5.10.3`.

<a id="evidence-project-control-source-health-actual-ipad-touch"></a>

## Actual iPad touch — passed

Supporting machine evidence passed on a physical iPad Pro 13-inch (M4), iPadOS
27.0, over the private tailnet. A signed XCUITest measured the pre-fix Scan
target at 34.04 points, then 41.70 points after the first sizing correction.
The final assembly measured at least 44 points, synthesized a tap on `Scan
local`, observed `Scan started`, and confirmed retained primary values.

- `evidence/physical-ipad-before-touch.png` — SHA-256 `037ab5278585d8203335a49720929e84cb98eb7deff118edac24f632b68c7e9b`
- `evidence/physical-ipad-after-touch.png` — SHA-256 `b140299433d938a3bfd86bcb99884903946123963625ed014f9304135f05e249`
- `evidence/physical-ipad-xcresult-manifest.json` — SHA-256 `310e3e081919ceccd51016aa8973ec071a21423f726a3591cf51d70697403df5`

On 2026-08-29, after loopback and tailnet health both returned `200 ready`, the
owner repeated the test with a finger in actual iPad Safari. `Scan local`
activated on the first attempt, the page reported `Scan started`, no adjacent
control activated, and the Source Health layout remained intact.

- `evidence/physical-ipad-human-touch-confirmed.png` — SHA-256 `975819a8dcbded707db8cca5dfa8bf8d380ee3b89190d43407f44ae1270debca`
- Verdict: passed.

<a id="evidence-project-control-source-health-actual-zoom-200"></a>

## Actual 200 percent zoom — passed

Actual Firefox 154.0.1 was opened in a dedicated UI window at 100 percent,
advanced through the browser's real zoom control until its accessibility tree
reported exactly `200%`, and restored to 100 percent afterward. At 200 percent,
the recipe retained the named context, Refresh action, nonempty status, all three
labelled metrics, native disclosure, and settings. The page exposed only vertical
scrolling; no horizontal scrollbar or inline clipping appeared.

- `evidence/firefox-154-exact-200-percent.png` — SHA-256 `28af810a48b07c76b9d8bb12b88d4afb6fc99341c110e7d564302901a3c665c0`
- Verdict: passed.

<a id="evidence-project-control-source-health-voiceover"></a>

## VoiceOver — not applicable to Project Control

On 2026-08-29, the owner clarified that Project Control's committed Source
Health acceptance boundary does not include VoiceOver compatibility or
screen-reader certification. Browser and platform support do not imply
certification of every assistive-technology pairing. This adoption makes no
VoiceOver or general screen-reader conformance claim; the gate reopens before
any such Project Control support claim.

Historical Dark Roast fixture finding, retained as non-gating internal evidence:
the first controlled VoiceOver run announced the focused controls and the recipe
as a busy website region, but did not announce `Refreshing retained result`.
The busy recipe root suppressed its descendant live-region mutation. Dark Roast
5.10.3 now mirrors the visible refresh label through a pre-existing polite,
atomic live region outside the busy subtree, and automated topology/focus
coverage passes. No post-repair actual VoiceOver pass is claimed. This remains
kernel interoperability evidence, not a pending Project Control acceptance item.

- Verdict: not applicable to Project Control.

<a id="evidence-project-control-source-health-nvda"></a>

## NVDA — not applicable

Project Control's product boundary at consumer commit `d6516b1` supports current
Safari, Chromium, and Firefox on macOS plus private iPadOS Safari. Windows is not
a supported interactive client. NVDA becomes required before any future Windows
support claim.

<a id="evidence-project-control-source-health-safari"></a>

## Safari 27 — passed

Actual Safari 27.0 on macOS 27 rendered the sanitized compact-monitor fixture
and the live seven-source consumer. The accessibility tree exposed the named
recipe, `Refresh` and `Acknowledge` buttons, nonempty status text, three labelled
metrics, native disclosure state, chronological history, and settings after the
operational scan path. The live consumer exposed seven named source regions,
seven unique Scan buttons, status/provenance text, and primary metrics in DOM
order.

- `evidence/safari-27-compact-monitor.png` — SHA-256 `001895ff80b94190dabc2bf89440d3ecbf57d0ee296ca9c6f906e037d4711965`
- Verdict: passed.

<a id="evidence-project-control-source-health-firefox"></a>

## Firefox 154 — passed

Actual Firefox 154.0.1 with GeckoDriver 0.37.1 rendered the sanitized fixture
and live Source Health. Selenium verified seven cards, exact status semantics,
visible primary regions, zero document/card inline overflow, zero axe A/AA
violations, retained primary identity/value during Refresh, preserved focus, and
the `Scan started` native form result.

- Fixture geometry: document `1280/1280`, recipe `608/608` client/scroll width.
- `evidence/firefox-154-compact-monitor.png` — SHA-256 `6ebf0dc88629e27d454cc4993ffe8cd11602a5a165fc8eb9b42cd0d51845f25e`
- Verdict: passed.

<a id="evidence-project-control-source-health-windows-high-contrast"></a>

## Windows High Contrast — not applicable

Windows is outside the supported interactive-client boundary committed at
`d6516b1`. Chromium forced-colors remains regression coverage, not a claim of
actual Windows High Contrast acceptance. This gate reopens before any Windows
support claim.

<a id="evidence-project-control-source-health-no-color-human"></a>

## Human no-color interpretation — passed

The original sanitized Safari fixture was converted to a true grayscale PNG.
Automated inspection confirmed persistent text labels and structure, but only a
human could close this gate.

- `evidence/safari-27-compact-monitor-grayscale.png` — SHA-256 `ff5c78e7b0cfef736e3489465dd540e03d41567b161cbc0aea467d548c7816da`

The first human review correctly recovered every status, metric, provenance
line, action, disclosure, and date, but misread every `of 10` denominator as
`of 18` and judged the intensity bars color-dependent. That review is failed
evidence, not a pass. The repair adds a visible zero-to-ten scale, full-width
tracks, patterned proportional fills, and larger slashed-zero `n / 10` values.

- `evidence/firefox-154-compact-monitor-grayscale-repaired.png` — SHA-256 `31ad21eccbb0b72804dab628166ca98f423a4849e06aa766ef4311792ce28768`
- Owner retest, 2026-08-29: correctly read `2 / 10`, `5 / 10`, `8 / 10`, and
  `4 / 10`, then ranked the patterned bar lengths `8 > 5 > 4 > 2` without hue.
- Verdict: passed.
