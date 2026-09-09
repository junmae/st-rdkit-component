import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(here, "..");
const publicDir = join(frontendRoot, "public");
const generatedDir = join(frontendRoot, "src", "generated");
const rdkitJsName = "RDKIT_minimal_csp.js";
const rdkitWasmName = "RDKIT_minimal_csp.wasm";

mkdirSync(publicDir, { recursive: true });
mkdirSync(generatedDir, { recursive: true });

const required = [rdkitJsName, rdkitWasmName];
const missing = required.filter((fileName) => !existsSync(join(publicDir, fileName)));
if (missing.length > 0) {
  console.error(
    `Missing RDKit.js assets: ${missing.join(", ")}. ` +
      "Place RDKIT_minimal_csp.js and RDKIT_minimal_csp.wasm in frontend/public/."
  );
  process.exit(1);
}

const rdkitJs = readFileSync(join(publicDir, rdkitJsName), "utf8").replace(
  /(["'])RDKit_minimal\.wasm\1/g,
  JSON.stringify(rdkitWasmName)
);
const rdkitWasm = readFileSync(join(publicDir, rdkitWasmName));

writeFileSync(
  join(generatedDir, "RDKIT_minimal_csp_module.js"),
  `${rdkitJs}\nexport default initRDKitModule;\n`,
  "utf8"
);
writeFileSync(
  join(generatedDir, "RDKIT_minimal_csp_module.d.ts"),
  [
    "import type { RDKitModule } from '../types';",
    "declare const initRDKitModule: (options?: Record<string, unknown>) => Promise<RDKitModule> | RDKitModule;",
    "export default initRDKitModule;",
    ""
  ].join("\n"),
  "utf8"
);
writeFileSync(
  join(generatedDir, "rdkitWasmBase64.ts"),
  `export const rdkitWasmBase64 = ${JSON.stringify(rdkitWasm.toString("base64"))};\n`,
  "utf8"
);
console.log("Generated bundled RDKit.js CSP module and wasm base64 source.");
