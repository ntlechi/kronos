import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "icons");
mkdirSync(outDir, { recursive: true });

async function makeIcon(size) {
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#0b0d0c"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.28}" fill="none" stroke="#c8f560" stroke-width="${size * 0.06}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.08}" fill="#c8f560"/>
  <line x1="${size * 0.5}" y1="${size * 0.5}" x2="${size * 0.5}" y2="${size * 0.28}" stroke="#c8f560" stroke-width="${size * 0.05}" stroke-linecap="round"/>
  <line x1="${size * 0.5}" y1="${size * 0.5}" x2="${size * 0.68}" y2="${size * 0.5}" stroke="#c8f560" stroke-width="${size * 0.04}" stroke-linecap="round"/>
</svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(outDir, `icon-${size}.png`));
}

await makeIcon(192);
await makeIcon(512);
console.log("Icons written to public/icons");
