#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "Installing backend dependencies..."
cd backend
uv sync

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

# If the student added GROQ_API_KEY as a Codespaces secret,
# copy it into backend/.env automatically.
if [ -n "${GROQ_API_KEY:-}" ]; then
  python - <<'PY'
from pathlib import Path
import os

env_path = Path(".env")
lines = env_path.read_text().splitlines() if env_path.exists() else []

def set_key(lines, key, value):
    found = False
    out = []
    for line in lines:
        if line.startswith(f"{key}="):
            out.append(f"{key}={value}")
            found = True
        else:
            out.append(line)
    if not found:
        out.append(f"{key}={value}")
    return out

lines = set_key(lines, "GROQ_API_KEY", os.environ["GROQ_API_KEY"])
lines = set_key(lines, "FRONTEND_URL", "http://localhost:5173")
env_path.write_text("\n".join(lines) + "\n")
PY
fi

cd "$REPO_ROOT"

echo "Installing frontend dependencies..."
cd frontend
npm install

if [ ! -f ".env" ]; then
  cp .env.example .env
fi

echo "Codespace setup complete."
echo "Run the VS Code task: Run full app"