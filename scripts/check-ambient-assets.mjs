#!/usr/bin/env node
/** Lists CC0 ambient loops present vs expected under public/audio/ambient/. */

import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const ambientDir = path.join(root, "public", "audio", "ambient");
const manifestPath = path.join(ambientDir, "manifest.json");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

async function exists(filePath) {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

console.log(`Ambient assets — ${ambientDir}\n`);

for (const sound of manifest.sounds) {
  let found = null;
  for (const file of sound.files) {
    const full = path.join(ambientDir, file);
    if (await exists(full)) {
      found = file;
      break;
    }
  }

  const status = found ? `file (${found})` : "procedural fallback";
  console.log(`  ${sound.id.padEnd(10)} ${status}`);
  if (!found) {
    console.log(`             → drop ${sound.files.join(" or ")} — ${sound.hint}`);
  }
}

console.log("\nDone. File loops auto-override synth at runtime.");
