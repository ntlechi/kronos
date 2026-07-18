import sharp from "sharp";
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourceSvg = join(root, "public", "Kronos Design.svg");
const brandDir = join(root, "public", "brand");
const iconsDir = join(root, "public", "icons");

mkdirSync(brandDir, { recursive: true });
mkdirSync(iconsDir, { recursive: true });

copyFileSync(sourceSvg, join(root, "public", "kronos-logo.svg"));
copyFileSync(sourceSvg, join(brandDir, "kronos-logo.svg"));

async function writeLogoPng(width, outPath) {
  await sharp(sourceSvg)
    .resize(width, null, { fit: "inside" })
    .png()
    .toFile(outPath);
}

async function writeAppIcon(size) {
  const logo = sharp(sourceSvg).resize(Math.round(size * 0.72), Math.round(size * 0.72), {
    fit: "inside",
  });

  const logoBuffer = await logo.png().toBuffer();
  const meta = await sharp(logoBuffer).metadata();
  const logoW = meta.width ?? size;
  const logoH = meta.height ?? size;

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 11, g: 13, b: 12, alpha: 1 },
    },
  })
    .composite([
      {
        input: logoBuffer,
        left: Math.round((size - logoW) / 2),
        top: Math.round((size - logoH) / 2),
      },
    ])
    .png()
    .toFile(join(iconsDir, `icon-${size}.png`));
}

await writeLogoPng(320, join(brandDir, "kronos-logo.png"));
await writeLogoPng(480, join(brandDir, "kronos-logo@2x.png"));
await writeAppIcon(192);
await writeAppIcon(512);

console.log("Brand assets written to public/brand and public/icons");
