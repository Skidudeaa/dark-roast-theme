import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const VARIANTS_DIR = join(ROOT, 'src/variants');

const variantFiles = readdirSync(VARIANTS_DIR).filter(f => f.endsWith('.json'));
const variants = variantFiles.map(f => JSON.parse(readFileSync(join(VARIANTS_DIR, f), 'utf8')));

// Sort by displayOrder
variants.sort((a, b) => (a.displayOrder || 99) - (b.displayOrder || 99));

let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dark Roast: The Full Menu</title>
    <style>
        :root {
            --font-main: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        body {
            margin: 0;
            padding: 40px;
            font-family: var(--font-main);
            background: #121212;
            color: #e0e0e0;
        }
        header {
            max-width: 1200px;
            margin: 0 auto 60px auto;
            border-bottom: 1px solid #333;
            padding-bottom: 20px;
        }
        h1 { font-weight: 800; font-size: 2.5rem; margin-bottom: 10px; color: #fff; }
        .menu-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
            gap: 40px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .theme-card {
            border-radius: 12px;
            overflow: hidden;
            background: #1e1e1e;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            transition: transform 0.2s;
            display: flex;
            flex-direction: column;
        }
        .theme-card:hover { transform: translateY(-5px); }
        .preview-box {
            height: 200px;
            padding: 24px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .info { padding: 24px; flex-grow: 1; }
        .tag {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.7rem;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
        }
        .tag.dark { background: #000; color: #fff; }
        .tag.light { background: #fff; color: #000; }
        .theme-name { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; color: #fff; }
        .description { font-size: 0.95rem; line-height: 1.6; color: #aaa; margin-bottom: 20px; }
        
        .swatch-ramp {
            display: flex;
            gap: 4px;
            margin-top: 10px;
        }
        .swatch {
            width: 24px;
            height: 24px;
            border-radius: 3px;
            border: 1px solid rgba(0,0,0,0.1);
        }

        .code-snippet {
            grid-column: span 2;
            font-family: "SF Mono", "Fira Code", monospace;
            font-size: 0.85rem;
            padding: 15px;
            border-radius: 6px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <header>
        <h1>Dark Roast Theme Family</h1>
        <p>A comprehensive perusal of all brewed variants, from OLED Black to Cascara Tea.</p>
    </header>

    <div class="menu-grid">
`;

for (const v of variants) {
    const c = v.colors;
    const isLight = v.polarity === 'light';
    
    html += `
        <div class="theme-card">
            <div class="preview-box" style="background: ${c.void};">
                <div class="code-snippet" style="background: ${c.obsidian}; color: ${c.crema}; border: 1px solid ${c.espresso};">
                    <span style="color: ${c.amber};">const</span> <span style="color: ${c.teal};">brew</span> = () => {<br>
                    &nbsp;&nbsp;<span style="color: ${c.scarlet};">return</span> <span style="color: ${c.gold};">'Dark Roast'</span>;<br>
                    };
                </div>
                <div class="swatch-ramp">
                    <div class="swatch" style="background: ${c.amber};" title="Amber"></div>
                    <div class="swatch" style="background: ${c.teal};" title="Teal"></div>
                    <div class="swatch" style="background: ${c.scarlet};" title="Scarlet"></div>
                    <div class="swatch" style="background: ${c.gold};" title="Gold"></div>
                    <div class="swatch" style="background: ${c.magenta};" title="Magenta"></div>
                </div>
            </div>
            <div class="info">
                <span class="tag ${isLight ? 'light' : 'dark'}">${v.polarity} mode</span>
                <div class="theme-name">${v.name}</div>
                <div class="description">${v.description}</div>
                <div style="font-size: 0.8rem; color: #666;">ID: ${v.id} | Hue: ${v.hue || 'N/A'}</div>
            </div>
        </div>
    `;
}

html += `
    </div>
</body>
</html>
`;

writeFileSync(join(ROOT, 'perusal-gallery.html'), html);
console.log('✓ Created perusal-gallery.html');
