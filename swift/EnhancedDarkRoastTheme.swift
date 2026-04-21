// ═══════════════════════════════════════════════════════════════
// EnhancedDarkRoastTheme.swift
// Enhanced Dark Roast: Black Label — SwiftUI Design System v2.0
//
// ARCHITECTURE: Single-file drop-in theme for any SwiftUI app.
// Mirrors the canonical CSS token set in dark-roast-tokens.css.
// Organized by functional concern: Colors → Opacity → Glows →
// Typography → Spacing → Timing → Severity → Status → CExE →
// Theme Protocol → Environment → View Modifiers.
//
// WHY single file: Portability. Drop into Xcode, wire up the
// environment key, and every token is available immediately.
//
// Song Expanse integration: Theme provides chrome/UI shell only.
// Song-derived TextColors handle content areas (lyrics, timeline,
// annotations). These two systems must NEVER be conflated.
// ═══════════════════════════════════════════════════════════════

import SwiftUI


// MARK: - § 1 · Color Hex Initializer

extension Color {
    /// Init from hex integer: `Color(hex: 0xFFF7EE)`
    init(hex: UInt, alpha: Double = 1.0) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255.0,
            green: Double((hex >> 8) & 0xFF) / 255.0,
            blue: Double(hex & 0xFF) / 255.0,
            opacity: alpha
        )
    }

    /// Init from hex string: `Color(hexString: "#FFF7EE")`
    init(hexString: String) {
        let hex = hexString.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        self.init(hex: UInt(int))
    }
}


// MARK: - § 2 · Core Color Tokens (16 Base Colors)

// WHY: 16 production-locked colors across four functional layers.
// Changes require a version bump. Matches tokens.json exactly.

/// Complete token set for Enhanced Dark Roast: Black Label v2.0.
enum DarkRoast {

    // ── Layer 1: Surface Scale (6 steps, monotonic dark → light) ─
    //
    // OLED science: void (#120C06) keeps pixels energized at
    // 1.6ms wake delay, avoiding the 18.5ms purple-smearing
    // artifact of pure black (#000000). obsidian (#160E08) is
    // the elevated floor at 1.8ms. Both are above the OLED
    // power-off threshold while remaining perceptually near-black.
    //
    // v4.0.0 renames:
    //   grain        → espresso        (#2A1C13 unchanged)
    //   grainHover   → espressoHover   (#382818 unchanged)
    //   crater       → craterDeep      (#3C2A21 unchanged)
    //   craterLt     → crater          (#4D3B31 unchanged — now top of surface scale)

    /// The Void — deepest background layer. OLED-safe floor.
    static let void_         = Color(hex: 0x120C06)
    /// Obsidian — elevated content area background.
    static let obsidian      = Color(hex: 0x160E08)
    /// Dark Cacao — elevated surfaces (modals, sheets, popovers).
    static let darkCacao     = Color(hex: 0x1E140E)
    /// Espresso — card/panel surfaces (was `grain` pre-v4).
    static let espresso      = Color(hex: 0x2A1C13)
    /// Warm lift on hover/focus interaction (was `grainHover` pre-v4).
    static let espressoHover = Color(hex: 0x382818)
    /// Roasted Bean — borders, dividers.
    static let roastedBean   = Color(hex: 0x3C2A1E)
    /// Crater — top of surface scale, geological accent (was `craterLt` pre-v4).
    static let crater        = Color(hex: 0x4D3B31)

    // ── Layer 2: Foregrounds ────────────────────────────────

    /// Ivory Crema — hero text, brand chrome, highest contrast.
    static let crema       = Color(hex: 0xFFF7EE)
    /// Warm White — bright callouts, ANSI 15.
    static let warmWhite   = Color(hex: 0xF0E6D0)
    /// Off-White/Bone — reduced-contrast body text, codex ink.
    static let bone        = Color(hex: 0xEBE1D7)
    /// Muted Mocha — secondary/caption text.
    static let mocha       = Color(hex: 0x8B7355)

    // ── Layer 3: Crater Brown Geological (Accent Sediment) ──
    //
    // Warm accent sediment layer providing structural depth.
    // Never carries semantic meaning — purely spatial hierarchy.

    /// Crater Deep — geological accent, darker (was `crater` pre-v4).
    static let craterDeep  = Color(hex: 0x3C2A21)
    /// Desaturated Asparagus — tertiary metadata, timestamps.
    static let asparagus   = Color(hex: 0x465945)
    /// Rustic Red — grounded interactive state, atmospheric bleed.
    static let rustic      = Color(hex: 0x480404)
    /// Bulgarian Rose — contextual error background tint.
    static let rose        = Color(hex: 0x480607)

    // ── Layer 4: Action & State ─────────────────────────────

    /// Amber Gold — primary accent, CTA, buttons, links.
    static let amber       = Color(hex: 0xE69A4C)
    /// High-Octane Amber — gradient terminal, worsening severity.
    static let amberHot    = Color(hex: 0xD2691E)
    /// Muted Amber — reader contexts, Mystic2 parity.
    static let amberMuted  = Color(hex: 0xC07A4A)
    /// True Gold — stable severity.
    static let gold        = Color(hex: 0xDAA520)
    /// Brass — warning, caution.
    static let brass       = Color(hex: 0xBFA162)
    /// Roasted Scarlet — clinical critical severity.
    static let scarlet     = Color(hex: 0xC44C4C)
    /// Burnt Sienna — terminal error, UI error (ANSI red).
    static let burntSienna = Color(hex: 0xC75B39)
    /// Kinetic Teal — live data flow, success, SSE streams.
    static let teal        = Color(hex: 0x4CC4B4)

    // ── Structural Derived ──────────────────────────────────

    /// Ultra-subtle divider — crema at 4% opacity.
    static let divider     = Color(hex: 0xFFF7EE, alpha: 0.04)
    /// Input field background (Swift-only extension — midpoint between void and espresso).
    static let inputBg     = Color(hex: 0x1E140C)

    // ── Deprecated v3 aliases (removed in v5) ───────────────
    //
    // Kept so existing Song Expanse / somaCURA call sites compile
    // unchanged. Migrate to the new names at next refactor.

    /// @available v3.0.0; use `espresso` in v4+.
    @available(*, deprecated, renamed: "espresso")
    static var grain: Color { espresso }
    /// @available v3.0.0; use `espressoHover` in v4+.
    @available(*, deprecated, renamed: "espressoHover")
    static var grainHover: Color { espressoHover }
    /// @available v3.0.0; use `crater` in v4+ (name moved to surface top).
    @available(*, deprecated, renamed: "crater")
    static var craterLt: Color { crater }
}


// MARK: - § 3 · Opacity Variants (dim/subtle/ghost)

// WHY: Three opacity tiers per action color for layered UI states.
// dim (40%) = focused borders, active rings
// subtle (10%) = hover backgrounds, light fills, badge bg
// ghost (5%) = skeleton loads, faint state indicators

extension DarkRoast {

    // ── Amber ───────────────────────────────────────────────
    static let amberDim       = Color(hex: 0xE69A4C, alpha: 0.40)
    static let amberSubtle    = Color(hex: 0xE69A4C, alpha: 0.10)
    static let amberGhost     = Color(hex: 0xE69A4C, alpha: 0.05)

    // ── Amber-Hot ───────────────────────────────────────────
    static let amberHotDim    = Color(hex: 0xD2691E, alpha: 0.40)
    static let amberHotSubtle = Color(hex: 0xD2691E, alpha: 0.10)
    static let amberHotGhost  = Color(hex: 0xD2691E, alpha: 0.05)

    // ── Gold ────────────────────────────────────────────────
    static let goldDim        = Color(hex: 0xDAA520, alpha: 0.40)
    static let goldSubtle     = Color(hex: 0xDAA520, alpha: 0.10)
    static let goldGhost      = Color(hex: 0xDAA520, alpha: 0.05)

    // ── Scarlet ─────────────────────────────────────────────
    static let scarletDim     = Color(hex: 0xC44C4C, alpha: 0.40)
    static let scarletSubtle  = Color(hex: 0xC44C4C, alpha: 0.10)
    static let scarletGhost   = Color(hex: 0xC44C4C, alpha: 0.05)

    // ── Teal ────────────────────────────────────────────────
    static let tealDim        = Color(hex: 0x4CC4B4, alpha: 0.40)
    static let tealSubtle     = Color(hex: 0x4CC4B4, alpha: 0.10)
    static let tealGhost      = Color(hex: 0x4CC4B4, alpha: 0.05)
}


// MARK: - § 4 · Glow System (Multi-Layer Phosphor Shadows)

// ARCHITECTURE: CSS glows are box-shadow values. In SwiftUI these
// translate to stacked .shadow() modifiers. Each glow has up to
// three phosphor layers: white hotspot, color midband, color wash.
//
// TRADEOFF: SwiftUI .shadow() doesn't support multiple comma-
// separated shadows like CSS. We use a ViewModifier that stacks
// three .shadow() calls. Slightly more draw calls but visually
// identical on Metal-backed renderers.

/// Glow definition — three-layer phosphor shadow.
struct DarkRoastGlow {
    let hotspot: (color: Color, radius: CGFloat)
    let midband: (color: Color, radius: CGFloat)
    let wash: (color: Color, radius: CGFloat)
}

extension DarkRoast {

    // ── Glow Definitions ────────────────────────────────────

    static let glowAmber = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.3), 2),
        midband: (Color(hex: 0xE69A4C).opacity(0.25), 10),
        wash:    (Color(hex: 0xE69A4C).opacity(0.10), 24)
    )

    static let glowAmberIntense = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.5), 4),
        midband: (Color(hex: 0xE69A4C).opacity(0.40), 14),
        wash:    (Color(hex: 0xE69A4C).opacity(0.15), 32)
    )

    static let glowTeal = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.4), 2),
        midband: (Color(hex: 0x4CC4B4).opacity(0.35), 8),
        wash:    (Color(hex: 0x4CC4B4).opacity(0.12), 24)
    )

    static let glowTealIntense = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.6), 4),
        midband: (Color(hex: 0x4CC4B4).opacity(0.50), 16),
        wash:    (Color(hex: 0x4CC4B4).opacity(0.20), 36)
    )

    static let glowScarlet = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.3), 2),
        midband: (Color(hex: 0xC44C4C).opacity(0.40), 8),
        wash:    (Color(hex: 0xC44C4C).opacity(0.15), 16)
    )

    static let glowScarletIntense = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.5), 4),
        midband: (Color(hex: 0xC44C4C).opacity(0.55), 14),
        wash:    (Color(hex: 0xC44C4C).opacity(0.20), 28)
    )

    static let glowGold = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.3), 2),
        midband: (Color(hex: 0xDAA520).opacity(0.25), 10),
        wash:    (Color(hex: 0xDAA520).opacity(0.10), 24)
    )

    static let glowGoldIntense = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.5), 4),
        midband: (Color(hex: 0xDAA520).opacity(0.40), 14),
        wash:    (Color(hex: 0xDAA520).opacity(0.15), 32)
    )

    static let glowAmberHot = DarkRoastGlow(
        hotspot: (Color.white.opacity(0.3), 2),
        midband: (Color(hex: 0xD2691E).opacity(0.30), 8),
        wash:    (Color(hex: 0xD2691E).opacity(0.10), 20)
    )

    /// Ghost-level glow for empty state / skeleton cards.
    static let glowTealGhost = DarkRoastGlow(
        hotspot: (Color(hex: 0x4CC4B4).opacity(0.08), 4),
        midband: (Color(hex: 0x4CC4B4).opacity(0.03), 12),
        wash:    (.clear, 0)
    )
}


// MARK: - § 5 · Typography

// ARCHITECTURE: Four-tier type system matching CSS.
// SwiftUI uses Font.custom() for custom typefaces; fall back to
// system fonts with .design() for apps that don't bundle them.
//
// NOTE: Playfair Display, Instrument Sans, DM Sans, and Fira Code
// must be added to the Xcode project (Info.plist UIAppFonts) for
// custom fonts to render. The fallback stack is built into the
// helper methods below.

extension DarkRoast {

    // ── Font Names (raw PostScript names) ───────────────────

    enum FontFamily {
        /// Hero elements, brand identity. Weights: 700, 900.
        static let display = "PlayfairDisplay"
        /// Card headers, patient names, track titles. Weights: 400–700.
        static let heading = "InstrumentSans"
        /// Clinical descriptions, UI labels. Weights: 400, 500, 700.
        static let body    = "DMSans"
        /// Lab values, vitals, timestamps, ISRC codes. Weights: 400–600.
        static let mono    = "FiraCode"
    }

    // ── Type Scale (matches --dr-text-*) ────────────────────

    enum TextSize {
        /// 11pt — metadata labels, timestamps.
        static let xs:   CGFloat = 11
        /// 13pt — captions, secondary info.
        static let sm:   CGFloat = 13
        /// 15pt — body text.
        static let base: CGFloat = 15
        /// 18pt — subheadings.
        static let lg:   CGFloat = 18
        /// 24pt — section headers.
        static let xl:   CGFloat = 24
        /// 32pt — page titles.
        static let xxl:  CGFloat = 32
        /// 72pt — hero display.
        static let huge: CGFloat = 72
    }

    // ── Letter Spacing (matches --dr-tracking-*) ────────────

    enum Tracking {
        static let tight:   CGFloat = -0.2   // ≈ -0.01em at 15pt
        static let normal:  CGFloat = 0
        static let wide:    CGFloat = 0.75   // ≈ 0.05em at 15pt
        static let wider:   CGFloat = 1.5    // ≈ 0.10em at 15pt
        static let widest:  CGFloat = 3.0    // ≈ 0.20em at 15pt
        static let display: CGFloat = 2.25   // ≈ 0.15em at 15pt
    }

    // ── Font Helpers ────────────────────────────────────────
    // WHY helpers: .custom() silently falls back to system font
    // if the typeface isn't bundled. These helpers let you swap
    // to .system() fallbacks explicitly when fonts aren't available.

    /// Display font at given size (Playfair Display or serif fallback).
    static func displayFont(size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .custom(FontFamily.display, size: size).weight(weight)
    }

    /// Heading font at given size (Instrument Sans or system fallback).
    static func headingFont(size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        .custom(FontFamily.heading, size: size).weight(weight)
    }

    /// Body font at given size (DM Sans or system fallback).
    static func bodyFont(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom(FontFamily.body, size: size).weight(weight)
    }

    /// Mono font at given size (Fira Code or monospaced fallback).
    static func monoFont(size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .custom(FontFamily.mono, size: size).weight(weight)
    }
}


// MARK: - § 6 · Spacing & Geometry

extension DarkRoast {

    // ── Spacing Scale (matches --dr-space-*) ────────────────

    enum Space {
        static let xs:   CGFloat = 4
        static let sm:   CGFloat = 8
        static let md:   CGFloat = 12
        static let lg:   CGFloat = 16
        static let xl:   CGFloat = 24
        static let xxl:  CGFloat = 32
        static let xxxl: CGFloat = 48
    }

    // ── Border Radii (matches --dr-radius-*) ────────────────

    enum Radius {
        static let none: CGFloat = 0
        static let sm:   CGFloat = 4
        static let md:   CGFloat = 8
        static let lg:   CGFloat = 12
        static let xl:   CGFloat = 16
        static let xxl:  CGFloat = 24
    }

    // ── Geo-Stripe ──────────────────────────────────────────

    enum GeoStripe {
        static let height:  CGFloat = 2
        static let opacity: Double  = 0.5
    }
}


// MARK: - § 7 · Animation Timing

extension DarkRoast {

    enum Duration {
        /// 0.15s — micro-interactions, toggle states.
        static let fast:       Double = 0.15
        /// 0.3s — standard transitions.
        static let normal:     Double = 0.30
        /// 0.5s — dramatic emphasis, panel slides.
        static let theatrical: Double = 0.50
        /// 0.6s — content entrance animations.
        static let entrance:   Double = 0.60
    }

    enum Easing {
        /// Standard ease — `cubic-bezier(0.4, 0, 0.2, 1)`.
        static let standard = Animation.timingCurve(0.4, 0, 0.2, 1)
        /// Dramatic ease — `cubic-bezier(0.22, 1, 0.36, 1)`.
        static let dramatic = Animation.timingCurve(0.22, 1, 0.36, 1)
        /// Bounce ease — `cubic-bezier(0.34, 1.56, 0.64, 1)`.
        static let bounce   = Animation.timingCurve(0.34, 1.56, 0.64, 1)
    }
}


// MARK: - § 8 · Clinical Severity

// WHY: Maps clinical severity states to the action color palette.
// Used for patient cards, problem badges, avatar rings, and charts.
// Matches CSS --dr-severity-* tokens exactly.

enum ClinicalSeverity: String, CaseIterable, Identifiable {
    case critical   // Immediate attention required
    case worsening  // Deteriorating trend
    case improving  // Positive trajectory
    case stable     // No significant change
    case resolved   // Problem resolved

    var id: String { rawValue }

    /// Primary severity color.
    var color: Color {
        switch self {
        case .critical:  return DarkRoast.scarlet
        case .worsening: return DarkRoast.amberHot
        case .improving: return DarkRoast.amber
        case .stable:    return DarkRoast.gold
        case .resolved:  return DarkRoast.teal
        }
    }

    /// Subtle background fill for severity badges (10% opacity).
    var background: Color {
        switch self {
        case .critical:  return DarkRoast.scarletSubtle
        case .worsening: return DarkRoast.amberHotSubtle
        case .improving: return DarkRoast.amberSubtle
        case .stable:    return DarkRoast.goldSubtle
        case .resolved:  return DarkRoast.tealSubtle
        }
    }

    /// Glow effect for emphasis states.
    var glow: DarkRoastGlow {
        switch self {
        case .critical:  return DarkRoast.glowScarlet
        case .worsening: return DarkRoast.glowAmberHot
        case .improving: return DarkRoast.glowAmber
        case .stable:    return DarkRoast.glowGold
        case .resolved:  return DarkRoast.glowTeal
        }
    }
}


// MARK: - § 9 · Clinical Workflow Status

// Matches CSS --dr-status-* tokens.

enum ClinicalStatus: String, CaseIterable {
    case idle
    case generating
    case ready
    case editing
    case error

    var color: Color {
        switch self {
        case .idle:       return DarkRoast.mocha
        case .generating: return DarkRoast.teal
        case .ready:      return DarkRoast.gold
        case .editing:    return DarkRoast.amber
        case .error:      return DarkRoast.scarlet
        }
    }
}


// MARK: - § 10 · CExE Component Tokens (Clinical Expression Engine)

// WHY: Semantic aliases for the CExE UI, mirroring CSS --dr-cexe-*
// custom properties. Using aliases (not raw colors) so CExE views
// read as domain language: `DarkRoast.CExE.runningTotal` not
// `DarkRoast.gold`. Changes to the underlying palette propagate
// automatically without touching CExE call sites.

extension DarkRoast {

    enum CExE {
        // ── Evaluation Badges ─────────────────────────────────
        /// Badge surface behind severity/eval indicators.
        static let evalBadgeBg       = DarkRoast.espresso
        /// Badge border — geological primary (crater deep).
        static let evalBadgeBorder   = DarkRoast.craterDeep
        /// Answer text — full contrast for readability.
        static let answerText        = DarkRoast.crema
        /// Highlighted answer fragment — primary accent.
        static let answerHighlight   = DarkRoast.amber

        // ── Scope & What-If ───────────────────────────────────
        /// Scope boundary indicator — tertiary metadata color.
        static let scopeIndicator    = DarkRoast.asparagus
        /// What-if highlight fill (10% amber).
        static let whatIfHighlight   = DarkRoast.amberSubtle
        /// What-if container border (40% amber).
        static let whatIfBorder      = DarkRoast.amberDim

        // ── Provenance ────────────────────────────────────────
        /// Provenance hover lift — interactive card state.
        static let provenanceHover   = DarkRoast.espressoHover
        /// Provenance container border — earth taupe (crater, top of surface scale).
        static let provenanceBorder  = DarkRoast.crater

        // ── Running Totals ────────────────────────────────────
        /// Running total text — gold for stable/computed values.
        static let runningTotal      = DarkRoast.gold
        /// Running total background (5% gold).
        static let runningTotalBg    = DarkRoast.goldGhost

        // ── ABx Badges ────────────────────────────────────────
        /// Antibiotic badge text — caution tier.
        static let abxBadge          = DarkRoast.amberHot
        /// Antibiotic badge background (10% amber-hot).
        static let abxBadgeBg        = DarkRoast.amberHotSubtle

        // ── Expression Detection ──────────────────────────────
        /// Detected expression highlight (10% teal).
        static let exprDetect        = DarkRoast.tealSubtle
        /// Detected expression border (40% teal).
        static let exprDetectBorder  = DarkRoast.tealDim
    }
}


// MARK: - § 11 · Theme Protocol & Environment

// ARCHITECTURE: Semantic theme contract. Any future theme (light
// mode, high contrast, etc.) conforms to ThemeProvider. The enum
// approach keeps it compile-time safe with exhaustive switches.

/// Semantic theme contract — every property maps to a design role,
/// not a raw hex value.
protocol ThemeProvider {

    // ── Backgrounds ─────────────────────────────────────────
    var primaryBackground: Color { get }
    var secondaryBackground: Color { get }
    var cardBackground: Color { get }
    var cardBackgroundHover: Color { get }
    var inputBackground: Color { get }

    // ── Typography Colors ───────────────────────────────────
    var primaryText: Color { get }
    var secondaryText: Color { get }
    var tertiaryText: Color { get }
    var reducedContrastText: Color { get }

    // ── Action & State ──────────────────────────────────────
    var accent: Color { get }
    var accentHot: Color { get }
    var success: Color { get }
    var warning: Color { get }
    var error: Color { get }
    var liveData: Color { get }

    // ── Structural ──────────────────────────────────────────
    var divider: Color { get }
    var errorBackground: Color { get }

    // ── Geological Accent ───────────────────────────────────
    var geologicalBase: Color { get }
    var geologicalLight: Color { get }

    // ── Severity ────────────────────────────────────────────
    func severityColor(_ severity: ClinicalSeverity) -> Color
    func severityBackground(_ severity: ClinicalSeverity) -> Color
}

/// The one-and-only theme for now. Exhaustive switch ensures future
/// themes can't miss a property.
enum AppTheme: ThemeProvider {
    case enhancedDarkRoast

    // ── Backgrounds ─────────────────────────────────────────

    var primaryBackground: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.void_ }
    }
    var secondaryBackground: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.obsidian }
    }
    var cardBackground: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.espresso }
    }
    var cardBackgroundHover: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.espressoHover }
    }
    var inputBackground: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.inputBg }
    }

    // ── Typography Colors ───────────────────────────────────

    var primaryText: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.crema }
    }
    var secondaryText: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.mocha }
    }
    var tertiaryText: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.asparagus }
    }
    var reducedContrastText: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.bone }
    }

    // ── Action & State ──────────────────────────────────────

    var accent: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.amber }
    }
    var accentHot: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.amberHot }
    }
    var success: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.teal }
    }
    var warning: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.brass }
    }
    var error: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.burntSienna }
    }
    var liveData: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.teal }
    }

    // ── Structural ──────────────────────────────────────────

    var divider: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.divider }
    }
    var errorBackground: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.rose }
    }

    // ── Geological Accent ───────────────────────────────────

    var geologicalBase: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.craterDeep }
    }
    var geologicalLight: Color {
        switch self { case .enhancedDarkRoast: return DarkRoast.crater }
    }

    // ── Severity ────────────────────────────────────────────

    func severityColor(_ severity: ClinicalSeverity) -> Color {
        severity.color
    }
    func severityBackground(_ severity: ClinicalSeverity) -> Color {
        severity.background
    }
}


// MARK: - § 12 · Environment Key

/// Inject theme into the SwiftUI environment for any view to consume.
///
///     .environment(\.darkRoastTheme, .enhancedDarkRoast)
///
struct DarkRoastThemeKey: EnvironmentKey {
    static let defaultValue: AppTheme = .enhancedDarkRoast
}

extension EnvironmentValues {
    var darkRoastTheme: AppTheme {
        get { self[DarkRoastThemeKey.self] }
        set { self[DarkRoastThemeKey.self] = newValue }
    }
}


// MARK: - § 13 · View Modifiers

// ── Phosphor Glow ───────────────────────────────────────────

/// Applies a three-layer phosphor glow (hotspot → midband → wash).
struct PhosphorGlowModifier: ViewModifier {
    let glow: DarkRoastGlow

    func body(content: Content) -> some View {
        content
            .shadow(color: glow.hotspot.color, radius: glow.hotspot.radius)
            .shadow(color: glow.midband.color, radius: glow.midband.radius)
            .shadow(color: glow.wash.color, radius: glow.wash.radius)
    }
}

extension View {
    /// Apply a Dark Roast phosphor glow (three-layer shadow).
    func phosphorGlow(_ glow: DarkRoastGlow) -> some View {
        modifier(PhosphorGlowModifier(glow: glow))
    }
}


// ── Dark Roast Card ─────────────────────────────────────────

/// Card with geological sediment stripe and optional amber glow.
struct DarkRoastCard: ViewModifier {
    @Environment(\.darkRoastTheme) private var theme
    var elevated: Bool = false

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: DarkRoast.Radius.lg)
                    .fill(theme.cardBackground)
                    .overlay(
                        // Crater Brown geological sediment stripe at bottom
                        VStack {
                            Spacer()
                            LinearGradient(
                                colors: [theme.geologicalBase, theme.geologicalLight, .clear],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                            .frame(height: DarkRoast.GeoStripe.height)
                            .opacity(DarkRoast.GeoStripe.opacity)
                        }
                        .clipShape(RoundedRectangle(cornerRadius: DarkRoast.Radius.lg))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: DarkRoast.Radius.lg)
                            .stroke(theme.divider, lineWidth: 1)
                    )
            )
            .if(elevated) { view in
                view.phosphorGlow(DarkRoast.glowAmber)
            }
    }
}


// ── Dark Roast Background ───────────────────────────────────

/// Full-screen gradient background with geological radial bleeds.
struct DarkRoastBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                ZStack {
                    // Base gradient: void → obsidian
                    LinearGradient(
                        colors: [DarkRoast.void_, DarkRoast.obsidian],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    // Crater Brown radial bleed (top-left corner)
                    RadialGradient(
                        colors: [DarkRoast.craterDeep.opacity(0.3), .clear],
                        center: .topLeading,
                        startRadius: 0,
                        endRadius: 400
                    )
                    // Rustic Red atmospheric bleed (bottom-right corner)
                    RadialGradient(
                        colors: [DarkRoast.rustic.opacity(0.08), .clear],
                        center: .bottomTrailing,
                        startRadius: 0,
                        endRadius: 300
                    )
                }
                .ignoresSafeArea()
            )
    }
}


// ── Glass Panel ─────────────────────────────────────────────

/// Glass morphism panel — standard Dark Roast card surface with
/// deep drop shadow and crater-deep border.
struct DarkRoastGlassPanel: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(
                LinearGradient(
                    colors: [DarkRoast.espresso, DarkRoast.craterDeep.opacity(0.2)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
            .clipShape(RoundedRectangle(cornerRadius: DarkRoast.Radius.lg))
            .overlay(
                RoundedRectangle(cornerRadius: DarkRoast.Radius.lg)
                    .stroke(DarkRoast.craterDeep, lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.5), radius: 20, y: 10)
    }
}


// ── Severity Badge ──────────────────────────────────────────

/// Inline pill/chip styled for a clinical severity level.
struct SeverityBadgeModifier: ViewModifier {
    let severity: ClinicalSeverity

    func body(content: Content) -> some View {
        content
            .font(DarkRoast.monoFont(size: DarkRoast.TextSize.xs, weight: .medium))
            .tracking(DarkRoast.Tracking.wider)
            .textCase(.uppercase)
            .foregroundColor(severity.color)
            .padding(.horizontal, DarkRoast.Space.sm)
            .padding(.vertical, DarkRoast.Space.xs)
            .background(
                Capsule()
                    .fill(severity.background)
            )
            .overlay(
                Capsule()
                    .stroke(severity.color.opacity(0.3), lineWidth: 1)
            )
    }
}


// ── Section Label ───────────────────────────────────────────

/// Uppercase metadata label styled with mono font and asparagus color.
/// Matches CSS `.section-label` pattern.
struct SectionLabelModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(DarkRoast.monoFont(size: 10, weight: .medium))
            .tracking(2.5)
            .textCase(.uppercase)
            .foregroundColor(DarkRoast.asparagus)
    }
}


// ── Animations (match CSS @keyframes) ───────────────────────

// WHY: SwiftUI has no CSS @keyframes equivalent. These modifiers
// use @State-driven animations triggered on appear. Each respects
// accessibilityReduceMotion (matching CSS prefers-reduced-motion).
// TRADEOFF: Each modifier owns its animation state independently.
// Composing multiple animated modifiers works but adds draw calls.

/// Pulsing teal ring — matches CSS `.dr-pulse-teal` (2.5s infinite).
/// Ring expands outward from the view and fades, then repeats.
struct PulseTealModifier: ViewModifier {
    @State private var isPulsing = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content
            .overlay(
                Circle()
                    .stroke(DarkRoast.teal, lineWidth: 2)
                    .scaleEffect(isPulsing ? 2.0 : 1.0)
                    .opacity(isPulsing ? 0 : 0.6)
                    .animation(
                        reduceMotion ? nil :
                            .easeOut(duration: 2.5)
                            .repeatForever(autoreverses: false),
                        value: isPulsing
                    )
            )
            .onAppear { isPulsing = true }
    }
}

/// Fade-up entrance — matches CSS `.dr-fade-up` (0.7s ease-out).
/// Content fades in while translating 24pt upward.
struct FadeUpModifier: ViewModifier {
    @State private var appeared = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 24)
            .animation(
                reduceMotion ? nil : .easeOut(duration: 0.7),
                value: appeared
            )
            .onAppear { appeared = true }
    }
}

/// Slide-in entrance — matches CSS `.dr-slide-in` (0.5s ease-out).
/// Content fades in while translating 20pt from the leading edge.
struct SlideInModifier: ViewModifier {
    @State private var appeared = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content
            .opacity(appeared ? 1 : 0)
            .offset(x: appeared ? 0 : -20)
            .animation(
                reduceMotion ? nil :
                    .easeOut(duration: DarkRoast.Duration.theatrical),
                value: appeared
            )
            .onAppear { appeared = true }
    }
}

/// Amber breathing glow — matches CSS `.dr-glow-breathe` (3s infinite).
/// Shadow radius oscillates between 8pt and 20pt at 30% amber.
struct GlowBreatheModifier: ViewModifier {
    @State private var isExpanded = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func body(content: Content) -> some View {
        content
            .shadow(
                color: Color(hex: 0xE69A4C, alpha: 0.3),
                radius: isExpanded ? 20 : 8
            )
            .animation(
                reduceMotion ? nil :
                    .easeInOut(duration: 3.0).repeatForever(),
                value: isExpanded
            )
            .onAppear { isExpanded = true }
    }
}


// ── Convenience Extensions ──────────────────────────────────

extension View {
    /// Apply Dark Roast card styling with geological stripe and optional glow.
    func darkRoastCard(elevated: Bool = false) -> some View {
        modifier(DarkRoastCard(elevated: elevated))
    }

    /// Apply full Enhanced Dark Roast background with geological bleeds.
    func darkRoastBackground() -> some View {
        modifier(DarkRoastBackground())
    }

    /// Apply glass morphism panel styling.
    func darkRoastGlassPanel() -> some View {
        modifier(DarkRoastGlassPanel())
    }

    /// Style as a clinical severity badge.
    func severityBadge(_ severity: ClinicalSeverity) -> some View {
        modifier(SeverityBadgeModifier(severity: severity))
    }

    /// Style as an uppercase section label.
    func sectionLabel() -> some View {
        modifier(SectionLabelModifier())
    }

    /// Pulsing teal ring for live data indicators.
    func pulseTeal() -> some View {
        modifier(PulseTealModifier())
    }

    /// Fade-up entrance animation (0.7s, 24pt travel).
    func fadeUp() -> some View {
        modifier(FadeUpModifier())
    }

    /// Slide-in entrance animation (0.5s, 20pt travel).
    func slideIn() -> some View {
        modifier(SlideInModifier())
    }

    /// Amber breathing glow (3s infinite cycle).
    func glowBreathe() -> some View {
        modifier(GlowBreatheModifier())
    }
}


// MARK: - § 14 · Conditional View Modifier

// WHY: SwiftUI doesn't have a built-in conditional modifier.
// This lets us write `.if(condition) { $0.someModifier() }`.

extension View {
    @ViewBuilder
    func `if`<Transform: View>(
        _ condition: Bool,
        transform: (Self) -> Transform
    ) -> some View {
        if condition {
            transform(self)
        } else {
            self
        }
    }
}


// MARK: - § 15 · JSON Export

extension AppTheme {
    /// Export current theme as JSON-compatible dictionary.
    var jsonDictionary: [String: Any] {
        [
            "themeName": "Dark Roast: Black Label",
            "version": "4.0.0",
            "colors": [
                "void": "#120C06",
                "obsidian": "#160E08",
                "darkCacao": "#1E140E",
                "espresso": "#2A1C13",
                "espressoHover": "#382818",
                "roastedBean": "#3C2A1E",
                "crater": "#4D3B31",
                "crema": "#FFF7EE",
                "warmWhite": "#F0E6D0",
                "bone": "#EBE1D7",
                "mocha": "#8B7355",
                "craterDeep": "#3C2A21",
                "asparagus": "#465945",
                "rustic": "#480404",
                "rose": "#480607",
                "amber": "#E69A4C",
                "amberHot": "#D2691E",
                "amberMuted": "#C07A4A",
                "gold": "#DAA520",
                "brass": "#BFA162",
                "scarlet": "#C44C4C",
                "burntSienna": "#C75B39",
                "teal": "#4CC4B4"
            ],
            "severity": [
                "critical": "#C44C4C",
                "worsening": "#D2691E",
                "improving": "#E69A4C",
                "stable": "#DAA520",
                "resolved": "#4CC4B4"
            ],
            "typography": [
                "displayFont": "Playfair Display",
                "headingFont": "Instrument Sans",
                "bodyFont": "DM Sans",
                "monoFont": "Fira Code"
            ],
            "oledScience": [
                "pureBlackDelay_ms": 18.5,
                "voidDelay_ms": 1.6,
                "obsidianDelay_ms": 1.8,
                "rationale": "Both void and obsidian keep OLED pixels energized above power-off threshold"
            ]
        ]
    }

    /// Serialize to JSON Data.
    var jsonData: Data? {
        try? JSONSerialization.data(withJSONObject: jsonDictionary, options: .prettyPrinted)
    }
}


// MARK: - § 16 · Song Expanse Integration Guide
//
// Song Expanse uses a dynamic `TextColors` struct derived from album art.
// The theme system intentionally does NOT override TextColors.
//
// Mapping strategy:
//   - TextColors.textColor1-9  → Content areas (lyrics, annotations, timeline)
//   - DarkRoast / AppTheme     → Chrome (nav bars, tab bars, settings, modals)
//
// Example integration in a view that uses both:
//
//   struct SongDetailView: View {
//       @Environment(\.darkRoastTheme) private var theme
//       let textColors: TextColors  // Song-derived dynamic colors
//
//       var body: some View {
//           VStack {
//               // Chrome: uses theme
//               HStack {
//                   Text("Now Playing")
//                       .foregroundColor(theme.primaryText)
//                   Spacer()
//                   Image(systemName: "ellipsis")
//                       .foregroundColor(theme.secondaryText)
//               }
//               .padding()
//               .background(theme.cardBackground)
//
//               // Content: uses TextColors
//               LyricView(colors: textColors)
//
//               // Timeline rail: theme for chrome, TextColors for fill
//               InteractiveTimelineRail(
//                   fillColor: textColors.textColor1,
//                   trackColor: theme.geologicalBase,
//                   thumbColor: theme.accent
//               )
//           }
//           .darkRoastBackground()
//       }
//   }
//
// Vinyl Renderer (Metal GPU) token mapping:
//   case background   → DarkRoast.void_
//   platter shadow    → DarkRoast.craterDeep
//   tonearm metallic  → DarkRoast.mocha
//   tonearm tip glow  → DarkRoast.amber
//   controls bg       → DarkRoast.espresso
//   play button       → DarkRoast.amber
//   loading indicator → DarkRoast.teal (Kinetic Teal)
//
// MarqueeOverlayView integration:
//   soft phase bg     → DarkRoast.void_ (with blur)
//   full phase scrim  → DarkRoast.craterDeep
//   title text        → DarkRoast.crema
//   artist text       → DarkRoast.mocha
//   loading indicator → DarkRoast.teal (pulsing)
//   grid lines        → DarkRoast.amber.opacity(0.3)
//   sun gradient      → [DarkRoast.amber, .gold, .amberHot]


// MARK: - § 17 · Preview

#if DEBUG
struct DarkRoastPreview: View {
    @Environment(\.darkRoastTheme) private var theme

    var body: some View {
        ScrollView {
            VStack(spacing: DarkRoast.Space.xl) {

                // ── Section Label ────────────────────────
                Text("Design System v4.0")
                    .sectionLabel()
                    .frame(maxWidth: .infinity, alignment: .leading)

                // ── Color Swatches ──────────────────────
                Text("Core Palette")
                    .font(DarkRoast.headingFont(size: DarkRoast.TextSize.lg))
                    .foregroundColor(theme.primaryText)
                    .frame(maxWidth: .infinity, alignment: .leading)

                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: DarkRoast.Space.sm) {
                    colorSwatch("void", DarkRoast.void_)
                    colorSwatch("obsidian", DarkRoast.obsidian)
                    colorSwatch("espresso", DarkRoast.espresso)
                    colorSwatch("crater", DarkRoast.crater)
                    colorSwatch("crema", DarkRoast.crema)
                    colorSwatch("mocha", DarkRoast.mocha)
                    colorSwatch("amber", DarkRoast.amber)
                    colorSwatch("teal", DarkRoast.teal)
                    colorSwatch("gold", DarkRoast.gold)
                    colorSwatch("scarlet", DarkRoast.scarlet)
                    colorSwatch("amberHot", DarkRoast.amberHot)
                    colorSwatch("bone", DarkRoast.bone)
                }

                // ── Severity Badges ─────────────────────
                Text("Clinical Severity")
                    .sectionLabel()
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: DarkRoast.Space.sm) {
                    ForEach(ClinicalSeverity.allCases) { severity in
                        Text(severity.rawValue)
                            .severityBadge(severity)
                    }
                }

                // ── Card Examples ────────────────────────
                Text("Cards")
                    .sectionLabel()
                    .frame(maxWidth: .infinity, alignment: .leading)

                VStack(spacing: DarkRoast.Space.md) {
                    Text("Standard Card")
                        .foregroundColor(theme.primaryText)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .darkRoastCard()

                    Text("Elevated Card")
                        .foregroundColor(theme.primaryText)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .darkRoastCard(elevated: true)

                    Text("Glass Panel")
                        .foregroundColor(theme.primaryText)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .darkRoastGlassPanel()
                }

                // ── Typography ───────────────────────────
                Text("Typography")
                    .sectionLabel()
                    .frame(maxWidth: .infinity, alignment: .leading)

                VStack(alignment: .leading, spacing: DarkRoast.Space.sm) {
                    Text("Display — Playfair Display")
                        .font(DarkRoast.displayFont(size: DarkRoast.TextSize.xxl))
                        .foregroundColor(theme.primaryText)
                    Text("Heading — Instrument Sans")
                        .font(DarkRoast.headingFont(size: DarkRoast.TextSize.xl))
                        .foregroundColor(theme.primaryText)
                    Text("Body — DM Sans")
                        .font(DarkRoast.bodyFont(size: DarkRoast.TextSize.base))
                        .foregroundColor(theme.secondaryText)
                    Text("Mono — Fira Code: Na+ 138 K+ 4.2")
                        .font(DarkRoast.monoFont(size: DarkRoast.TextSize.sm))
                        .foregroundColor(theme.liveData)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                // ── Glow Showcase ────────────────────────
                Text("Phosphor Glows")
                    .sectionLabel()
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: DarkRoast.Space.lg) {
                    glowCircle("Amber", DarkRoast.amber, DarkRoast.glowAmberIntense)
                    glowCircle("Teal", DarkRoast.teal, DarkRoast.glowTealIntense)
                    glowCircle("Scarlet", DarkRoast.scarlet, DarkRoast.glowScarletIntense)
                    glowCircle("Gold", DarkRoast.gold, DarkRoast.glowGoldIntense)
                }
            }
            .padding(DarkRoast.Space.xl)
        }
        .darkRoastBackground()
    }

    // ── Helpers ──────────────────────────────────────────────

    private func colorSwatch(_ name: String, _ color: Color) -> some View {
        VStack(spacing: DarkRoast.Space.xs) {
            RoundedRectangle(cornerRadius: DarkRoast.Radius.sm)
                .fill(color)
                .frame(height: 44)
                .overlay(
                    RoundedRectangle(cornerRadius: DarkRoast.Radius.sm)
                        .stroke(DarkRoast.crater, lineWidth: 1)
                )
            Text(name)
                .font(DarkRoast.monoFont(size: 9))
                .foregroundColor(DarkRoast.mocha)
        }
    }

    private func glowCircle(_ label: String, _ color: Color, _ glow: DarkRoastGlow) -> some View {
        VStack(spacing: DarkRoast.Space.xs) {
            Circle()
                .fill(color)
                .frame(width: 40, height: 40)
                .phosphorGlow(glow)
            Text(label)
                .font(DarkRoast.monoFont(size: 9))
                .foregroundColor(DarkRoast.mocha)
        }
    }
}

#Preview {
    DarkRoastPreview()
        .environment(\.darkRoastTheme, .enhancedDarkRoast)
}
#endif
