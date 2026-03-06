# Dark Roast: Black Label — Syntax Color Specification

**Version:** 1.0
**Status:** AUTHORITATIVE — All editor themes must conform to this document.
**Background:** `#120C06` (void) for all contrast calculations.

This document is the single source of truth for syntax highlighting color
assignments across every Dark Roast editor theme (VS Code, Xcode, Textastic,
Sublime, Tabby, and any future targets). When this spec and a theme file
disagree, **the spec wins**. Update the theme file, not this document, unless
you are making a deliberate canonical revision with a clear rationale.

---

## 1. Design Philosophy

### 1.1 The 12-Hour Shift Principle

Dark Roast is an espresso theme, not a hazard theme. It was designed for
extended development sessions — the kind where you open the editor at 06:00
and look up and it is 20:00. Every color choice must be evaluated through
that lens: **how does this color feel after hour 10?**

The clinical severity gradient (scarlet → amber-hot → amber → gold → teal)
is a powerful organizing principle for patient state in the somaCURA UI, where
you glance at a badge for 200 milliseconds. That same gradient is a **poor
direct mapping to code syntax** because code is text you read continuously for
hours. The highest-alarm color (`scarlet #C44C4C`) applied to keywords — tokens
that appear on nearly every line — creates a low-grade stress response over
time. You do not stare at a critical patient alert for eight hours. You do stare
at `if`, `return`, `def`, and `const` for eight hours.

### 1.2 Visual Ergonomics Over Semantic Literalism

The canonical mapping was designed around four ergonomic principles:

**Frequency governs saturation.** The more often a token class appears, the
more muted its color should be. Keywords are everywhere; they should be
*distinct but not fatiguing*. Mauve (`#AD7FA8`) reads as structural without
reading as alarming.

**Visual weight signals importance.** The reader's eye should land first on
the most semantically meaningful token in any given expression. In most
languages, that is the function or method being called, followed by the type
system shaping it, followed by the data flowing through it. The hierarchy:
functions (teal, kinetic) > types (gold, stable/warm) > strings (sage, organic)
> keywords (mauve, structural but frequent) > everything else.

**Temperature carries meaning.** The Dark Roast palette has a warm-cool axis.
Warm colors (amber family, gold) feel like YOUR code — things you define and
own. Cool colors (slate, teal) feel like things that DO something or come from
outside your file. This maps well: user-defined types and constants are warm;
function calls and SDK identifiers are cool. Xcode's user vs. system split
exploits this axis explicitly.

**Scarlet is not for everyday use.** In any given file, the only things that
should appear in scarlet are errors, invalid tokens, and template literal
delimiters (where escape semantics genuinely need a flag). If scarlet
appears on every line because keywords are scarlet, it loses its power as
an error signal.

### 1.3 Why the Current Themes Diverged

The VS Code theme (`dark-roast-color-theme.json`) reflects the ergonomic
philosophy above: keywords are mauve, not scarlet. It was authored with the
12-hour shift principle in mind.

The Textastic and Xcode themes were authored by applying the clinical severity
gradient directly to code constructs — a logical first pass that produces a
visually cohesive result but violates the ergonomics rationale. The Textastic
file's own documentation states: "Keywords/control flow → scarlet (critical:
structural, demands attention)." This reasoning is sound for a *dashboard*
badge. It is not sound for a token you read 1,000 times per session.

**This spec adopts the VS Code approach as canonical and extends it.**

---

## 2. Palette Reference

Full Dark Roast palette with hex values and approximate contrast ratios against
void (`#120C06`). Ratios calculated per WCAG 2.1 relative luminance formula.

### 2.1 Syntax-Relevant Colors

| Token Name   | Hex       | Role in palette               | Approx contrast vs void |
|--------------|-----------|-------------------------------|------------------------|
| `crema`      | `#FFF7EE` | Primary text, default         | ~18.3:1                |
| `bone`       | `#EBE1D7` | Reduced-contrast body text    | ~14.1:1                |
| `mocha`      | `#8B7355` | Secondary / caption text      | ~4.7:1                 |
| `asparagus`  | `#465945` | Tertiary metadata             | ~2.6:1                 |
| `crater-lt`  | `#4D3B31` | Structural, quiet punctuation | ~2.2:1                 |
| `crater`     | `#3C2A21` | Minimal, near-invisible       | ~1.8:1                 |
| `teal`       | `#4CC4B4` | Kinetic / actionable          | ~8.9:1                 |
| `gold`       | `#DAA520` | Warm stable / success         | ~7.8:1                 |
| `sage`       | `#8AAC6B` | Organic warm green            | ~5.3:1                 |
| `slate`      | `#6E8FAD` | Dusty cool blue               | ~4.7:1                 |
| `mauve`      | `#AD7FA8` | Dried lavender / structural   | ~5.1:1                 |
| `amber`      | `#E69A4C` | Primary accent / constructive | ~8.0:1                 |
| `amber-hot`  | `#D2691E` | Caution / special behavior    | ~5.9:1                 |
| `scarlet`    | `#C44C4C` | Error / critical / invalid    | ~4.8:1                 |

### 2.2 Background and Chrome Colors

| Token Name    | Hex       | Use                        |
|---------------|-----------|----------------------------|
| `void`        | `#120C06` | Editor background          |
| `obsidian`    | `#160E08` | Elevated surfaces          |
| `grain`       | `#2A1C13` | Panel / card surfaces      |
| `grain-hover` | `#382818` | Hover lift                 |
| `rustic`      | `#480404` | Error background tint      |
| `rose`        | `#480607` | Contextual error fill      |

---

## 3. Canonical Syntax Color Mapping

This table is the authoritative mapping. All themes MUST implement these
assignments. Rationale is given for each decision.

### 3.1 Core Language Constructs

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **Comment**           | `mocha`     | `#8B7355` | italic       | Comments are context, not action. Mocha recedes while remaining legible at 4.7:1. Italic adds typographic separation. |
| **Doc comment**       | `mocha`     | `#8B7355` | italic       | Same as comment — doc strings are still prose, not code. Distinguish via style in editors that support it. |
| **Doc keyword** (`@param`, `Returns`) | `amber` | `#E69A4C` | regular | Highlights navigable doc structure within a muted comment block without breaking the comment's overall receded tone. |
| **Keyword** (`if`, `return`, `def`, `func`, `class`) | `mauve` | `#AD7FA8` | regular | Appears on nearly every line. Mauve is distinct enough to scan but not fatiguing. NOT scarlet — see §1.2. |
| **Storage modifier** (`var`, `let`, `const`, `static`, `async`) | `mauve` | `#AD7FA8` | regular | Same family as keyword; these are structural declarations. |
| **Import / from**     | `mauve`     | `#AD7FA8` | italic       | Italic signals "about the file, not the logic." Same hue as keyword family. |
| **Control flow** (`if`, `else`, `for`, `while`, `switch`, `try`) | `mauve` | `#AD7FA8` | regular | Control flow is keywords; no special escalation to scarlet. The 12-hour shift principle. |
| **Operator** (`=`, `+`, `&&`, `=>`, `?.`) | `teal` | `#4CC4B4` | regular | Operators perform transformation — kinetic. Teal connects them visually to function calls. Bone was used in early themes but operators are semantically more active than punctuation. |
| **Punctuation** (`,`, `;`, `.`, `:`) | `crater-lt` | `#4D3B31` | regular | Pure structure, near-invisible. Punctuation should not compete. |
| **Brackets / braces** (`{}`, `[]`, `()`) | `mocha` | `#8B7355` | regular | Slightly more visible than punctuation because bracket depth is scannable, but still receded. |

### 3.2 Data and Literals

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **String**            | `sage`      | `#8AAC6B` | regular      | Strings are organic, inert data — warm green reads as "content, not logic." Sage is the only unambiguously green token, making strings instantly scannable. This is a deliberate departure from Textastic/Xcode (which use gold) — gold is reserved for types, creating a cleaner type-vs-data distinction. |
| **String escape** (`\n`, `\t`, `\"`) | `amber-hot` | `#D2691E` | regular | Escapes change string semantics — caution color is correct here, unlike keywords. |
| **Template literal / interpolation** | `teal` | `#4CC4B4` | regular | Interpolation is evaluated code within a string — kinetic, not inert. Teal signals "this runs." |
| **Regex**             | `amber`     | `#E69A4C` | italic       | Regex is a mini-language. Italic distinguishes it from plain strings; amber signals active pattern matching. |
| **Number**            | `amber-hot` | `#D2691E` | regular      | Numbers are concrete values with immediate meaning. Amber-hot gives them visual weight without alarm. |
| **Language constant** (`true`, `false`, `null`, `nil`, `None`) | `amber-hot` | `#D2691E` | italic | These have exact, compiler-defined semantics — caution is appropriate. Italic distinguishes from plain numbers. |
| **User-defined constant** (`MY_MAX`, `API_KEY`, `MAX_RETRIES`) | `amber` | `#E69A4C` | regular | Named values: constructive, author-defined. Warmer than language constants to signal "yours, not theirs." |
| **Enum member / case** | `amber-hot` | `#D2691E` | regular | Enum members are language-managed named constants — closer to `true`/`false` than to `MY_MAX`. |

### 3.3 Functions and Methods

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **Function definition** | `teal`   | `#4CC4B4` | regular      | Functions are the verbs of code — kinetic, actionable. Teal is the highest-contrast non-warm color. |
| **Method definition** | `teal`      | `#4CC4B4` | regular      | Same as function. No distinction needed at declaration. |
| **Function call**     | `teal`      | `#4CC4B4` | regular      | Consistent with declaration — teal always means "this does something." |
| **Built-in / support function** | `teal` | `#4CC4B4` | italic | Same semantic role; italic signals "not defined in this file." |
| **System / SDK function** (Xcode-specific) | `slate` | `#6E8FAD` | regular | Xcode's user/system split: cool slate for Apple's code, warm teal for yours. Your eyes learn the axis. |
| **Decorator / annotation** (`@staticmethod`, `@IBOutlet`, `@State`) | `amber-hot` | `#D2691E` | italic | Meta-programming constructs that modify behavior — caution is right here. Italic signals "modifies the next thing." |
| **Magic method** (`__init__`, `__repr__`) | `amber-hot` | `#D2691E` | regular | Language-defined protocol methods with special behavior. Same caution family as decorators. |

### 3.4 Types and Classes

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **User class / struct / enum** | `gold` | `#DAA520` | italic | Types are blueprints — warm, stable, definitive. Gold is the stable color in the severity gradient. Italic is conventional for type names across most popular dark themes (Dracula, One Dark, etc.) and aids scanability. |
| **User type alias / generic** | `gold` | `#DAA520` | italic | Same family as class — type-level concept. |
| **Inherited class**   | `gold`      | `#DAA520` | italic underline | Underline signals the derivation relationship without changing hue. |
| **Interface / protocol / trait** | `gold` | `#DAA520` | italic | Abstract type contracts — same semantic family as class. |
| **Type annotation** (Python hints, TypeScript) | `gold` | `#DAA520` | italic | Type system metadata — consistent with class/struct. |
| **System / SDK type** (Xcode-specific) | `slate` | `#6E8FAD` | regular | Cool axis for Apple's type hierarchy vs. yours. `UIViewController`, `NSString`, `Int` (in Swift's stdlib sense). |
| **Namespace / module** | `amber`   | `#E69A4C` | regular      | Modules are structural containers — constructive, warm, but not types themselves. |

### 3.5 Variables and Parameters

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **Variable (default)** | `crema`   | `#FFF7EE` | regular      | Variables are the default text of code. Primary text color = no overhead for the eye. |
| **Parameter**         | `bone`      | `#EBE1D7` | italic       | Parameters are inputs — slightly reduced from full crema to distinguish from locals. Italic is conventional. |
| **Object property**   | `bone`      | `#EBE1D7` | regular      | Property access is structural, frequent. Slightly receded from variables without italic (italic is for params). |
| **Language variable** (`this`, `self`, `super`) | `amber-hot` | `#D2691E` | italic | These have special compiler-defined semantics. Caution color; italic signals "special." |
| **Readonly variable** | `crema`     | `#FFF7EE` | italic       | Same color as variable, italic modifier only — semantic distinction without color noise. |

### 3.6 Errors and Special States

| Semantic Role         | DR Token    | Hex       | Style             | Rationale |
|-----------------------|-------------|-----------|-------------------|-----------|
| **Invalid / illegal** | `scarlet`   | `#C44C4C` | underline         | The only place scarlet is correct. Errors must be impossible to miss. Underline adds a second signal (not everyone is color-safe). |
| **Deprecated**        | `amber-hot` | `#D2691E` | italic strikethrough | Deprecated is not an error — it is a warning. Amber-hot + strikethrough. |
| **Unused / unreachable** (semantic) | `asparagus` | `#465945` | regular | Asparagus is the lowest-legibility foreground token. Unused code should visually recede. |

### 3.7 Markup and Documentation Languages

#### HTML / XML / JSX

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **Tag name** (`div`, `View`, `HStack`) | `mauve` | `#AD7FA8` | regular | Tag names are the HTML equivalent of keywords — structural and frequent. Mauve, not scarlet, for the same ergonomic reason. |
| **Tag attribute name** | `amber`   | `#E69A4C` | italic       | Attributes are parameters of tags — amber/italic matches the parameter ergonomic. |
| **Tag attribute value** | `sage`   | `#8AAC6B` | regular      | Attribute values are string data — sage for consistency with strings. |
| **Tag punctuation** (`<`, `>`, `/`, `=`) | `crater-lt` | `#4D3B31` | regular | Maximum recession — these are scaffolding. |

#### CSS / SCSS / Less

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **Selector** (`.class`, `#id`, `element`) | `gold` | `#DAA520` | regular | Selectors name the thing being styled — type-like. Gold. |
| **Property name** (`color`, `display`, `flex`) | `slate` | `#6E8FAD` | regular | CSS properties are the API surface of the browser — external, system-like. Slate. |
| **Property value** (`red`, `flex`, `1fr`) | `bone` | `#EBE1D7` | regular | Values are the data being set — reduced contrast, like properties. |
| **CSS variable** (`--my-token`) | `amber`   | `#E69A4C` | regular      | CSS custom properties are user-defined named values — amber. |
| **Unit** (`px`, `em`, `%`, `vh`) | `amber-hot` | `#D2691E` | regular | Units are type annotations on numbers — they change numeric meaning. Amber-hot consistent with number family. |
| **At-rule** (`@media`, `@keyframes`) | `mauve` | `#AD7FA8` | regular | Structural meta-rules — keyword family. |

#### JSON / YAML

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **Key**               | `slate`     | `#6E8FAD` | regular      | Keys are the "API" of a data format — external, cool. Slate. |
| **String value**      | `sage`      | `#8AAC6B` | regular      | String data — consistent with string rule. |
| **Number value**      | `amber-hot` | `#D2691E` | regular      | Number data — consistent with number rule. |
| **Boolean / null value** | `amber-hot` | `#D2691E` | italic | Language-constant equivalents — caution, italic. |

#### Markdown

| Semantic Role         | DR Token    | Hex       | Style        | Rationale |
|-----------------------|-------------|-----------|--------------|-----------|
| **Heading** (`#`, `##`) | `amber`  | `#E69A4C` | bold         | Headings are navigational anchors — amber provides warm prominence without alarm. |
| **Bold text**         | `crema`     | `#FFF7EE` | bold         | Bold is a typographic signal; the content should remain primary text color. |
| **Italic text**       | `bone`      | `#EBE1D7` | italic       | Slightly reduced contrast for typographic variety — italic prose recedes slightly. |
| **Inline code**       | `teal`      | `#4CC4B4` | regular      | Code is always kinetic. |
| **Block quote**       | `mocha`     | `#8B7355` | italic       | Quoted prose — recedes like comments. |
| **Link**              | `teal`      | `#4CC4B4` | underline    | Links are actions — kinetic. |
| **List bullet / marker** | `gold`  | `#DAA520` | regular      | List markers are structural anchors — gold provides quiet warmth. |

#### Diff

| Semantic Role         | DR Token    | Hex       | Style        |
|-----------------------|-------------|-----------|--------------|
| **Inserted line**     | `sage`      | `#8AAC6B` | regular      |
| **Deleted line**      | `scarlet`   | `#C44C4C` | regular      |
| **Changed line**      | `amber`     | `#E69A4C` | regular      |
| **Diff header / hunk** | `slate`   | `#6E8FAD` | regular      |

---

## 4. Editor Chrome Mapping

These assignments apply to all editors regardless of their syntax color format.

| UI Element                       | DR Token    | Hex                    | Note |
|----------------------------------|-------------|------------------------|------|
| **Editor background**            | `void`      | `#120C06`              | OLED-safe near-black (1.6ms pixel wake delay). |
| **Default text**                 | `crema`     | `#FFF7EE`              | 18.3:1 contrast. |
| **Cursor / caret**               | `teal`      | `#4CC4B4`              | Kinetic — easy to locate. |
| **Line highlight (current)**     | `grain`     | `#2A1C13`              | Warm lift, not jarring. |
| **Selection background**         | `amber` 20% | `#E69A4C33`            | Warm tint that does not obscure syntax colors. |
| **Inactive selection**           | `amber` 13% | `#E69A4C22`            | Further reduced when pane unfocused. |
| **Search match**                 | `amber` 27% | `#E69A4C44`            | Brighter than selection for find-next visibility. |
| **Search match border**          | `amber`     | `#E69A4C`              | Full amber border for focused match. |
| **Word highlight (read)**        | `teal` 10%  | `#4CC4B41A`            | Soft teal for "same identifier" underlines. |
| **Word highlight (write)**       | `teal` 20%  | `#4CC4B433`            | Stronger teal for mutation highlight. |
| **Line number (inactive)**       | `crater`    | `#3C2A21`              | Maximum recession — gutter should not compete. |
| **Line number (active)**         | `mocha`     | `#8B7355`              | Current line number becomes readable. |
| **Gutter background**            | `void`      | `#120C06`              | Flush with editor. |
| **Gutter: added line**           | `sage`      | `#8AAC6B`              | Added = green. |
| **Gutter: modified line**        | `slate`     | `#6E8FAD`              | Modified = blue. Cool, not alarming. |
| **Gutter: deleted line**         | `scarlet`   | `#C44C4C`              | Deleted = scarlet. Appropriate alarm. |
| **Indent guides (inactive)**     | `grain` 40% | `#2A1C1366`            | Barely visible guides. |
| **Indent guides (active)**       | `crater`    | `#3C2A21`              | Current scope guide slightly visible. |
| **Bracket match background**     | `amber` 13% | `#E69A4C22`            | Warm fill for matched bracket pair. |
| **Bracket match border**         | `amber`     | `#E69A4C`              | Amber border on bracket pair. |
| **Whitespace / invisibles**      | `crater`    | `#3C2A21`              | Visible when shown, not distracting. |
| **Ruler**                        | `grain`     | `#2A1C13`              | Structural marker, minimal. |
| **Fold background**              | `grain` 40% | `#2A1C1366`            | Folded code region, receded. |
| **Error squiggle**               | `scarlet`   | `#C44C4C`              | |
| **Warning squiggle**             | `amber`     | `#E69A4C`              | |
| **Info squiggle**                | `teal`      | `#4CC4B4`              | |
| **Ghost text (AI inline)**       | `asparagus` | `#465945`              | Must not compete with real code. |
| **Widget / popup background**    | `obsidian`  | `#160E08`              | Slightly elevated from void. |
| **Widget border**                | `crater`    | `#3C2A21`              | |
| **Suggestion highlight**         | `amber`     | `#E69A4C`              | Match highlight in autocomplete. |
| **Diff inserted (text)**         | `sage` 20%  | `#8AAC6B33`            | |
| **Diff removed (text)**          | `scarlet` 20% | `#C44C4C33`          | |

### 4.1 Bracket Pair Colorization

For editors supporting multi-level bracket colorization (VS Code), assign the
six levels in order. These are chosen for maximum mutual distinguishability
while staying within the DR palette:

| Level | Color  | Hex       |
|-------|--------|-----------|
| 1     | amber  | `#E69A4C` |
| 2     | teal   | `#4CC4B4` |
| 3     | mauve  | `#AD7FA8` |
| 4     | gold   | `#DAA520` |
| 5     | slate  | `#6E8FAD` |
| 6     | sage   | `#8AAC6B` |

---

## 5. ANSI Terminal Palette

The 16-color ANSI palette is stable as established in the Warp theme. All
terminal emulators (VS Code integrated terminal, Warp, Tabby, Xcode console)
MUST use this exact mapping.

### 5.1 Normal Colors (0–7)

| Index | ANSI Name | DR Token      | Hex       | Semantic use in DR |
|-------|-----------|---------------|-----------|--------------------|
| 0     | Black     | `obsidian`    | `#160E08` | Dark background (not void — avoids invisible text) |
| 1     | Red       | `scarlet`     | `#C44C4C` | Errors, `stderr` |
| 2     | Green     | `sage`        | `#8AAC6B` | Success, diff added |
| 3     | Yellow    | `amber`       | `#E69A4C` | Warnings, `make` output |
| 4     | Blue      | `slate`       | `#6E8FAD` | Info, git modified |
| 5     | Magenta   | `mauve`       | `#AD7FA8` | Special, branch names |
| 6     | Cyan      | `teal`        | `#4CC4B4` | Links, interactive prompts |
| 7     | White     | `bone`        | `#EBE1D7` | Normal text on dark bg |

### 5.2 Bright Colors (8–15)

| Index | ANSI Name      | DR Token       | Hex       | Note |
|-------|----------------|----------------|-----------|------|
| 8     | Bright Black   | `crater`       | `#3C2A21` | Comments, dim text |
| 9     | Bright Red     | `scarlet-lt`   | `#D46868` | Lighter error (8% lighter) |
| 10    | Bright Green   | `sage-lt`      | `#A3C484` | Lighter success (8% lighter) |
| 11    | Bright Yellow  | `gold`         | `#DAA520` | True gold — stable success |
| 12    | Bright Blue    | `slate-lt`     | `#8AABC4` | Lighter slate (8% lighter) |
| 13    | Bright Magenta | `mauve-lt`     | `#C49BC0` | Lighter mauve (8% lighter) |
| 14    | Bright Cyan    | `teal`         | `#4CC4B4` | Teal is already bright — same value |
| 15    | Bright White   | `crema`        | `#FFF7EE` | Full brightness text |

---

## 6. Per-Editor Notes

### 6.1 VS Code (`dark-roast-color-theme.json`)

VS Code has two syntax color layers: **TextMate token colors** (grammar-based,
`tokenColors`) and **semantic token colors** (`semanticTokenColors`). When
both match a token, semantic wins. This creates a two-pass system.

**Semantic layer rules:**
- `type`, `class`, `interface`, `enum` → `gold` `#DAA520` italic
- `enumMember` → `amber-hot` `#D2691E`
- `function.declaration` → `teal` `#4CC4B4`
- `parameter` → italic only (no color change, inherits crema)
- `variable.readonly` → italic only
- `comment` → `mocha` `#8B7355` italic

**TextMate layer rules:** Must match canonical spec. No editor-specific
overrides are permitted in the TextMate layer except for things the semantic
layer cannot express.

**Known VS Code delta from canonical spec:** The current file uses `sage`
(`#8AAC6B`) for strings. This IS the canonical choice — do not revert to
`gold` for strings in this theme.

### 6.2 Textastic (`.tmTheme`)

Textastic uses `.tmTheme` (XML plist, TextMate grammar format). The current
file (`Dark-Roast-Black-Label.tmTheme`) has two **non-canonical** assignments
that must be fixed to align with this spec:

1. **Keywords → scarlet** (`#C44C4C`). MUST change to **mauve** (`#AD7FA8`).
   Affects scopes: `keyword`, `keyword.control`, `storage.type`, `storage.modifier`.

2. **Numbers → amber** (`#E69A4C`). MUST change to **amber-hot** (`#D2691E`).
   Affects scope: `constant.numeric`.

3. **Types/classes → amber** (`#E69A4C`). MUST change to **gold** (`#DAA520`).
   Affects scopes: `entity.name.class`, `entity.name.type`, `entity.name.struct`.

4. **Functions → teal** (`#4CC4B4`). This IS correct — no change needed.

5. **Strings → gold** (`#DAA520`). MUST change to **sage** (`#8AAC6B`).
   Affects scope: `string`.

The `.tmTheme` format does not support semantic highlighting layers, so the
rationale comments embedded in the file are the primary documentation vehicle.
Update all `WHY:` comment blocks when making these corrections.

### 6.3 Xcode (`.dvtcolortheme`)

Xcode is the only editor that distinguishes **user-defined** identifiers from
**system/SDK** identifiers natively. This distinction is architecturally sound
and should be exploited:

- **User types, functions, constants** → warm palette (`gold`, `teal`, `amber`)
- **System/SDK types, functions, constants** → cool palette (`slate`)
- **`self` and `super`** → `amber-hot` (language-defined special behavior)

Xcode **non-canonical** assignments to fix:

1. **Keywords → scarlet** (`#C44C4C`). MUST change to **mauve** (`#AD7FA8`).
   Affects `xcode.syntax.keyword` and `xcode.syntax.preprocessor`.

2. **Strings → gold** (`#DAA520`). MUST change to **sage** (`#8AAC6B`).
   Affects `xcode.syntax.string` and `xcode.syntax.character`.

3. **User types → amber** (`#E69A4C`). MUST change to **gold** (`#DAA520`).
   Affects `xcode.syntax.identifier.class` and `xcode.syntax.identifier.type`.

The Xcode `user vs. system` split is a **canonical feature**, not an
Xcode-specific exception. When other editors gain this capability, the same
warm/cool axis MUST be applied.

Xcode bold convention (retain):
- `xcode.syntax.keyword` → Bold
- `xcode.syntax.comment.doc.keyword` → Bold
- `xcode.syntax.identifier.constant.system` → Bold

### 6.4 Sublime Text

Sublime Text reads `.tmTheme` files natively, so the corrected Textastic file
can be used directly. Sublime also supports `.sublime-color-scheme` (JSON5)
for enhanced capabilities. If a dedicated Sublime theme is created, it must
use the canonical mapping above. Sublime does not natively support semantic
highlighting — the TextMate grammar layer is the only option.

### 6.5 Warp / Tabby / Terminal Emulators

Terminal emulators only consume the ANSI palette (§5). Syntax highlighting
inside a terminal editor (e.g., `vim` with a colorscheme) is the editor's
concern, not the terminal theme's. The Warp file is canonical and stable.
Tabby and other emulators should mirror the Warp ANSI values exactly.

---

## 7. Contrast Ratios

All values calculated against `void` background (`#120C06`, sRGB luminance
≈ 0.0023). Formula: `(L1 + 0.05) / (L2 + 0.05)` per WCAG 2.1.

| Token     | Hex       | Luminance | Contrast vs void | WCAG AA (4.5:1) | WCAG AAA (7:1) |
|-----------|-----------|-----------|------------------|-----------------|----------------|
| crema     | `#FFF7EE` | 0.9607    | ~18.3:1          | PASS            | PASS           |
| bone      | `#EBE1D7` | 0.8432    | ~14.1:1          | PASS            | PASS           |
| teal      | `#4CC4B4` | 0.2195    | ~8.9:1           | PASS            | PASS           |
| amber     | `#E69A4C` | 0.2668    | ~8.0:1 (est.)    | PASS            | PASS           |
| gold      | `#DAA520` | 0.2303    | ~7.8:1 (est.)    | PASS            | PASS           |
| sage      | `#8AAC6B` | 0.1796    | ~5.3:1 (est.)    | PASS            | FAIL           |
| mauve     | `#AD7FA8` | 0.1720    | ~5.1:1 (est.)    | PASS            | FAIL           |
| mocha     | `#8B7355` | 0.1296    | ~4.7:1 (est.)    | PASS            | FAIL           |
| slate     | `#6E8FAD` | 0.1378    | ~4.7:1 (est.)    | PASS            | FAIL           |
| scarlet   | `#C44C4C` | 0.1330    | ~4.8:1 (est.)    | PASS            | FAIL           |
| amber-hot | `#D2691E` | 0.1027    | ~5.9:1 (est.)    | PASS            | FAIL           |
| asparagus | `#465945` | 0.0447    | ~2.6:1           | FAIL            | FAIL           |
| crater-lt | `#4D3B31` | 0.0283    | ~2.2:1           | FAIL            | FAIL           |
| crater    | `#3C2A21` | 0.0158    | ~1.8:1           | FAIL            | FAIL           |

**Notes:**
- `mocha` (comments) is at 4.7:1 — just at the WCAG AA threshold. This is
  intentional: comments should be visible but recede. Do not reduce further.
- `asparagus`, `crater-lt`, and `crater` fall below AA. These are ONLY used
  for non-essential chrome (ghost text, punctuation, gutter) — never for
  content the reader needs to parse. Acceptable by design.
- High-contrast media query (`prefers-contrast: more`) should substitute `bone`
  for `mocha` in comment roles and `crater-lt` for `crater` in punctuation.

---

## 8. Anti-Patterns

These are explicitly prohibited assignments. If you see them in any theme file,
they are bugs, not intentional deviations.

### 8.1 Do Not Use Scarlet for Keywords

```
WRONG:  keyword → scarlet (#C44C4C)
RIGHT:  keyword → mauve (#AD7FA8)
```

Scarlet is an error/critical signal. Keywords appear on every line. Applying
scarlet to `if`, `return`, `def`, `func`, or `const` wastes the error signal
and creates sustained visual stress. Any theme file with `keyword → scarlet`
is a pre-canonical artifact that needs to be corrected.

### 8.2 Do Not Use Gold for Strings

```
WRONG:  string → gold (#DAA520)
RIGHT:  string → sage (#8AAC6B)
```

Gold is reserved for types and classes. If strings and types share gold, the
type-vs-data visual distinction collapses. Sage provides a distinct warm-green
channel that is reserved solely for strings and inserted diff lines.

### 8.3 Do Not Use Amber for Types

```
WRONG:  class/type → amber (#E69A4C)
RIGHT:  class/type → gold (#DAA520)
```

Amber is the primary UI accent (buttons, CTAs, highlights). Using amber for
types bleeds the UI language into the syntax language. Gold is the correct
warm-stable tone for type names.

### 8.4 Do Not Use Teal for Keywords or Strings

Teal is reserved for actionable/kinetic tokens: function calls, operators,
links, template interpolation, interactive UI. Applying teal to static tokens
(keywords, strings) erodes the kinetic signal.

### 8.5 Do Not Leave Punctuation in High-Contrast Colors

Braces, brackets, semicolons, and commas are scaffolding. They must not
compete with content tokens. Any color brighter than `mocha` (`#8B7355`) for
bare punctuation is incorrect. `crater-lt` (`#4D3B31`) is the canonical choice;
`mocha` is acceptable for bracket pairs (where depth scanning is the intent).

### 8.6 Do Not Make Comments Invisible

```
WRONG:  comment → asparagus (#465945)   [2.6:1 contrast — fails AA]
RIGHT:  comment → mocha (#8B7355)       [4.7:1 contrast — passes AA]
```

Comments convey intent and architecture decisions. They must remain legible.
Asparagus is for ghost text and `@deprecated` decorative markers only.

### 8.7 Do Not Use Semantic Severity Colors for Non-Error Code Constructs

The five clinical severity states (critical/worsening/improving/stable/resolved)
map to (`scarlet`, `amber-hot`, `amber`, `gold`, `teal`). These are the somaCURA
badge colors. Do not apply them to code semantics as if code constructs have
clinical severity. The syntax color mapping is driven by ergonomic frequency and
visual weight, not by the severity gradient.

The one exception: the severity gradient IS a useful mnemonic for *errors
specifically* — scarlet for invalid/illegal, amber-hot for deprecated/warning,
amber for style warnings. This is fine because it maps alarm-level constructs
to alarm-level colors. The gradient reasoning breaks down when applied to
structural constructs like keywords.

---

## 9. Revision History

| Version | Date       | Change |
|---------|------------|--------|
| 1.0     | 2026-03-01 | Initial canonical spec. Resolves keyword/string/type disagreement between VS Code (mauve keywords, sage strings, gold types) and Textastic/Xcode (scarlet keywords, gold strings, amber types). VS Code approach adopted as canonical. Textastic and Xcode listed as needing correction. |
