import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, extname } from "node:path";

// Only these asset subtrees are reachable from the shipped game: the sprite
// loader (js/sprites.js) walks assets/sprites, and index.html +
// manifest.webmanifest point at assets/app-icon. assets/custom (staging art),
// assets/grac-submission and assets/play-store are repo-only material and
// added ~100MB to the .ait package while never being requested at runtime.
// The app logo in assets/ait-store is served from the Pages deploy over an
// absolute URL (granite.config.ts), so it does not belong in the bundle.
const ASSET_DIRS = ["sprites", "app-icon"];

// macOS/iCloud collision copies: "main 2.js", "splash 7.png", ...
const DUPLICATE_COPY = / \d+(\.[^.]+)?$/;

function include(src) {
  const name = basename(src);
  if (name.startsWith(".")) return false;
  return !DUPLICATE_COPY.test(name.slice(0, name.length - extname(name).length));
}

async function copyIfExists(src, dest) {
  if (!existsSync(src)) return false;
  await cp(src, dest, { recursive: true, filter: include });
  return true;
}

const copied = [];
await mkdir("dist/assets", { recursive: true });

for (const dir of ASSET_DIRS) {
  if (await copyIfExists(`assets/${dir}`, `dist/assets/${dir}`)) {
    copied.push(`assets/${dir}/`);
  }
}
if (await copyIfExists("css", "dist/css")) copied.push("css/");

console.log(`Copied ${copied.join(", ")} → dist/`);
