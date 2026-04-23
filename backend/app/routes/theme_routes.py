# app/routes/theme_routes.py
from urllib.parse import quote

from fastapi import APIRouter, HTTPException
from fastapi.responses import HTMLResponse

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
        source, matched_slug, experience_dict, mode = get_or_create_experience_dict(
            request.neighborhood,
            strict_dataset=request.strict_dataset_match,
        )
    except (ValueError, LookupError) as error:
        raise _theme_http_exception(error) from error
    except Exception as error:
        raise _theme_http_exception(error) from error

    return {
        "source": source,
        "matchedKey": matched_slug,
        "mode": mode,
        "experience": experience_dict,
        "pageUrl": f"/api/neighborhoods/{quote(matched_slug, safe='')}/page",
    }


@router.get("/neighborhoods/{neighborhood_key}/page", response_class=HTMLResponse)
def neighborhood_page(neighborhood_key: str):
    try:
        source, matched_slug, experience_dict, mode = get_or_create_experience_dict(
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
