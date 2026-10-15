#!/usr/bin/env bash
set -euo pipefail

workspace_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
[[ -e "$workspace_root/.git" ]] || { echo "Run from the canonical AI-Skills checkout." >&2; exit 1; }
cd "$workspace_root"
case "${1:-}" in
  push)
    [[ "$(git branch --show-current)" == main ]] || { echo "Switch to main first." >&2; exit 1; }
    [[ -z "$(git status --porcelain -- tools/remotion-style-atlas)" ]] || { echo "Commit Atlas changes first." >&2; exit 1; }
    git push origin main
    printf 'AI-Skills pushed; GitHub Actions synchronizes Atlas and publishes the original website.\n'
    ;;
  pull)
    echo "Reverse sync is disabled. Edit tools/remotion-style-atlas in AI-Skills; no local website remote is needed." >&2
    exit 1
    ;;
  *) echo "Usage: pnpm run sync:push" >&2; exit 1 ;;
esac
