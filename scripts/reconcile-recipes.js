import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generatePalette } from '../lib/brew-engine.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECIPES_DIR = join(__dirname, '../src/recipes');
const VARIANTS_DIR = join(__dirname, '../src/variants');

const recipes = readdirSync(RECIPES_DIR).filter(f => f.endsWith('.json'));

for (const file of recipes) {
	const recipe = JSON.parse(readFileSync(join(RECIPES_DIR, file), 'utf8'));
	const variant = generatePalette(recipe);
	
	// Ensure standard metadata is included
	variant.version = "1.0.0";
	variant.selector = `dark-roast-${variant.id}`;
	variant.className = `dark-roast-${variant.id}`;
	
	const outPath = join(VARIANTS_DIR, `${variant.id}.json`);
	writeFileSync(outPath, JSON.stringify(variant, null, '\t'));
	console.log(`✓ Brewed ${variant.id} -> ${outPath}`);
}
