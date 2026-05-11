// One-shot script: rasterise the source SVGs in /public into the PNG sizes
// the PWA manifest + iOS need. Run manually:
//   npm run gen:icons
// (Commit the generated PNGs — the build doesn't regenerate them.)

import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "..", "public");

const main = readFileSync(join(publicDir, "icon.svg"));
const maskable = readFileSync(join(publicDir, "icon-maskable.svg"));

const targets = [
  { src: main,     out: "icon-192.png",         size: 192 },
  { src: main,     out: "icon-512.png",         size: 512 },
  { src: maskable, out: "icon-maskable-512.png", size: 512 },
  { src: main,     out: "apple-touch-icon.png",  size: 180 },
  { src: main,     out: "favicon-32.png",        size: 32 },
];

for (const { src, out, size } of targets) {
  await sharp(src)
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(join(publicDir, out));
  console.log(`✓ ${out} (${size}×${size})`);
}

console.log("Done — PNG icons regenerated in /public");
