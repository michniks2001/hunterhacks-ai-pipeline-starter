#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Create backend .env
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi

# Create frontend .env
if [ ! -f frontend/.env ]; then
  cp frontend/.env.example frontend/.env
fi

# If running inside GitHub Codespaces, generate the forwarded URLs.
if [ -n "${CODESPACE_NAME:-}" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"

  FRONTEND_URL="https://${CODESPACE_NAME}-5173.${DOMAIN}"
  BACKEND_URL="https://${CODESPACE_NAME}-8000.${DOMAIN}"

  cat > frontend/.env <<EOF
VITE_API_BASE_URL=${BACKEND_URL}
EOF

  python - <<PY
from pathlib import Path
import os

env_path = Path("backend/.env")
existing = env_path.read_text().splitlines() if env_path.exists() else []

values = {
    "FRONTEND_URL": "${FRONTEND_URL}",
}

if os.environ.get("GROQ_API_KEY"):
    values["GROQ_API_KEY"] = os.environ["GROQ_API_KEY"]

seen = set()
out = []

for line in existing:
    if "=" not in line or line.strip().startswith("#"):
        out.append(line)
        continue

    key = line.split("=", 1)[0]

    if key in values:
        out.append(f"{key}={values[key]}")
        seen.add(key)
    else:
        out.append(line)

for key, value in values.items():
    if key not in seen:
        out.append(f"{key}={value}")

env_path.write_text("\\n".join(out) + "\\n")
PY

  echo "Codespaces frontend URL: ${FRONTEND_URL}"
  echo "Codespaces backend URL:  ${BACKEND_URL}"
else
  echo "Not running inside Codespaces. Keeping local .env files."
fi