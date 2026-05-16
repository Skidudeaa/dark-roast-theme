#!/usr/bin/env python3
"""
Dark Roast Theme CLI v2 — programmatic design token manager.

Reads dark-roast-v4.json (single source of truth) and generates platform
exports, validates accessibility, previews themes, computes color metrics,
audits capture quality, and harmonizes album palettes against the collection.

Usage:
    python dark-roast.py validate                              # WCAG + OLED wake checks
    python dark-roast.py inspect dark_roast                    # Resolved profile + metrics
    python dark-roast.py compare dark_roast movember            # Delta-E + L/a/b DNA breakdown
    python dark-roast.py audit                                  # Capture quality / completeness
    python dark-roast.py harmonize "#8B4513,#D2691E,#F4A460"   # Score album art against themes
    python dark-roast.py palette-audit                          # Enforce palette_rules from design spec
    python dark-roast.py export css --theme dark_roast          # CSS custom properties
    python dark-roast.py export swift --theme dark_roast        # Swift Color(hex:) extension
    python dark-roast.py export iterm --theme flexoki_dark      # iTerm .itermcolors XML
    python dark-roast.py export alacritty --theme ayu_dark      # Alacritty TOML
    python dark-roast.py export warp --theme dark_roast         # Warp YAML
    python dark-roast.py preview                                # HTML page with all themes

Zero external dependencies — stdlib only.
"""
from __future__ import annotations
import argparse, json, math, sys, textwrap
from pathlib import Path
from typing import Optional

# ---------------------------------------------------------------------------
# Color math
# ---------------------------------------------------------------------------

def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#").split()[0]
    if len(h) != 6: raise ValueError(f"Bad hex: {h!r}")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)

def hex_to_rgb_float(h: str) -> tuple[float, float, float]:
    r, g, b = hex_to_rgb(h)
    return r / 255.0, g / 255.0, b / 255.0

def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def relative_luminance(hex_color: str) -> float:
    r, g, b = hex_to_rgb_float(hex_color)
    return 0.2126 * srgb_to_linear(r) + 0.7152 * srgb_to_linear(g) + 0.0722 * srgb_to_linear(b)

def contrast_ratio(hex1: str, hex2: str) -> float:
    l1, l2 = relative_luminance(hex1), relative_luminance(hex2)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def bg_lightness_pct(hex_color: str) -> float:
    return relative_luminance(hex_color) * 100

def rgb_to_xyz(r: float, g: float, b: float) -> tuple[float, float, float]:
    rl, gl, bl = srgb_to_linear(r), srgb_to_linear(g), srgb_to_linear(b)
    return (0.4124564*rl + 0.3575761*gl + 0.1804375*bl,
            0.2126729*rl + 0.7151522*gl + 0.0721750*bl,
            0.0193339*rl + 0.1191920*gl + 0.9503041*bl)

def xyz_to_lab(x: float, y: float, z: float) -> tuple[float, float, float]:
    xn, yn, zn = 0.95047, 1.00000, 1.08883
    def f(t): return t ** (1/3) if t > 0.008856 else 7.787 * t + 16/116
    fx, fy, fz = f(x/xn), f(y/yn), f(z/zn)
    return 116*fy - 16, 500*(fx - fy), 200*(fy - fz)

def hex_to_lab(h: str) -> tuple[float, float, float]:
    return xyz_to_lab(*rgb_to_xyz(*hex_to_rgb_float(h)))

def delta_e(hex1: str, hex2: str) -> float:
    L1,a1,b1 = hex_to_lab(hex1); L2,a2,b2 = hex_to_lab(hex2)
    return math.sqrt((L2-L1)**2 + (a2-a1)**2 + (b2-b1)**2)

def lab_diff(hex1: str, hex2: str) -> tuple[float, float, float, float]:
    """(delta_E, delta_L, delta_a, delta_b). +L=lighter, +a=redder, +b=yellower."""
    L1,a1,b1 = hex_to_lab(hex1); L2,a2,b2 = hex_to_lab(hex2)
    dL, da, db = L2-L1, a2-a1, b2-b1
    return math.sqrt(dL**2 + da**2 + db**2), dL, da, db

def hex_to_hsl(h: str) -> tuple[float, float, float]:
    r, g, b = hex_to_rgb_float(h)
    mx, mn = max(r,g,b), min(r,g,b)
    l = (mx+mn)/2
    if mx == mn: return 0.0, 0.0, round(l*100,1)
    d = mx - mn
    s = d/(2-mx-mn) if l > 0.5 else d/(mx+mn)
    if mx == r: hue = ((g-b)/d + (6 if g < b else 0))/6
    elif mx == g: hue = ((b-r)/d + 2)/6
    else: hue = ((r-g)/d + 4)/6
    return round(hue*360,1), round(s*100,1), round(l*100,1)

def temp_label(h: str) -> str:
    hue, s, _ = hex_to_hsl(h)
    if s < 10: return "neutral"
    return "warm" if (hue <= 60 or hue >= 330) else "cool"

# ---------------------------------------------------------------------------
# OLED wake-delay model
# ---------------------------------------------------------------------------
# WHY: OLED pixels have measurable wake delay from full-off (#000000) to lit.
# Causes purple-smearing on fast scroll. Empirical data from Dark Roast spec.
# We interpolate using relative luminance as x-axis.

OLED_WAKE_REF = [
    (0.0,    18.5),  # #000000 pure black, worst case
    (0.0040,  1.6),  # #120C06 void
    (0.0053,  1.8),  # #160E08 obsidian
    (0.0145,  2.1),  # #4D3B31 crater
    (1.0,     0.0),  # white, instant
]
OLED_SMEAR_MS = 5.0

def oled_wake_ms(hex_color: str) -> float:
    lum = relative_luminance(hex_color)
    pts = OLED_WAKE_REF
    if lum <= pts[0][0]: return pts[0][1]
    if lum >= pts[-1][0]: return pts[-1][1]
    for i in range(len(pts)-1):
        x0,y0 = pts[i]; x1,y1 = pts[i+1]
        if x0 <= lum <= x1:
            t = (lum - x0) / (x1 - x0) if x1 != x0 else 0
            return y0 + t * (y1 - y0)
    return 0.0

# ---------------------------------------------------------------------------
# JSON loader + resolver
# ---------------------------------------------------------------------------

DEFAULT_JSON = Path(__file__).parent / "dark-roast-v4.json"
ANSI_NAMES = [
    "black","red","green","yellow","blue","magenta","cyan","white",
    "bright_black","bright_red","bright_green","bright_yellow",
    "bright_blue","bright_magenta","bright_cyan","bright_white",
]

def load_spec(path: Path = DEFAULT_JSON) -> dict:
    with open(path) as f: return json.load(f)

def resolve_profile(theme: dict) -> dict | None:
    if "profile" in theme: return theme["profile"]
    for t in theme.get("tracks", []):
        if t.get("preferred"): return t.get("profile")
    for t in theme.get("tracks", []):
        if "profile" in t: return t["profile"]
    ui = theme.get("ui", {})
    if ui.get("background") and ui.get("foreground"):
        p = {"background": ui["background"], "foreground": ui["foreground"]}
        for k in ["cursor","selection","selected_text","bold"]:
            if k in ui: p[k] = ui[k]
        if "ansi" in theme: p["ansi"] = theme["ansi"]
        return p
    return None

def resolve_ansi(profile: dict) -> dict[str, str] | None:
    ansi = profile.get("ansi")
    if ansi is None: return None
    if isinstance(ansi, dict): return ansi
    if isinstance(ansi, list) and len(ansi) >= 16: return dict(zip(ANSI_NAMES, ansi))
    return None

def all_themes(spec: dict) -> dict[str, dict]:
    return spec.get("themes", {})

def get_theme(spec: dict, name: str) -> dict:
    themes = all_themes(spec)
    if name not in themes:
        print(f"Unknown theme: {name!r}. Available: {', '.join(themes.keys())}", file=sys.stderr); sys.exit(1)
    return themes[name]

def _to_camel(snake: str) -> str:
    parts = snake.split("_")
    return parts[0] + "".join(w.capitalize() for w in parts[1:])

# ---------------------------------------------------------------------------
# validate
# ---------------------------------------------------------------------------

def cmd_validate(spec: dict, args: argparse.Namespace) -> None:
    themes = all_themes(spec)
    issues: list[str] = []
    print(f"{'Theme':<22} {'BG':<9} {'FG':<9} {'Ratio':>6} {'AA':>5} {'AAA':>5} {'Wake':>7} {'OLED':>6}")
    print("-" * 78)
    for name, theme in themes.items():
        profile = resolve_profile(theme)
        if not profile: issues.append(f"  {name}: no resolvable profile"); continue
        bg, fg = profile.get("background"), profile.get("foreground")
        if not bg or not fg: issues.append(f"  {name}: missing bg/fg"); continue
        cr = contrast_ratio(bg, fg)
        aa, aaa = cr >= 4.5, cr >= 7.0
        wake = oled_wake_ms(bg)
        oled_ok = wake < OLED_SMEAR_MS
        print(f"  {name:<20} {bg:<9} {fg:<9} {cr:>5.2f} {'PASS' if aa else 'FAIL':>5} {'PASS' if aaa else 'fail':>5} {wake:>5.1f}ms {'safe' if oled_ok else 'SMEAR':>6}")
        if not aa: issues.append(f"  {name}: contrast {cr:.2f} fails WCAG AA")
        if not oled_ok: issues.append(f"  {name}: OLED wake {wake:.1f}ms > {OLED_SMEAR_MS}ms threshold")
        ansi = resolve_ansi(profile)
        if ansi:
            missing = [n for n in ANSI_NAMES if n not in ansi]
            if missing: issues.append(f"  {name}: missing ANSI: {', '.join(missing)}")
            low = [f"{n}({contrast_ratio(bg, v):.1f})" for n, v in ansi.items()
                   if n not in ("black","bright_black") and contrast_ratio(bg, v) < 3.0]
            if low: issues.append(f"  {name}: low-contrast ANSI vs bg: {', '.join(low)}")
        else: issues.append(f"  {name}: no ANSI palette")
        for sn, sv in theme.get("surface_scale", {}).items():
            if sn.startswith("_"): continue
            sw = oled_wake_ms(sv)
            if sw >= OLED_SMEAR_MS: issues.append(f"  {name}: surface '{sn}' wake {sw:.1f}ms — smear risk")
    print()
    if issues:
        print(f"Issues ({len(issues)}):")
        for i in issues: print(i)
    else: print("All themes pass.")

# ---------------------------------------------------------------------------
# inspect
# ---------------------------------------------------------------------------

def cmd_inspect(spec: dict, args: argparse.Namespace) -> None:
    theme = get_theme(spec, args.theme)
    profile = resolve_profile(theme)
    if not profile: print(f"No profile for {args.theme!r}", file=sys.stderr); sys.exit(1)
    print(f"Theme: {theme.get('name', args.theme)}")
    print(f"Status: {theme.get('status', '?')}  Confidence: {theme.get('confidence', '?')}")
    print(f"Tags: {', '.join(theme.get('tags', []))}\n")
    bg, fg = profile.get("background", "?"), profile.get("foreground", "?")
    print(f"Background:  {bg}")
    print(f"Foreground:  {fg}")
    if bg != "?" and fg != "?":
        cr = contrast_ratio(bg, fg); wake = oled_wake_ms(bg)
        h, s, l = hex_to_hsl(bg)
        print(f"Contrast:    {cr:.2f}  {'(AA)' if cr >= 4.5 else '(FAIL AA)'} {'(AAA)' if cr >= 7.0 else ''}")
        print(f"OLED wake:   {wake:.1f}ms  {'(safe)' if wake < OLED_SMEAR_MS else '(SMEAR RISK)'}")
        print(f"BG HSL:      {h}\u00b0/{s}%/{l}%  ({temp_label(bg)})")
    for k in ["cursor","selection","selected_text","bold"]:
        if k in profile: print(f"{k:12} {profile[k]}")
    ansi = resolve_ansi(profile)
    if ansi:
        print(f"\n{'Slot':<18} {'Hex':<9} {'Contrast':>8} {'Wake':>7} {'Temp':<8} HSL")
        print("-" * 70)
        for n in ANSI_NAMES:
            v = ansi.get(n, "\u2014")
            if v != "\u2014" and bg != "?":
                cr = contrast_ratio(bg, v); w = oled_wake_ms(v); h,s,l = hex_to_hsl(v)
                print(f"  {n:<16} {v:<9} {cr:>7.2f} {w:>6.1f} {temp_label(v):<8} {h}\u00b0/{s}%/{l}%")
            else: print(f"  {n:<16} {v}")
    for section in ["design_philosophy","design_notes","typography","surface_scale","severity_mapping"]:
        if section in theme:
            val = theme[section]; print(f"\n{section}:")
            if isinstance(val, dict):
                for k, v in val.items():
                    if not k.startswith("_"): print(f"  {k}: {json.dumps(v) if isinstance(v, dict) else v}")
            else: print(f"  {val}")

# ---------------------------------------------------------------------------
# compare — with L/a/b DNA decomposition
# ---------------------------------------------------------------------------

def _dna_note(dL, da, db):
    parts = []
    if abs(dL) > 3: parts.append(f"{'lighter' if dL > 0 else 'darker'} {abs(dL):.0f}L")
    if abs(da) > 3: parts.append(f"{'redder' if da > 0 else 'greener'} {abs(da):.0f}a")
    if abs(db) > 3: parts.append(f"{'yellower' if db > 0 else 'bluer'} {abs(db):.0f}b")
    return ", ".join(parts) or "near-identical"

def cmd_compare(spec: dict, args: argparse.Namespace) -> None:
    ta, tb = get_theme(spec, args.theme_a), get_theme(spec, args.theme_b)
    pa, pb = resolve_profile(ta), resolve_profile(tb)
    if not pa or not pb: print("Cannot resolve both profiles.", file=sys.stderr); sys.exit(1)
    na, nb = ta.get("name", args.theme_a), tb.get("name", args.theme_b)
    print(f"Comparing: {na} vs {nb}")
    print(f"{'Slot':<18} {'A':<10} {'B':<10} {'\u0394E':>5} {'\u0394L':>5} {'\u0394a':>5} {'\u0394b':>5}  DNA")
    print("-" * 88)
    for k in ["background","foreground","cursor"]:
        ha, hb = pa.get(k), pb.get(k)
        if ha and hb:
            dE, dL, da, db = lab_diff(ha, hb)
            print(f"  {k:<16} {ha:<10} {hb:<10} {dE:>4.1f} {dL:>+5.0f} {da:>+5.0f} {db:>+5.0f}  {_dna_note(dL, da, db)}")
    aa, ab = resolve_ansi(pa), resolve_ansi(pb)
    if aa and ab:
        total, cnt = 0.0, 0
        for n in ANSI_NAMES:
            ha, hb = aa.get(n), ab.get(n)
            if ha and hb:
                dE, dL, da, db = lab_diff(ha, hb); total += dE; cnt += 1
                print(f"  {n:<16} {ha:<10} {hb:<10} {dE:>4.1f} {dL:>+5.0f} {da:>+5.0f} {db:>+5.0f}  {_dna_note(dL, da, db)}")
        if cnt: print(f"\n  Avg \u0394E across {cnt} slots: {total/cnt:.1f}")
        ta_temps = [temp_label(aa[n]) for n in ANSI_NAMES[1:7] if n in aa]
        tb_temps = [temp_label(ab[n]) for n in ANSI_NAMES[1:7] if n in ab]
        print(f"  Temperature: {na} = {ta_temps.count('warm')}W/{ta_temps.count('cool')}C  |  {nb} = {tb_temps.count('warm')}W/{tb_temps.count('cool')}C")

# ---------------------------------------------------------------------------
# audit
# ---------------------------------------------------------------------------

def cmd_audit(spec: dict, args: argparse.Namespace) -> None:
    themes = all_themes(spec)
    print("CAPTURE QUALITY AUDIT")
    print(f"{'Theme':<22} {'Status':<18} {'Conf':>5} {'ANSI':>5} {'UI':>4} Tolerance")
    print("-" * 80)
    ui_fields = ["background","foreground","cursor","selection","selected_text"]
    for name, theme in themes.items():
        status = theme.get("status", "?")[:17]
        conf = theme.get("confidence", 0)
        profile = resolve_profile(theme)
        ac = sum(1 for n in ANSI_NAMES if resolve_ansi(profile or {}) and n in (resolve_ansi(profile) or {})) if profile else 0
        uc = sum(1 for f in ui_fields if profile and profile.get(f)) if profile else 0
        tol = theme.get("confidence_note", "\u2014")
        print(f"  {name:<20} {status:<18} {conf:>4.2f} {ac:>2}/16 {uc:>1}/5  {tol}")
    queue = spec.get("capture_queue", [])
    if queue:
        print(f"\nCAPTURE QUEUE ({len(queue)}):")
        for item in queue:
            p = item.get("priority", "?")
            m = "!!!" if p == "high" else " ! " if p == "medium" else "   "
            print(f"  {m} [{p:<6}] {item.get('theme','?')}: {item.get('why','')}")
    print("\nACTIONABLE:")
    approx = [n for n, t in themes.items() if "approximate" in str(t.get("confidence_note", "")) or "\u00b1" in str(t.get("confidence_note", ""))]
    if approx: print(f"  Digital Color Meter needed: {', '.join(approx)}")
    low = [n for n, t in themes.items() if t.get("confidence", 1.0) < 0.7]
    if low: print(f"  Low confidence (<0.70): {', '.join(low)}")

# ---------------------------------------------------------------------------
# harmonize — Song Expanse TextColors bridge
# ---------------------------------------------------------------------------

def cmd_harmonize(spec: dict, args: argparse.Namespace) -> None:
    raw = args.palette.replace(" ", "").split(",")
    colors = []
    for c in raw:
        c = c.strip()
        if not c.startswith("#"): c = "#" + c
        try: hex_to_rgb(c); colors.append(c)
        except ValueError: print(f"Skipping: {c!r}", file=sys.stderr)
    if not colors: print("No valid colors.", file=sys.stderr); sys.exit(1)
    print(f"Input: {', '.join(colors)}")
    print(f"Temp:  {', '.join(temp_label(c) for c in colors)}\n")
    input_warm = sum(1 for c in colors if temp_label(c) == "warm")
    input_cool = sum(1 for c in colors if temp_label(c) == "cool")
    scores = []
    for name, theme in all_themes(spec).items():
        profile = resolve_profile(theme)
        if not profile: continue
        ansi = resolve_ansi(profile)
        if not ansi: continue
        tc = [v for k, v in ansi.items() if k in ANSI_NAMES[1:7]]
        avg_min = sum(min(delta_e(ic, t) for t in tc) for ic in colors) / len(colors)
        tt = [temp_label(ansi.get(n, "#000")) for n in ANSI_NAMES[1:7]]
        tw, tco = tt.count("warm"), tt.count("cool")
        bonus = 0.85 if (input_warm > input_cool and tw > tco) or (input_cool > input_warm and tco > tw) else 1.2 if (input_warm > input_cool and tco > tw) else 1.0
        scores.append((name, avg_min * bonus, f"{tw}W/{tco}C"))
    scores.sort(key=lambda x: x[1])
    print(f"{'Rank':<5} {'Theme':<22} {'Score':>7} {'Temp':>8}  Verdict")
    print("-" * 58)
    for i, (n, s, t) in enumerate(scores):
        v = "strong match" if s < 15 else "compatible" if s < 25 else "workable" if s < 40 else "clash"
        print(f"  {'>>>' if i == 0 else '   '} {n:<22} {s:>6.1f} {t:>8}  {v}")
    print(f"\nRecommendation: {scores[0][0]}")
    if len(scores) > 1 and scores[1][1] - scores[0][1] < 3:
        print(f"  Close runner-up: {scores[1][0]} (\u0394{scores[1][1]-scores[0][1]:.1f})")

# ---------------------------------------------------------------------------
# export: CSS
# ---------------------------------------------------------------------------

def export_css(tn: str, theme: dict, profile: dict) -> str:
    lines = [f"/* Generated from dark-roast-v4.json \u2014 {theme.get('name', tn)} */"]
    sn = tn.replace("_", "-")
    lines.append(f"[data-theme='{sn}'] {{")
    bg, fg = profile.get("background"), profile.get("foreground")
    if bg: lines.append(f"  --color-bg: {bg};")
    if fg: lines.append(f"  --color-fg: {fg};")
    for k in ["cursor","selection","selected_text","bold"]:
        if k in profile: lines.append(f"  --color-{k.replace('_','-')}: {profile[k]};")
    for k, v in theme.get("surface_scale", {}).items():
        if not k.startswith("_"): lines.append(f"  --surface-{k.replace('_','-')}: {v};")
    for k, v in theme.get("action", {}).items():
        lines.append(f"  --action-{k.replace('_','-')}: {v};")
    for k, v in theme.get("ui", {}).items():
        lines.append(f"  --ui-{k.replace('_','-')}: {v};")
    ft = theme.get("foreground", {})
    if isinstance(ft, dict):
        for k, v in ft.items():
            if not k.startswith("_"): lines.append(f"  --fg-{k.replace('_','-')}: {v};")
    ansi = resolve_ansi(profile)
    if ansi:
        lines.append("\n  /* ANSI */")
        for n in ANSI_NAMES:
            if n in ansi: lines.append(f"  --ansi-{n.replace('_','-')}: {ansi[n]};")
    sev = theme.get("severity_mapping", {})
    if sev:
        lines.append("\n  /* Severity */")
        for k, v in sev.items(): lines.append(f"  --severity-{k}: {v};")
    lines.append("}"); return "\n".join(lines)

# ---------------------------------------------------------------------------
# export: Swift — Color(hex:) architecture
# ---------------------------------------------------------------------------

def export_swift(tn: str, theme: dict, profile: dict) -> str:
    cn = "".join(w.capitalize() for w in tn.split("_"))
    lines = [
        f"// Generated from dark-roast-v4.json \u2014 {theme.get('name', tn)}",
        f"// Regenerate: python dark-roast.py export swift --theme {tn}",
        "", "import SwiftUI", "",
        f"struct {cn}Tokens {{",
    ]
    def emit(name, hex_val, cmt=""):
        r, g, b = hex_to_rgb(hex_val)
        c = f"  // {cmt}" if cmt else ""
        lines.append(f"    static let {name} = Color(hex: 0x{r:02X}{g:02X}{b:02X}){c}")
    bg, fg = profile.get("background"), profile.get("foreground")
    if bg: emit("background", bg)
    if fg: emit("foreground", fg)
    for k in ["cursor","selection","selected_text","bold"]:
        if profile.get(k): emit(_to_camel(k), profile[k])
    for section, label in [("surface_scale","Surface Scale"),("crater_brown_layer","Crater Brown"),("foreground","Foreground Tiers"),("action","Action / State"),("severity_mapping","Severity")]:
        data = theme.get(section, {})
        if not isinstance(data, dict) or not data: continue
        lines.append(f"\n    // \u2500\u2500 {label} \u2500\u2500")
        for k, v in data.items():
            if k.startswith("_"): continue
            try: hex_to_rgb(v); emit(_to_camel(k), v)
            except (ValueError, TypeError): pass
    ansi = resolve_ansi(profile)
    if ansi:
        lines.append(f"\n    // \u2500\u2500 ANSI \u2500\u2500")
        for n in ANSI_NAMES:
            if n in ansi: emit(_to_camel(f"ansi_{n}"), ansi[n])
    lines.append("}")
    lines.extend(["", "// MARK: - Color(hex:) initializer (include once)", "//", "// extension Color {",
        "//     init(hex: UInt, alpha: Double = 1.0) {", "//         self.init(.sRGB,",
        "//             red: Double((hex >> 16) & 0xFF) / 255.0,",
        "//             green: Double((hex >> 8) & 0xFF) / 255.0,",
        "//             blue: Double(hex & 0xFF) / 255.0, opacity: alpha)", "//     }", "// }"])
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# export: iTerm
# ---------------------------------------------------------------------------

ITERM_KEYS = [f"Ansi {i} Color" for i in range(16)]

def export_iterm(tn: str, theme: dict, profile: dict) -> str:
    def cd(h):
        r, g, b = hex_to_rgb_float(h)
        return f"\t<dict>\n\t\t<key>Red Component</key>\n\t\t<real>{r:.6f}</real>\n\t\t<key>Green Component</key>\n\t\t<real>{g:.6f}</real>\n\t\t<key>Blue Component</key>\n\t\t<real>{b:.6f}</real>\n\t\t<key>Alpha Component</key>\n\t\t<real>1</real>\n\t\t<key>Color Space</key>\n\t\t<string>sRGB</string>\n\t</dict>"
    bg = profile.get("background","#000000"); fg = profile.get("foreground","#FFFFFF")
    cursor = profile.get("cursor", fg); sel = profile.get("selection","#444444")
    lines = ['<?xml version="1.0" encoding="UTF-8"?>','<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
        f'<!-- {theme.get("name", tn)} -->','<plist version="1.0">','<dict>']
    ansi = resolve_ansi(profile)
    if ansi:
        for i, n in enumerate(ANSI_NAMES):
            lines.append(f"\t<key>{ITERM_KEYS[i]}</key>"); lines.append(cd(ansi.get(n,"#000000")))
    for key, val in [("Background Color",bg),("Foreground Color",fg),("Cursor Color",cursor),("Cursor Text Color",bg),("Selection Color",sel),("Selected Text Color",fg),("Bold Color",profile.get("bold",fg))]:
        lines.append(f"\t<key>{key}</key>"); lines.append(cd(val))
    lines.extend(["</dict>","</plist>"]); return "\n".join(lines)

# ---------------------------------------------------------------------------
# export: Alacritty
# ---------------------------------------------------------------------------

def export_alacritty(tn: str, theme: dict, profile: dict) -> str:
    bg = profile.get("background","#000000"); fg = profile.get("foreground","#FFFFFF")
    cursor = profile.get("cursor", fg); sel = profile.get("selection","#444444")
    lines = [f"# {theme.get('name', tn)}","","[colors.primary]",f'background = "{bg}"',f'foreground = "{fg}"',
        "","[colors.cursor]",f'cursor = "{cursor}"',f'text = "{bg}"',
        "","[colors.selection]",f'background = "{sel}"',f'text = "{fg}"']
    ansi = resolve_ansi(profile)
    if ansi:
        lines.extend(["","[colors.normal]"])
        for n in ANSI_NAMES[:8]: lines.append(f'{n} = "{ansi.get(n,"#000000")}"')
        lines.extend(["","[colors.bright]"])
        for n in ANSI_NAMES[8:]: lines.append(f'{n.replace("bright_","")} = "{ansi.get(n,"#000000")}"')
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# export: Warp
# ---------------------------------------------------------------------------

def export_warp(tn: str, theme: dict, profile: dict) -> str:
    bg = profile.get("background","#000000"); fg = profile.get("foreground","#FFFFFF")
    cursor = profile.get("cursor", fg); sel = profile.get("selection","#444444")
    act = theme.get("action", theme.get("ui", {}))
    accent = act.get("accent", cursor) if isinstance(act, dict) else cursor
    lines = [f"# {theme.get('name', tn)}",f"# ~/.warp/themes/{tn}.yaml",
        f'accent: "{accent}"',f'background: "{bg}"',f'foreground: "{fg}"',
        f'cursor: "{cursor}"',f'selection_background: "{sel}"',"details: darker"]
    ansi = resolve_ansi(profile)
    if ansi:
        lines.append("terminal_colors:")
        lines.append("  normal:")
        for n in ANSI_NAMES[:8]: lines.append(f'    {n}: "{ansi.get(n,"#000000")}"')
        lines.append("  bright:")
        for n in ANSI_NAMES[8:]: lines.append(f'    {n.replace("bright_","")}: "{ansi.get(n,"#000000")}"')
    return "\n".join(lines)

# ---------------------------------------------------------------------------
# export dispatcher
# ---------------------------------------------------------------------------

EXPORTERS = {"css": export_css, "swift": export_swift, "iterm": export_iterm, "alacritty": export_alacritty, "warp": export_warp}

def cmd_export(spec: dict, args: argparse.Namespace) -> None:
    fmt = args.format
    if fmt not in EXPORTERS: print(f"Unknown: {fmt!r}", file=sys.stderr); sys.exit(1)
    names = [args.theme] if args.theme else list(all_themes(spec).keys())
    outputs = []
    for n in names:
        t = get_theme(spec, n); p = resolve_profile(t)
        if not p: print(f"Skipping {n}", file=sys.stderr); continue
        outputs.append(EXPORTERS[fmt](n, t, p))
    print("\n\n".join(outputs))

# ---------------------------------------------------------------------------
# palette-audit — enforces palette_rules from dark-roast-system-v*.json
# ---------------------------------------------------------------------------

def build_token_resolver(spec: dict) -> dict[str, str]:
    """Build a map of token-path-reference to hex.

    Walks the `color` section, indexing every leaf token under its dotted path
    like 'action.accent' -> '#E69A4C'. Used to resolve string references that
    components and role-claiming groups use to point at color tokens.
    """
    resolver: dict[str, str] = {}
    color = spec.get("color", {})
    for category, tokens in color.items():
        if category.startswith("_") or not isinstance(tokens, dict): continue
        for name, data in tokens.items():
            if name.startswith("_"): continue
            hex_val = None
            if isinstance(data, dict) and isinstance(data.get("hex"), str):
                hex_val = data["hex"]
            elif isinstance(data, str) and data.startswith("#"):
                hex_val = data
            if hex_val and len(hex_val) == 7:
                try: hex_to_rgb(hex_val); resolver[f"{category}.{name}"] = hex_val.upper()
                except ValueError: pass
    return resolver

def _walk_for_colors(node, path="", resolver: dict[str, str] | None = None):
    """Yield (path, hex, resolved_from) for every color reference.

    resolved_from is None for direct hex values (#RRGGBB), or the token
    reference string (e.g. 'action.accent') if the value was looked up via
    the resolver. This gives the audit provenance — it can distinguish
    'this hex appears here directly' from 'this hex appears via reference'.
    """
    resolver = resolver or {}
    if isinstance(node, str):
        s = node.strip()
        if len(s) == 7 and s.startswith("#"):
            try: hex_to_rgb(s); yield path, s.upper(), None; return
            except ValueError: pass
        if s in resolver: yield path, resolver[s], s
        return
    if isinstance(node, dict):
        if "hex" in node and isinstance(node["hex"], str):
            try: hex_to_rgb(node["hex"]); yield path, node["hex"].upper(), None; return
            except ValueError: pass
        for k, v in node.items():
            if k.startswith("_"): continue
            yield from _walk_for_colors(v, f"{path}.{k}" if path else k, resolver)
        return
    if isinstance(node, list):
        for i, v in enumerate(node):
            yield from _walk_for_colors(v, f"{path}[{i}]", resolver)

def _hue_gap(h1: float, h2: float) -> float:
    """Circular distance between hues (0-180)."""
    d = abs(h1 - h2) % 360
    return min(d, 360 - d)

def _group_of(path: str) -> str:
    """The semantic group is the closest meaningful parent in the path.
    severity_mapping.critical.color -> severity_mapping
    somaCURA.severity_mapping.critical.color -> severity_mapping
    color.action.accent -> action"""
    parts = [p for p in path.split(".") if "[" not in p]
    if len(parts) >= 2:
        # Walk up until we find a known group keyword or hit top
        groups = {"severity_mapping", "pipeline_states", "action", "surface",
                  "foreground", "components", "thread_accents", "crater_layer"}
        for p in reversed(parts[:-1]):
            if p in groups: return p
        return parts[-2]
    return "root"

def cmd_palette_audit(spec: dict, args: argparse.Namespace) -> None:
    """Audit a Dark Roast design system spec for palette blending issues.
    Enforces palette_rules: hue family separation, cross-group reuse,
    directional state coverage. Resolves token references (e.g.
    'action.accent') back to hex so cross-group reuse via reference is
    detected, not just direct hex collisions."""
    rules = spec.get("palette_rules", {})
    hue_threshold = rules.get("hue_family_separation", {}).get("threshold", {}).get("hue_degrees_min", 30)
    de_threshold = rules.get("hue_family_separation", {}).get("threshold", {}).get("delta_e_min", 25)

    if hasattr(args, "hue_threshold") and args.hue_threshold is not None:
        hue_threshold = args.hue_threshold
    if hasattr(args, "de_threshold") and args.de_threshold is not None:
        de_threshold = args.de_threshold

    # Build token resolver from the color section
    resolver = build_token_resolver(spec)

    print("PALETTE AUDIT")
    print(f"Spec: {args.json}")
    print(f"Thresholds: hue \u2265 {hue_threshold}\u00b0, \u0394E \u2265 {de_threshold}")
    print(f"Token resolver: {len(resolver)} tokens indexed from color.*")
    print("=" * 76)

    # Collect all colors with their paths AND provenance
    all_colors = list(_walk_for_colors(spec, resolver=resolver))

    # Group by semantic group — tuples are (path, hex, resolved_from)
    groups: dict[str, list[tuple[str, str, str | None]]] = {}
    for path, hex_val, ref in all_colors:
        g = _group_of(path)
        groups.setdefault(g, []).append((path, hex_val, ref))

    # Focus groups for intra-group hue separation
    role_groups = {"severity_mapping", "pipeline_states"}
    critical_findings = []
    medium_findings = []

    # 1. Intra-group hue family separation
    for g_name in role_groups:
        if g_name not in groups: continue
        members = groups[g_name]
        seen_roles: dict[str, str] = {}
        for path, hex_val, _ref in members:
            leaf = path.split(".")[-1] if "." in path else path
            if leaf in ("hex", "color"): leaf = path.split(".")[-2]
            seen_roles.setdefault(leaf, hex_val)

        print(f"\n[{g_name}] \u2014 {len(seen_roles)} roles")
        for role, hx in seen_roles.items():
            h, s, l = hex_to_hsl(hx)
            print(f"  {role:<22} {hx}  HSL {h:>5.0f}\u00b0/{s:>3.0f}%/{l:>3.0f}%")

        items = list(seen_roles.items())
        for i, (r1, h1) in enumerate(items):
            for r2, h2 in items[i+1:]:
                hue1 = hex_to_hsl(h1)[0]
                hue2 = hex_to_hsl(h2)[0]
                gap = _hue_gap(hue1, hue2)
                dE = delta_e(h1, h2)
                if gap < hue_threshold and dE < de_threshold:
                    severity = "CRITICAL" if gap < 15 else "MEDIUM"
                    finding = {
                        "group": g_name, "role_a": r1, "hex_a": h1,
                        "role_b": r2, "hex_b": h2,
                        "hue_gap": gap, "delta_e": dE, "severity": severity
                    }
                    if severity == "CRITICAL": critical_findings.append(finding)
                    else: medium_findings.append(finding)

    # 2. Cross-group color reuse — now uses resolved hex AND tracks provenance
    print(f"\n[cross-group color reuse — with token reference resolution]")
    color_to_uses: dict[str, list[dict]] = {}
    for g_name in role_groups:
        if g_name not in groups: continue
        for path, hex_val, ref in groups[g_name]:
            # Skip nested 'hex' leaves — they're redundant with the parent path
            if path.endswith(".hex"): continue
            color_to_uses.setdefault(hex_val, []).append({
                "path": path, "group": g_name, "ref": ref
            })

    reuse_findings = []
    for hex_val, uses in color_to_uses.items():
        groups_used = {u["group"] for u in uses}
        if len(groups_used) > 1:
            reuse_findings.append({"hex": hex_val, "uses": uses, "groups": groups_used})

    if not reuse_findings:
        print("  No cross-group exact-color reuse found.")
    else:
        for f in reuse_findings:
            print(f"  {f['hex']} appears in {len(f['uses'])} places across {len(f['groups'])} groups:")
            for u in f["uses"]:
                prov = f" (via {u['ref']})" if u["ref"] else " (direct hex)"
                print(f"    \u2022 {u['path']}{prov}")
            medium_findings.append({
                **f, "severity": "MEDIUM", "type": "cross_group_reuse"
            })

    # 3. Findings summary
    print(f"\n{'='*76}")
    print(f"FINDINGS \u2014 {len(critical_findings)} critical, {len(medium_findings)} medium")
    print(f"{'='*76}")

    for f in critical_findings + medium_findings:
        sev = f.get("severity", "?")
        marker = "!!!" if sev == "CRITICAL" else " ! "
        if f.get("type") == "cross_group_reuse":
            print(f"\n  {marker} [{sev}] cross-group exact reuse: {f['hex']}")
            print(f"      Appears in groups: {', '.join(sorted(f['groups']))}")
            print(f"      REMEDIATION: use distinct token per group OR pair with channel-distinguishing icon/animation.")
        else:
            print(f"\n  {marker} [{sev}] {f['group']}: {f['role_a']} \u2194 {f['role_b']}")
            print(f"      {f['hex_a']} vs {f['hex_b']}  \u2014  hue gap {f['hue_gap']:.0f}\u00b0, \u0394E {f['delta_e']:.1f}")
            if f["hue_gap"] < 15:
                print(f"      Same hue family. Roles cannot be distinguished at scanning speed.")
            else:
                print(f"      Adjacent hue family. May blend under fatigue / peripheral vision.")
            print(f"      REMEDIATION: push one role to a different hue family OR pair with directional iconography.")

    # 4. Directional-states iconography check
    sev_map = spec.get("somaCURA", {}).get("severity_mapping", {})
    directional_keys = [k for k in sev_map.keys() if k in ("worsening", "improving", "stable", "increasing", "decreasing")]
    if directional_keys:
        print(f"\n[directional state iconography check]")
        missing_icons = []
        for state in directional_keys:
            entry = sev_map.get(state, {})
            if not isinstance(entry, dict): continue
            if "icon" not in entry:
                missing_icons.append(state)
        if missing_icons:
            print(f"  ! Missing iconography: {', '.join(missing_icons)}")
            print(f"    Rule 3 requires paired arrow/slope icons for directional states.")
            medium_findings.append({
                "severity": "MEDIUM", "type": "missing_iconography",
                "states": missing_icons
            })
        else:
            print(f"  \u2713 All {len(directional_keys)} directional states have iconography declared: {', '.join(directional_keys)}")

    # Exit code
    if critical_findings:
        print(f"\nEXIT 1 \u2014 critical findings present")
        sys.exit(1)
    elif medium_findings:
        print(f"\nEXIT 2 — medium findings present")
        sys.exit(2)
    else:
        print(f"\nEXIT 0 — all rules pass")


# ---------------------------------------------------------------------------
# preview: HTML
# ---------------------------------------------------------------------------

def cmd_preview(spec: dict, args: argparse.Namespace) -> None:
    themes = all_themes(spec)
    html = ['<!DOCTYPE html>','<html lang="en"><head><meta charset="utf-8">',
        "<title>Dark Roast v4</title>",
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Instrument+Sans:wght@400;600&family=DM+Sans:wght@400;500;700&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet">',
        "<style>","*{margin:0;padding:0;box-sizing:border-box}",
        "body{font-family:'DM Sans',sans-serif;background:#0a0a0a;color:#ccc;padding:2rem}",
        "h1{font-family:'Playfair Display',serif;color:#E69A4C;margin-bottom:.5rem;font-size:2rem}",
        ".sub{color:#8B7355;font-size:.85rem;margin-bottom:2rem}",
        ".grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:1.5rem}",
        ".card{border-radius:12px;padding:1.5rem;font-family:'Fira Code',monospace;font-size:13px;border:1px solid rgba(255,255,255,.06)}",
        ".card h2{font-family:'Instrument Sans',sans-serif;font-size:1.1rem;margin-bottom:.25rem}",
        ".meta{opacity:.5;font-size:11px;margin-bottom:1rem;font-family:'DM Sans',sans-serif}",
        ".sr{display:flex;gap:3px;margin:3px 0}",
        ".sw{width:32px;height:22px;border-radius:3px;border:1px solid rgba(255,255,255,.08)}",
        ".smp{margin-top:.75rem;line-height:1.7}",
        ".lbl{font-size:10px;opacity:.4;margin-top:6px;font-family:'DM Sans',sans-serif}",
        ".bdg{display:inline-block;font-size:10px;padding:1px 6px;border-radius:3px;margin-right:4px;font-family:'DM Sans',sans-serif}",
        "</style></head><body>",
        "<h1>Dark Roast v4</h1>",
        '<p class="sub">11 themes \u00b7 programmatic design tokens \u00b7 OLED wake model \u00b7 CIELAB DNA</p>',
        '<div class="grid">']
    for name, theme in themes.items():
        profile = resolve_profile(theme)
        if not profile: continue
        bg = profile.get("background","#000"); fg = profile.get("foreground","#ccc")
        cr = contrast_ratio(bg, fg); wake = oled_wake_ms(bg)
        ansi = resolve_ansi(profile); tags = theme.get("tags",[]); conf = theme.get("confidence","?")
        fav = "\u2605 " if theme.get("favorite") else ""
        html.append(f'<div class="card" style="background:{bg};color:{fg};">')
        html.append(f'<h2 style="color:{fg};">{fav}{theme.get("name",name)}</h2>')
        badges = "".join(f'<span class="bdg" style="background:{fg}18;color:{fg};">{t}</span>' for t in tags[:4])
        html.append(f'<div class="meta">{badges} cr:{cr:.1f} wake:{wake:.1f}ms conf:{conf}</div>')
        if ansi:
            html.append(f'<div class="lbl" style="color:{fg};">normal</div><div class="sr">')
            for s in ANSI_NAMES[:8]: html.append(f'<div class="sw" style="background:{ansi.get(s,"#000")};" title="{s}: {ansi.get(s,"")}"></div>')
            html.append(f'</div><div class="lbl" style="color:{fg};">bright</div><div class="sr">')
            for s in ANSI_NAMES[8:]: html.append(f'<div class="sw" style="background:{ansi.get(s,"#000")};" title="{s}: {ansi.get(s,"")}"></div>')
            html.append('</div>')
            kw,fn,st,nm,cm,mg,cy = [ansi.get(n,fg) for n in ["red","blue","green","yellow","bright_black","magenta","cyan"]]
            html.append(f'<div class="smp"><span style="color:{cm};">// hospitalist dashboard</span><br>')
            html.append(f'<span style="color:{kw};">func</span> <span style="color:{fn};">fetchCensus</span>(<span style="color:{fg};">unit:</span> <span style="color:{st};">Ward</span>) -> <span style="color:{nm};">[Patient]</span> {{<br>')
            html.append(f'&nbsp;&nbsp;<span style="color:{kw};">let</span> <span style="color:{fg};">data</span> = <span style="color:{mg};">api</span>.<span style="color:{cy};">stream</span>(<span style="color:{st};">"census"</span>)<br>}}</div>')
        html.append("</div>")
    html.append("</div></body></html>")
    print("\n".join(html))

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    p = argparse.ArgumentParser(description="Dark Roast Theme CLI v2", formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--json", type=Path, default=DEFAULT_JSON, help="Path to JSON spec")
    sub = p.add_subparsers(dest="command")
    sub.add_parser("validate", help="WCAG + OLED wake checks")
    pi = sub.add_parser("inspect", help="Resolved profile + metrics"); pi.add_argument("theme")
    pc = sub.add_parser("compare", help="Delta-E + L/a/b DNA diff"); pc.add_argument("theme_a"); pc.add_argument("theme_b")
    sub.add_parser("audit", help="Capture quality + queue")
    ph = sub.add_parser("harmonize", help="Score palette against themes"); ph.add_argument("palette", help='"#hex1,#hex2,..."')
    pa = sub.add_parser("palette-audit", help="Enforce palette_rules from design system spec"); pa.add_argument("--hue-threshold", type=int, default=None); pa.add_argument("--de-threshold", type=int, default=None)
    pe = sub.add_parser("export", help="Platform export"); pe.add_argument("format", choices=list(EXPORTERS.keys())); pe.add_argument("--theme")
    sub.add_parser("preview", help="HTML preview")
    args = p.parse_args()
    if not args.command: p.print_help(); sys.exit(0)
    spec = load_spec(args.json)
    {"validate":cmd_validate,"inspect":cmd_inspect,"compare":cmd_compare,"audit":cmd_audit,"harmonize":cmd_harmonize,"palette-audit":cmd_palette_audit,"export":cmd_export,"preview":cmd_preview}[args.command](spec, args)

if __name__ == "__main__":
    main()
