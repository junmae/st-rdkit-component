from __future__ import annotations

from dataclasses import dataclass, field
from importlib import resources
from functools import lru_cache
from pathlib import Path
from typing import Any, Mapping, Sequence

__all__ = [
    "MolSvgResult",
    "MoleculeDetailResult",
    "MoleculeGridResult",
    "mol_svg",
    "molecule_detail",
    "molecule_grid",
]


@dataclass(slots=True)
class MolSvgResult:
    status: str = "idle"
    error: str | None = None
    action: dict[str, Any] | None = None


@dataclass(slots=True)
class MoleculeGridResult:
    selected_id: str | int | None = None
    selected_ids: list[str | int] = field(default_factory=list)
    action: dict[str, Any] | None = None
    errors: list[dict[str, Any]] = field(default_factory=list)


@dataclass(slots=True)
class MoleculeDetailResult:
    selected_id: str | int | None = None
    action: dict[str, Any] | None = None
    error: str | None = None


def _noop_callback(*_: Any, **__: Any) -> None:
    return None


def _frontend_build_dir() -> Path:
    return Path(str(resources.files(__package__) / "frontend" / "build"))


def _frontend_js_glob() -> str:
    return "index-*.js"


def _ensure_component_manifest_registered() -> None:
    from streamlit.components.v2 import get_bidi_component_manager
    from streamlit.components.v2.manifest_scanner import (
        ComponentConfig,
        ComponentManifest,
    )

    manager = get_bidi_component_manager()
    package_root = Path(str(resources.files(__package__)))
    manifest = ComponentManifest(
        name="st-rdkit-components",
        version="0.1.0",
        components=[ComponentConfig(name="rdkit", asset_dir="frontend/build")],
    )
    manager.register_from_manifest(manifest, package_root)


@lru_cache(maxsize=1)
def _renderer() -> Any:
    import streamlit as st

    try:
        component = st.components.v2.component
    except AttributeError as exc:
        raise RuntimeError(
            "st-rdkit-components requires Streamlit custom component v2 "
            "(streamlit>=1.51)."
        ) from exc

    _ensure_component_manifest_registered()
    return component(
        "st-rdkit-components.rdkit",
        html='<div id="st-rdkit-components-root"></div>',
        js=_frontend_js_glob(),
    )


def _component_call(
    *,
    data: dict[str, Any],
    default: dict[str, Any],
    key: str | None,
    height: int | None,
) -> Any:
    kwargs: dict[str, Any] = {
        "data": data,
        "default": default,
        "key": key,
        "height": height if height is not None else "content",
    }
    for state_name in default:
        kwargs[f"on_{state_name}_change"] = _noop_callback
    kwargs["on_action_change"] = _noop_callback

    return _renderer()(**kwargs)


def _get_value(value: Any, name: str, fallback: Any) -> Any:
    if isinstance(value, Mapping):
        return value.get(name, fallback)
    return getattr(value, name, fallback)


def _mol_svg_result(raw: Any) -> MolSvgResult:
    return MolSvgResult(
        status=_get_value(raw, "status", "idle"),
        error=_get_value(raw, "error", None),
        action=_get_value(raw, "action", None),
    )


def _grid_result(raw: Any) -> MoleculeGridResult:
    selected_ids = _get_value(raw, "selected_ids", [])
    if selected_ids is None:
        selected_ids = []
    return MoleculeGridResult(
        selected_id=_get_value(raw, "selected_id", None),
        selected_ids=list(selected_ids),
        action=_get_value(raw, "action", None),
        errors=list(_get_value(raw, "errors", []) or []),
    )


def _detail_result(raw: Any) -> MoleculeDetailResult:
    return MoleculeDetailResult(
        selected_id=_get_value(raw, "selected_id", None),
        action=_get_value(raw, "action", None),
        error=_get_value(raw, "error", None),
    )


def mol_svg(
    *,
    smiles: str,
    legend: str | None = None,
    show_smiles: bool = False,
    enable_export: bool = False,
    svg_width: int | None = None,
    svg_height: int | None = None,
    height: int = 320,
    key: str | None = None,
) -> MolSvgResult:
    default = {"status": "idle", "error": None, "action": None}
    data = {
        "component_type": "mol_svg",
        "smiles": smiles,
        "legend": legend,
        "show_smiles": show_smiles,
        "enable_export": enable_export,
        "svg_width": svg_width,
        "svg_height": svg_height,
        "height": height,
    }
    return _mol_svg_result(
        _component_call(data=data, default=default, key=key, height=height)
    )


def molecule_grid(
    *,
    records: Sequence[Mapping[str, Any]],
    id_col: str = "id",
    smiles_col: str = "smiles",
    title_col: str | None = None,
    subtitle_cols: Sequence[str] | None = None,
    actions: Sequence[str] | None = None,
    selectable: str = "single",
    svg_width: int | None = None,
    svg_height: int | None = None,
    height: int = 600,
    key: str | None = None,
) -> MoleculeGridResult:
    default = {
        "selected_id": None,
        "selected_ids": [],
        "action": None,
        "errors": [],
    }
    data = {
        "component_type": "molecule_grid",
        "records": [dict(record) for record in records],
        "id_col": id_col,
        "smiles_col": smiles_col,
        "title_col": title_col,
        "subtitle_cols": list(subtitle_cols or []),
        "actions": list(actions or []),
        "selectable": selectable,
        "svg_width": svg_width,
        "svg_height": svg_height,
        "height": height,
    }
    return _grid_result(
        _component_call(data=data, default=default, key=key, height=height)
    )


def molecule_detail(
    *,
    record: Mapping[str, Any],
    id_col: str = "id",
    smiles_col: str = "smiles",
    title_col: str | None = None,
    fields: Sequence[str] | None = None,
    actions: Sequence[str] | None = None,
    height: int = 500,
    key: str | None = None,
) -> MoleculeDetailResult:
    default = {"selected_id": None, "action": None, "error": None}
    data = {
        "component_type": "molecule_detail",
        "record": dict(record),
        "id_col": id_col,
        "smiles_col": smiles_col,
        "title_col": title_col,
        "fields": list(fields or []),
        "actions": list(actions or []),
        "height": height,
    }
    return _detail_result(
        _component_call(data=data, default=default, key=key, height=height)
    )
