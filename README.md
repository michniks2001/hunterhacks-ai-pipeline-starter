# HunterHacks AI Pipeline Starter

A beginner-friendly workshop app that shows an AI pipeline in action.

You type a neighborhood name in the frontend. The backend builds context, calls Groq, checks/normalizes the model JSON, and the frontend renders that JSON into a page.

## How this works as an AI pipeline

1. **User input**  
   The user enters a neighborhood name (plus optional design direction).

2. **Context lookup**  
   The backend tries to match a curated NYC sample dataset first. If no match and strict mode is off, it uses a general-knowledge fallback context.

3. **Model call**  
   The backend sends both:
   - verified context
   - optional user design direction

   The design direction can influence style and layout, but should not replace verified facts.

4. **Validation + normalization**  
   The backend parses model JSON, repairs common issues, and validates structure before the UI uses it.

5. **Rendering**  
   The frontend renders structured JSON into real UI components.

6. **Caching**  
   Cached responses prevent unnecessary LLM calls and make repeat demos fast.

## What to point out during the workshop

- The model receives **context**, not just a raw one-line prompt.
- The model returns **structured JSON**, not React code.
- The backend **validates and normalizes** model output before rendering.
- The frontend **renders JSON into UI** components.
- Cache behavior is visible:
  - first request: fresh from LLM
  - second request: cache hit
  - clear cache endpoint: fresh from LLM again
- Optional design direction changes visual/story style without replacing verified data.

## Project structure

- `backend/` FastAPI API + pipeline orchestration
- `frontend/` Vite + React teaching UI

## Quick start

### 1) Backend

```bash
cd backend
uv sync
cp .env.example .env
uv run uvicorn app.main:app --reload
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL from Vite (usually `http://localhost:5173`).

## Environment files

### `backend/.env.example`

```bash
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env.example`

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Main API endpoints

- `GET /api/neighborhoods`
- `POST /api/theme`
- `GET /api/neighborhoods/{key}/page`
- `POST /api/debug/cache/clear`

## Notes

- This is a teaching artifact: the goal is to make pipeline steps visible.
- Groq is called only from the backend (never from the frontend).
