# app/cache.py

_SCHEMA_VERSION = "exp-v1"
_experience_cache: dict[str, dict] = {}


def _cache_key(canonical_neighborhood_key: str) -> str:
    return f"{_SCHEMA_VERSION}:{canonical_neighborhood_key}"


def get_cached_experience(canonical_neighborhood_key: str) -> dict | None:
    return _experience_cache.get(_cache_key(canonical_neighborhood_key))


def save_experience_to_cache(canonical_neighborhood_key: str, payload: dict) -> None:
    _experience_cache[_cache_key(canonical_neighborhood_key)] = payload
