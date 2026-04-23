# app/services/page_render.py
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

_TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html", "xml"]),
)


def render_neighborhood_page(
    *,
    dataset: dict,
    experience: dict,
    source: str,
    page_mode: str = "dataset",
) -> str:
    template = _env.get_template("neighborhood_page.html")
    return template.render(
        dataset=dataset,
        experience=experience,
        source=source,
        page_mode=page_mode,
    )
