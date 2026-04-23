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


def _normalize_item(raw: Any) -> dict[str, str]:
    if not isinstance(raw, dict):
        return {"label": "", "text": ""}
    return {"label": _str(raw.get("label")), "text": _str(raw.get("text"))}


def _normalize_block(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        raw = {}
    t = raw.get("type")
    if t not in _VALID_BLOCK_TYPES:
        t = "hero"
    items_raw = raw.get("items")
    if not isinstance(items_raw, list):
        items_raw = []
    bullets_raw = raw.get("bullets")
    if not isinstance(bullets_raw, list):
        bullets_raw = []
    return {
        "type": t,
        "kicker": _str(raw.get("kicker")),
        "title": _str(raw.get("title")),
        "subtitle": _str(raw.get("subtitle")),
        "body": _str(raw.get("body")),
        "bodySecondary": _str(raw.get("bodySecondary")),
        "bullets": [_str(b) for b in bullets_raw],
        "items": [_normalize_item(x) for x in items_raw],
    }


def _normalize_palette(raw: Any) -> dict[str, str]:
    if not isinstance(raw, dict):
        raw = {}
    return {
        "background": _str(raw.get("background")) or "#fafafa",
        "primary": _str(raw.get("primary")) or "#18181b",
        "secondary": _str(raw.get("secondary")) or "#a1a1aa",
        "accent": _str(raw.get("accent")) or "#6366f1",
        "text": _str(raw.get("text")) or "#18181b",
    }


def normalize_experience_dict(raw: Any) -> dict[str, Any]:
    """
    Fill missing / wrong-typed fields so Pydantic validation succeeds
    after best-effort JSON schema mode from the provider.
    """
    if not isinstance(raw, dict):
        raw = {}

    blocks_raw = raw.get("blocks")
    if not isinstance(blocks_raw, list):
        blocks_raw = []

    blocks = [_normalize_block(b) for b in blocks_raw if b is not None]
    if not blocks:
        headline = _str(raw.get("headline")) or _str(raw.get("neighborhoodName")) or "Neighborhood"
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

    return {
        "neighborhoodName": _str(raw.get("neighborhoodName")) or "Neighborhood",
        "borough": _str(raw.get("borough")) or "",
        "headline": _str(raw.get("headline")) or _str(raw.get("neighborhoodName")) or "Headline",
        "subheadline": _str(raw.get("subheadline")),
        "byline": _str(raw.get("byline")),
        "bio": _str(raw.get("bio")) or _str(raw.get("subheadline")),
        "readingTimeNote": _str(raw.get("readingTimeNote")),
        "visualStyle": _str(raw.get("visualStyle")) or "editorial",
        "colorPalette": _normalize_palette(raw.get("colorPalette")),
        "blocks": blocks,
    }
