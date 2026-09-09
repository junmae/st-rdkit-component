import streamlit as st

from st_rdkit_components import mol_svg


st.title("Single molecule")

input_format = st.selectbox(
    "Input format",
    ["smiles", "molfile", "json", "smarts", "auto"],
)
mol_input = st.text_area("Molecule input", "CCO", height=96)
highlight_smarts = st.text_input("Highlight SMARTS", "")
highlight_all_matches = st.checkbox("Highlight all matches", value=False)
result = mol_svg(
    mol_input=mol_input,
    input_format=input_format,
    legend="Molecule",
    show_input=True,
    enable_export=True,
    highlight_smarts=highlight_smarts or None,
    highlight_all_matches=highlight_all_matches,
    svg_width=420,
    svg_height=300,
    height=320,
    key="single_molecule",
)

st.write(result)
