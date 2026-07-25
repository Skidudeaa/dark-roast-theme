// ============================================================================
// Dark Roast: Black Label — Blink Shell Theme (iOS / iPadOS)
// Version: 4.0.0
//
// INSTALL
// -------
//   Blink imports themes from a URL, so the file has to be reachable over
//   HTTPS first (raw GitHub file or a gist both work):
//
//     1. Host this file, e.g. push the repo and use its raw URL, or run
//        `gh gist create "platforms/blink/Dark Roast.js"`
//     2. In Blink: type `config` (or press ⌘,) → Appearance → Themes → New Theme
//     3. Paste the URL of the JS theme
//     4. Back in Appearance → Theme → select "Dark Roast"
//
//   Blink names the theme after the file, so keep the filename intact.
//
// FORMAT
// ------
// Blink's terminal is hterm-based: a theme is a JavaScript snippet evaluated
// with the terminal instance bound to `t`. Only four preferences carry color —
// the ANSI-16 palette override, foreground, background, and cursor. Blink has
// no selection-color preference, so selection follows its own system tint.
//
// PALETTE PHILOSOPHY
// ------------------
// All five Dark Roast terminal themes (Warp, Tabby, Terminal.app, iTerm2,
// Blink) share an identical ANSI-16 palette so that ls, git diff, vim syntax,
// tmux, and every other CLI tool produce exactly the same output regardless of
// which emulator you're running.
//
// The palette is grounded in the Dark Roast design system:
//   - Background/foreground pulled directly from DR tokens (void, crema)
//   - Cursor matches the editor cursor (teal — "kinetic, live data flow"),
//     held at 65% alpha because hterm paints the cursor over the glyph rather
//     than inverting it; a solid block would swallow the character underneath
//   - ANSI normals and brights use the five DR action colors + three
//     terminal-extension colors (sage, slate, mauve) that aren't in the core
//     UI token set but sit squarely within the warm espresso aesthetic
//
// FULL COLOR REFERENCE
// --------------------
// Chrome:
//   background    #120C06   void      — OLED-safe deepest layer (1.6ms wake)
//   foreground    #FFF7EE   crema     — primary text (18.31:1 contrast vs void)
//   cursor        #4CC4B4   teal      — kinetic, matches editor caret
//
// ANSI Normal (indices 0–7):
//   0 black       #160E08   obsidian  — dark but not void; provides depth in dark bg
//   1 red         #C44C4C   scarlet   — error / critical
//   2 green       #8AAC6B   sage      — warm fern green (terminal extension)
//   3 yellow      #E69A4C   amber     — warning / accent / CTA
//   4 blue        #6E8FAD   slate     — dusty steel blue (terminal extension)
//   5 magenta     #AD7FA8   mauve     — dried lavender (terminal extension)
//   6 cyan        #4CC4B4   teal      — live data flow / resolved
//   7 white       #EBE1D7   bone      — reduced-contrast light text
//
// ANSI Bright (indices 8–15):
//   8  bright black    #3C2A21   crater-deep   — comment gray / muted metadata
//   9  bright red      #D46868   scarlet-lt    — scarlet lightened (~20%)
//  10  bright green    #A3C484   sage-lt       — sage lightened (~20%)
//  11  bright yellow   #DAA520   gold          — success / stable severity
//  12  bright blue     #8AABC4   slate-lt      — slate lightened (~20%)
//  13  bright magenta  #C49BC0   mauve-lt      — mauve lightened (~20%)
//  14  bright cyan     #6DD4C8   teal-lt       — teal brightened (noticeably lighter
//                                               than normal teal; brights should be
//                                               brighter, not identical)
//  15  bright white    #FFF7EE   crema         — full brightness
// ============================================================================

const darkRoast = {
  // ── ANSI normal (0–7) ─────────────────────────────────────────────────────
  black: "#160E08", // obsidian — elevated floor, not as deep as void
  red: "#C44C4C", // scarlet — error / critical severity
  green: "#8AAC6B", // sage — warm fern; git diff +lines, ls dirs
  yellow: "#E69A4C", // amber — warning / accent; DR primary CTA
  blue: "#6E8FAD", // slate — dusty steel; git diff header, less prompt
  magenta: "#AD7FA8", // mauve — dried lavender; grep matches, vim special
  cyan: "#4CC4B4", // teal — live data; matches cursor + DR teal token
  white: "#EBE1D7", // bone — reduced-contrast; comment-level brightness

  // ── ANSI bright (8–15) ────────────────────────────────────────────────────
  lightBlack: "#3C2A21", // crater-deep — comment gray; git log graph, tmux inactive
  lightRed: "#D46868", // scarlet lightened ~20% — diff removed, error paths
  lightGreen: "#A3C484", // sage lightened ~20% — diff added, success paths
  lightYellow: "#DAA520", // gold — success / stable; git branch
  lightBlue: "#8AABC4", // slate lightened ~20% — links, prompt path segments
  lightMagenta: "#C49BC0", // mauve lightened ~20% — vim visual, special tokens
  lightCyan: "#6DD4C8", // teal lightened — brighter than normal teal
  lightWhite: "#FFF7EE", // crema — full brightness; bold text, headings

  // ── Chrome ────────────────────────────────────────────────────────────────
  backgroundColor: "#120C06", // void — OLED-safe deepest layer
  foregroundColor: "#FFF7EE", // crema — primary text, 18.31:1 contrast vs void
  cursorColor: "rgba(76, 196, 180, 0.65)", // teal at 65% — glyph stays legible under the block
};

t.prefs_.set('color-palette-overrides', [
  darkRoast.black,
  darkRoast.red,
  darkRoast.green,
  darkRoast.yellow,
  darkRoast.blue,
  darkRoast.magenta,
  darkRoast.cyan,
  darkRoast.white,
  darkRoast.lightBlack,
  darkRoast.lightRed,
  darkRoast.lightGreen,
  darkRoast.lightYellow,
  darkRoast.lightBlue,
  darkRoast.lightMagenta,
  darkRoast.lightCyan,
  darkRoast.lightWhite
]);

t.prefs_.set('foreground-color', darkRoast.foregroundColor);
t.prefs_.set('background-color', darkRoast.backgroundColor);
t.prefs_.set('cursor-color', darkRoast.cursorColor);
