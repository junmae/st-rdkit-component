import type { HighlightDetails, RDKitModule, RDKitMol } from "./types";
import initRDKitModule from "./generated/RDKIT_minimal_csp_module.js";
import { rdkitWasmBase64 } from "./generated/rdkitWasmBase64";

let rdkitPromise: Promise<RDKitModule> | null = null;

function base64ToUint8Array(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function getRDKit(): Promise<RDKitModule> {
  if (!rdkitPromise) {
    rdkitPromise = (async () => {
      if (typeof initRDKitModule !== "function") {
        throw new Error(
          "Bundled RDKit.js did not export initRDKitModule. " +
            "Check that RDKIT_minimal_csp.js matches the expected RDKit.js minimal CSP build."
        );
      }

      return await initRDKitModule({
        wasmBinary: base64ToUint8Array(rdkitWasmBase64)
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

function collectNumberValues(value: unknown, target: Set<number>): void {
  if (!Array.isArray(value)) {
    return;
  }

  for (const item of value) {
    if (Array.isArray(item)) {
      collectNumberValues(item, target);
    } else if (typeof item === "number" && Number.isFinite(item)) {
      target.add(item);
    }
  }
}

function normalizeSubstructMatchDetails(value: unknown): HighlightDetails {
  const atoms = new Set<number>();
  const bonds = new Set<number>();

  const addMatch = (match: unknown): void => {
    if (!match || typeof match !== "object") {
      return;
    }
    const details = match as HighlightDetails;
    collectNumberValues(details.atoms, atoms);
    collectNumberValues(details.bonds, bonds);
  };

  if (Array.isArray(value)) {
    value.forEach(addMatch);
  } else {
    addMatch(value);
  }

  return {
    atoms: [...atoms],
    bonds: [...bonds]
  };
}

export async function molInputToSvg(
  molInput: string,
  options: {
    width?: number | null;
    height?: number | null;
    highlightSmarts?: string | null;
    highlightAllMatches?: boolean;
    highlightDetails?: HighlightDetails | null;
  } = {}
): Promise<string> {
  const rdkit = await getRDKit();
  let mol: RDKitMol | null = null;
  let qmol: RDKitMol | null = null;
  const width = normalizePositiveInt(options.width);
  const height = normalizePositiveInt(options.height);
  try {
    mol = rdkit.get_mol(molInput);
    if (!mol) {
      throw new Error("Invalid molecule input.");
    }

    const smarts = (options.highlightSmarts ?? "").trim();
    const details = { ...(options.highlightDetails ?? {}) };
    const hasRequestedHighlights = smarts !== "" || Object.keys(details).length > 0;

    if (smarts) {
      qmol = rdkit.get_qmol(smarts);
      if (!qmol) {
        throw new Error(`Invalid SMARTS: ${smarts}`);
      }
      const matchDetails = options.highlightAllMatches
        ? mol.get_substruct_matches(qmol)
        : mol.get_substruct_match(qmol);
      Object.assign(details, normalizeSubstructMatchDetails(JSON.parse(matchDetails)));
    }

    if (hasRequestedHighlights && width) {
      details.width = width;
    }
    if (hasRequestedHighlights && height) {
      details.height = height;
    }

    const svg = hasRequestedHighlights
      ? mol.get_svg_with_highlights(JSON.stringify(details))
      : width || height
        ? mol.get_svg(width, height)
        : mol.get_svg();
    if (!svg) {
      throw new Error("RDKit.js returned an empty SVG for molecule input.");
    }
    return sizeSvg(svg, width, height);
  } finally {
    if (qmol) {
      qmol.delete();
    }
    if (mol) {
      mol.delete();
    }
  }
}

export async function smilesToSvg(
  smiles: string,
  options: {
    width?: number | null;
    height?: number | null;
    highlightSmarts?: string | null;
    highlightAllMatches?: boolean;
    highlightDetails?: HighlightDetails | null;
  } = {}
): Promise<string> {
  return molInputToSvg(smiles, options);
}
