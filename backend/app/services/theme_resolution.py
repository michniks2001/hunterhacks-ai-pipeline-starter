# app/services/theme_resolution.py
from app.cache import get_cached_experience, save_experience_to_cache
from app.services.neighborhood_service import (
    build_freeform_context,
    get_neighborhood_context,
    normalize_neighborhood_name,
    resolve_neighborhood_key,
)
from app.services.groq_service import generate_neighborhood_experience

_FREEFORM_CACHE_PREFIX = "freeform:"


def get_or_create_experience_dict(
    user_input: str,
    *,
    strict_dataset: bool = False,
    user_context: str | None = None,
) -> tuple[str, str, dict, str, dict, list[str]]:
    """
    Return (source, matched_slug, experience_dict, mode, context_used, warnings).
    `matched_slug` is the canonical dataset key or a normalized slug for URLs/cache.
    `mode` is ``dataset`` or ``freeform``.
    """
    raw = user_input.strip()
    if not raw:
        raise ValueError("Neighborhood is required.")

    canonical = resolve_neighborhood_key(user_input)

    if canonical is not None:
        storage_key = canonical
        mode = "dataset"
        matched_slug = canonical
    else:
        if strict_dataset:
            raise LookupError("Neighborhood not found in local dataset.")
        mode = "freeform"
        matched_slug = normalize_neighborhood_name(raw)
        storage_key = f"{_FREEFORM_CACHE_PREFIX}{matched_slug}"

    cached = get_cached_experience(storage_key)
    if cached:
        context_used = get_neighborhood_context(canonical) if canonical is not None else build_freeform_context(raw)
        assert context_used is not None
        context_used.pop("_source", None)
        return "cache", matched_slug, cached, mode, context_used, []

    if canonical is not None:
        context = get_neighborhood_context(canonical)
        if context is None:
            raise LookupError("Neighborhood not found in local dataset.")
    else:
        context = build_freeform_context(raw)

    experience, warnings = generate_neighborhood_experience(
        context,
        user_design_direction=user_context,
    )
    payload = experience.model_dump()
    save_experience_to_cache(storage_key, payload)
    context_for_trace = dict(context)
    context_for_trace.pop("_source", None)
    return "llm", matched_slug, payload, mode, context_for_trace, warnings
