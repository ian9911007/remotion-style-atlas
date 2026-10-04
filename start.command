#!/usr/bin/env bash
# Created: 2026-10-04
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"
if [ ! -d node_modules ]; then npm ci; fi
if [ ! -d technology-runtime/node_modules ]; then npm ci --prefix technology-runtime; fi
npm run dev
