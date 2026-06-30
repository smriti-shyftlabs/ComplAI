#!/usr/bin/env bash
#
# ComplAI — start backend (:4000) and frontend (:5173) together.
# Usage:  ./start.sh   (or:  npm run dev)
# Stop:   Ctrl+C       (stops both)
#
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACK="$ROOT/BackEnd"
FRONT="$ROOT/FrontEnd/ai-product-compliance"

# ── Use Node 20+ via nvm if available ────────────────────────────────────────
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then . "$NVM_DIR/nvm.sh"; nvm use 22 >/dev/null 2>&1 || true; fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "⚠️  Node 20+ required (found $(node -v 2>/dev/null || echo none)). Run 'nvm use 22' first." >&2
  exit 1
fi

# ── First-run install ─────────────────────────────────────────────────────────
[ -d "$BACK/node_modules" ]  || ( echo "📦 Installing backend deps…";  cd "$BACK"  && npm install )
[ -d "$FRONT/node_modules" ] || ( echo "📦 Installing frontend deps…"; cd "$FRONT" && npm install )

# ── Free the ports so a stale process doesn't block us ───────────────────────
lsof -ti:4000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null || true

# ── Stop both children on exit / Ctrl+C ──────────────────────────────────────
cleanup() { echo; echo "⏹  Stopping ComplAI…"; kill 0 2>/dev/null || true; }
trap cleanup EXIT INT TERM

echo "▶  Starting ComplAI — API http://localhost:4000  ·  Web http://localhost:5173"
( cd "$BACK"  && npm run dev 2>&1 | sed 's/^/[api] /' ) &
( cd "$FRONT" && npm run dev 2>&1 | sed 's/^/[web] /' ) &
wait
