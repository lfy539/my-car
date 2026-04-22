#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   API_BASE="https://api.breakcode.top/api/v1" bash online_smoke_test.sh
# Optional:
#   CF_BASE="https://api.breakcode.top"  # if you have a gateway for cloudfunction-like checks

API_BASE="${API_BASE:-https://api.breakcode.top/api/v1}"

echo "[1/5] health check -> ${API_BASE}/health"
curl -fsS "${API_BASE}/health" >/dev/null
echo "OK: health"

echo "[2/5] public home"
curl -fsS "${API_BASE}/public/home" | python3 -c "import sys,json;d=json.load(sys.stdin);assert 'brands' in d and 'hotWallpapers' in d;print('OK: public/home')"

echo "[3/5] public wallpapers list"
curl -fsS "${API_BASE}/public/wallpapers?page=1&pageSize=2" | python3 -c "import sys,json;d=json.load(sys.stdin);assert 'list' in d and 'total' in d;print('OK: public/wallpapers')"

echo "[4/5] public sounds list"
curl -fsS "${API_BASE}/public/sounds?page=1&pageSize=2" | python3 -c "import sys,json;d=json.load(sys.stdin);assert 'list' in d and 'total' in d;print('OK: public/sounds')"

echo "[5/5] public search hot"
curl -fsS "${API_BASE}/public/search/hot" | python3 -c "import sys,json;d=json.load(sys.stdin);assert 'keywords' in d;print('OK: public/search/hot')"

echo "All smoke checks passed."
