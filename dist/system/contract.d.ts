// AUTO-GENERATED from src/system/contract.json by scripts/build-system.js — DO NOT EDIT.
// Edit src/system/contract.json and run `npm run build:system`.
// TypeScript surface for the Operational Interface Doctrine contract.
//
// These are convenience types. Per §13 the CSS and semantic DOM contracts
// are canonical; removing the TypeScript adapter must not change behavior.

/** `data-oi-surface` — stable. */
export type OiSurface = 'canvas' | 'base' | 'raised' | 'interactive' | 'inset' | 'overlay' | 'scrim';

/** `data-oi-activity` — stable. */
export type OiActivity = 'idle' | 'loading' | 'refreshing' | 'live' | 'ready' | 'failed';

/** `data-oi-severity` — stable. */
export type OiSeverity = 'neutral' | 'informational' | 'positive' | 'warning' | 'negative' | 'critical';

/** `data-oi-freshness` — stable. */
export type OiFreshness = 'live' | 'recent' | 'stale' | 'unknown';

/** `data-oi-certainty` — stable. */
export type OiCertainty = 'confirmed' | 'inferred' | 'uncertain' | 'disputed';

/** `data-oi-completeness` — stable. */
export type OiCompleteness = 'complete' | 'partial' | 'missing' | 'unavailable';

/** `data-oi-source` — stable. */
export type OiSource = 'direct' | 'derived' | 'generated' | 'user-entered' | 'external';

/** `data-oi-emphasis` — stable. */
export type OiEmphasis = 'quiet' | 'normal' | 'strong';

/** `data-oi-density` — stable. */
export type OiDensity = 'compact' | 'standard' | 'spacious';

/** Structural primitives (§10). */
export type OiPrimitive = 'surface' | 'stack' | 'cluster' | 'rail' | 'inset' | 'divider' | 'metric' | 'meter' | 'disclosure' | 'history-strip';

/** Composition recipes (§11). */
export type OiRecipe = 'compact-monitor';

/** Every slot name declared by any recipe. */
export type OiSlot = 'actions' | 'context' | 'details' | 'focus' | 'history' | 'primary' | 'settings' | 'status';

export type OiStability = 'study' | 'candidate' | 'experimental' | 'proven' | 'stable' | 'deprecated';

/** Explicit assertion mode for native browser ESM without Node environment globals. */
export interface OiRuntimeOptions {
  readonly development?: boolean;
}

/** The orthogonal state of a single operational surface (§5.3). */
export interface OiState {
  surface?: OiSurface;
  activity?: OiActivity;
  severity?: OiSeverity;
  freshness?: OiFreshness;
  certainty?: OiCertainty;
  completeness?: OiCompleteness;
  source?: OiSource;
  emphasis?: OiEmphasis;
  density?: OiDensity;
}

/** Public contract of one recipe. */
export interface OiRecipeContract {
  readonly stability: OiStability;
  readonly slotOrder: readonly OiSlot[];
  readonly requiredSlots: readonly OiSlot[];
  readonly optionalSlots: readonly OiSlot[];
  readonly supportedDensities: readonly OiDensity[];
  readonly publicHooks: readonly string[];
}

export declare const CONTRACT_NAME: string;
export declare const CONTRACT_VERSION: string;
export declare const cssClassPrefix: string;
export declare const cssVariablePrefix: string;
export declare const axisAttributePrefix: string;
export declare const slotAttribute: string;
export declare const typeScriptTypePrefix: string;
export declare const swiftTypePrefix: string;

export declare const surface: readonly OiSurface[];
export declare const activity: readonly OiActivity[];
export declare const severity: readonly OiSeverity[];
export declare const freshness: readonly OiFreshness[];
export declare const certainty: readonly OiCertainty[];
export declare const completeness: readonly OiCompleteness[];
export declare const source: readonly OiSource[];
export declare const emphasis: readonly OiEmphasis[];
export declare const density: readonly OiDensity[];

export declare const axes: { readonly [K in keyof OiState]-?: readonly string[] };
export declare const axisAttributes: { readonly [K in keyof OiState]-?: string };
export declare const axisStability: { readonly [K in keyof OiState]-?: 'stable' | 'experimental' };
export declare const truthAxes: readonly string[];
export declare const semanticRoles: Readonly<Record<string, readonly string[]>>;
export declare const semanticRoleVariables: readonly string[];
export declare const primitives: readonly OiPrimitive[];
export declare const primitiveAxes: Readonly<Record<OiPrimitive, readonly string[]>>;
export declare const recipes: readonly OiRecipe[];
export declare const recipeContracts: Readonly<Record<OiRecipe, OiRecipeContract>>;
export declare const reservedRecipeNames: readonly string[];
export declare const stabilityLadder: readonly OiStability[];
export declare const forbiddenDomainTerms: readonly string[];

export declare function assertAxisValue(axis: string, value: string, options?: OiRuntimeOptions): boolean;
export declare function missingRequiredSlots(recipe: OiRecipe, providedSlots: readonly string[], options?: OiRuntimeOptions): OiSlot[];
export declare function requiresProvenanceDisclosure(state: Pick<OiState, 'source' | 'certainty' | 'freshness' | 'completeness'>): boolean;
