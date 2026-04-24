# HunterHacks AI Pipeline Starter

A beginner-friendly workshop app that shows an AI pipeline in action.

You type a neighborhood name in the frontend. The backend builds context, calls Groq, checks/normalizes the model JSON, and the frontend renders that JSON into a page.

## How this works as an AI pipeline

1. **User input**  
   The user enters a neighborhood name plus optional design direction.

2. **Context lookup**  
   The backend tries to match a curated NYC sample dataset first. If no match is found and strict mode is off, it uses a general-knowledge fallback context.

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

## Set up Groq

This app uses Groq as the LLM provider.

1. Go to [console.groq.com](https://console.groq.com/).
2. Create a free account or sign in.
3. Go to **API Keys**.
4. Click **Create API Key**.
5. Copy the key and save it somewhere safe.

You will put this key in:

`backend/.env`

Do **not** put your Groq API key in the frontend.  
Do **not** commit your `.env` file to GitHub.

## Quick start

### 1) Backend

From the repo root:

```bash
cd backend
uv sync
cp .env.example .env
```

Open `backend/.env` and replace the placeholder key:

```bash
GROQ_API_KEY=your_real_groq_api_key_here
FRONTEND_URL=http://localhost:5173
```

Then start the backend:

```bash
uv run uvicorn app.main:app --reload
```

The backend runs on:

`http://localhost:8000`

### 2) Frontend

Open a second terminal from the repo root:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL from Vite, usually:

`http://localhost:5173`

## Environment files

### `backend/.env.example`

```bash
GROQ_API_KEY=your_groq_api_key_here
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env.example`

```bash
VITE_API_BASE_URL=
```

Leave `VITE_API_BASE_URL` blank by default.

The frontend calls the backend through Vite’s `/api` proxy, so you usually do **not** need to manually set a backend URL.

## Main API endpoints

- `GET /api/neighborhoods`
- `POST /api/theme`
- `GET /api/neighborhoods/{key}/page`
- `POST /api/debug/cache/clear`

## To Run in GitHub Codespaces

### 1) Open the Codespace

Click:

**Code → Codespaces → Create codespace on main**

Or open:

`https://codespaces.new/michniks2001/hunterhacks-ai-pipeline-starter?quickstart=1`

Wait for the Codespace to finish opening.

### 2) Install dependencies

In the Codespace terminal, run these commands from the repo root:

```bash
cd backend
uv sync
```

Then:

```bash
cd ../frontend
npm install
```

Then return to the repo root:

```bash
cd ..
```

### 3) Initialize environment files

Run:

```bash
bash .devcontainer/postCreate.sh
```

This creates or updates the environment files used by the backend and frontend.

### 4) Add your Groq API key

Open:

`backend/.env`

Set:

```bash
GROQ_API_KEY=your_real_groq_api_key_here
```

In Codespaces, the `FRONTEND_URL` value may be automatically updated for the Codespace environment.

### 5) Run the full app

In VS Code, open the Command Palette:

`Ctrl + Shift + P`

Search for:

`Tasks: Run Task`

Then choose:

`Run full app`

This starts:

- FastAPI backend on port `8000`
- Vite frontend on port `5173`

### 6) Open the frontend

Open the forwarded **Vite Frontend** port, usually port `5173`.

The frontend calls the backend through Vite’s `/api` proxy, so you should not need to manually edit API URLs.

## If something goes wrong in Codespaces

### Backend says the Groq key is missing

Check:

```bash
cat backend/.env
```

Make sure it contains:

```bash
GROQ_API_KEY=your_real_groq_api_key_here
```

Then restart the backend or rerun:

`Tasks: Run Task → Run full app`

### Frontend cannot reach the backend

Make sure `frontend/.env` has:

```bash
VITE_API_BASE_URL=
```

It should usually be blank.

The app is designed to use Vite’s `/api` proxy instead of calling the backend port directly.

### Setup script did not run

Run it manually from the repo root:

```bash
bash .devcontainer/postCreate.sh
```

Then restart the full app task.

## Notes

- This is a teaching artifact: the goal is to make pipeline steps visible.
- Groq is called only from the backend, never from the frontend.
- The model generates structured JSON, not React code.
- The frontend renders that structured JSON into UI.
- The cache is intentionally visible so you can see when the app uses a fresh LLM response versus a cached response.

## License

This project is licensed under the MIT License
