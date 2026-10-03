#!/usr/bin/env bash
set -euo pipefail

workspace_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
prefix="tools/remotion-style-atlas"
website_remote="style-atlas"
website_url="https://github.com/ian9911007/remotion-style-atlas.git"
website_branch="main"
workspace_branch="main"

die() {
  printf 'Sync stopped: %s\n' "$1" >&2
  exit 1
}

[[ -d "$workspace_root/.git" ]] || die "Run this from the canonical AI Skills checkout."
cd "$workspace_root"
[[ "$(git branch --show-current)" == "$workspace_branch" ]] || die "Switch the AI Skills checkout to main before syncing."
git_subtree_path="$(git --exec-path)/git-subtree"
[[ -x "$git_subtree_path" ]] || die "git subtree is required; install Git's subtree component before syncing."
if git show-ref --verify --quiet "refs/remotes/origin/$workspace_branch"; then
  git merge-base --is-ancestor "origin/$workspace_branch" HEAD || die "AI Skills main is behind origin/main; update the workspace branch before syncing either remote."
fi

if ! git remote get-url "$website_remote" >/dev/null 2>&1; then
  git remote add "$website_remote" "$website_url"
else
  configured_url="$(git remote get-url "$website_remote")"
  [[ "$configured_url" == "$website_url" ]] || die "Remote '$website_remote' exists with a different URL; inspect it before changing configuration."
fi

case "${1:-}" in
  push)
    [[ -z "$(git status --porcelain -- "$prefix")" ]] || die "Commit all Style Atlas changes before syncing."
    git subtree push --prefix="$prefix" "$website_remote" "$website_branch"
    git push origin "$workspace_branch"
    ;;
  pull)
    [[ -z "$(git status --porcelain -- "$prefix")" ]] || die "Commit or stash all Style Atlas changes before pulling."
    git subtree pull --prefix="$prefix" "$website_remote" "$website_branch"
    git push origin "$workspace_branch"
    ;;
  *)
    die "Usage: npm run sync:push | npm run sync:pull"
    ;;
esac

printf 'Synchronized Style Atlas and AI Skills main.\n'
