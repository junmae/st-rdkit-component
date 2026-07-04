import { smilesToSvg } from "./rdkit";
import { escapeHtml } from "./molSvg";
import type { MoleculeDetailData, MoleculeRecord, RenderContext } from "./types";

function valueOf(record: MoleculeRecord, column: string | null | undefined): string {
  if (!column) {
    return "";
  }
  const value = record[column];
  return value == null ? "" : String(value);
}

function actionButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "src-button";
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

export async function renderMoleculeDetail({
  root,
  data,
  api
}: RenderContext<MoleculeDetailData>): Promise<void> {
  const record = data.record ?? {};
  const id = valueOf(record, data.id_col ?? "id");
  const smiles = valueOf(record, data.smiles_col ?? "smiles");
  const title = valueOf(record, data.title_col) || id || "Molecule";
  const fields = data.fields ?? [];
  const actions = new Set(data.actions ?? []);

  root.style.minHeight = data.height ? `${data.height}px` : "";
  root.innerHTML = `
    <section class="src-panel src-detail">
      <div class="src-detail-main">
        <div class="src-detail-svg" data-role="detail-svg">
          <div class="src-loading">Loading RDKit.js...</div>
        </div>
        <div class="src-detail-info">
          <div class="src-title">${escapeHtml(title)}</div>
          ${id ? `<div class="src-id">${escapeHtml(id)}</div>` : ""}
          <dl class="src-field-list">
            ${fields
              .map(
                (field) =>
                  `<div><dt>${escapeHtml(field)}</dt><dd>${escapeHtml(valueOf(record, field))}</dd></div>`
              )
              .join("")}
          </dl>
          <div class="src-actions" data-role="detail-actions"></div>
        </div>
      </div>
    </section>
  `;

  api.setStateValue("selected_id", id || null);
  api.setStateValue("error", null);

  const svgTarget = root.querySelector<HTMLElement>('[data-role="detail-svg"]');
  const actionTarget = root.querySelector<HTMLElement>('[data-role="detail-actions"]');

  if (!smiles) {
    const message = "Missing SMILES.";
    api.setStateValue("error", message);
    if (svgTarget) {
      svgTarget.innerHTML = `<div class="src-error">${escapeHtml(message)}</div>`;
    }
    api.setFrameHeight();
    return;
  }

  try {
    const svg = await smilesToSvg(smiles);
    if (svgTarget) {
      svgTarget.innerHTML = `<div class="src-svg-wrap">${svg}</div>`;
    }
    if (actionTarget) {
      if (actions.has("copy_smiles")) {
        actionTarget.append(
          actionButton("Copy SMILES", () => {
            void navigator.clipboard?.writeText(smiles).catch(() => undefined);
            api.setTriggerValue("action", { type: "copy_smiles", id, smiles });
          })
        );
      }
      if (actions.has("export_svg")) {
        actionTarget.append(
          actionButton("Export SVG", () => {
            api.setTriggerValue("action", {
              type: "export_svg",
              id,
              smiles,
              svg
            });
          })
        );
      }
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to render molecule.";
    api.setStateValue("error", message);
    if (svgTarget) {
      svgTarget.innerHTML = `<div class="src-error">${escapeHtml(message)}</div>`;
    }
  } finally {
    api.setFrameHeight();
  }
}
