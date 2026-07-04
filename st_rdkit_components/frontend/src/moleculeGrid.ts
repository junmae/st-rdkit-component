import { smilesToSvg } from "./rdkit";
import { escapeHtml } from "./molSvg";
import type { MoleculeGridData, MoleculeRecord, RenderContext } from "./types";

const SVG_CACHE_LIMIT = 500;
const svgCache = new Map<string, string>();
let selectedIds = new Set<string>();

function createEventId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function valueOf(record: MoleculeRecord, column: string | null | undefined): string {
  if (!column) {
    return "";
  }
  const value = record[column];
  return value == null ? "" : String(value);
}

function cacheSvg(smiles: string, svg: string): void {
  if (svgCache.has(smiles)) {
    svgCache.delete(smiles);
  }
  svgCache.set(smiles, svg);
  while (svgCache.size > SVG_CACHE_LIMIT) {
    const oldest = svgCache.keys().next().value;
    if (oldest == null) {
      break;
    }
    svgCache.delete(oldest);
  }
}

function cacheKey(smiles: string, width?: number | null, height?: number | null): string {
  return `${smiles}::${width ?? ""}x${height ?? ""}`;
}

async function getCachedSvg(
  smiles: string,
  width?: number | null,
  height?: number | null
): Promise<string> {
  const key = cacheKey(smiles, width, height);
  const cached = svgCache.get(key);
  if (cached) {
    svgCache.delete(key);
    svgCache.set(key, cached);
    return cached;
  }
  const svg = await smilesToSvg(smiles, { width, height });
  cacheSvg(key, svg);
  return svg;
}

function emitSelection(
  data: MoleculeGridData,
  api: RenderContext["api"],
  root: HTMLElement,
  eventId?: string
): void {
  const ids = [...selectedIds];
  api.setStateValue("selected_ids", ids);
  api.setStateValue("selected_id", ids[0] ?? null);
  if (eventId) {
    api.setStateValue("event_id", eventId);
  }

  const cards = root.querySelectorAll<HTMLElement>("[data-src-card-id]");
  cards.forEach((card) => {
    const id = card.dataset.srcCardId ?? "";
    const isSelected = selectedIds.has(id);
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-selected", String(isSelected));
  });

  if (data.selectable === "none") {
    api.setStateValue("selected_ids", []);
    api.setStateValue("selected_id", null);
  }
}

function actionButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "src-button src-button-small";
  button.textContent = label;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

export async function renderMoleculeGrid({
  root,
  data,
  api
}: RenderContext<MoleculeGridData>): Promise<void> {
  const records = Array.isArray(data.records) ? data.records : [];
  const idCol = data.id_col ?? "id";
  const smilesCol = data.smiles_col ?? "smiles";
  const subtitleCols = data.subtitle_cols ?? [];
  const actions = new Set(data.actions ?? []);
  const selectable = data.selectable ?? "single";
  const svgWidth = data.svg_width ?? null;
  const svgHeight = data.svg_height ?? null;
  const errors: Array<{ id: string; smiles: string; error: string }> = [];

  root.style.minHeight = data.height ? `${data.height}px` : "";
  root.style.setProperty(
    "--src-grid-card-min-width",
    `${Math.max(180, Math.round(svgWidth ?? 180))}px`
  );
  root.style.setProperty(
    "--src-grid-svg-min-height",
    `${Math.max(128, Math.round(svgHeight ?? 128))}px`
  );
  root.innerHTML = `
    <section class="src-panel src-grid-panel">
      <div class="src-grid" data-role="grid"></div>
    </section>
  `;

  const grid = root.querySelector<HTMLElement>('[data-role="grid"]');
  if (!grid) {
    return;
  }

  if (records.length === 0) {
    grid.innerHTML = `<div class="src-placeholder">No records.</div>`;
    api.setStateValue("errors", []);
    api.setFrameHeight();
    return;
  }

  for (const record of records) {
    const id = valueOf(record, idCol);
    const smiles = valueOf(record, smilesCol);
    const title = valueOf(record, data.title_col) || id || smiles;
    const subtitles = subtitleCols
      .map((column) => [column, valueOf(record, column)] as const)
      .filter(([, value]) => value !== "");

    const card = document.createElement("article");
    card.className = "src-card";
    card.dataset.srcCardId = id;
    card.setAttribute("aria-selected", String(selectedIds.has(id)));
    if (selectedIds.has(id)) {
      card.classList.add("is-selected");
    }
    card.innerHTML = `
      <div class="src-card-svg" data-role="card-svg">
        <div class="src-loading">Loading...</div>
      </div>
      <div class="src-card-text">
        <div class="src-card-title">${escapeHtml(title)}</div>
        <div class="src-smiles">${escapeHtml(smiles)}</div>
        ${
          subtitles.length
            ? `<dl class="src-meta">${subtitles
                .map(
                  ([column, value]) =>
                    `<div><dt>${escapeHtml(column)}</dt><dd>${escapeHtml(value)}</dd></div>`
                )
                .join("")}</dl>`
            : ""
        }
      </div>
      <div class="src-actions" data-role="card-actions"></div>
    `;

    if (selectable !== "none") {
      card.tabIndex = 0;
      card.setAttribute("role", selectable === "multi" ? "checkbox" : "button");
      card.addEventListener("click", () => {
        if (selectable === "multi") {
          if (selectedIds.has(id)) {
            selectedIds.delete(id);
          } else {
            selectedIds.add(id);
          }
        } else {
          selectedIds = new Set([id]);
        }
        emitSelection(data, api, root, createEventId());
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          card.click();
        }
      });
    }

    const cardActions = card.querySelector<HTMLElement>('[data-role="card-actions"]');
    if (cardActions) {
      if (actions.has("detail")) {
        cardActions.append(
          actionButton("Detail", () => {
            api.setTriggerValue("action", { type: "detail", id });
          })
        );
      }
      if (actions.has("copy_smiles")) {
        cardActions.append(
          actionButton("Copy SMILES", () => {
            void navigator.clipboard?.writeText(smiles).catch(() => undefined);
            api.setTriggerValue("action", { type: "copy_smiles", id, smiles });
          })
        );
      }
      if (actions.has("export_svg")) {
        cardActions.append(
          actionButton("Export SVG", async () => {
            const svg = await getCachedSvg(smiles, svgWidth, svgHeight);
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

    grid.append(card);

    const svgTarget = card.querySelector<HTMLElement>('[data-role="card-svg"]');
    if (!smiles) {
      const message = "Missing SMILES.";
      errors.push({ id, smiles, error: message });
      if (svgTarget) {
        svgTarget.innerHTML = `<div class="src-error">${escapeHtml(message)}</div>`;
      }
      continue;
    }

    void getCachedSvg(smiles, svgWidth, svgHeight)
      .then((svg) => {
        if (svgTarget) {
          svgTarget.innerHTML = `<div class="src-svg-wrap">${svg}</div>`;
        }
      })
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to render molecule.";
        errors.push({ id, smiles, error: message });
        api.setStateValue("errors", errors);
        if (svgTarget) {
          svgTarget.innerHTML = `<div class="src-error">${escapeHtml(message)}</div>`;
        }
      })
      .finally(() => api.setFrameHeight());
  }

  api.setStateValue("errors", errors);
  emitSelection(data, api, root);
  api.setFrameHeight();
}
