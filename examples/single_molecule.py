import streamlit as st

from st_rdkit_components import mol_svg


st.title("Single molecule")

smiles = st.text_input("SMILES", "CCO")
result = mol_svg(
    smiles=smiles,
    legend="Molecule",
    show_smiles=True,
    enable_export=True,
    svg_width=420,
    svg_height=300,
    height=320,
    key="single_molecule",
)

st.write(result)
