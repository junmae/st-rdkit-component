import streamlit as st

from st_rdkit_components import mol_svg, molecule_detail, molecule_grid


st.set_page_config(page_title="st-rdkit-components demo", layout="wide")
st.title("st-rdkit-components")

smiles = st.text_input("SMILES", value="CC(=O)Oc1ccccc1C(=O)O")

single = mol_svg(
    smiles=smiles,
    legend="Single molecule",
    show_smiles=True,
    enable_export=True,
    svg_width=420,
    svg_height=240,
    height=320,
    key="mol_svg_demo",
)

with st.expander("mol_svg result", expanded=True):
    st.write(single)

records = [
    {"id": "ST0000001-000", "smiles": "CCO", "name": "Ethanol", "mw": 46.07},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {
        "id": "ST0000003-000",
        "smiles": "CC(=O)Oc1ccccc1C(=O)O",
        "name": "Aspirin",
        "mw": 180.16,
    },
    {"id": "BAD-000", "smiles": "not_a_smiles", "name": "Invalid example", "mw": None},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
    {"id": "ST0000002-000", "smiles": "c1ccccc1", "name": "Benzene", "mw": 78.11},
]

st.subheader("Molecule grid")
grid = molecule_grid(
    records=records,
    id_col="id",
    smiles_col="smiles",
    title_col="name",
    subtitle_cols=["mw"],
    actions=["detail", "copy_smiles", "export_svg"],
    selectable="single",
    svg_width=120,
    svg_height=120,
    height=600,
    key="mol_grid_demo",
)

cols = st.columns(2)
cols[0].write(
    {
        "selected_id": grid.selected_id,
        "selected_ids": grid.selected_ids,
        "event_id": grid.event_id,
    }
)
cols[1].write({"action": grid.action, "errors": grid.errors})

selected = next(
    (record for record in records if record["id"] == grid.selected_id),
    records[0],
)

with st.bottom:
    st.subheader("Molecule detail")
    detail = molecule_detail(
        record={**selected, "formula": "C2H6O" if selected["id"] == "ST0000001-000" else ""},
        id_col="id",
        smiles_col="smiles",
        title_col="name",
        fields=["id", "smiles", "mw", "formula"],
        actions=["export_svg", "copy_smiles"],
        height=300,
        key="mol_detail_demo",
    )
    # st.write(detail)
