#!/usr/bin/env bash
# Created: 2026-10-05
set -euo pipefail
task_project_dir="$(cd "$(dirname "$0")" && pwd)"
task_workspace="$(python3 -c 'import json; from pathlib import Path; print(json.loads((Path.home()/".codex/codex-antigravity-workspace.json").read_text())["resolved_workspace"])')"
task_runtime="$task_workspace/scripts/package_runtime.py"
python3 "$task_runtime" pm "$task_project_dir" install
python3 "$task_runtime" pm "$task_project_dir/technology-runtime" install
exec python3 "$task_runtime" pm "$task_project_dir" run dev
