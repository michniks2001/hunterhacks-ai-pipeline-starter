from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ThemeRequest(BaseModel):
    neighborhood: str
    strict_dataset_match: bool = False
    user_context: str | None = None


class ColorPalette(BaseModel):
    model_config = ConfigDict(extra="forbid")

    background: str
    primary: str
    secondary: str
    accent: str
    text: str


class UIItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    label: str
    text: str


UIBlockType = Literal[
    "hero",
    "intro_columns",
    "bio_panel",
    "fact_grid",
    "split_story",
    "pull_quote",
    "timeline",
    "insight_list",
    "cta_band",
]


class UIBlock(BaseModel):
    """
    One layout region for strict LLM JSON schemas: every field is required
    (use '' or [] when a block type does not use a field).
    """

    model_config = ConfigDict(extra="forbid")

    type: UIBlockType
    kicker: str
    title: str
    subtitle: str
    body: str
    bodySecondary: str
    bullets: list[str] = Field(min_length=0)
    items: list[UIItem] = Field(min_length=0)


class NeighborhoodExperience(BaseModel):
    model_config = ConfigDict(extra="forbid")

    neighborhoodName: str
    borough: str
    headline: str
    subheadline: str
    byline: str
    bio: str
    readingTimeNote: str
    visualStyle: str
    colorPalette: ColorPalette
    blocks: list[UIBlock] = Field(default_factory=list)
