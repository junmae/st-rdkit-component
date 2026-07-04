import { smilesToSvg } from "./rdkit";
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
  root.style.minHeight = data.height ? `${data.height}px` : "";
  root.innerHTML = `
    <section class="src-panel src-mol-svg">
      <div class="src-mol-header">
        <div>
          ${data.legend ? `<div class="src-title">${escapeHtml(data.legend)}</div>` : ""}
          ${
            data.show_smiles
              ? `<div class="src-smiles">${escapeHtml(data.smiles)}</div>`
              : ""
          }
        </div>
      </div>
      <div class="src-mol-body" data-role="mol-body">
        <div class="src-placeholder">No SMILES provided.</div>
      </div>
      <div class="src-actions" data-role="mol-actions"></div>
    </section>
  `;
}

export async function renderMolSvg({
  root,
  data,
  api
}: RenderContext<MolSvgData>): Promise<void> {
  const smiles = (data.smiles ?? "").trim();
  setShell(root, data);

  const body = root.querySelector<HTMLElement>('[data-role="mol-body"]');
  const actions = root.querySelector<HTMLElement>('[data-role="mol-actions"]');
  if (!body || !actions) {
    return;
  }

  if (!smiles) {
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
    const svg = await smilesToSvg(smiles, {
      width: svgWidth,
      height: svgHeight
    });
    body.innerHTML = `<div class="src-svg-wrap">${svg}</div>`;
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
          smiles,
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
        <strong>Invalid SMILES or RDKit.js error</strong>
        <span>${escapeHtml(message)}</span>
      </div>
    `;
    api.setStateValue("status", "error");
    api.setStateValue("error", message);
  } finally {
    api.setFrameHeight();
  }
}
