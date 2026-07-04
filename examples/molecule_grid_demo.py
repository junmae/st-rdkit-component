import streamlit as st

from st_rdkit_components import molecule_grid


st.title("Molecule grid")

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
    key="molecule_grid",
)

st.write(result)
