import { molInputToSvg } from "./rdkit";
import type { MolSvgData, RenderContext } from "./types";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function setShell(root: HTMLElement, data: MolSvgData): void {
  root.style.minHeight = "";
  root.style.height = data.height ? `${data.height}px` : "";
  root.style.setProperty("--src-mol-height", data.height ? `${data.height}px` : "auto");
  const shouldShowInput = data.show_input ?? data.show_smiles;
  const hasHeader = Boolean(data.legend || shouldShowInput);
  root.innerHTML = `
    <section class="src-panel src-mol-svg">
      ${
        hasHeader
          ? `<div class="src-mol-header">
              <div>
                ${data.legend ? `<div class="src-title">${escapeHtml(data.legend)}</div>` : ""}
                ${
                  shouldShowInput
                    ? `<div class="src-smiles">${escapeHtml(data.mol_input ?? data.smiles)}</div>`
                    : ""
                }
              </div>
            </div>`
          : ""
      }
      <div class="src-mol-body" data-role="mol-body">
        <div class="src-placeholder">No molecule input provided.</div>
      </div>
      <div class="src-actions" data-role="mol-actions"></div>
    </section>
  `;
}

function fitSvgViewBoxToContent(container: HTMLElement): void {
  const svg = container.querySelector<SVGSVGElement>("svg");
  if (!svg || typeof svg.getBBox !== "function") {
    return;
  }

  try {
    const box = svg.getBBox();
    if (!Number.isFinite(box.width) || !Number.isFinite(box.height)) {
      return;
    }
    if (box.width <= 0 || box.height <= 0) {
      return;
    }

    const padding = Math.max(box.width, box.height) * 0.05;
    svg.setAttribute(
      "viewBox",
      [
        box.x - padding,
        box.y - padding,
        box.width + padding * 2,
        box.height + padding * 2
      ].join(" ")
    );
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  } catch {
    // Some browsers can fail getBBox while fonts or SVG nodes are settling.
  }
}

export async function renderMolSvg({
  root,
  data,
  api
}: RenderContext<MolSvgData>): Promise<void> {
  const molInput = (data.mol_input ?? data.smiles ?? "").trim();
  const inputFormat = data.input_format ?? (data.smiles ? "smiles" : "auto");
  setShell(root, data);

  const body = root.querySelector<HTMLElement>('[data-role="mol-body"]');
  const actions = root.querySelector<HTMLElement>('[data-role="mol-actions"]');
  if (!body || !actions) {
    return;
  }

  if (!molInput) {
    api.setStateValue("status", "idle");
    api.setStateValue("error", null);
    api.setFrameHeight();
    return;
  }

  api.setStateValue("status", "loading");
  api.setStateValue("error", null);
  body.innerHTML = `<div class="src-loading">Loading RDKit.js...</div>`;
  api.setFrameHeight();

  try {
    const fallbackSvgSize = data.height;
    const svgHeight = data.svg_height ?? fallbackSvgSize;
    const svgWidth = data.svg_width ?? svgHeight;
    const svg = await molInputToSvg(molInput, {
      width: svgWidth,
      height: svgHeight,
      highlightSmarts: data.highlight_smarts,
      highlightAllMatches: data.highlight_all_matches,
      highlightDetails: data.highlight_details
    });
    body.innerHTML = `<div class="src-svg-wrap">${svg}</div>`;
    fitSvgViewBoxToContent(body);
    api.setStateValue("status", "ok");
    api.setStateValue("error", null);

    if (data.enable_export) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "src-button";
      button.textContent = "Export SVG";
      button.addEventListener("click", () => {
        api.setTriggerValue("action", {
          type: "export_svg",
          smiles: inputFormat === "smiles" ? molInput : data.smiles,
          mol_input: molInput,
          input_format: inputFormat,
          svg
        });
      });
      actions.replaceChildren(button);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to render molecule.";
    body.innerHTML = `
      <div class="src-error">
        <strong>Invalid molecule input or RDKit.js error</strong>
        <span>${escapeHtml(message)}</span>
      </div>
    `;
    api.setStateValue("status", "error");
    api.setStateValue("error", message);
  } finally {
    api.setFrameHeight();
  }
}
