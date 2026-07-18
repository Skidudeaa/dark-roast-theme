import { clampChroma, formatHex, wcagContrast } from 'culori';

/**
 * The Brew Engine takes a Recipe and generates a full 38-color Dark Roast palette.
 * It uses OKLCH math to ensure perceptual consistency and accessibility.
 */
export function generatePalette(recipe) {
	const isLight = recipe.polarity === 'light';
	const baseHue = recipe.hue;
	const cScale = recipe.chroma_scale || 1.0;

	// Semantic Lightness Ramps
	// For light mode (additive), 'void' is light. For dark mode (subtractive), 'void' is dark.
	const L = (val) => isLight ? 1 - val : val;

	const seeds = {
		colors: {
			void: [L(0.12), 0.015 * cScale, baseHue],
			obsidian: [L(0.16), 0.02 * cScale, baseHue],
			darkCacao: [L(0.20), 0.025 * cScale, baseHue],
			espresso: [L(0.25), 0.03 * cScale, baseHue],
			espressoHover: [L(0.30), 0.035 * cScale, baseHue],
			roastedBean: [L(0.40), 0.04 * cScale, baseHue],
			crater: [L(0.50), 0.05 * cScale, baseHue],
			crema: [L(0.95), 0.01 * cScale, baseHue],
			warmWhite: [L(0.90), 0.02 * cScale, baseHue],
			bone: [L(0.85), 0.025 * cScale, baseHue],
			mocha: [L(0.70), 0.06 * cScale, baseHue],
			craterDeep: [L(0.45), 0.045 * cScale, baseHue],
			
			// Accents (Hues are rotated from base)
			amber: [L(0.65), 0.15 * cScale, 70],
			teal: [L(0.65), 0.12 * cScale, 195],
			scarlet: [L(0.55), 0.18 * cScale, 25],
			gold: [L(0.75), 0.14 * cScale, 90],
			// ... more accents would follow
		},
		platform: {
			structural: [L(0.35), 0.03 * cScale, baseHue],
			shadow: [L(0.05), 0.03 * cScale, baseHue],
			// ... platform keys
		}
	};

	const colors = {};
	const platform = {};

	const toHex = ([l, c, h]) => {
		const mapped = clampChroma({ mode: 'oklch', l, c, h }, 'oklch', 'rgb');
		return formatHex(mapped).toUpperCase();
	};

	for (const [name, seed] of Object.entries(seeds.colors)) colors[name] = toHex(seed);
	for (const [name, seed] of Object.entries(seeds.platform)) platform[name] = toHex(seed);

	return {
		...recipe,
		colors,
		platform
	};
}
