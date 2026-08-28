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

/** Public part names declared by structural primitives. */
export type OiPart = 'bar' | 'content' | 'control' | 'description' | 'fill' | 'item' | 'label' | 'provenance' | 'rail' | 'summary' | 'time' | 'track' | 'trend' | 'unit' | 'value';

/** Primitive-specific part-name narrowing for framework adapters. */
export interface OiPrimitivePartMap {
  readonly 'surface': never;
  readonly 'stack': never;
  readonly 'cluster': never;
  readonly 'rail': 'rail' | 'content';
  readonly 'inset': never;
  readonly 'divider': never;
  readonly 'metric': 'label' | 'value' | 'unit' | 'trend' | 'provenance';
  readonly 'meter': 'label' | 'control' | 'track' | 'fill' | 'value' | 'description';
  readonly 'disclosure': 'summary' | 'content';
  readonly 'history-strip': 'item' | 'time' | 'bar' | 'value';
}

/** Composition recipes (§11). */
export type OiRecipe = 'compact-monitor';

/** Public owner-qualified part names declared by composition recipes. */
export type OiRecipePart = 'chrome';

/** Recipe-specific part-name narrowing for framework adapters. */
export interface OiRecipePartMap {
  readonly 'compact-monitor': 'chrome';
}

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

export type OiAccessibleName = 'none' | 'contents' | 'required';
export type OiPartCardinality = 'one' | 'zero-or-one' | 'one-or-more' | 'zero-or-more';
export type OiPartOrderPolicy = 'none' | 'listed' | 'either';

/** Element and attribute obligations shared by primitive roots and parts. */
export interface OiPrimitiveNodeContract {
  readonly elements: readonly string[];
  readonly requiredClasses?: readonly string[];
  readonly requiredAttributes: Readonly<Record<string, readonly string[]>>;
  readonly forbiddenAttributes: readonly string[];
  readonly accessibleName: OiAccessibleName;
}

/** Public contract of one owner-qualified primitive part. */
export interface OiPrimitivePartContract extends OiPrimitiveNodeContract {
  readonly parent: 'root' | OiPart;
  readonly cardinality: OiPartCardinality;
}

/** Public DOM and styling contract of one structural primitive. */
export interface OiPrimitiveContract {
  readonly stability: OiStability;
  readonly responsibility: string;
  readonly axes: readonly (keyof OiState)[];
  readonly root: OiPrimitiveNodeContract;
  readonly partOrder: readonly OiPart[];
  readonly partOrderPolicy: OiPartOrderPolicy;
  readonly parts: Readonly<Partial<Record<OiPart, OiPrimitivePartContract>>>;
  readonly publicHooks: readonly string[];
}

/** Public contract of one owner-qualified recipe part. */
export interface OiRecipePartContract extends OiPrimitiveNodeContract {
  readonly parent: 'root' | OiRecipePart;
  readonly cardinality: OiPartCardinality;
}

/** Named recipe support widths; these are proof points, not a forced minimum size. */
export interface OiRecipeWidths {
  readonly minimumViable: string;
  readonly preferred: string;
  readonly wide: string;
}

export interface OiRecipeOverflowBehavior {
  readonly root: 'no-scroll-container';
  readonly text: 'wrap-anywhere';
  readonly scrollSlots: readonly OiSlot[];
  readonly documentInlineOverflow: 'forbidden';
}

export interface OiRecipeTruncationBehavior {
  readonly default: 'none';
  readonly ellipsisSlots: readonly OiSlot[];
  readonly preserveNumericValues: true;
}

export interface OiRecipeOptionalSlotCollapse {
  readonly strategy: 'omit';
  readonly emptySlotElements: 'forbidden';
  readonly residualSpace: 'forbidden';
  readonly conditionalParts: Readonly<Partial<Record<OiRecipePart, readonly OiSlot[]>>>;
}

export interface OiRecipeDensityBehavior {
  readonly boundary: 'required';
  readonly changes: readonly string[];
  readonly preserves: readonly string[];
}

export interface OiRecipeAsyncBehavior {
  readonly scenarios: readonly string[];
  readonly ariaBusyActivities: readonly OiActivity[];
  readonly geometryPreservedSlotsOnLoading: readonly OiSlot[];
  readonly retainedSlotsOnRefresh: readonly OiSlot[];
  readonly retainedSlotsWhenStale: readonly OiSlot[];
  readonly failureIsolation: 'smallest-responsible-slot';
  readonly recovery: 'visible-action';
  readonly validEmpty: 'ready-not-loading';
}

export interface OiRecipeKeyboardFocus {
  readonly model: 'native';
  readonly tabOrder: 'dom';
  readonly rootFocusable: false;
  readonly rovingFocus: false;
  readonly recipeShortcuts: readonly string[];
  readonly escapeBehavior: 'none';
  readonly responsiveReordering: 'forbidden';
  readonly asyncFocus: 'preserve-existing-node';
}

export interface OiRecipeProofFixtures {
  readonly mappings: readonly string[];
  readonly widths: readonly string[];
  readonly densities: readonly OiDensity[];
  readonly asyncScenarios: readonly string[];
  readonly states: readonly string[];
  readonly stress: readonly string[];
}

/** Public contract of one recipe. */
export interface OiRecipeContract {
  readonly stability: OiStability;
  readonly study?: string;
  readonly axes: readonly (keyof OiState)[];
  readonly root: OiPrimitiveNodeContract;
  readonly partOrder: readonly OiRecipePart[];
  readonly partOrderPolicy: OiPartOrderPolicy;
  readonly parts: Readonly<Partial<Record<OiRecipePart, OiRecipePartContract>>>;
  readonly slotOrder: readonly OiSlot[];
  readonly requiredSlots: readonly OiSlot[];
  readonly optionalSlots: readonly OiSlot[];
  readonly slotParents: Readonly<Partial<Record<OiSlot, 'root' | OiRecipePart>>>;
  readonly supportedDensities: readonly OiDensity[];
  readonly widths: OiRecipeWidths;
  readonly overflowBehavior: OiRecipeOverflowBehavior;
  readonly truncationBehavior: OiRecipeTruncationBehavior;
  readonly optionalSlotCollapse: OiRecipeOptionalSlotCollapse;
  readonly densityBehavior: OiRecipeDensityBehavior;
  readonly asyncBehavior: OiRecipeAsyncBehavior;
  readonly keyboardFocus: OiRecipeKeyboardFocus;
  readonly proofFixtures: OiRecipeProofFixtures;
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
export declare const primitiveContracts: Readonly<Record<OiPrimitive, OiPrimitiveContract>>;
export declare const primitivePartClasses: {
  readonly [K in OiPrimitive]: Readonly<Partial<Record<OiPrimitivePartMap[K], string>>>;
};
export declare const recipes: readonly OiRecipe[];
export declare const recipeContracts: Readonly<Record<OiRecipe, OiRecipeContract>>;
export declare const recipePartClasses: {
  readonly [K in OiRecipe]: Readonly<Partial<Record<OiRecipePartMap[K], string>>>;
};
export declare const reservedRecipeNames: readonly string[];
export declare const stabilityLadder: readonly OiStability[];
export declare const forbiddenDomainTerms: readonly string[];

export declare function assertAxisValue(axis: string, value: string, options?: OiRuntimeOptions): boolean;
export declare function missingRequiredSlots(recipe: OiRecipe, providedSlots: readonly string[], options?: OiRuntimeOptions): OiSlot[];
export declare function requiresProvenanceDisclosure(state: Pick<OiState, 'source' | 'certainty' | 'freshness' | 'completeness'>): boolean;
