#!/usr/bin/env node
// Validate every Dark Roast companion theme against the canonical token source.
// Zero dependencies: this intentionally uses only Node's standard library.

import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN_FILE = join(ROOT, 'src', 'tokens.json');
const VARIANT_DIR = join(ROOT, 'src', 'variants');

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SURFACE_SCALE = [
  'void',
  'obsidian',
  'darkCacao',
  'espresso',
  'espressoHover',
  'roastedBean',
  'crater',
];
const BORDER_SCALE = ['roastedBean', 'craterDeep', 'crater'];
const INFORMATIONAL_COLORS = [
  'crema',
  'warmWhite',
  'bone',
  'mocha',
  'asparagus',
  'amber',
  'amberHot',
  'amberMuted',
  'gold',
  'brass',
  'scarlet',
  'burntSienna',
  'teal',
  'magenta',
  'harvest',
  'olive',
];
const INFORMATIONAL_PLATFORM_COLORS = ['structural', 'sage', 'slate', 'mauve'];
const CORE_ACCENT_COLORS = [
  'amber',
  'amberHot',
  'amberMuted',
  'gold',
  'brass',
  'scarlet',
  'burntSienna',
  'teal',
  'magenta',
  'harvest',
  'olive',
];
const PLATFORM_ACCENT_COLORS = [
  'sage',
  'slate',
  'mauve',
  'scarletBright',
  'sageBright',
  'slateBright',
  'mauveBright',
  'tealBright',
  'tealActive',
];
const SEVERITY_COLORS = ['magenta', 'harvest', 'olive'];
const ACTION_COLORS = ['amber', 'teal', 'scarlet'];
const MINIMUM_SEVERITY_HUE_GAP = 25;
const MINIMUM_ACTION_CONTRAST = 4.5;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`${label}: ${error.message}`);
  }
}

function rgb(hex) {
  if (!HEX_COLOR.test(hex)) return null;
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function relativeLuminance(hex) {
  const channels = rgb(hex);
  if (!channels) return null;
  const linear = channels.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  if (firstLuminance === null || secondLuminance === null) return null;
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

// OKLab chroma tracks perceived color density far better than HSL saturation:
// a milk-washed pink can report 100% HSL saturation while remaining nearly
// white. Companion palettes declare an average chroma floor to prevent that
// regression without forcing intentionally metallic roles to share one floor.
function oklabChroma(hex) {
  const channels = rgb(hex);
  if (!channels) return null;
  const [red, green, blue] = channels.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const lightness = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const medium = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const short = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const axisA = 1.9779984951 * lightness - 2.428592205 * medium + 0.4505937099 * short;
  const axisB = 0.0259040371 * lightness + 0.7827717662 * medium - 0.808675766 * short;
  return Math.hypot(axisA, axisB);
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function hue(hex) {
  const channels = rgb(hex);
  if (!channels) return null;
  const [red, green, blue] = channels.map((channel) => channel / 255);
  const maximum = Math.max(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const delta = maximum - minimum;
  if (delta === 0) return null;

  let value;
  if (maximum === red) value = ((green - blue) / delta) % 6;
  else if (maximum === green) value = (blue - red) / delta + 2;
  else value = (red - green) / delta + 4;
  return (value * 60 + 360) % 360;
}

function circularHueDistance(first, second) {
  const distance = Math.abs(first - second);
  return Math.min(distance, 360 - distance);
}

function main() {
  const tokenBytes = readFileSync(TOKEN_FILE);
  let tokens;
  try {
    tokens = JSON.parse(tokenBytes.toString('utf8'));
  } catch (error) {
    throw new Error(`src/tokens.json: ${error.message}`);
  }
  if (!isObject(tokens) || typeof tokens.version !== 'string' || !isObject(tokens.colors)) {
    throw new Error('src/tokens.json must define a string version and a colors object');
  }

  const canonicalColorKeys = Object.keys(tokens.colors).filter((key) => !key.startsWith('_'));
  if (canonicalColorKeys.length === 0) {
    throw new Error('src/tokens.json does not define any canonical colors');
  }
  for (const key of canonicalColorKeys) {
    if (!HEX_COLOR.test(tokens.colors[key])) {
      throw new Error(`src/tokens.json colors.${key} must be a #RRGGBB color`);
    }
  }

  const fingerprint = `sha256:${createHash('sha256').update(tokenBytes).digest('hex')}`;
  const variantFiles = readdirSync(VARIANT_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort((first, second) => first.localeCompare(second));
  if (variantFiles.length === 0) throw new Error('src/variants contains no JSON theme variants');

  const errors = [];
  const variants = [];
  const metrics = [];
  const fail = (file, message) => errors.push(`${file}: ${message}`);

  for (const file of variantFiles) {
    let variant;
    try {
      variant = parseJson(join(VARIANT_DIR, file), file);
    } catch (error) {
      errors.push(error.message);
      continue;
    }
    if (!isObject(variant)) {
      fail(file, 'top-level JSON value must be an object');
      continue;
    }
    variants.push({ file, variant });

    if (variant.baseVersion !== tokens.version) {
      fail(file, `baseVersion must be ${JSON.stringify(tokens.version)} (got ${JSON.stringify(variant.baseVersion)})`);
    }
    if (variant.baseFingerprint !== fingerprint) {
      fail(file, `baseFingerprint must be ${fingerprint} (got ${JSON.stringify(variant.baseFingerprint)})`);
    }

    for (const field of ['id', 'name', 'selector']) {
      if (typeof variant[field] !== 'string' || variant[field].trim() === '') {
        fail(file, `${field} must be a non-empty string`);
      }
    }
    if (!Number.isInteger(variant.displayOrder) || variant.displayOrder < 1) {
      fail(file, 'displayOrder must be a positive integer');
    }
    if (typeof variant.textasticUuid !== 'string' || !UUID.test(variant.textasticUuid)) {
      fail(file, 'textasticUuid must be a valid UUID');
    }

    if (!isObject(variant.colors)) {
      fail(file, 'colors must be an object');
    } else {
      for (const key of canonicalColorKeys) {
        if (!Object.hasOwn(variant.colors, key)) {
          fail(file, `colors.${key} is required by the canonical palette`);
        }
      }
      for (const [key, value] of Object.entries(variant.colors)) {
        if (!HEX_COLOR.test(value)) fail(file, `colors.${key} must be a #RRGGBB color`);
      }
    }

    if (!isObject(variant.platform)) {
      fail(file, 'platform must be an object');
    } else {
      for (const [key, value] of Object.entries(variant.platform)) {
        if (!HEX_COLOR.test(value)) fail(file, `platform.${key} must be a #RRGGBB color`);
      }
      for (const key of INFORMATIONAL_PLATFORM_COLORS) {
        if (!Object.hasOwn(variant.platform, key)) {
          fail(file, `platform.${key} is required for informational contrast validation`);
        }
      }
    }

    const colors = isObject(variant.colors) ? variant.colors : {};
    const platform = isObject(variant.platform) ? variant.platform : {};

    const surfaceLuminances = SURFACE_SCALE.map((key) => relativeLuminance(colors[key]));
    for (let index = 1; index < SURFACE_SCALE.length; index += 1) {
      const previous = surfaceLuminances[index - 1];
      const current = surfaceLuminances[index];
      if (previous !== null && current !== null && current <= previous) {
        fail(
          file,
          `surface luminance must increase from colors.${SURFACE_SCALE[index - 1]} to colors.${SURFACE_SCALE[index]}`,
        );
      }
    }

    const borderLuminances = BORDER_SCALE.map((key) => relativeLuminance(colors[key]));
    for (let index = 1; index < BORDER_SCALE.length; index += 1) {
      const previous = borderLuminances[index - 1];
      const current = borderLuminances[index];
      if (previous !== null && current !== null && current <= previous) {
        fail(
          file,
          `border luminance must increase from colors.${BORDER_SCALE[index - 1]} to colors.${BORDER_SCALE[index]}`,
        );
      }
    }

    let contrastSurface = null;
    let minimumInformationalContrast = null;
    let minimumCoreAccentChromaAverage = null;
    let minimumPlatformAccentChromaAverage = null;
    if (!isObject(variant.quality)) {
      fail(file, 'quality must be an object');
    } else {
      const surfaceKey = variant.quality.contrastSurface;
      if (typeof surfaceKey !== 'string' || !HEX_COLOR.test(colors[surfaceKey])) {
        fail(file, 'quality.contrastSurface must name a valid color in colors');
      } else {
        contrastSurface = colors[surfaceKey];
      }
      const minimum = variant.quality.minimumInformationalContrast;
      if (typeof minimum !== 'number' || !Number.isFinite(minimum) || minimum < 1 || minimum > 21) {
        fail(file, 'quality.minimumInformationalContrast must be a number from 1 through 21');
      } else {
        minimumInformationalContrast = minimum;
      }
      const coreChroma = variant.quality.minimumCoreAccentChromaAverage;
      if (typeof coreChroma !== 'number' || !Number.isFinite(coreChroma) || coreChroma <= 0 || coreChroma > 0.4) {
        fail(file, 'quality.minimumCoreAccentChromaAverage must be a number greater than 0 and at most 0.4');
      } else {
        minimumCoreAccentChromaAverage = coreChroma;
      }
      const platformChroma = variant.quality.minimumPlatformAccentChromaAverage;
      if (typeof platformChroma !== 'number' || !Number.isFinite(platformChroma) || platformChroma <= 0 || platformChroma > 0.4) {
        fail(file, 'quality.minimumPlatformAccentChromaAverage must be a number greater than 0 and at most 0.4');
      } else {
        minimumPlatformAccentChromaAverage = platformChroma;
      }
    }

    const informationalRatios = [];
    if (contrastSurface !== null && minimumInformationalContrast !== null) {
      const candidates = [
        ...INFORMATIONAL_COLORS.map((key) => [`colors.${key}`, colors[key]]),
        ...INFORMATIONAL_PLATFORM_COLORS.map((key) => [`platform.${key}`, platform[key]]),
      ];
      for (const [label, value] of candidates) {
        const ratio = contrastRatio(value, contrastSurface);
        if (ratio === null) continue;
        informationalRatios.push(ratio);
        if (ratio < minimumInformationalContrast) {
          fail(
            file,
            `${label} contrast is ${ratio.toFixed(2)}:1, below ${minimumInformationalContrast.toFixed(2)}:1 against colors.${variant.quality.contrastSurface}`,
          );
        }
      }
    }

    const coreAccentChromaAverage = average(
      CORE_ACCENT_COLORS.map((key) => oklabChroma(colors[key])).filter((value) => value !== null),
    );
    if (
      coreAccentChromaAverage !== null &&
      minimumCoreAccentChromaAverage !== null &&
      coreAccentChromaAverage < minimumCoreAccentChromaAverage
    ) {
      fail(
        file,
        `core accent average OKLab chroma is ${coreAccentChromaAverage.toFixed(3)}, below ${minimumCoreAccentChromaAverage.toFixed(3)}`,
      );
    }

    const platformAccentChromaAverage = average(
      PLATFORM_ACCENT_COLORS.map((key) => oklabChroma(platform[key])).filter((value) => value !== null),
    );
    if (
      platformAccentChromaAverage !== null &&
      minimumPlatformAccentChromaAverage !== null &&
      platformAccentChromaAverage < minimumPlatformAccentChromaAverage
    ) {
      fail(
        file,
        `platform accent average OKLab chroma is ${platformAccentChromaAverage.toFixed(3)}, below ${minimumPlatformAccentChromaAverage.toFixed(3)}`,
      );
    }

    const severityHues = Object.fromEntries(SEVERITY_COLORS.map((key) => [key, hue(colors[key])]));
    for (const key of SEVERITY_COLORS) {
      if (HEX_COLOR.test(colors[key]) && severityHues[key] === null) {
        fail(file, `colors.${key} must be chromatic for severity hue separation`);
      }
    }
    const severityGaps = [];
    for (let first = 0; first < SEVERITY_COLORS.length; first += 1) {
      for (let second = first + 1; second < SEVERITY_COLORS.length; second += 1) {
        const firstKey = SEVERITY_COLORS[first];
        const secondKey = SEVERITY_COLORS[second];
        const firstHue = severityHues[firstKey];
        const secondHue = severityHues[secondKey];
        if (firstHue === null || secondHue === null) continue;
        const gap = circularHueDistance(firstHue, secondHue);
        severityGaps.push(gap);
        if (gap < MINIMUM_SEVERITY_HUE_GAP) {
          fail(
            file,
            `severity hue gap colors.${firstKey}/colors.${secondKey} is ${gap.toFixed(1)}\u00b0, below ${MINIMUM_SEVERITY_HUE_GAP}\u00b0`,
          );
        }
      }
    }

    const actionRatios = [];
    for (const key of ACTION_COLORS) {
      const ratio = contrastRatio(colors.void, colors[key]);
      if (ratio === null) continue;
      actionRatios.push(ratio);
      if (ratio < MINIMUM_ACTION_CONTRAST) {
        fail(
          file,
          `colors.void contrast on colors.${key} is ${ratio.toFixed(2)}:1, below ${MINIMUM_ACTION_CONTRAST.toFixed(2)}:1`,
        );
      }
    }

    metrics.push({
      file,
      name: typeof variant.name === 'string' ? variant.name : file,
      minimumInformationalContrast,
      minimumInformationalRatio: informationalRatios.length ? Math.min(...informationalRatios) : null,
      minimumSeverityGap: severityGaps.length ? Math.min(...severityGaps) : null,
      minimumActionRatio: actionRatios.length ? Math.min(...actionRatios) : null,
      minimumCoreAccentChromaAverage,
      coreAccentChromaAverage,
      minimumPlatformAccentChromaAverage,
      platformAccentChromaAverage,
    });
  }

  const uniqueFields = [
    ['id', (value) => value.toLowerCase()],
    ['name', (value) => value.toLowerCase()],
    ['selector', (value) => value.toLowerCase()],
    ['textasticUuid', (value) => value.toLowerCase()],
  ];
  for (const [field, normalize] of uniqueFields) {
    const seen = new Map();
    for (const { file, variant } of variants) {
      const value = variant[field];
      if (typeof value !== 'string' || value.trim() === '') continue;
      const normalized = normalize(value.trim());
      if (seen.has(normalized)) {
        fail(file, `${field} duplicates ${JSON.stringify(value)} from ${seen.get(normalized)}`);
      } else {
        seen.set(normalized, file);
      }
    }
  }
  const displayOrders = new Map();
  for (const { file, variant } of variants) {
    if (!Number.isInteger(variant.displayOrder) || variant.displayOrder < 1) continue;
    if (displayOrders.has(variant.displayOrder)) {
      fail(file, `displayOrder duplicates ${variant.displayOrder} from ${displayOrders.get(variant.displayOrder)}`);
    } else {
      displayOrders.set(variant.displayOrder, file);
    }
  }

  if (errors.length > 0) {
    console.error(`FAIL theme validation (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  for (const metric of metrics) {
    console.log(
      `PASS ${metric.name}: ${canonicalColorKeys.length} colors; ` +
        `info ${metric.minimumInformationalRatio.toFixed(2)}:1 >= ${metric.minimumInformationalContrast.toFixed(2)}:1; ` +
        `chroma ${metric.coreAccentChromaAverage.toFixed(3)}/${metric.platformAccentChromaAverage.toFixed(3)}; ` +
        `severity ${metric.minimumSeverityGap.toFixed(1)}\u00b0; actions ${metric.minimumActionRatio.toFixed(2)}:1`,
    );
  }
  console.log(
    `PASS ${metrics.length} theme${metrics.length === 1 ? '' : 's'} validated ` +
      `(${metrics.length * (INFORMATIONAL_COLORS.length + INFORMATIONAL_PLATFORM_COLORS.length)} informational, ` +
      `${metrics.length * 3} severity, ${metrics.length * 3} action checks)`,
  );
}

try {
  main();
} catch (error) {
  console.error(`FAIL theme validation: ${error.message}`);
  process.exitCode = 1;
}
