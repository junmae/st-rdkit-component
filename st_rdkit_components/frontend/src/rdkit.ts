import type { RDKitModule, RDKitMol } from "./types";

let rdkitPromise: Promise<RDKitModule> | null = null;

function loadScript(src: string): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(
    `script[data-rdkit-src="${src}"]`
  );
  if (existing?.dataset.loaded === "true") {
    return Promise.resolve();
  }
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)), {
        once: true
      });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.rdkitSrc = src;
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true }
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load bundled RDKit.js asset: ${src}`)),
      { once: true }
    );
    document.head.appendChild(script);
  });
}

export function getRDKit(): Promise<RDKitModule> {
  if (!rdkitPromise) {
    rdkitPromise = (async () => {
      const jsUrl = new URL("./RDKit_minimal.js", import.meta.url).toString();
      const wasmUrl = new URL("./RDKit_minimal.wasm", import.meta.url).toString();

      await loadScript(jsUrl);

      if (typeof window.initRDKitModule !== "function") {
        throw new Error(
          "RDKit.js was loaded, but window.initRDKitModule was not found. " +
            "Check that RDKit_minimal.js matches the expected RDKit.js minimal build."
        );
      }

      return await window.initRDKitModule({
        locateFile: (path: string) => {
          if (path.endsWith(".wasm")) {
            return wasmUrl;
          }
          return path;
        }
      });
    })();
  }
  return rdkitPromise;
}

function normalizePositiveInt(value: number | null | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return Math.round(value);
}

function sizeSvg(svg: string, width?: number, height?: number): string {
  if (!width && !height) {
    return svg;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(svg, "image/svg+xml");
  const svgElement = document.querySelector("svg");
  if (!svgElement) {
    return svg;
  }

  const existingWidth = svgElement.getAttribute("width");
  const existingHeight = svgElement.getAttribute("height");
  const finalWidth = width ?? Number.parseFloat(existingWidth ?? "");
  const finalHeight = height ?? Number.parseFloat(existingHeight ?? "");

  if (width) {
    svgElement.setAttribute("width", String(width));
  }
  if (height) {
    svgElement.setAttribute("height", String(height));
  }
  if (
    !svgElement.hasAttribute("viewBox") &&
    Number.isFinite(finalWidth) &&
    Number.isFinite(finalHeight)
  ) {
    svgElement.setAttribute("viewBox", `0 0 ${finalWidth} ${finalHeight}`);
  }

  return new XMLSerializer().serializeToString(svgElement);
}

export async function smilesToSvg(
  smiles: string,
  options: { width?: number | null; height?: number | null } = {}
): Promise<string> {
  const rdkit = await getRDKit();
  let mol: RDKitMol | null = null;
  const width = normalizePositiveInt(options.width);
  const height = normalizePositiveInt(options.height);
  try {
    mol = rdkit.get_mol(smiles);
    if (!mol) {
      throw new Error(`Invalid SMILES: ${smiles}`);
    }
    const svg = width || height ? mol.get_svg(width, height) : mol.get_svg();
    if (!svg) {
      throw new Error(`RDKit.js returned an empty SVG for SMILES: ${smiles}`);
    }
    return sizeSvg(svg, width, height);
  } finally {
    if (mol) {
      mol.delete();
    }
  }
}
