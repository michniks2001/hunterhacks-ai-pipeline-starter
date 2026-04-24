# app/services/experience_normalize.py
"""Coerce LLM JSON into the shape expected by NeighborhoodExperience."""

from __future__ import annotations

from typing import Any

_VALID_BLOCK_TYPES = frozenset(
    {
        "hero",
        "intro_columns",
        "bio_panel",
        "fact_grid",
        "split_story",
        "pull_quote",
        "timeline",
        "insight_list",
        "cta_band",
    }
)


def _str(v: Any) -> str:
    if v is None:
        return ""
    if isinstance(v, str):
        return v
    return str(v)


def _normalize_item(raw: Any) -> tuple[dict[str, str], list[str]]:
    warnings: list[str] = []
    if not isinstance(raw, dict):
        warnings.append("Invalid item entry; replaced with empty {label, text}.")
        return {"label": "", "text": ""}, warnings
    return {"label": _str(raw.get("label")), "text": _str(raw.get("text"))}, warnings


def _normalize_block(raw: Any) -> tuple[dict[str, Any], list[str]]:
    warnings: list[str] = []
    if not isinstance(raw, dict):
        warnings.append("Invalid block entry; replaced with fallback hero block fields.")
        raw = {}
    t = raw.get("type")
    if t not in _VALID_BLOCK_TYPES:
        warnings.append("Invalid block type replaced with hero.")
        t = "hero"
    items_raw = raw.get("items")
    if not isinstance(items_raw, list):
        warnings.append("Block items was not an array; replaced with [].")
        items_raw = []
    bullets_raw = raw.get("bullets")
    if not isinstance(bullets_raw, list):
        warnings.append("Block bullets was not an array; replaced with [].")
        bullets_raw = []
    items: list[dict[str, str]] = []
    for x in items_raw:
        item, item_warnings = _normalize_item(x)
        items.append(item)
        warnings.extend(item_warnings)
    return {
        "type": t,
        "kicker": _str(raw.get("kicker")),
        "title": _str(raw.get("title")),
        "subtitle": _str(raw.get("subtitle")),
        "body": _str(raw.get("body")),
        "bodySecondary": _str(raw.get("bodySecondary")),
        "bullets": [_str(b) for b in bullets_raw],
        "items": items,
    }, warnings


def _normalize_palette(raw: Any) -> tuple[dict[str, str], list[str]]:
    warnings: list[str] = []
    if not isinstance(raw, dict):
        warnings.append("Missing colorPalette; used fallback palette.")
        raw = {}
    background = _str(raw.get("background"))
    primary = _str(raw.get("primary"))
    secondary = _str(raw.get("secondary"))
    accent = _str(raw.get("accent"))
    text = _str(raw.get("text"))
    if not background:
        warnings.append("Missing colorPalette.background; used fallback #fafafa.")
    if not primary:
        warnings.append("Missing colorPalette.primary; used fallback #18181b.")
    if not secondary:
        warnings.append("Missing colorPalette.secondary; used fallback #a1a1aa.")
    if not accent:
        warnings.append("Missing colorPalette.accent; used fallback #6366f1.")
    if not text:
        warnings.append("Missing colorPalette.text; used fallback #18181b.")
    return {
        "background": background or "#fafafa",
        "primary": primary or "#18181b",
        "secondary": secondary or "#a1a1aa",
        "accent": accent or "#6366f1",
        "text": text or "#18181b",
    }, warnings


def normalize_experience_dict(raw: Any) -> tuple[dict[str, Any], list[str]]:
    """
    Fill missing / wrong-typed fields so Pydantic validation succeeds
    after best-effort JSON schema mode from the provider.
    """
    if not isinstance(raw, dict):
        warnings = ["Model output was not an object; using empty defaults."]
        raw = {}
    else:
        warnings = []

    blocks_raw = raw.get("blocks")
    if not isinstance(blocks_raw, list):
        warnings.append("Model returned blocks as a non-array; replaced with [].")
        blocks_raw = []

    blocks: list[dict[str, Any]] = []
    for b in blocks_raw:
        if b is None:
            continue
        normalized_block, block_warnings = _normalize_block(b)
        blocks.append(normalized_block)
        warnings.extend(block_warnings)
    if not blocks:
        headline = _str(raw.get("headline")) or _str(raw.get("neighborhoodName")) or "Neighborhood"
        warnings.append("No blocks returned; created fallback hero block.")
        blocks = [
            {
                "type": "hero",
                "kicker": "",
                "title": headline,
                "subtitle": _str(raw.get("subheadline")),
                "body": _str(raw.get("byline")),
                "bodySecondary": "",
                "bullets": [],
                "items": [],
            }
        ]
    palette, palette_warnings = _normalize_palette(raw.get("colorPalette"))
    warnings.extend(palette_warnings)

    normalized = {
        "neighborhoodName": _str(raw.get("neighborhoodName")) or "Neighborhood",
        "borough": _str(raw.get("borough")) or "",
        "headline": _str(raw.get("headline")) or _str(raw.get("neighborhoodName")) or "Headline",
        "subheadline": _str(raw.get("subheadline")),
        "byline": _str(raw.get("byline")),
        "bio": _str(raw.get("bio")) or _str(raw.get("subheadline")),
        "readingTimeNote": _str(raw.get("readingTimeNote")),
        "visualStyle": _str(raw.get("visualStyle")) or "editorial",
        "colorPalette": palette,
        "blocks": blocks,
    }
    deduped_warnings = list(dict.fromkeys(warnings))
    return normalized, deduped_warnings
