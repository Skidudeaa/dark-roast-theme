# Operational monitor starter

A working page you can drop into a fresh project. It is the proven
`compact-monitor` recipe plus the structural primitives it is made from, styled
only through semantic `--oi-*` roles, on the Dark Roast palette.

## What is in this directory

| File | Owner | What to do with it |
|---|---|---|
| `index.html` | you | Replace the copy. Keep the anatomy: roots, parts, slots, and axes are a contract. |
| `starter.css` | you | Product styles under `@layer product`. Read `--oi-*` roles only. |
| `theme/` | the package | Generated stylesheets and a manifest. Regenerate; never edit. |

`theme/` is written by `dark-roast-theme assets theme` and verified by
`dark-roast-theme assets theme --check`. If you upgrade the package, run the
first command again and commit the result.

## The five-minute path

```bash
npm install --save-dev dark-roast-theme parse5   # or a packed tarball, see below
npx dark-roast-theme init ui                    # writes ui/index.html, ui/starter.css, ui/theme/
npx dark-roast-theme check ui/index.html        # PASS ... conform to doctrine 0.x.y
```

Open `ui/index.html` with any static server. Edit the page. Run `check` again.

Add both commands to your test script so the page cannot drift:

```json
"test": "dark-roast-theme assets ui/theme --check && dark-roast-theme check ui/index.html"
```

## Rules the check enforces

- Every state is an attribute on the root: `data-oi-activity`,
  `data-oi-severity`, `data-oi-freshness`, `data-oi-certainty`,
  `data-oi-completeness`, `data-oi-source`, `data-oi-density`. Values are
  closed sets; unknown values fail.
- `status` and `primary` slots are required and must stay visible. Optional
  slots are present or omitted, never empty or hidden.
- Slot order is fixed: context, actions, focus, status, primary, details,
  history, settings. The `chrome` header exists only when context or actions
  do.
- The status slot has `role="status"`, an id, visible text, and the root
  references it with `aria-describedby`.
- Loading or refreshing roots carry `aria-busy="true"`; any other activity
  does not.
- A metric whose data is not direct, confirmed, fresh, and complete needs a
  visible provenance part referenced by `aria-describedby`.
- Meters keep the native `<meter>` and the visual `--oi-meter-value` in
  agreement.
- History strips are chronological and every item carries a textual value.
- Only declared `oi-*` classes appear. Product classes use your own prefix.
- Inline styles on operational elements never reference `--dr-*`.

## Choosing a companion palette

```bash
npx dark-roast-theme themes                     # list ids
npx dark-roast-theme init ui --theme night-shift
```

`init` rewrites the body class for the chosen theme; the mapping and system
stylesheets are the same for every palette.

## Until the package is on npm

The package is not yet published. Consume a packed tarball exactly as the first
adoption does:

```bash
(cd path/to/dark-roast-theme && npm pack --pack-destination /tmp)
npm install --save-dev /tmp/dark-roast-theme-<version>.tgz parse5
```

Commit the tarball under `vendor/` if you want reproducible installs.
