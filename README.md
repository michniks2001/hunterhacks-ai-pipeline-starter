# Neighborhood AI pipeline (starter)

This project is a small demo app: you type a **neighborhood name**, and you get back a **long write-up** plus a **styled page** (headings, sections, colors) that the app builds for you.

---

## What “AI pipeline” means here

People say **pipeline** to mean: *a few clear steps in a row*, where each step hands something to the next—not a single black box.

In this repo the chain is short:

1. **You** type a name and press generate.
2. **The app** looks up extra facts when it can (a tiny built-in list of NYC neighborhoods). If the name is not on that list, it still continues and lets the AI work from the name alone (unless you turn on “only use the list”).
3. **The AI** (through Groq) reads your name plus that extra text and writes back a big blob of structured content: a bio, headlines, color picks, and a list of “blocks” (hero, quote, list, etc.).
4. **The server** cleans up that blob so the rest of the app can trust the shape.
5. **The website** reads that blob and draws the page. Same content can also open as a simple HTML page from a link.

So: **input → context (when we have it) → model → tidy up → show.** That’s the whole pipeline in one breath.

---

## What’s in the repo

- **`backend/`** — The server: receives the name, talks to the AI, caches results, can render HTML.
- **`frontend/`** — The website you use in the browser.

You don’t need to understand every file to run it.

---

## Run it

**1. Backend** (needs Python and [`uv`](https://docs.astral.sh/uv/), or use your own way to install deps from `backend/pyproject.toml`):

```bash
cd backend
uv sync
```

Create `backend/.env` with your Groq key:

```bash
GROQ_API_KEY=your_key_here
```

Start the server:

```bash
uv run uvicorn app.main:app --reload
```

**2. Frontend** (needs Node):

```bash
cd frontend
npm install
npm run dev
```

Open the address the terminal prints (usually **http://localhost:5173**). Type a neighborhood (try a quick-fill chip first), generate, and read the page.

---

## If something breaks

- **“Could not generate” / API errors** — Check `GROQ_API_KEY` in `backend/.env` and that the backend terminal is still running.
- **Browser says CORS** — Run the frontend on `http://localhost:5173`, or change `FRONTEND_URL` in `backend/app/config.py` to match where your UI runs.

---

## License

Add your license or hackathon credit here if you need it.
