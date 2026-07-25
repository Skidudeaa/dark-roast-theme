// Dark Roast brew engine: recipe -> complete companion palette.
//
// A recipe declares intent (hue, chroma scale, polarity, contrast target); this
// module turns that into the 26-color + 12-role registry that
// scripts/reconcile-recipes.js writes to src/variants/.
//
// The engine SOLVES for the quality floors it declares rather than emitting a
// seed lattice and hoping. Earlier revisions published
// `minimumCoreAccentChromaAverage` and `minimumInformationalContrast` values
// that the generated palette then failed, because three effects were never
// accounted for:
//
//   1. sRGB gamut mapping silently reduces chroma, so a seed asking for 0.16
//      can land at 0.09 once clamped — below the floor the same file declared.
//   2. `chroma_scale` multiplied the seeds without re-checking that floor.
//   3. Severity separation was specified in OKLCH hue, but validate-themes
//      measures HSL hue. A 30 degree OKLCH gap can collapse to 20 degrees in
//      HSL, which is what put harvest/olive under the 25 degree minimum.
//
// Every constraint is now solved numerically and then re-asserted, so the
// engine throws instead of emitting a palette that cannot pass validation.

import { clampChroma, converter, formatHex, wcagContrast } from 'culori';

const toOklch = converter('oklch');
const toHsl = converter('hsl');

// validate-themes.js measures severity separation in HSL and requires 25
// degrees; solve to a margin above it so gamut rounding cannot drop us under.
const SEVERITY_HUE_MINIMUM = 25;
const SEVERITY_HUE_TARGET = 29;
// Contrast is solved slightly above the declared target for the same reason.
const CONTRAST_MARGIN = 0.08;
const MAX_SOLVER_PASSES = 12;

function hexAt(l, c, h) {
  const mapped = clampChroma({ mode: 'oklch', l, c, h: c === 0 ? undefined : h }, 'oklch', 'rgb');
  return formatHex(mapped).toUpperCase();
}

// Largest chroma sRGB can actually represent at this lightness and hue. Gamut
// mapping is the hot path of every solver here, so memoise it.
const gamutCache = new Map();
function gamutChroma(l, h) {
  const key = `${l.toFixed(4)}:${h.toFixed(2)}`;
  let value = gamutCache.get(key);
  if (value === undefined) {
    value = toOklch(hexAt(l, 0.4, h)).c || 0;
    gamutCache.set(key, value);
  }
  return value;
}

function circularDistance(first, second) {
  const distance = Math.abs(first - second);
  return Math.min(distance, 360 - distance);
}

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

// Place a chromatic role at the lightness that carries the most colour while
// still clearing the contrast target.
//
// The naive approach — mirroring lightness for light polarity, so an accent
// seeded at L=0.68 lands at L=0.32 — buries accents where sRGB simply has no
// chroma to give. Cold Brew, the hand-seeded light companion that does pass,
// sits its accents near L=0.43, the chroma peak for dark ink on a light canvas.
// Solving for that placement instead of assuming it is what lets a generated
// light palette reach the same density.
function placeChromatic(desiredChroma, h, surfaceHex, target, preferredL) {
  let best = null;
  for (let l = 0.12; l <= 0.95; l += 0.005) {
    const chroma = Math.min(desiredChroma, gamutChroma(l, h));
    const candidate = hexAt(l, chroma, h);
    if (wcagContrast(candidate, surfaceHex) < target) continue;
    // Maximise delivered chroma, breaking ties toward the recipe's intent so a
    // palette keeps its authored character where the gamut allows a choice.
    const score = toOklch(candidate).c - Math.abs(l - preferredL) * 0.02;
    if (!best || score > best.score) best = { seed: [l, chroma, h], score };
  }
  return best ? best.seed : null;
}

// Scale a group's requested chroma until its delivered average meets the floor.
// Placement already caps each entry at what sRGB can represent, so this only
// asks for more colour where more colour exists.
function solveChromaFloor(entries, floor, surfaceHex, target, label, recipeId) {
  const placeAll = (multiplier) =>
    entries.map((entry) => {
      const seed = placeChromatic(entry.chroma * multiplier, entry.hue, surfaceHex, target, entry.preferredL);
      if (!seed) {
        throw new Error(
          `brew-engine: ${recipeId} cannot place ${label} hue ${entry.hue} at ${target.toFixed(2)}:1 ` +
            'against the assigned surface; no lightness in sRGB satisfies it.',
        );
      }
      return seed;
    });

  const deliveredAverage = (seeds) => average(seeds.map((seed) => toOklch(hexAt(...seed)).c));
  const atOne = placeAll(1);
  if (deliveredAverage(atOne) >= floor) return atOne;

  const ceiling = placeAll(24);
  const bestAverage = deliveredAverage(ceiling);
  if (bestAverage < floor) {
    throw new Error(
      `brew-engine: ${recipeId} ${label} cannot reach an average OKLab chroma of ${floor.toFixed(3)} ` +
        `while holding ${target.toFixed(2)}:1 contrast; sRGB delivers at most ${bestAverage.toFixed(3)}. ` +
        'Lower the floor in the recipe or relax its contrast target.',
    );
  }

  let low = 1;
  let high = 24;
  for (let pass = 0; pass < 32; pass += 1) {
    const mid = (low + high) / 2;
    if (deliveredAverage(placeAll(mid)) >= floor) high = mid;
    else low = mid;
  }
  return placeAll(high);
}

// Near-neutral text tones carry no chroma requirement — only contrast.
function solveContrastLightness(seed, surfaceHex, target, isLight) {
  const [, c, h] = seed;
  let l = seed[0];
  const step = isLight ? -0.005 : 0.005;
  for (let pass = 0; pass < 220; pass += 1) {
    if (wcagContrast(hexAt(l, c, h), surfaceHex) >= target) return [l, c, h];
    l += step;
    if (l < 0.02 || l > 0.99) break;
  }
  return [Math.min(Math.max(l, 0.02), 0.99), c, h];
}

export function generatePalette(recipe) {
  const isLight = recipe.polarity === 'light';
  const baseHue = recipe.hue;
  const cScale = recipe.chroma_scale || 1.0;
  const contrastTarget = recipe.contrast_target || 4.5;
  // Dark ink on a light canvas lives in a lower-chroma region of sRGB than
  // light ink on a dark one, so the achievable floor is polarity-dependent.
  // The light defaults match Cold Brew, the shipped hand-seeded light
  // companion, which delivers 0.113 core against a declared 0.11.
  const coreFloor = recipe.minimum_core_chroma || (isLight ? 0.11 : 0.12);
  const platformFloor = recipe.minimum_platform_chroma || (isLight ? 0.09 : 0.10);

  const L = (val) => (isLight ? 1 - val : val);
  const acc = (l, c, h) => [L(l), c * cScale, h];

  const surfaces = {
    void: [L(0.10), 0.01 * cScale, baseHue],
    obsidian: [L(0.14), 0.015 * cScale, baseHue],
    darkCacao: [L(0.18), 0.02 * cScale, baseHue],
    espresso: [L(0.22), 0.025 * cScale, baseHue],
    espressoHover: [L(0.28), 0.03 * cScale, baseHue],
    roastedBean: [L(0.38), 0.04 * cScale, baseHue],
    crater: [L(0.48), 0.05 * cScale, baseHue],
    craterDeep: [L(0.44), 0.045 * cScale, baseHue],
  };

  // Severity hues are separated in HSL space, because that is where the family
  // contract measures them. magenta stays put; harvest and olive fan out.
  const severityHues = { magenta: 330, harvest: 80, olive: 110 };
  const severityLightness = { magenta: 0.65, harvest: 0.72, olive: 0.72 };
  const severityChroma = { magenta: 0.16, harvest: 0.14, olive: 0.12 };

  const informational = {
    crema: [L(0.96), 0.01 * cScale, baseHue],
    warmWhite: [L(0.92), 0.02 * cScale, baseHue],
    bone: [L(0.86), 0.025 * cScale, baseHue],
    mocha: [L(0.72), 0.06 * cScale, baseHue],
    asparagus: acc(0.75, 0.08, 130),
    amber: acc(0.68, 0.16, 70),
    amberHot: acc(0.65, 0.18, 45),
    amberMuted: acc(0.70, 0.12, 60),
    gold: acc(0.75, 0.15, 85),
    brass: acc(0.72, 0.12, 90),
    scarlet: acc(0.58, 0.18, 25),
    burntSienna: acc(0.62, 0.16, 40),
    teal: acc(0.65, 0.14, 195),
  };
  const decorative = {
    rustic: acc(0.40, 0.12, 20),
    rose: acc(0.40, 0.12, 340),
  };
  const platformSeeds = {
    // structural is an informational foreground (comments, punctuation, inlay
    // hints), not a border, so it is solved against the contrast target rather
    // than pinned to a mid lightness.
    structural: acc(0.45, 0.03, baseHue),
    sage: acc(0.68, 0.10, 140),
    slate: acc(0.65, 0.12, 240),
    mauve: acc(0.65, 0.14, 300),
    scarletBright: acc(0.60, 0.18, 25),
    sageBright: acc(0.72, 0.12, 140),
    slateBright: acc(0.70, 0.14, 240),
    mauveBright: acc(0.70, 0.16, 300),
    tealBright: acc(0.70, 0.16, 195),
    tealActive: acc(0.65, 0.18, 195),
  };
  const chrome = {
    shadow: [L(0.04), 0.03, baseHue],
    hoverSurface: [L(0.24), 0.03, baseHue],
  };

  // For light polarity the card surface (obsidian) sits darker than the canvas,
  // so validating against it is the stricter test — and it is what Cold Brew
  // assigns. Dark polarity reads against the panel surface.
  const contrastSurfaceKey = isLight ? 'obsidian' : 'espresso';
  const target = contrastTarget + CONTRAST_MARGIN;

  // Severity hue separation, measured the way the validator measures it.
  const separateSeverity = () => {
    const hexOfSeverity = (key) =>
      hexAt(L(severityLightness[key]), severityChroma[key] * cScale, severityHues[key]);
    const hslHue = (key) => toHsl(hexOfSeverity(key)).h ?? 0;
    for (let pass = 0; pass < 120; pass += 1) {
      const gap = circularDistance(hslHue('harvest'), hslHue('olive'));
      if (gap >= SEVERITY_HUE_TARGET) break;
      // Push olive further from harvest along the OKLCH hue circle.
      severityHues.olive += 1;
    }
  };
  separateSeverity();

  const severity = {
    magenta: [L(severityLightness.magenta), severityChroma.magenta * cScale, severityHues.magenta],
    harvest: [L(severityLightness.harvest), severityChroma.harvest * cScale, severityHues.harvest],
    olive: [L(severityLightness.olive), severityChroma.olive * cScale, severityHues.olive],
  };

  let colorSeeds = { ...surfaces, ...informational, ...severity, ...decorative };
  let platformResolved = { ...platformSeeds };

  const CORE_ACCENTS = [
    'amber', 'amberHot', 'amberMuted', 'gold', 'brass', 'scarlet',
    'burntSienna', 'teal', 'magenta', 'harvest', 'olive',
  ];
  const PLATFORM_ACCENTS = [
    'sage', 'slate', 'mauve', 'scarletBright', 'sageBright', 'slateBright',
    'mauveBright', 'tealBright', 'tealActive',
  ];
  const INFORMATIONAL_KEYS = [
    'crema', 'warmWhite', 'bone', 'mocha', 'asparagus', 'amber', 'amberHot',
    'amberMuted', 'gold', 'brass', 'scarlet', 'burntSienna', 'teal', 'magenta',
    'harvest', 'olive',
  ];
  const INFORMATIONAL_PLATFORM_KEYS = ['structural', 'sage', 'slate', 'mauve'];

  // Surfaces are fixed by the elevation ramp, so the assigned surface is stable
  // and every chromatic role can be placed against it in one pass.
  const surfaceHex = hexAt(...colorSeeds[contrastSurfaceKey]);
  const asEntry = (seed) => ({ chroma: seed[1], hue: seed[2], preferredL: seed[0] });

  // Severity separation must hold for the colours actually delivered, not the
  // seeds: placement moves lightness and chroma, which moves HSL hue with it.
  // Solve placement, measure the delivered gap, fan olive out, repeat.
  const severityPairs = [['magenta', 'harvest'], ['magenta', 'olive'], ['harvest', 'olive']];
  for (let attempt = 0; attempt < 90; attempt += 1) {
    colorSeeds.olive = [L(severityLightness.olive), severityChroma.olive * cScale, severityHues.olive];
    const solved = solveChromaFloor(
      CORE_ACCENTS.map((key) => asEntry(colorSeeds[key])), coreFloor, surfaceHex, target, 'core accents', recipe.id,
    );
    CORE_ACCENTS.forEach((key, index) => { colorSeeds[key] = solved[index]; });
    const delivered = Object.fromEntries(
      ['magenta', 'harvest', 'olive'].map((key) => [key, toHsl(hexAt(...colorSeeds[key])).h ?? 0]),
    );
    const worst = Math.min(...severityPairs.map(([a, b]) => circularDistance(delivered[a], delivered[b])));
    if (worst >= SEVERITY_HUE_TARGET) break;
    severityHues.olive += 1;
  }

  const platformSolved = solveChromaFloor(
    PLATFORM_ACCENTS.map((key) => asEntry(platformResolved[key])), platformFloor, surfaceHex, target,
    'platform accents', recipe.id,
  );
  PLATFORM_ACCENTS.forEach((key, index) => { platformResolved[key] = platformSolved[index]; });

  // asparagus is informational and chromatic but not a scored accent; structural
  // is an informational foreground rather than a border. Both are placed the
  // same way, just without a floor to satisfy.
  for (const key of ['asparagus']) {
    colorSeeds[key] = placeChromatic(colorSeeds[key][1], colorSeeds[key][2], surfaceHex, target, colorSeeds[key][0])
      || solveContrastLightness(colorSeeds[key], surfaceHex, target, isLight);
  }
  platformResolved.structural =
    placeChromatic(platformResolved.structural[1], platformResolved.structural[2], surfaceHex, target, platformResolved.structural[0])
    || solveContrastLightness(platformResolved.structural, surfaceHex, target, isLight);

  for (const key of ['crema', 'warmWhite', 'bone', 'mocha']) {
    colorSeeds[key] = solveContrastLightness(colorSeeds[key], surfaceHex, target, isLight);
  }

  const colors = {};
  for (const [name, seed] of Object.entries(colorSeeds)) colors[name] = hexAt(...seed);
  const platform = {};
  for (const [name, seed] of Object.entries({ ...platformResolved, ...chrome })) platform[name] = hexAt(...seed);

  // Re-assert every published guarantee. The engine must never emit a registry
  // that its own quality block would fail.
  const assignedSurface = colors[contrastSurfaceKey];
  for (const key of INFORMATIONAL_KEYS) {
    const ratio = wcagContrast(colors[key], assignedSurface);
    if (ratio < contrastTarget) {
      throw new Error(`brew-engine: ${recipe.id} colors.${key} is ${ratio.toFixed(2)}:1 against ${contrastSurfaceKey}, below ${contrastTarget}`);
    }
  }
  for (const key of INFORMATIONAL_PLATFORM_KEYS) {
    const ratio = wcagContrast(platform[key], assignedSurface);
    if (ratio < contrastTarget) {
      throw new Error(`brew-engine: ${recipe.id} platform.${key} is ${ratio.toFixed(2)}:1 against ${contrastSurfaceKey}, below ${contrastTarget}`);
    }
  }
  const coreAverage = average(CORE_ACCENTS.map((key) => toOklch(colors[key]).c));
  if (coreAverage < coreFloor) {
    throw new Error(`brew-engine: ${recipe.id} core accent chroma ${coreAverage.toFixed(3)} is below ${coreFloor}`);
  }
  const platformAverage = average(PLATFORM_ACCENTS.map((key) => toOklch(platform[key]).c));
  if (platformAverage < platformFloor) {
    throw new Error(`brew-engine: ${recipe.id} platform accent chroma ${platformAverage.toFixed(3)} is below ${platformFloor}`);
  }
  for (const [first, second] of [['magenta', 'harvest'], ['magenta', 'olive'], ['harvest', 'olive']]) {
    const gap = circularDistance(toHsl(colors[first]).h ?? 0, toHsl(colors[second]).h ?? 0);
    if (gap < SEVERITY_HUE_MINIMUM) {
      throw new Error(`brew-engine: ${recipe.id} severity hue gap ${first}/${second} is ${gap.toFixed(1)} degrees, below ${SEVERITY_HUE_MINIMUM}`);
    }
  }
  // Actions are read against the canvas, not the assigned surface.
  for (const key of ['amber', 'teal', 'scarlet']) {
    const ratio = wcagContrast(colors.void, colors[key]);
    if (ratio < 4.5) {
      throw new Error(`brew-engine: ${recipe.id} colors.void on colors.${key} is ${ratio.toFixed(2)}:1, below 4.50`);
    }
  }
  // Elevation ramps must stay strictly monotonic in the polarity's direction.
  const ramp = ['void', 'obsidian', 'darkCacao', 'espresso', 'espressoHover', 'roastedBean', 'crater'];
  for (let index = 1; index < ramp.length; index += 1) {
    const previous = toOklch(colors[ramp[index - 1]]).l;
    const current = toOklch(colors[ramp[index]]).l;
    const ok = isLight ? current < previous : current > previous;
    if (!ok) throw new Error(`brew-engine: ${recipe.id} surface ramp is not monotonic at ${ramp[index]}`);
  }

  return {
    ...recipe,
    colors,
    platform,
    quality: {
      contrastSurface: contrastSurfaceKey,
      minimumInformationalContrast: contrastTarget,
      minimumCoreAccentChromaAverage: coreFloor,
      minimumPlatformAccentChromaAverage: platformFloor,
    },
  };
}
