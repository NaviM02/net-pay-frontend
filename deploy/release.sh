#!/usr/bin/env bash
set -euo pipefail
[[ $EUID -eq 0 ]] || exit 1
release=${1:?Pass a Git commit SHA}
[[ $release =~ ^[a-f0-9]{40}$ ]] || exit 2
config=/etc/netpay-frontend/deploy.env
old=$(awk -F= '$1 == "APP_IMAGE_TAG" {print $2}' "$config")
set_release() {
  local temporary
  temporary=$(mktemp /etc/netpay-frontend/deploy.env.XXXXXX)
  awk -F= '$1 != "APP_IMAGE_TAG"' "$config" >"$temporary"
  printf 'APP_IMAGE_TAG=%s\n' "$1" >>"$temporary"
  chmod 600 "$temporary"
  mv "$temporary" "$config"
}
set_release "$release"
if ! systemctl restart netpay-frontend.service; then
  if [[ $old =~ ^[a-f0-9]{40}$ ]]; then
    set_release "$old"
    systemctl restart netpay-frontend.service || true
  fi
  exit 1
fi
