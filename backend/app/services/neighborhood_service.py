# app/services/neighborhood_service.py
import json
from pathlib import Path

_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "neighborhoods.json"

with _DATA_PATH.open(encoding="utf-8") as f:
    _NEIGHBORHOODS: dict[str, dict] = json.load(f)

FREEFORM_CONTEXT_MARKER = "freeform"


def normalize_neighborhood_name(name: str) -> str:
    return name.strip().lower()


def resolve_neighborhood_key(raw: str) -> str | None:
    """Map free text to a canonical dataset key, or None if unknown."""
    n = normalize_neighborhood_name(raw)
    if not n:
        return None
    if n in _NEIGHBORHOODS:
        return n
    for key, row in _NEIGHBORHOODS.items():
        if row["name"].strip().lower() == n:
            return key
    return None


def get_neighborhood_context(key: str) -> dict | None:
    row = _NEIGHBORHOODS.get(key)
    if row is None:
        return None
    return dict(row)


def get_all_neighborhoods() -> list[dict]:
    return [
        {"key": key, "name": data["name"], "borough": data["borough"]}
        for key, data in sorted(_NEIGHBORHOODS.items(), key=lambda x: x[1]["name"])
    ]


def build_freeform_context(display_name: str) -> dict:
    """Minimal context when the user names a place outside the local JSON."""
    name = display_name.strip()
    return {
        "name": name,
        "borough": "Not in the curated sample list",
        "landmarks": [],
        "vibe": "",
        "designHints": [],
        "_source": FREEFORM_CONTEXT_MARKER,
    }
