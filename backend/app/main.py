# app/main.py
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes.theme_routes import router as theme_router


app = FastAPI(
    title="NYC Neighborhood AI Theme API",
    description="A lightweight FastAPI backend for demonstrating AI pipelines.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_origin_regex=r"https://.*-5173\.app\.github\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(theme_router)


@app.get("/")
def health_check():
    return {
        "message": "NYC Neighborhood AI Theme API is running."
    }


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)