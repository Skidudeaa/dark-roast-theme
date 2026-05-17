# 🔍 Weak Points Analysis — Dark Roast: Black Label v4.0.0

I analyzed **every file** in the project: `tokens.json`, all JS modules, both CSS files, the VS Code theme, Swift, Xcode, Textastic tmTheme, all 4 terminal themes (Warp, Tabby, iTerm2, Terminal.app), the spec HTML, both docs, `dark-roast-system-v1.json`, and the theme-context-cache. **23 issues found**, ranked by severity.

---

## 🔴 CRITICAL — Accessibility Failures & Stale Claims

### 1. `tokens.json` accessibility section has **wrong contrast values**

The `accessibility.contrastTargets` section is stale — written for a previous color set:

| Role | Claimed | Actual | Own Min | Status |
|---|---|---|---|---|
| **workhorse** | 11.3:1 | **15.1:1** | 7.0 | Stale (matches old `#D4C4A8`) |
| **secondary (mocha)** | 5.1:1 | **4.33:1** | 4.5 | ✗ **FAILS OWN MINIMUM** |
| **tertiary (asparagus)** | 3.2:1 | **2.57:1** | 3.0 | ✗ **FAILS OWN MINIMUM** |
| display | 17.4:1 | 18.3:1 | 12.0 | Inaccurate |

The workhorse value of 11.3 matches the **old** `system-v1` color `#D4C4A8`, not the current `bone` (`#EBE1D7`). Mocha and asparagus **fail their own documented minimums**.

### 2. Crema contrast ratio is **consistently wrong everywhere**

Claimed as **17.08:1** in README, Warp comments, and DESIGN-SYSTEM.md. Actual: **18.31:1** vs void. The 17.08 value was apparently computed against `darkCacao` (#1E140E → 17.04:1), not `void`.

---

## 🟠 HIGH — Cross-File Color Drift

### 3. Off-palette `#1E140C` used in VS Code theme (20+ scopes) and Swift

Not a canonical color — it's **2 off in the blue channel** from `darkCacao` (`#1E140E`). Affects: `sideBar.background`, `panel.background`, `terminal.background`, `input.background`, list hover states, and `inputBg` in Swift.

### 4. VS Code `terminal.ansiBrightCyan` = `#4CC4B4` (same as normal teal!)

All other terminals correctly use `#6DD4C8`. The VS Code theme reuses normal teal, **defeating the stated goal** that "bright is visibly brighter than normal." The README explicitly claims all four emulators share the same bright palette.

### 5. VS Code `terminal.background` = `#1E140C` ≠ `void` (`#120C06`)

All other terminal themes use `void` for background. VS Code's integrated terminal is inconsistent.

### 6. `dark-roast-system-v1.json` has drifted from `tokens.json`

| Token | system-v1 | tokens.json | Delta |
|---|---|---|---|
| espresso | `#2A1C14` | `#2A1C13` | 1 in blue |
| **workhorse** | `#D4C4A8` | `#EBE1D7` | **Entirely different color!** |

### 7. `theme-context-cache-v4.json` ANSI palette completely disagrees with shipped terminals

**15 of 16** ANSI colors in the cache differ from what's shipped in Warp/Tabby/iTerm2. The cache holds an obsolete draft palette.

---

## 🟡 MEDIUM — Structural & Process Gaps

### 8. No automated tests or validation of any kind

- No test runner (Jest, Vitest — nothing)
- No npm scripts at all
- No linter or formatter
- No CI/CD pipeline
- No build step to validate token sync across 7+ output formats

**Manual sync is the only guard against drift — and it has already failed** (findings 3–7).

### 9. VS Code extension version mismatch: **3.0.0** vs package **4.0.0**

`vscode/package.json` says `"version": "3.0.0"`. The bundled `.vsix` is also v3.0.0.

### 10. No LICENSE file

`package.json` declares MIT but no `LICENSE` or `LICENSE.md` exists. The license grant is legally ambiguous.

### 11. Terminal extension colors are undocumented in the token system

8 colors used across all terminal themes and VS Code are **NOT** in `tokens.json`, `colors.js`, or CSS:
- `sage` #8AAC6B, `slate` #6E8FAD, `mauve` #AD7FA8
- Bright red #D46868, bright green #A3C484, bright blue #8AABC4, bright magenta #C49BC0, bright cyan #6DD4C8

A JS/CSS consumer building a terminal component has no access to these values.

### 12. 63 CSS-only tokens with no JS export

Includes: 15 CEXE app-specific tokens, 15 severity states, 5 status indicators, 10 elevation shadow/border flat values, 10 leading values, 4 foreground aliases.

### 13. `spec/dark-roast-spec.html` — 96 hardcoded hex values, 0 CSS variable references

Entirely hardcoded. Any token change requires manual updates. Also contains off-palette `#1A110B`.

### 14. Type scale claims "1.25 minor-third ratio" but ratios vary 1.125–1.333

The scale is pragmatically rounded to useful pixel values, but the "minor-third" claim is misleading.

### 15. Legacy v3 rem tokens silently differ from v4 sizes

`textXsRem` = 0.6875rem (11px) but v4 `textXs` = 10px. Not flagged as a breaking change.

---

## 🔵 LOW — Polish & Housekeeping

| # | Issue |
|---|---|
| 16 | Stale **v3.0.0 .vsix binary** committed to git and included in npm publish |
| 17 | `.planning/` with **1.8MB binary search index** in repo, not gitignored |
| 18 | No `CHANGELOG.md` or `MIGRATION.md` despite breaking v3→v4 changes |
| 19 | `craterDeep` and `roastedBean` are **near-indistinguishable** (luminance 0.02726 vs 0.02710) |
| 20 | Deprecated CSS aliases have **no removal timeline** |
| 21 | Missing `forced-colors` media query (Windows High Contrast Mode) |
| 22 | `dr-shimmer-skeleton` and `dr-glow` **missing from** `prefers-reduced-motion` disable list |
| 23 | `.gitignore` is minimal — doesn't exclude `.vsix`, `.planning/`, `.db`, cache files |

---

## ✅ What's Working Well

- **Core token sync** between `tokens.json` ↔ `colors.js` ↔ both CSS files ↔ Xcode ↔ Textastic: **perfect match**
- **Terminal ANSI palette** consistent across Warp, Tabby, iTerm2, Terminal.app: **all 16 colors match**
- **Surface scale** is genuinely monotonic in luminance
- **DESIGN-SYSTEM.md** contrast table is honest and accurate (except crema)
- **High-contrast** and **reduced-motion** media queries are present
- Glow rgba values correctly reference canonical color RGB values
- Both CSS files are byte-for-byte identical in variable values
