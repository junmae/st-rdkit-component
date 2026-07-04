import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(here, "..");
const publicDir = join(frontendRoot, "public");
const required = ["RDKit_minimal.js", "RDKit_minimal.wasm"];

const candidateRoots = [
  join(frontendRoot, "node_modules", "@rdkit", "rdkit", "Code", "MinimalLib", "dist"),
  join(frontendRoot, "node_modules", "@rdkit", "rdkit", "dist"),
  join(frontendRoot, "node_modules", "@rdkit", "rdkit"),
  join(frontendRoot, "..", "..", "node_modules", "@rdkit", "rdkit", "Code", "MinimalLib", "dist"),
  join(frontendRoot, "..", "..", "node_modules", "@rdkit", "rdkit", "dist"),
  join(frontendRoot, "..", "..", "node_modules", "@rdkit", "rdkit")
];

function walk(root, fileName, depth = 0) {
  if (!existsSync(root) || depth > 4) {
    return null;
  }
  const direct = join(root, fileName);
  if (existsSync(direct)) {
    return direct;
  }
  for (const entry of readdirSync(root)) {
    const next = join(root, entry);
    if (statSync(next).isDirectory()) {
      const found = walk(next, fileName, depth + 1);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

mkdirSync(publicDir, { recursive: true });

const copied = [];
const missing = [];
for (const fileName of required) {
  let source = null;
  for (const root of candidateRoots) {
    source = walk(root, fileName);
    if (source) {
      break;
    }
  }
  if (source) {
    copyFileSync(source, join(publicDir, fileName));
    copied.push(`${fileName} <- ${source}`);
  } else {
    missing.push(fileName);
  }
}

if (copied.length > 0) {
  console.log("Copied RDKit.js assets:");
  for (const line of copied) {
    console.log(`  ${line}`);
  }
}

if (missing.length > 0) {
  console.error(
    `Missing RDKit.js assets: ${missing.join(", ")}. ` +
      "Run npm install, or place RDKit_minimal.js and RDKit_minimal.wasm in frontend/public/."
  );
  process.exit(1);
}
