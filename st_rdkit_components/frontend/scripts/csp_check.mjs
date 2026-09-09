import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const frontendRoot = resolve(new URL("..", import.meta.url).pathname);
const targets = [join(frontendRoot, "build")];
const patterns = [
  { label: "eval(", regex: /\beval\s*\(/ },
  { label: "new Function", regex: /\bnew\s+Function\b/ },
  { label: "Function(", regex: /\bFunction\s*\(/ },
  { label: "importScripts(", regex: /\bimportScripts\s*\(/ }
];

function filesUnder(path) {
  if (!existsSync(path)) {
    return [];
  }
  if (statSync(path).isFile()) {
    return [path];
  }
  return readdirSync(path).flatMap((entry) => filesUnder(join(path, entry)));
}

let warningCount = 0;
for (const file of [...new Set(targets.flatMap(filesUnder))]) {
  if (!/\.(js|mjs)$/.test(file)) {
    continue;
  }
  const text = readFileSync(file, "utf8");
  for (const { label, regex } of patterns) {
    if (regex.test(text)) {
      warningCount += 1;
      console.warn(`[csp-check] warning: ${label} found in ${file}`);
    }
  }
}

if (warningCount === 0) {
  console.log("[csp-check] no obvious CSP-sensitive patterns found.");
} else {
  console.warn(
    `[csp-check] ${warningCount} warning(s). Snowflake Streamlit container runtime may block these constructs.`
  );
}
