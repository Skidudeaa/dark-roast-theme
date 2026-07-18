import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { generatePalette } from '../lib/brew-engine.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RECIPES_DIR = join(ROOT, 'src/recipes');
const VARIANTS_DIR = join(ROOT, 'src/variants');
const TOKENS_PATH = join(ROOT, 'src/tokens.json');

const tokenBytes = readFileSync(TOKENS_PATH);
const fingerprint = `sha256:${createHash('sha256').update(tokenBytes).digest('hex')}`;
const packageVersion = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;

const recipes = readdirSync(RECIPES_DIR).filter(f => f.endsWith('.json'));

for (const file of recipes) {
	const recipe = JSON.parse(readFileSync(join(RECIPES_DIR, file), 'utf8'));
	const variant = generatePalette(recipe);
	
	variant.version = "1.0.0";
	variant.baseVersion = "5.0.0"; // Mirroring existing standard
	variant.baseFingerprint = fingerprint;
	variant.selector = `dark-roast-${variant.id}`;
	variant.className = `dark-roast-${variant.id}`;
	variant.sourceVersion = packageVersion;
	
	const outPath = join(VARIANTS_DIR, `${variant.id}.json`);
	writeFileSync(outPath, JSON.stringify(variant, null, '\t'));
	console.log(`✓ Brewed ${variant.id} -> ${outPath}`);
}
