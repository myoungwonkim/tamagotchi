import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";

async function copyIfExists(src, dest) {
  if (!existsSync(src)) return;
  await cp(src, dest, { recursive: true });
}

await mkdir("dist", { recursive: true });
await copyIfExists("assets", "dist/assets");
await copyIfExists("css", "dist/css");

console.log("Copied assets/ and css/ → dist/");
