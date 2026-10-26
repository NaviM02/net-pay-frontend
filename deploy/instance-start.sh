#!/usr/bin/env bash
set -euo pipefail
config=/etc/netpay-frontend/deploy.env
# shellcheck disable=SC1090
source "$config"
[[ -n ${APP_IMAGE_TAG:-} ]] || exit 0
[[ $APP_IMAGE_TAG =~ ^[a-f0-9]{40}$ ]] || exit 2
export DOCKER_CONFIG
DOCKER_CONFIG=$(mktemp -d)
trap 'rm -rf -- "$DOCKER_CONFIG"' EXIT
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "${ECR_REPOSITORY%%/*}" >/dev/null
compose=(docker compose --project-directory /etc/netpay-frontend --env-file "$config" -f /etc/netpay-frontend/compose.prod.yml)
"${compose[@]}" pull frontend
"${compose[@]}" up -d --wait --wait-timeout 120
for _attempt in {1..30}; do
  if page=$(curl --fail --silent --show-error --connect-timeout 5 --max-time 15 "https://$API_HOST/") && [[ $page == *'<app-root'* ]]; then
    echo 'frontend_healthy'
    exit 0
  fi
  sleep 5
done
echo 'frontend_https_health_check_failed' >&2
exit 1
