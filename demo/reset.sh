#!/usr/bin/env bash
# Put demo-app/ back to its committed state (the seeded bug included), so the demo can run again.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/demo-app"
node scripts/deploy-test.js down >/dev/null 2>&1 || true
if [ "${1:-}" != "-y" ]; then
  git status --short -- .
  read -r -p "Discard all changes in demo-app/ shown above? [y/N] " answer
  [ "$answer" = y ] || exit 1
fi
git checkout -- .
git clean -fdq -- .
rm -rf "$ROOT/.demo"
echo "demo-app reset."
