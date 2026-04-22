#!/usr/bin/env bash
set -euo pipefail

# One-click deployment for my-car-admin
# - Builds frontend dist locally
# - Builds backend Docker image locally
# - Uploads artifacts to remote server
# - Loads image and restarts backend container remotely
# - Optional: configure nginx for admin/api domains

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

CONFIG_FILE="${SCRIPT_DIR}/deploy.conf"
SETUP_NGINX=false

if [[ "${1:-}" == "--setup-nginx" ]]; then
  SETUP_NGINX=true
fi

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "Missing config: ${CONFIG_FILE}"
  echo "Create it from: ${SCRIPT_DIR}/deploy.conf.example"
  exit 1
fi

# shellcheck disable=SC1090
source "${CONFIG_FILE}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command not found: $1"
    exit 1
  fi
}

require_cmd docker
require_cmd ssh
require_cmd scp
require_cmd rsync
require_cmd npm

if [[ -z "${DEPLOY_HOST:-}" || -z "${DEPLOY_USER:-}" || -z "${DEPLOY_BASE_DIR:-}" ]]; then
  echo "DEPLOY_HOST / DEPLOY_USER / DEPLOY_BASE_DIR must be set in deploy.conf"
  exit 1
fi

DEPLOY_PORT="${DEPLOY_PORT:-22}"
IMAGE_NAME="${IMAGE_NAME:-mycar-admin-backend:prod}"
CONTAINER_NAME="${CONTAINER_NAME:-mycar_backend}"
ENV_FILE="${ENV_FILE:-backend/.env}"
ADMIN_DOMAIN="${ADMIN_DOMAIN:-admin.breakcode.top}"
API_DOMAIN="${API_DOMAIN:-api.breakcode.top}"

if [[ ! -f "${PROJECT_DIR}/${ENV_FILE}" ]]; then
  echo "Env file not found: ${PROJECT_DIR}/${ENV_FILE}"
  exit 1
fi

if [[ ! -f "${PROJECT_DIR}/backend/Dockerfile" ]]; then
  echo "Missing backend Dockerfile: ${PROJECT_DIR}/backend/Dockerfile"
  exit 1
fi

TS="$(date +%Y%m%d%H%M%S)"
IMAGE_TAR="/tmp/${CONTAINER_NAME}-${TS}.tar"
SSH_TARGET="${DEPLOY_USER}@${DEPLOY_HOST}"

echo "==> [1/7] Build frontend"
cd "${PROJECT_DIR}/frontend"
npm ci
npm run build

echo "==> [2/7] Build backend image"
cd "${PROJECT_DIR}"
docker build -t "${IMAGE_NAME}" ./backend

echo "==> [3/7] Save image tar"
docker save "${IMAGE_NAME}" -o "${IMAGE_TAR}"

echo "==> [4/7] Prepare remote directories"
ssh -p "${DEPLOY_PORT}" "${SSH_TARGET}" \
  "mkdir -p '${DEPLOY_BASE_DIR}/backend' '${DEPLOY_BASE_DIR}/frontend-dist' '${DEPLOY_BASE_DIR}/uploads'"

echo "==> [5/7] Upload artifacts"
scp -P "${DEPLOY_PORT}" "${IMAGE_TAR}" "${SSH_TARGET}:${DEPLOY_BASE_DIR}/backend/backend-image.tar"
scp -P "${DEPLOY_PORT}" "${PROJECT_DIR}/${ENV_FILE}" "${SSH_TARGET}:${DEPLOY_BASE_DIR}/backend/.env"
rsync -az --delete -e "ssh -p ${DEPLOY_PORT}" \
  "${PROJECT_DIR}/frontend/dist/" "${SSH_TARGET}:${DEPLOY_BASE_DIR}/frontend-dist/"

echo "==> [6/7] Load image and restart backend container"
ssh -p "${DEPLOY_PORT}" "${SSH_TARGET}" "bash -s" <<EOF
set -e
docker load -i "${DEPLOY_BASE_DIR}/backend/backend-image.tar"
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart always \
  --env-file "${DEPLOY_BASE_DIR}/backend/.env" \
  -p 127.0.0.1:8000:8000 \
  -v "${DEPLOY_BASE_DIR}/uploads:/data/uploads" \
  "${IMAGE_NAME}"
curl -fsS http://127.0.0.1:8000/api/v1/health >/dev/null
echo "Backend health check passed."
EOF

if [[ "${SETUP_NGINX}" == "true" ]]; then
  echo "==> [7/7] Setup nginx conf for ${ADMIN_DOMAIN} and ${API_DOMAIN}"
  ssh -p "${DEPLOY_PORT}" "${SSH_TARGET}" "bash -s" <<EOF
set -e
cat > /etc/nginx/conf.d/${ADMIN_DOMAIN}.conf <<'NGADMIN'
server {
    listen 80;
    server_name ${ADMIN_DOMAIN};
    root ${DEPLOY_BASE_DIR}/frontend-dist;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGADMIN

cat > /etc/nginx/conf.d/${API_DOMAIN}.conf <<'NGAPI'
server {
    listen 80;
    server_name ${API_DOMAIN};

    location /api/v1/ {
        proxy_pass http://127.0.0.1:8000/api/v1/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /media/ {
        alias ${DEPLOY_BASE_DIR}/uploads/;
    }
}
NGAPI

nginx -t
systemctl reload nginx
EOF
fi

rm -f "${IMAGE_TAR}"

echo ""
echo "Deploy success."
echo "Admin URL: http://${ADMIN_DOMAIN}"
echo "API Health: http://${API_DOMAIN}/api/v1/health"
echo "Tip: configure SSL in bt panel and force HTTPS."
