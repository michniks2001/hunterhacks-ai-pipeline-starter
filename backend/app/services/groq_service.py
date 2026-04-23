# app/services/groq_service.py
import json

from groq import BadRequestError, Groq
from pydantic import ValidationError

from app.config import settings
from app.models import NeighborhoodExperience
from app.services.experience_normalize import normalize_experience_dict
from app.services.neighborhood_service import FREEFORM_CONTEXT_MARKER


def _client() -> Groq:
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set.")
    return Groq(api_key=settings.GROQ_API_KEY)


_SYSTEM_CURATED = (
    "You are an editorial writer and product designer for neighborhood pages. "
    "You receive structured JSON about one neighborhood (name, borough, landmarks, vibe, designHints). "
    "Write an in-depth, magazine-style bio grounded ONLY in that JSON—do not invent new factual claims "
    "(no made-up history, statistics, or venues). You may describe mood, sensory texture, and "
    "typical experiences implied by the vibe and landmarks. "
    "Also produce a full page layout as `blocks`: 7–10 blocks with varied `type` values. "
    "Each block object must include these keys: type, kicker, title, subtitle, body, bodySecondary, bullets (array of strings), items (array of {label, text}). "
    "Use empty string or empty array where a field does not apply. "
    "Use `bio` for long-form prose (at least 4 rich paragraphs, separated by blank lines). "
    "Use `blocks` for scannable UI: heroes, fact grids from landmarks, timelines, pull quotes, etc. "
    "Return only JSON matching the schema."
)

_SYSTEM_FREEFORM = (
    "You are an editorial writer and product designer for neighborhood pages. "
    "The user named a place that is NOT in the hackathon's small curated JSON list. "
    "The payload only reliably contains `name` (and placeholder borough/empty lists). "
    "Use broad world knowledge to describe that neighborhood or city district: geography, culture, "
    "character, and well-known features people commonly associate with it. "
    "Avoid precise statistics, dates, or niche claims you are not confident about; prefer hedged language "
    "where needed. If the name is ambiguous, choose the best-known real-world interpretation. "
    "Produce the same top-level fields as the schema (neighborhoodName, borough, headline, subheadline, byline, bio, readingTimeNote, visualStyle, colorPalette, blocks). "
    "Each block must include type, kicker, title, subtitle, body, bodySecondary, bullets, items as specified in the curated prompt. "
    "Long `bio` (at least 4 paragraphs, blank lines between paragraphs) and 7–10 varied `blocks`. "
    "Return only JSON matching the schema."
)

_JSON_OBJECT_SUFFIX = (
    "\n\nOutput a single JSON object only (no markdown code fences). "
    "Each `blocks[]` entry must include string fields type, kicker, title, subtitle, body, bodySecondary, "
    "array bullets of strings, and array items of objects {label, text}. "
    "Block type must be one of: hero, intro_columns, bio_panel, fact_grid, split_story, pull_quote, "
    "timeline, insight_list, cta_band."
)


def generate_neighborhood_experience(context: dict) -> NeighborhoodExperience:
    client = _client()
    is_freeform = context.get("_source") == FREEFORM_CONTEXT_MARKER
    system = _SYSTEM_FREEFORM if is_freeform else _SYSTEM_CURATED

    user_msg = {"role": "user", "content": json.dumps(context)}
    schema_format = {
        "type": "json_schema",
        "json_schema": {
            "name": "neighborhood_experience",
            "strict": False,
            "schema": NeighborhoodExperience.model_json_schema(),
        },
    }

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            temperature=0.45,
            messages=[
                {"role": "system", "content": system},
                user_msg,
            ],
            response_format=schema_format,
        )
    except BadRequestError:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            temperature=0.4,
            messages=[
                {"role": "system", "content": system + _JSON_OBJECT_SUFFIX},
                user_msg,
            ],
            response_format={"type": "json_object"},
        )

    raw_content = response.choices[0].message.content

    if not raw_content:
        raise ValueError("Groq returned an empty response.")

    try:
        parsed_json = json.loads(raw_content)
    except json.JSONDecodeError as error:
        raise ValueError(f"Groq returned non-JSON content: {raw_content[:200]}…") from error

    normalized = normalize_experience_dict(parsed_json)
    try:
        return NeighborhoodExperience.model_validate(normalized)
    except ValidationError as error:
        raise ValueError(
            "Model JSON could not be coerced into NeighborhoodExperience. "
            f"Details: {error}"
        ) from error
