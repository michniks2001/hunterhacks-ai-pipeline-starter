#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

echo "Initializing Codespaces/dev environment..."

mkdir -p backend
mkdir -p frontend

# -----------------------------
# 1. Create backend/.env
# -----------------------------
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

# -----------------------------
# 2. Create frontend/.env
# -----------------------------
if [ ! -f frontend/.env ]; then
  if [ -f frontend/.env.example ]; then
    cp frontend/.env.example frontend/.env
  else
    cat > frontend/.env <<EOF
VITE_API_BASE_URL=
EOF
  fi
fi

# -----------------------------
# 3. Detect Codespaces URLs
# -----------------------------
if [ -n "${CODESPACE_NAME:-}" ]; then
  DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"

  FRONTEND_URL="https://${CODESPACE_NAME}-5173.${DOMAIN}"
  BACKEND_URL="https://${CODESPACE_NAME}-8000.${DOMAIN}"

  echo "Detected GitHub Codespaces."
  echo "Frontend URL: ${FRONTEND_URL}"
  echo "Backend URL:  ${BACKEND_URL}"
else
  FRONTEND_URL="http://localhost:5173"
  BACKEND_URL="http://127.0.0.1:8000"

  echo "Not running inside Codespaces."
  echo "Frontend URL: ${FRONTEND_URL}"
  echo "Backend URL:  ${BACKEND_URL}"
fi

# -----------------------------
# 4. Update backend/.env safely
# -----------------------------
python - <<PY
from pathlib import Path
import os

env_path = Path("backend/.env")
lines = env_path.read_text().splitlines() if env_path.exists() else []

values = {
    "FRONTEND_URL": "${FRONTEND_URL}",
}

# If the student added GROQ_API_KEY as a Codespaces secret,
# copy it into backend/.env automatically.
#
# If no Codespaces secret exists, preserve whatever is already
# inside backend/.env so manual edits are not wiped out.
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

# -----------------------------
# 5. Update frontend/.env
# -----------------------------
# Keep this blank by default.
#
# The frontend should call /api/... and Vite should proxy that
# to FastAPI internally. This avoids Codespaces CORS and private-port
# redirect problems.
cat > frontend/.env <<EOF
VITE_API_BASE_URL=
EOF

# -----------------------------
# 6. Print safe debug output
# -----------------------------
echo
echo "backend/.env:"
sed 's/GROQ_API_KEY=.*/GROQ_API_KEY=***hidden***/' backend/.env

echo
echo "frontend/.env:"
cat frontend/.env

echo
python - <<'PY'
from pathlib import Path

env_path = Path("backend/.env")
values = {}

for line in env_path.read_text().splitlines():
    if "=" in line and not line.strip().startswith("#"):
        key, value = line.split("=", 1)
        values[key] = value

print("Environment check:")
print(f"  GROQ_API_KEY present: {bool(values.get('GROQ_API_KEY'))}")
print(f"  FRONTEND_URL: {values.get('FRONTEND_URL', '')}")
PY

echo
echo "Environment initialized."
echo "Reminder: restart Vite/FastAPI if .env values changed."