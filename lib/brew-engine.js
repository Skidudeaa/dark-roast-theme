import { clampChroma, formatHex } from 'culori';

export function generatePalette(recipe) {
	const isLight = recipe.polarity === 'light';
	const baseHue = recipe.hue;
	const cScale = recipe.chroma_scale || 1.0;

	const L = (val) => isLight ? 1 - val : val;
	
	// Helper for accent rotations
	const acc = (l, c, h) => [L(l), c * cScale, h];

	const seeds = {
		colors: {
			void: [L(0.10), 0.01 * cScale, baseHue],
			obsidian: [L(0.14), 0.015 * cScale, baseHue],
			darkCacao: [L(0.18), 0.02 * cScale, baseHue],
			espresso: [L(0.22), 0.025 * cScale, baseHue],
			espressoHover: [L(0.28), 0.03 * cScale, baseHue],
			roastedBean: [L(0.38), 0.04 * cScale, baseHue],
			crater: [L(0.48), 0.05 * cScale, baseHue],
			crema: [L(0.96), 0.01 * cScale, baseHue],
			warmWhite: [L(0.92), 0.02 * cScale, baseHue],
			bone: [L(0.86), 0.025 * cScale, baseHue],
			mocha: [L(0.72), 0.06 * cScale, baseHue],
			craterDeep: [L(0.44), 0.045 * cScale, baseHue],
			asparagus: acc(0.75, 0.08, 130),
			rustic: acc(0.40, 0.12, 20),
			rose: acc(0.40, 0.12, 340),
			amber: acc(0.68, 0.16, 70),
			amberHot: acc(0.65, 0.18, 45),
			amberMuted: acc(0.70, 0.12, 60),
			gold: acc(0.75, 0.15, 85),
			brass: acc(0.72, 0.12, 90),
			scarlet: acc(0.58, 0.18, 25),
			burntSienna: acc(0.62, 0.16, 40),
			teal: acc(0.65, 0.14, 195),
			magenta: acc(0.65, 0.16, 330),
			harvest: acc(0.72, 0.14, 80),
			olive: acc(0.72, 0.12, 110)
		},
		platform: {
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
			shadow: [L(0.04), 0.03, baseHue],
			hoverSurface: [L(0.24), 0.03, baseHue]
		}
	};

	const toHex = ([l, c, h]) => {
		const mapped = clampChroma({ mode: 'oklch', l, c, h: h === undefined ? 0 : h }, 'oklch', 'rgb');
		return formatHex(mapped).toUpperCase();
	};

	const colors = {};
	const platform = {};
	for (const [name, seed] of Object.entries(seeds.colors)) colors[name] = toHex(seed);
	for (const [name, seed] of Object.entries(seeds.platform)) platform[name] = toHex(seed);

	return {
		...recipe,
		colors,
		platform,
		quality: {
			contrastSurface: isLight ? "void" : "espresso",
			minimumInformationalContrast: recipe.contrast_target || 4.5,
			minimumCoreAccentChromaAverage: 0.12,
			minimumPlatformAccentChromaAverage: 0.10
		}
	};
}
