#!/usr/bin/env python3
"""
Dark Roast: Black Label — Terminal.app Profile Generator
Version: 4.0.0

WHAT THIS SCRIPT DOES
---------------------
Generates "Dark Roast Black Label.terminal" — an Apple Terminal.app color
profile (.terminal file) with the full Dark Roast ANSI-16 palette.

Terminal.app stores colors as NSKeyedArchiver-serialized NSColor objects
embedded in a binary plist, which is then base64-encoded. This makes the
format impossible to write by hand (unlike iTerm2's .itermcolors). This
script uses PyObjC (the Python–Objective-C bridge that ships with every
macOS system Python installation) to produce the correct binary encoding.

REQUIREMENTS
------------
- macOS (any modern version — 10.15 Catalina or later recommended)
- Python 3 — use the SYSTEM python3, not a venv or Homebrew python, because
  PyObjC is only available on the system installation:
    /usr/bin/python3 generate-terminal-profile.py

  DO NOT use:
    python3 generate-terminal-profile.py   (if python3 points to Homebrew)
    ~/.pyenv/shims/python3 ...

INSTALL
-------
1. Run this script:
     /usr/bin/python3 generate-terminal-profile.py

2. A file named "Dark Roast Black Label.terminal" will be created in the
   current directory (same folder as this script).

3. Double-click "Dark Roast Black Label.terminal" in Finder, OR:
     open "Dark Roast Black Label.terminal"

   Terminal.app will import the profile automatically and prompt you to
   set it as default if desired.

4. To activate permanently:
   Terminal.app → Settings → Profiles → select "Dark Roast Black Label"
   → click "Default" button at the bottom of the list

ALTERNATIVE: Apply via defaults write (no file needed)
------------------------------------------------------
If you prefer to apply the profile directly without generating a file, see
the companion script install.sh in this same directory.

FULL COLOR REFERENCE
--------------------
Chrome:
  background    #120C06   void      — OLED-safe deepest layer (1.6ms wake)
  foreground    #FFF7EE   crema     — primary text (17.08:1 contrast on void)
  cursor        #4CC4B4   teal      — kinetic cursor, matches editor caret
  cursor text   #120C06   void      — text color inside cursor block
  selection     #2A1C13   espresso  — warm polished surface (v4: was `grain`)
  bold          #FFF7EE   crema     — same as foreground (bold = same weight)

ANSI Normal (indices 0–7):
  0  black       #160E08   obsidian  — dark floor (not as deep as void)
  1  red         #C44C4C   scarlet   — error / critical
  2  green       #8AAC6B   sage      — warm fern (terminal extension)
  3  yellow      #E69A4C   amber     — warning / accent
  4  blue        #6E8FAD   slate     — dusty steel (terminal extension)
  5  magenta     #AD7FA8   mauve     — dried lavender (terminal extension)
  6  cyan        #4CC4B4   teal      — live data flow
  7  white       #EBE1D7   bone      — reduced-contrast light text

ANSI Bright (indices 8–15):
  8  bright black    #3C2A21   crater-deep — comment gray (v4: was `crater`)
  9  bright red      #D46868   scarlet+  — scarlet lightened ~20%
  10 bright green    #A3C484   sage+     — sage lightened ~20%
  11 bright yellow   #DAA520   gold      — success / stable severity
  12 bright blue     #8AABC4   slate+    — slate lightened ~20%
  13 bright magenta  #C49BC0   mauve+    — mauve lightened ~20%
  14 bright cyan     #6DD4C8   teal+     — teal brightened (visibly lighter than #4CC4B4)
  15 bright white    #FFF7EE   crema     — full brightness
"""

import os
import sys
import plistlib
import struct

# ── Verify we're on macOS and PyObjC is available ────────────────────────────
if sys.platform != "darwin":
    sys.exit("ERROR: This script must be run on macOS.")

try:
    from Foundation import NSColor, NSKeyedArchiver, NSData
    from AppKit import NSFont
except ImportError:
    sys.exit(
        "ERROR: PyObjC is not available.\n"
        "This script requires the SYSTEM python3 at /usr/bin/python3.\n"
        "If /usr/bin/python3 reports this error, run:\n"
        "  xcode-select --install\n"
        "and then retry."
    )

# ── Color definitions ─────────────────────────────────────────────────────────
# Each tuple is (R, G, B) with components in 0.0–1.0 sRGB range.
# Converted from hex using component / 255.

def hex_to_rgb_floats(hex_str):
    """Convert '#RRGGBB' or 'RRGGBB' to (r, g, b) as 0.0–1.0 floats."""
    h = hex_str.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))

PALETTE = {
    # Chrome
    "background":     "#120C06",   # void
    "foreground":     "#FFF7EE",   # crema
    "cursor":         "#4CC4B4",   # teal
    "cursor_text":    "#120C06",   # void (inverted on cursor block)
    "selection":      "#2A1C13",   # espresso (Terminal.app uses opaque selection bg)
    "bold_text":      "#FFF7EE",   # crema (bold = same color, different weight)

    # ANSI Normal 0–7
    "ansi_black":     "#160E08",   # obsidian
    "ansi_red":       "#C44C4C",   # scarlet
    "ansi_green":     "#8AAC6B",   # sage
    "ansi_yellow":    "#E69A4C",   # amber
    "ansi_blue":      "#6E8FAD",   # slate
    "ansi_magenta":   "#AD7FA8",   # mauve
    "ansi_cyan":      "#4CC4B4",   # teal
    "ansi_white":     "#EBE1D7",   # bone

    # ANSI Bright 8–15
    "ansi_bright_black":   "#3C2A21",  # crater-deep
    "ansi_bright_red":     "#D46868",  # scarlet lightened
    "ansi_bright_green":   "#A3C484",  # sage lightened
    "ansi_bright_yellow":  "#DAA520",  # gold
    "ansi_bright_blue":    "#8AABC4",  # slate lightened
    "ansi_bright_magenta": "#C49BC0",  # mauve lightened
    "ansi_bright_cyan":    "#6DD4C8",  # teal brightened (lighter than #4CC4B4)
    "ansi_bright_white":   "#FFF7EE",  # crema
}

# Terminal.app plist key names for each palette entry
PLIST_KEYS = {
    "background":          "BackgroundColor",
    "foreground":          "TextColor",
    "cursor":              "CursorColor",
    "cursor_text":         "CursorTextColor",
    "selection":           "SelectionColor",
    "bold_text":           "TextBoldColor",

    "ansi_black":          "ANSIBlackColor",
    "ansi_red":            "ANSIRedColor",
    "ansi_green":          "ANSIGreenColor",
    "ansi_yellow":         "ANSIYellowColor",
    "ansi_blue":           "ANSIBlueColor",
    "ansi_magenta":        "ANSIMagentaColor",
    "ansi_cyan":           "ANSICyanColor",
    "ansi_white":          "ANSIWhiteColor",

    "ansi_bright_black":   "ANSIBrightBlackColor",
    "ansi_bright_red":     "ANSIBrightRedColor",
    "ansi_bright_green":   "ANSIBrightGreenColor",
    "ansi_bright_yellow":  "ANSIBrightYellowColor",
    "ansi_bright_blue":    "ANSIBrightBlueColor",
    "ansi_bright_magenta": "ANSIBrightMagentaColor",
    "ansi_bright_cyan":    "ANSIBrightCyanColor",
    "ansi_bright_white":   "ANSIBrightWhiteColor",
}


def color_to_nsdata(hex_color):
    """
    Convert a hex color string to NSData containing an NSKeyedArchiver-encoded
    NSColor object. This is the exact format Terminal.app expects in its plist.

    NSColor objects are serialized via NSKeyedArchiver because Terminal.app
    needs to round-trip them through Core Data. Plain hex is not accepted.
    """
    r, g, b = hex_to_rgb_floats(hex_color)
    # Create an sRGB NSColor with alpha = 1.0
    color = NSColor.colorWithSRGBRed_green_blue_alpha_(r, g, b, 1.0)
    # Archive it using NSKeyedArchiver
    data = NSKeyedArchiver.archivedDataWithRootObject_requiringSecureCoding_error_(
        color, False, None
    )
    # data is NSData; convert to Python bytes for plistlib
    return bytes(data)


def make_font_nsdata(family="Menlo", size=13.0):
    """
    Create NSKeyedArchiver-encoded NSFont data for the terminal font.
    Menlo 13pt is Terminal.app's default monospace font.
    """
    font = NSFont.fontWithName_size_(family, size)
    if font is None:
        # Fallback: try Monaco if Menlo somehow unavailable
        font = NSFont.fontWithName_size_("Monaco", size)
    if font is None:
        print(f"WARNING: Could not find font '{family}', skipping Font key.")
        return None
    data = NSKeyedArchiver.archivedDataWithRootObject_requiringSecureCoding_error_(
        font, False, None
    )
    return bytes(data)


def build_profile():
    """
    Build the complete Terminal.app profile plist dictionary.

    ProfileCurrentVersion 2.07 is the format used by Terminal on macOS 12+.
    The 'type' key must be exactly "Window Settings" — Terminal.app ignores
    profiles without this key.
    """
    profile = {
        # ── Profile metadata ─────────────────────────────────────────────
        "name":                   "Dark Roast Black Label",
        "type":                   "Window Settings",
        "ProfileCurrentVersion":  2.07,

        # ── Window size ──────────────────────────────────────────────────
        "columnCount":            220,
        "rowCount":               50,

        # ── Cursor style ─────────────────────────────────────────────────
        # 0 = block, 1 = underline, 2 = vertical bar
        "CursorType":             0,
        "CursorBlink":            True,

        # ── Text settings ────────────────────────────────────────────────
        "UseBoldFonts":           True,
        "UseBlinkingText":        False,
        "DisableANSIColor":       False,
        # Terminal.app uses "bright colors for bold text" by default —
        # we disable this so bold uses TextBoldColor (#FFF7EE) not the
        # bright ANSI variant.
        "UseBrightBold":          False,

        # ── Background opacity ───────────────────────────────────────────
        # 1.0 = fully opaque — required for OLED-black void to work correctly.
        # Transparency would blend void with desktop wallpaper.
        "BackgroundAlphaInactive": 1.0,
        "BackgroundBlur":          0.0,

        # ── Scrollback ───────────────────────────────────────────────────
        "ScrollbackLines":        10000,
        "ScrollbackUnlimited":    False,

        # ── Bell ─────────────────────────────────────────────────────────
        "Bell":                   False,
        "VisualBell":             False,
    }

    # ── Colors ───────────────────────────────────────────────────────────────
    for palette_key, plist_key in PLIST_KEYS.items():
        hex_color = PALETTE[palette_key]
        profile[plist_key] = color_to_nsdata(hex_color)

    # ── Font ─────────────────────────────────────────────────────────────────
    font_data = make_font_nsdata("Menlo", 13.0)
    if font_data:
        profile["Font"] = font_data

    return profile


def main():
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(output_dir, "Dark Roast Black Label.terminal")

    print("Dark Roast: Black Label — Terminal.app Profile Generator")
    print("=" * 60)
    print(f"Output: {output_path}")
    print()

    profile = build_profile()

    # Write as binary plist (required — Terminal.app rejects XML plist format
    # for color profiles because NSData values must be binary-encoded)
    with open(output_path, "wb") as f:
        plistlib.dump(profile, f, fmt=plistlib.FMT_XML)

    print(f"SUCCESS: Written to '{os.path.basename(output_path)}'")
    print()
    print("NEXT STEPS:")
    print("  1. Double-click the .terminal file in Finder, OR run:")
    print(f"       open \"{output_path}\"")
    print("  2. Terminal.app will import the profile automatically.")
    print("  3. To set as default: Terminal → Settings → Profiles →")
    print("     select 'Dark Roast Black Label' → click 'Default'.")
    print()
    print("ANSI PALETTE LOADED:")
    ansi_names = [
        ("0 black (obsidian)",        "ansi_black"),
        ("1 red (scarlet)",           "ansi_red"),
        ("2 green (sage)",            "ansi_green"),
        ("3 yellow (amber)",          "ansi_yellow"),
        ("4 blue (slate)",            "ansi_blue"),
        ("5 magenta (mauve)",         "ansi_magenta"),
        ("6 cyan (teal)",             "ansi_cyan"),
        ("7 white (bone)",            "ansi_white"),
        ("8 br.black (crater-deep)",  "ansi_bright_black"),
        ("9 br.red",                  "ansi_bright_red"),
        ("10 br.green",               "ansi_bright_green"),
        ("11 br.yellow (gold)",       "ansi_bright_yellow"),
        ("12 br.blue",                "ansi_bright_blue"),
        ("13 br.magenta",             "ansi_bright_magenta"),
        ("14 br.cyan (teal+)",        "ansi_bright_cyan"),
        ("15 br.white (crema)",       "ansi_bright_white"),
    ]
    for label, key in ansi_names:
        print(f"  {label:<28}  {PALETTE[key]}")


if __name__ == "__main__":
    main()
