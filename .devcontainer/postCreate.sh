#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "Initializing backend environment..."

mkdir -p backend
mkdir -p frontend

# Create backend .env from example if it does not exist.
if [ ! -f backend/.env ]; then
  if [ -f backend/.env.example ]; then
    cp backend/.env.example backend/.env
  else
    cat > backend/.env <<EOF
GROQ_API_KEY=
FRONTEND_URL=http://localhost:5173
EOF
  fi
fi

# Create frontend .env from example if it does not exist.
if [ ! -f frontend/.env ]; then
  if [ -f frontend/.env.example ]; then
    cp frontend/.env.example frontend/.env
  else
    cat > frontend/.env <<EOF
VITE_API_BASE_URL=
EOF
  fi
fi

# Build Codespaces URLs if running inside GitHub Codespaces.
if [ -n "${CODESPACE_NAME:-}" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"

  FRONTEND_URL="https://${CODESPACE_NAME}-5173.${DOMAIN}"
  BACKEND_URL="https://${CODESPACE_NAME}-8000.${DOMAIN}"

  echo "Detected GitHub Codespaces."
  echo "Frontend URL: ${FRONTEND_URL}"
  echo "Backend URL:  ${BACKEND_URL}"

  # Write frontend API URL.
  cat > frontend/.env <<EOF
VITE_API_BASE_URL=${BACKEND_URL}
EOF

  # Update backend .env safely.
  python - <<PY
from pathlib import Path
import os

env_path = Path("backend/.env")
lines = env_path.read_text().splitlines() if env_path.exists() else []

values = {
    "FRONTEND_URL": "${FRONTEND_URL}",
}

# If the student added GROQ_API_KEY as a Codespaces secret,
# inject it automatically.
if os.environ.get("GROQ_API_KEY"):
    values["GROQ_API_KEY"] = os.environ["GROQ_API_KEY"]

out = []
seen = set()

for line in lines:
    stripped = line.strip()

    if not stripped or stripped.startswith("#") or "=" not in line:
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

else
  echo "Not running inside Codespaces. Keeping local URLs."
fi

echo
echo "backend/.env:"
sed 's/GROQ_API_KEY=.*/GROQ_API_KEY=***hidden***/' backend/.env

echo
echo "frontend/.env:"
cat frontend/.env

echo
echo "Backend environment initialized."