# app/routes/theme_routes.py
from urllib.parse import quote

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

from app.cache import clear_experience_cache
from app.models import ThemeRequest
from app.services.neighborhood_service import (
    build_freeform_context,
    get_neighborhood_context,
    get_all_neighborhoods,
    resolve_neighborhood_key,
)
from app.services.page_render import render_neighborhood_page
from app.services.theme_resolution import get_or_create_experience_dict


router = APIRouter(prefix="/api", tags=["Themes"])


def _theme_http_exception(error: Exception) -> HTTPException:
    if isinstance(error, ValueError):
        return HTTPException(status_code=400, detail=str(error))
    if isinstance(error, LookupError):
        return HTTPException(status_code=404, detail=str(error))
    return HTTPException(
        status_code=500,
        detail=f"Failed to generate experience: {str(error)}",
    )


@router.get("/neighborhoods")
def list_neighborhoods():
    rows = get_all_neighborhoods()
    return {
        "neighborhoods": [
            {
                **row,
                "pageUrl": f"/api/neighborhoods/{quote(row['key'], safe='')}/page",
            }
            for row in rows
        ]
    }


@router.post("/theme")
def create_theme(request: ThemeRequest):
    try:
        source, matched_slug, experience_dict, mode, context_used, warnings = get_or_create_experience_dict(
            request.neighborhood,
            strict_dataset=request.strict_dataset_match,
            user_context=request.user_context,
        )
    except (ValueError, LookupError) as error:
        raise _theme_http_exception(error) from error
    except Exception as error:
        raise _theme_http_exception(error) from error

    model_call_description = (
        "Skipped model call and reused cached structured output."
        if source == "cache"
        else "Sent verified context and optional design direction to Groq to generate structured JSON."
    )
    pipeline_trace = {
        "userInput": request.neighborhood,
        "matchedKey": matched_slug,
        "mode": mode,
        "source": source,
        "strictDatasetMatch": request.strict_dataset_match,
        "contextUsed": context_used,
        "userDesignDirection": (request.user_context or "").strip(),
        "steps": [
            {
                "label": "User Input",
                "description": f"User entered '{request.neighborhood}'.",
            },
            {
                "label": "Context Lookup",
                "description": (
                    "Matched curated NYC sample data."
                    if mode == "dataset"
                    else "No curated match, so used model/general-knowledge fallback context."
                ),
            },
            {
                "label": "Model Call",
                "description": model_call_description,
            },
            {
                "label": "Validation / Normalization",
                "description": (
                    "Validated model JSON and applied normalization safeguards."
                    if source == "llm"
                    else "Returned previously normalized JSON from cache."
                ),
            },
            {
                "label": "Rendered UI",
                "description": "Frontend renders structured JSON into components.",
            },
        ],
    }

    return {
        "source": source,
        "matchedKey": matched_slug,
        "mode": mode,
        "experience": experience_dict,
        "pipelineTrace": pipeline_trace,
        "warnings": warnings,
        "pageUrl": f"/api/neighborhoods/{quote(matched_slug, safe='')}/page",
    }


@router.get("/neighborhoods/{neighborhood_key}/page", response_class=HTMLResponse)
def neighborhood_page(neighborhood_key: str):
    try:
        source, matched_slug, experience_dict, mode, _, _ = get_or_create_experience_dict(
            neighborhood_key,
            strict_dataset=False,
        )
    except ValueError as error:
        raise _theme_http_exception(error) from error
    except LookupError as error:
        raise _theme_http_exception(error) from error
    except Exception as error:
        raise _theme_http_exception(error) from error

    if mode == "dataset":
        canonical = resolve_neighborhood_key(neighborhood_key)
        dataset = get_neighborhood_context(canonical) if canonical else {}
    else:
        dataset = build_freeform_context(neighborhood_key.strip())

    html = render_neighborhood_page(
        dataset=dataset,
        experience=experience_dict,
        source=source,
        page_mode=mode,
    )
    return HTMLResponse(content=html)


@router.post("/debug/cache/clear")
def clear_cache():
    clear_experience_cache()
    return {"message": "Cache cleared"}
