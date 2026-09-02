# Adopting the operational interface kernel in a fresh project

**Status:** the supported drop-in path as of package 5.12.0, doctrine 0.5.0.

This is the job the kernel exists for: a new project gets the Dark Roast look
and the operational-interface structure in minutes, with a check that fails
when the page stops conforming. Everything below is exercised by `npm test`
in this repository (`scripts/validate-starter.js` and
`tests/system/conformance.spec.js`), so if it is written here, a gate runs it.

## What the first consumer taught us

Project Control adopted the kernel from a packed tarball and had to hand-write
three things before its first page could be trusted:

1. a script that copies the palette, system, and mapping stylesheets out of
   the package into its static directory and records their hashes;
2. a parse5 validator that re-implements the recipe root/part/slot/ARIA rules
   against its own template;
3. a deployment probe.

The first two are now shipped as `dark-roast-theme` commands and a public
runtime module. The third stays consumer-specific.

## The path

```bash
# 1. Install. Until first npm publication, use a packed tarball (see below).
npm install --save-dev dark-roast-theme parse5

# 2. Scaffold a page, its product stylesheet, and the generated theme assets.
npx dark-roast-theme init ui              # or: --theme night-shift

# 3. Prove it, and keep proving it.
npx dark-roast-theme check ui/index.html
npx dark-roast-theme assets ui/theme --check
```

Put both checks in the project's test script. `assets --check` fails when the
copied stylesheets drift from the installed package (after an upgrade, rerun
`assets` and commit). `check` fails with a stable code and a line number for
every contract violation.

`init` writes:

| File | Purpose |
|---|---|
| `ui/index.html` | A complete `compact-monitor` card plus the primitives it uses. Replace the copy, keep the anatomy. |
| `ui/starter.css` | Product styles under `@layer product`, reading only `--oi-*` roles. |
| `ui/README.md` | The rules the checker enforces, in consumer terms. |
| `ui/theme/` | `dark-roast.css`, `oi-system.css`, `oi-mapping-dark-roast.css`, and `dark-roast-assets.json`. Generated; never edit. |

If the project already has a page, skip `init` and run `assets` alone; the
command prints the three `<link>` tags in the required order.

## The stylesheet order is the architecture

```html
<link rel="stylesheet" href="theme/dark-roast.css">            <!-- palette: --dr-* -->
<link rel="stylesheet" href="theme/oi-system.css">             <!-- contracts, primitives, recipes: --oi-* -->
<link rel="stylesheet" href="theme/oi-mapping-dark-roast.css"> <!-- the one seam: reads --dr-*, assigns --oi-* -->
<link rel="stylesheet" href="starter.css">                     <!-- your product layer -->
<body class="dark-roast oi-root" data-oi-surface="canvas" data-oi-density="standard">
```

The system declares the cascade as
`@layer oi.mapping, oi.contracts, oi.primitives, oi.recipes, oi.utilities, product`,
so a product stylesheet wins over kernel defaults without specificity games.
The `.oi-root` class on the body is where the mapping applies; the checker
rejects any primitive or recipe outside it.

## Checking in a browser or a test runner

The same checker runs against a live DOM, which is how the kernel proves its
own fixtures and how a consumer's Playwright suite can prove rendered
templates rather than static files:

```js
import { checkConformance, fromDom, formatFindings } from 'dark-roast-theme/system/conformance';

const report = checkConformance(fromDom(document));          // whole page
const card = checkConformance(fromDom(document.querySelector('#monitor'))); // one subtree
console.log(report.primitives, report.recipes, formatFindings(report.findings));
```

`fromDom(element)` judges only that subtree but still resolves ancestors and
ID references document-wide, so `aria-describedby` targets outside the card
and the `.oi-root` wrapper behave exactly as in the browser. In Node, parse
with parse5 and use `fromParse5`. Finding codes are stable strings such as
`slot-required`, `busy-state`, `metric-provenance`, `meter-visual-value`, and
`class-undeclared`; each finding carries the offending element and, for
parsed files, its line and column.

## Server-rendered projects

For a FastAPI, Flask, Rails, or similar project, the pattern Project Control
uses is the intended one:

- run `dark-roast-theme assets static/theme` in the build step and commit the
  result; serve the directory as static files;
- run `dark-roast-theme check` against a rendered page in CI, or against a
  template whose placeholders do not sit inside attribute names (Jinja
  expressions in text nodes are fine; the checker reads them as text);
- if templates cannot be checked statically, check the rendered DOM in a
  browser test with `fromDom`.

## Until first npm publication

The package is unpublished by owner decision. Consume a packed tarball, pinned
and committed under `vendor/`, exactly as Project Control does:

```bash
(cd path/to/dark-roast-theme && npm pack --pack-destination /tmp)
mkdir -p vendor && cp /tmp/dark-roast-theme-5.12.0.tgz vendor/
npm install --save-dev ./vendor/dark-roast-theme-5.12.0.tgz parse5
```

The kernel's own package gate pins the packed SHA-256 to consumer evidence, so
a tarball built from a clean checkout at a tagged version is byte-identical to
the one the evidence names.

## What this does not do

- It does not certify accessibility. `check` enforces the doctrine's DOM and
  ARIA obligations; run axe or an equivalent on the rendered page as well. The
  starter is axe-clean at 360px and 1280px in this repository's suite.
- It does not adapt to a framework. React and SwiftUI adapters remain
  separate, deliberately selected work.
- It does not promote anything. A second consumer built from this starter is
  evidence toward `stable` only when its own proof gates are recorded under
  `governance/`.
