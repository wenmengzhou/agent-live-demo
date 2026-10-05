#!/usr/bin/env bash
# Pattern 4, relay handoff: the current agent writes HANDOFF.md, then a fresh
# agent (a different tool if you have one) picks up from the note alone.
#
#   demo/handoff.sh            # hand off to codex if installed, else a fresh claude session
#   demo/handoff.sh claude     # force a fresh Claude Code session as the next agent
#
# Run it in the middle of a task you started with claude in demo-app/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/demo-app"
NEXT="${1:-}"
[ -z "$NEXT" ] && { command -v codex >/dev/null 2>&1 && NEXT=codex || NEXT=claude; }

banner() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }

banner "1/2  Current agent writes the handoff note"
claude -p --continue --permission-mode acceptEdits < "$ROOT/demo/prompts/handoff.md"
echo; cat HANDOFF.md

TAKEOVER="Read HANDOFF.md and CLAUDE.md, then finish the task described there. Start from 'Suggested next step' unless you find a better one. Run npm run verify before you say you are done, and delete HANDOFF.md when the task is finished."

banner "2/2  A fresh agent ($NEXT) takes over from the note"
if [ "$NEXT" = codex ]; then
  codex exec --sandbox workspace-write "$TAKEOVER"
else
  claude -p --permission-mode acceptEdits --allowedTools "Bash(npm *)" "Bash(node *)" "$TAKEOVER"
fi
