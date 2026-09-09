export type ComponentType = "mol_svg" | "molecule_grid" | "molecule_detail";
export type MolInputFormat = "smiles" | "molfile" | "json" | "smarts" | "auto";

export interface BaseData {
  component_type?: ComponentType;
  height?: number;
}

export interface MolSvgData extends BaseData {
  component_type: "mol_svg";
  smiles?: string;
  mol_input?: string | null;
  input_format?: MolInputFormat | null;
  legend?: string | null;
  show_smiles?: boolean;
  show_input?: boolean;
  enable_export?: boolean;
  highlight_smarts?: string | null;
  highlight_all_matches?: boolean;
  highlight_details?: HighlightDetails | null;
  svg_width?: number | null;
  svg_height?: number | null;
}

export interface HighlightDetails {
  atoms?: number[];
  bonds?: number[];
  [key: string]: unknown;
}

export interface MoleculeRecord {
  [key: string]: unknown;
}

export interface MoleculeGridData extends BaseData {
  component_type: "molecule_grid";
  records?: MoleculeRecord[];
  id_col?: string;
  smiles_col?: string;
  title_col?: string | null;
  subtitle_cols?: string[];
  actions?: string[];
  selectable?: "single" | "multi" | "none";
  svg_width?: number | null;
  svg_height?: number | null;
}

export interface MoleculeDetailData extends BaseData {
  component_type: "molecule_detail";
  record?: MoleculeRecord;
  id_col?: string;
  smiles_col?: string;
  title_col?: string | null;
  fields?: string[];
  actions?: string[];
}

export type ComponentData = MolSvgData | MoleculeGridData | MoleculeDetailData;

export interface ComponentApi {
  setStateValue: (name: string, value: unknown) => void;
  setTriggerValue: (name: string, value: unknown) => void;
  setFrameHeight: () => void;
}

export interface FrontendComponent {
  data?: unknown;
  parentElement: HTMLElement | ShadowRoot;
  setStateValue: (name: string, value: unknown) => void;
  setTriggerValue: (name: string, value: unknown) => void;
}

export interface RenderContext<T extends ComponentData = ComponentData> {
  root: HTMLElement;
  data: T;
  api: ComponentApi;
}

export interface RDKitMol {
  get_svg: (width?: number, height?: number) => string;
  get_svg_with_highlights: (details: string) => string;
  get_substruct_match: (query: RDKitMol) => string;
  get_substruct_matches: (query: RDKitMol) => string;
  delete: () => void;
}

export interface RDKitModule {
  get_mol: (input: string) => RDKitMol | null;
  get_qmol: (smarts: string) => RDKitMol | null;
}

declare global {
  interface Window {
    initRDKitModule?: (options?: {
      locateFile?: (path: string, prefix?: string) => string;
    }) => Promise<RDKitModule> | RDKitModule;
    Streamlit?: {
      RENDER_EVENT?: string;
      setComponentReady?: () => void;
      setFrameHeight?: (height?: number) => void;
      setComponentValue?: (value: unknown) => void;
      setStateValue?: (name: string, value: unknown) => void;
      setTriggerValue?: (name: string, value: unknown) => void;
    };
    streamlitComponent?: {
      data?: unknown;
      setStateValue?: (name: string, value: unknown) => void;
      setTriggerValue?: (name: string, value: unknown) => void;
      setFrameHeight?: () => void;
    };
    __ST_RDKIT_COMPONENT_DATA__?: unknown;
  }
}
