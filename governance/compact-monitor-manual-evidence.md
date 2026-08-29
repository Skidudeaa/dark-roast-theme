# Compact monitor manual acceptance evidence

Evidence date: 2026-08-29

Kernel: `d5e7199`, package `5.10.2`, doctrine `0.4.1`

Consumer: Project Control `d6516b1` (`46f3662` touch assembly, `06679e2` package pin)

Target: Project Control Source Health and the sanitized compact-monitor fixture

<a id="evidence-project-control-source-health-actual-ipad-touch"></a>

## Actual iPad touch — pending human finger attestation

Supporting machine evidence passed on a physical iPad Pro 13-inch (M4), iPadOS
27.0, over the private tailnet. A signed XCUITest measured the pre-fix Scan
target at 34.04 points, then 41.70 points after the first sizing correction.
The final assembly measured at least 44 points, synthesized a tap on `Scan
local`, observed `Scan started`, and confirmed retained primary values.

- `evidence/physical-ipad-before-touch.png` — SHA-256 `037ab5278585d8203335a49720929e84cb98eb7deff118edac24f632b68c7e9b`
- `evidence/physical-ipad-after-touch.png` — SHA-256 `b140299433d938a3bfd86bcb99884903946123963625ed014f9304135f05e249`
- `evidence/physical-ipad-xcresult-manifest.json` — SHA-256 `310e3e081919ceccd51016aa8973ec071a21423f726a3591cf51d70697403df5`

This section does not claim a pass until a human performs the same tap with a
finger and confirms no adjacent activation.

<a id="evidence-project-control-source-health-actual-zoom-200"></a>

## Actual 200 percent zoom — pending

The existing narrow-viewport test remains supporting evidence only. Actual
Safari page zoom must be exercised and restored before this gate passes.

<a id="evidence-project-control-source-health-voiceover"></a>

## VoiceOver — pending

Safari exposes the expected headings, source regions, status text, metric
labels/values, and unique Scan buttons through the macOS accessibility tree.
Actual VoiceOver focus and live-region phrases still require a controlled run.

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

## Human no-color interpretation — pending

The sanitized Safari fixture was converted to a true grayscale PNG. Automated
inspection confirms persistent text labels and structure, but only a human can
close this gate.

- `evidence/safari-27-compact-monitor-grayscale.png` — SHA-256 `ff5c78e7b0cfef736e3489465dd540e03d41567b161cbc0aea467d548c7816da`
