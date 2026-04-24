# Backend (FastAPI)

This folder contains the API side of the workshop demo.

## Quick start

```bash
cd backend
uv sync
cp .env.example .env
uv run uvicorn app.main:app --reload
```

## Environment

- `GROQ_API_KEY` required for model calls
- `FRONTEND_URL` controls CORS allowlist (default `http://localhost:5173`)

## Main endpoints

- `GET /api/neighborhoods`
- `POST /api/theme`
- `GET /api/neighborhoods/{key}/page`
- `POST /api/debug/cache/clear`
