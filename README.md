# st-rdkit-components

Streamlit custom component v2 package for rendering SMILES in the browser with bundled RDKit.js. The Python side only passes data; molecule parsing and SVG generation happen in JavaScript.

This package is intended for Streamlit in Snowflake container runtime, where external CDN loading is often unsuitable. `RDKit_minimal.js` and `RDKit_minimal.wasm` are shipped as static component assets.

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
st_rdkit_components/frontend/public/RDKit_minimal.js
st_rdkit_components/frontend/public/RDKit_minimal.wasm
```

After `npm install`, `npm run build` runs `scripts/copy_rdkit_assets.mjs`. It searches likely `@rdkit/rdkit` package paths and copies the two files into `frontend/public/`.

If your `@rdkit/rdkit` package layout differs, place the two files manually in `frontend/public/` and rerun:

```bash
cd st_rdkit_components/frontend
npm run build
```

## Usage

```python
from st_rdkit_components import mol_svg

result = mol_svg(
    smiles="CC(=O)Oc1ccccc1C(=O)O",
    legend="Aspirin",
    show_smiles=True,
    enable_export=True,
    svg_width=420,
    svg_height=320,
    height=320,
    key="mol_svg",
)

result.status  # "idle" | "loading" | "ok" | "error"
result.error
result.action
```

`height` controls the Streamlit component height. For `mol_svg`, it is also used as the default SVG drawing size. Use `svg_width` and `svg_height` when you want explicit molecule drawing dimensions.

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

`npm run csp-check` scans built JavaScript and bundled `RDKit_minimal.js` for:

- `eval(`
- `new Function`
- `Function(`
- `importScripts(`

The command prints warnings instead of failing. Snowflake Streamlit container runtime may block RDKit.js builds that use these constructs.

## Snowflake notes

- RDKit.js and wasm are loaded from component static assets, not an external CDN.
- The Python package does not depend on the RDKit Python package.
- The component renders only visible records. It is not designed for drawing 100,000 molecules at once.
- SVG strings are not returned to Python during normal rendering. They are returned only through explicit export actions.
- Invalid SMILES are handled in JavaScript and shown inside the component; error state is also sent back to Python.
- If the RDKit.js build uses `eval`, `new Function`, or `importScripts`, Snowflake CSP may prevent it from running.

## Demo

```bash
/Users/junya/opt/miniconda3/envs/streamlit158/bin/streamlit run app.py
```
