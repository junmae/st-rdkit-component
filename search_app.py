from __future__ import annotations

from time import perf_counter

import streamlit as st

from st_rdkit_components import molecule_detail, molecule_grid


try:
    from rdkit import Chem
    from rdkit.Chem import Descriptors, rdMolDescriptors
except ImportError:  # pragma: no cover - shown in Streamlit runtime.
    Chem = None
    Descriptors = None
    rdMolDescriptors = None


SEED_MOLECULES = [
    ("MOL-001", "Aspirin", "CC(=O)Oc1ccccc1C(=O)O"),
    ("MOL-002", "Acetaminophen", "CC(=O)Nc1ccc(O)cc1"),
    ("MOL-003", "Caffeine", "Cn1cnc2c1c(=O)n(C)c(=O)n2C"),
    ("MOL-004", "Ibuprofen", "CC(C)Cc1ccc(cc1)C(C)C(=O)O"),
    ("MOL-005", "Naproxen", "COc1ccc2cc(ccc2c1)C(C)C(=O)O"),
    ("MOL-006", "Benzene", "c1ccccc1"),
    ("MOL-007", "Toluene", "Cc1ccccc1"),
    ("MOL-008", "Phenol", "Oc1ccccc1"),
    ("MOL-009", "Aniline", "Nc1ccccc1"),
    ("MOL-010", "Benzoic acid", "O=C(O)c1ccccc1"),
    ("MOL-011", "Ethyl acetate", "CCOC(=O)C"),
    ("MOL-012", "Acetic acid", "CC(=O)O"),
    ("MOL-013", "Ethanol", "CCO"),
    ("MOL-014", "Triethylamine", "CCN(CC)CC"),
    ("MOL-015", "Pyridine", "n1ccccc1"),
    ("MOL-016", "Imidazole", "c1ncc[nH]1"),
    ("MOL-017", "Cyclohexane", "C1CCCCC1"),
    ("MOL-018", "Morpholine", "C1COCCN1"),
    ("MOL-019", "Nicotine", "CN1CCC[C@H]1c2cccnc2"),
    ("MOL-020", "Lidocaine", "CCN(CC)CC(=O)Nc1c(C)cccc1C"),
]

EXAMPLE_QUERIES = {
    "no filter": "",
    "benzene ring": "c1ccccc1",
    "carboxylic acid": "C(=O)[OH]",
    "amide": "C(=O)N",
    "amine": "[NX3;H2,H1,H0;!$(NC=O)]",
    "hetero aromatic atom": "[n,o,s]",
    "alcohol / phenol OH": "[OX2H]",
}

DATASET_SIZES = [20, 100, 500, 1000]
PAGE_SIZES = [20, 50, 100, 200]
PAGE_STATE_KEY = "substructure_search_page"


def require_rdkit() -> bool:
    if Chem is not None:
        return True
    st.error(
        "Python RDKit is not available. Add `rdkit` to the Snowflake Streamlit "
        "environment before running this app."
    )
    return False


@st.cache_data(show_spinner=False)
def build_records(record_count: int) -> tuple[list[dict[str, object]], dict[str, object]]:
    start = perf_counter()
    records: list[dict[str, object]] = []
    assert Chem is not None
    assert Descriptors is not None
    assert rdMolDescriptors is not None

    invalid_count = 0
    for index in range(record_count):
        source_id, name, smiles = SEED_MOLECULES[index % len(SEED_MOLECULES)]
        batch = index // len(SEED_MOLECULES)
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            invalid_count += 1
            continue
        canonical_smiles = Chem.MolToSmiles(mol)
        records.append(
            {
                "id": f"MOL-{index + 1:05d}",
                "source_id": source_id,
                "name": f"{name} #{batch + 1}",
                "smiles": canonical_smiles,
                "mw": round(Descriptors.MolWt(mol), 2),
                "formula": rdMolDescriptors.CalcMolFormula(mol),
                "heavy_atoms": mol.GetNumHeavyAtoms(),
                "rings": rdMolDescriptors.CalcNumRings(mol),
                "hba": rdMolDescriptors.CalcNumHBA(mol),
                "hbd": rdMolDescriptors.CalcNumHBD(mol),
                "logp": round(Descriptors.MolLogP(mol), 2),
            }
        )
    elapsed_ms = round((perf_counter() - start) * 1000, 1)
    stats = {
        "requested": record_count,
        "valid": len(records),
        "invalid": invalid_count,
        "preprocess_ms": elapsed_ms,
        "python_rdkit_ops": [
            "MolFromSmiles",
            "MolToSmiles",
            "MolWt",
            "CalcMolFormula",
            "CalcNumRings",
            "CalcNumHBA",
            "CalcNumHBD",
            "MolLogP",
        ],
    }
    return records, stats


def search_records(
    records: list[dict[str, object]],
    query: str,
) -> tuple[list[dict[str, object]], str | None, dict[str, object]]:
    assert Chem is not None
    start = perf_counter()
    query = query.strip()
    if not query:
        return records, None, {
            "query_ms": 0.0,
            "python_rdkit_ops": [],
        }

    pattern = Chem.MolFromSmarts(query)
    if pattern is None:
        return [], f"Invalid SMARTS: {query}", {
            "query_ms": round((perf_counter() - start) * 1000, 1),
            "python_rdkit_ops": ["MolFromSmarts"],
        }

    matches: list[dict[str, object]] = []
    for record in records:
        mol = Chem.MolFromSmiles(str(record["smiles"]))
        if mol is not None and mol.HasSubstructMatch(pattern):
            matches.append(record)
    elapsed_ms = round((perf_counter() - start) * 1000, 1)
    return matches, None, {
        "query_ms": elapsed_ms,
        "python_rdkit_ops": ["MolFromSmarts", "MolFromSmiles", "HasSubstructMatch"],
    }


def paginate_records(
    records: list[dict[str, object]],
    page: int,
    page_size: int,
) -> tuple[list[dict[str, object]], dict[str, int]]:
    total = len(records)
    total_pages = max(1, (total + page_size - 1) // page_size)
    current_page = min(max(page, 1), total_pages)
    start = (current_page - 1) * page_size
    end = start + page_size
    page_records = records[start:end]
    return page_records, {
        "page": current_page,
        "page_size": page_size,
        "total_pages": total_pages,
        "start": start + 1 if page_records else 0,
        "end": min(end, total),
        "total": total,
    }


st.set_page_config(page_title="RDKit Snowflake smoke test", layout="wide")
st.title("RDKit Snowflake smoke test")

if require_rdkit():
    st.session_state.setdefault(PAGE_STATE_KEY, 1)

    settings = st.columns([0.25, 0.25, 0.5])
    record_count = settings[0].selectbox(
        "Dummy dataset size",
        options=DATASET_SIZES,
        index=1,
    )
    grid_height = settings[1].number_input(
        "Grid height",
        min_value=300,
        max_value=1200,
        value=650,
        step=50,
    )

    records, preprocess_stats = build_records(record_count)

    controls = st.columns([0.35, 0.65])
    example_label = controls[0].selectbox(
        "Example SMARTS",
        options=list(EXAMPLE_QUERIES),
        index=0,
    )
    default_query = EXAMPLE_QUERIES[example_label]
    query = controls[1].text_input(
        "SMARTS query",
        value=default_query,
        placeholder="e.g. c1ccccc1",
    )

    filtered_records, error, search_stats = search_records(records, query)
    if error:
        st.error(error)

    pager_controls = st.columns([0.18, 0.18, 0.16, 0.16, 0.16, 0.16])
    page_size = pager_controls[0].selectbox(
        "Page size",
        options=PAGE_SIZES,
        index=1,
    )
    total_pages = max(1, (len(filtered_records) + page_size - 1) // page_size)

    if st.session_state[PAGE_STATE_KEY] > total_pages:
        st.session_state[PAGE_STATE_KEY] = total_pages
    if st.session_state[PAGE_STATE_KEY] < 1:
        st.session_state[PAGE_STATE_KEY] = 1

    if pager_controls[2].button("First", use_container_width=True):
        st.session_state[PAGE_STATE_KEY] = 1
    if pager_controls[3].button("Prev", use_container_width=True):
        st.session_state[PAGE_STATE_KEY] = max(1, st.session_state[PAGE_STATE_KEY] - 1)
    if pager_controls[4].button("Next", use_container_width=True):
        st.session_state[PAGE_STATE_KEY] = min(
            total_pages,
            st.session_state[PAGE_STATE_KEY] + 1,
        )
    if pager_controls[5].button("Last", use_container_width=True):
        st.session_state[PAGE_STATE_KEY] = total_pages

    page = pager_controls[1].number_input(
        "Page",
        min_value=1,
        max_value=total_pages,
        step=1,
        key=PAGE_STATE_KEY,
    )

    page_records, page_stats = paginate_records(
        filtered_records,
        page=int(page),
        page_size=int(page_size),
    )

    metrics = st.columns(5)
    metrics[0].metric("Prepared records", f"{len(records):,}")
    metrics[1].metric("Matched records", f"{len(filtered_records):,}")
    metrics[2].metric("Preprocess", f"{preprocess_stats['preprocess_ms']} ms")
    metrics[3].metric("Search", f"{search_stats['query_ms']} ms")
    metrics[4].metric("Displayed page", f"{len(page_records):,}")

    with st.expander("Python RDKit preprocessing check", expanded=False):
        st.write(
            {
                "preprocess_ops": preprocess_stats["python_rdkit_ops"],
                "search_ops": search_stats["python_rdkit_ops"],
            }
        )
        st.dataframe(records[:20], use_container_width=True, hide_index=True)

    st.caption(
        f"Showing {page_stats['start']:,}-{page_stats['end']:,} of "
        f"{page_stats['total']:,} matched molecules. "
        f"Only {len(page_records):,} records are passed to molecule_grid."
    )
    grid = molecule_grid(
        records=page_records,
        id_col="id",
        smiles_col="smiles",
        title_col="name",
        subtitle_cols=["formula", "mw", "rings", "hba", "hbd", "logp"],
        actions=["detail", "copy_smiles", "export_svg"],
        selectable="single",
        svg_width=180,
        svg_height=140,
        height=int(grid_height),
        key="substructure_search_grid",
    )

    st.write(
        {
            "selected_id": grid.selected_id,
            "selected_ids": grid.selected_ids,
            "event_id": grid.event_id,
            "action": grid.action,
        }
    )

    if grid.selected_id is not None:
        selected = next(
            (record for record in page_records if record["id"] == grid.selected_id),
            None,
        )
        if selected is not None:
            st.subheader("Selected molecule")
            molecule_detail(
                record=selected,
                id_col="id",
                smiles_col="smiles",
                title_col="name",
                fields=[
                    "id",
                    "source_id",
                    "smiles",
                    "formula",
                    "mw",
                    "heavy_atoms",
                    "rings",
                    "hba",
                    "hbd",
                    "logp",
                ],
                actions=["copy_smiles", "export_svg"],
                height=360,
                key=f"substructure_search_detail_{selected['id']}",
            )
