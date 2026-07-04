import styleText from "./style.css?inline";
import { renderMolSvg } from "./molSvg";
import { renderMoleculeGrid } from "./moleculeGrid";
import { renderMoleculeDetail } from "./moleculeDetail";
import type { ComponentApi, ComponentData, FrontendComponent } from "./types";

function rootElement(parentElement: HTMLElement | ShadowRoot): HTMLElement {
  const existing = parentElement.querySelector?.("#st-rdkit-components-root");
  if (existing instanceof HTMLElement) {
    existing.replaceChildren();
    return existing;
  }
  const root = document.createElement("div");
  root.id = "st-rdkit-components-root";
  parentElement.append(root);
  return root;
}

function injectStyle(parentElement: HTMLElement | ShadowRoot): void {
  if (parentElement.querySelector?.("#st-rdkit-components-style")) {
    return;
  }
  const style = document.createElement("style");
  style.id = "st-rdkit-components-style";
  style.textContent = styleText;
  parentElement.prepend(style);
}

function api(component: FrontendComponent): ComponentApi {
  return {
    setStateValue(name: string, value: unknown): void {
      component.setStateValue(name, value);
    },
    setTriggerValue(name: string, value: unknown): void {
      component.setTriggerValue(name, value);
    },
    setFrameHeight(): void {
      return undefined;
    }
  };
}

function coerceData(raw: unknown): ComponentData | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const maybe = raw as Record<string, unknown>;
  const data =
    maybe.data && typeof maybe.data === "object"
      ? (maybe.data as Record<string, unknown>)
      : maybe;
  if (
    data.component_type === "mol_svg" ||
    data.component_type === "molecule_grid" ||
    data.component_type === "molecule_detail"
  ) {
    return data as unknown as ComponentData;
  }
  return null;
}

async function render(component: FrontendComponent, data: ComponentData): Promise<void> {
  injectStyle(component.parentElement);
  const root = rootElement(component.parentElement);
  const componentApi = api(component);
  try {
    if (data.component_type === "mol_svg") {
      await renderMolSvg({ root, data, api: componentApi });
    } else if (data.component_type === "molecule_grid") {
      await renderMoleculeGrid({ root, data, api: componentApi });
    } else if (data.component_type === "molecule_detail") {
      await renderMoleculeDetail({ root, data, api: componentApi });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to render component.";
    root.innerHTML = `<div class="src-error"><strong>st-rdkit-components</strong><span>${message}</span></div>`;
    componentApi.setFrameHeight();
  }
}

export default function stRdkitComponents(component: FrontendComponent): () => void {
  const data = coerceData(component.data);
  injectStyle(component.parentElement);
  if (data) {
    void render(component, data);
  } else {
    const root = rootElement(component.parentElement);
    root.innerHTML = `<div class="src-placeholder">Waiting for Streamlit data.</div>`;
  }
  return () => {
    const root = component.parentElement.querySelector?.("#st-rdkit-components-root");
    root?.remove();
  };
}
