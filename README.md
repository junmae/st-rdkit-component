# st-rdkit-components

Streamlit custom component v2 package for rendering SMILES in the browser with bundled RDKit.js. The Python side only passes data; molecule parsing and SVG generation happen in JavaScript.

This package is intended for Streamlit in Snowflake container runtime, where external CDN loading is often unsuitable. `RDKIT_minimal_csp.js` and `RDKIT_minimal_csp.wasm` are bundled into the component JavaScript at build time.

## Install

```bash
pip install st-rdkit-components
```

For local development:

```bash
/Users/junya/opt/miniconda3/envs/streamlit158/bin/python -m pip install -e .
cd st_rdkit_components/frontend
npm install
npm run build
npm run csp-check
cd ../..
/Users/junya/opt/miniconda3/envs/streamlit158/bin/streamlit run app.py
```

## RDKit.js assets

The frontend build expects these files:

```text
st_rdkit_components/frontend/public/RDKIT_minimal_csp.js
st_rdkit_components/frontend/public/RDKIT_minimal_csp.wasm
```

`npm run build` runs `scripts/copy_rdkit_assets.mjs`, which reads the CSP-safe RDKit.js files from `frontend/public/` and embeds them into the generated `index-*.js` bundle. The Streamlit component does not fetch a separate RDKit JavaScript or wasm file at runtime.

If the files are missing, place them manually in `frontend/public/` and rerun:

```bash
cd st_rdkit_components/frontend
npm run build
```

## Usage

```python
from st_rdkit_components import mol_svg

result = mol_svg(
    mol_input="CC(=O)Oc1ccccc1C(=O)O",
    input_format="smiles",
    legend="Aspirin",
    show_input=True,
    enable_export=True,
    highlight_smarts="O=C",
    highlight_all_matches=True,
    highlight_details={"highlightColour": [1, 0, 1]},
    svg_width=420,
    svg_height=320,
    height=320,
    key="mol_svg",
)

result.status  # "idle" | "loading" | "ok" | "error"
result.error
result.action
```

`smiles="CCO"` is still supported as a backward-compatible shortcut for `mol_input="CCO", input_format="smiles"`.

`height` controls the Streamlit component height. For `mol_svg`, it is also used as the default SVG drawing size. Use `svg_width` and `svg_height` when you want explicit molecule drawing dimensions.

`mol_input` is passed to RDKit.js `get_mol(input)`, which accepts SMILES, SMARTS, MolFile, and JSON strings. `input_format` records the intended format in component state and export actions; RDKit.js still performs the parsing.

```python
mol_svg(
    mol_input=molfile_text,
    input_format="molfile",
    legend="MolFile input",
    show_input=True,
)
```

`highlight_smarts` highlights substructure matches using RDKit.js SMARTS matching. By default it highlights the first match; set `highlight_all_matches=True` to highlight every match. Multiple matches are merged into one atom/bond highlight set. `highlight_details` is passed to RDKit.js `get_svg_with_highlights`, so it can also be used for manual highlights and drawing options:

```python
mol_svg(
    smiles="CC(=O)Oc1ccccc1C(=O)O",
    highlight_smarts="Oc1[c,n]cccc1",
    highlight_all_matches=True,
    highlight_details={
        "highlightColour": [1, 0, 1],
        "addAtomIndices": True,
    },
)

mol_svg(
    smiles="CC(=O)Oc1ccccc1C(=O)O",
    highlight_details={"atoms": [0, 1, 10], "bonds": [0]},
)
```

`result.action` contains SVG only when the user clicks Export SVG:

```json
{
  "type": "export_svg",
  "smiles": "CCO",
  "svg": "<svg ...>...</svg>"
}
```

## Grid

```python
from st_rdkit_components import molecule_grid

records = [
    {"id": "ST0000001-000", "smiles": "CCO", "name": "Ethanol", "mw": 46.07},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
]

result = molecule_grid(
    records=records,
    id_col="id",
    smiles_col="smiles",
    title_col="name",
    subtitle_cols=["mw"],
    actions=["detail", "copy_smiles", "export_svg"],
    selectable="single",
    svg_width=260,
    svg_height=180,
    height=600,
    key="mol_grid",
)

result.selected_id
result.selected_ids
result.event_id
result.action
result.errors
```

`event_id` changes on every card click, even when the clicked card is already selected. This is useful when Python needs to detect repeated clicks.

## Detail

```python
from st_rdkit_components import molecule_detail

result = molecule_detail(
    record={
        "id": "ST0000001-000",
        "smiles": "CCO",
        "name": "Ethanol",
        "mw": 46.07,
        "formula": "C2H6O",
    },
    id_col="id",
    smiles_col="smiles",
    title_col="name",
    fields=["id", "smiles", "mw", "formula"],
    actions=["export_svg", "copy_smiles"],
    height=500,
    key="mol_detail",
)
```

## Development

Frontend commands:

```bash
cd st_rdkit_components/frontend
npm install
npm run build
npm run csp-check
```

`npm run csp-check` scans built JavaScript for:

- `eval(`
- `new Function`
- `Function(`
- `importScripts(`

The command prints warnings instead of failing. Snowflake Streamlit container runtime may block RDKit.js builds that use these constructs.

## Snowflake notes

- RDKit.js and wasm are bundled into the component JavaScript, not loaded from an external CDN.
- The Python package does not depend on the RDKit Python package.
- The component renders only visible records. It is not designed for drawing 100,000 molecules at once.
- SVG strings are not returned to Python during normal rendering. They are returned only through explicit export actions.
- Invalid molecule inputs are handled in JavaScript and shown inside the component; error state is also sent back to Python.
- If the RDKit.js build uses `eval`, `new Function`, or `importScripts`, Snowflake CSP may prevent it from running.

## Demo

```bash
/Users/junya/opt/miniconda3/envs/streamlit158/bin/streamlit run app.py
```
