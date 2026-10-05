#!/usr/bin/env bash
# Pattern 3, writer + reviewer: one agent writes, a different model reviews,
# the writer addresses the findings, and a human approves at the end.
#
#   demo/writer-reviewer.sh demo/briefs/fix-login-401.md
#
# Writer:   Claude Code (claude -p). WRITER_MODEL picks its model.
# Reviewer: REVIEWER=codex  -> Codex's built-in reviewer (codex exec review), CODEX_MODEL picks its model
#           REVIEWER=claude -> Claude Code on another model (REVIEWER_MODEL, default "sonnet")
#           unset           -> codex if it is installed, else claude
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRIEF="$(cd "$(dirname "${1:?usage: demo/writer-reviewer.sh <brief.md>}")" && pwd)/$(basename "$1")"
OUT="$ROOT/.demo"
mkdir -p "$OUT"
cd "$ROOT/demo-app"

WRITER_ARGS=(-p --permission-mode acceptEdits --allowedTools "Bash(npm *)" "Bash(node *)" "Bash(git diff *)" "Bash(git status *)" "Bash(git stash *)")
[ -n "${WRITER_MODEL:-}" ] && WRITER_ARGS+=(--model "$WRITER_MODEL")

banner() { printf '\n\033[1;33m==> %s\033[0m\n' "$*"; }

diff_since_start() {
  git add -N . >/dev/null 2>&1 || true   # include new files in the diff
  git diff -- .
}

REVIEWER="${REVIEWER:-$(command -v codex >/dev/null 2>&1 && echo codex || echo claude)}"

review() {
  if [ "$REVIEWER" = codex ]; then
    # Codex's built-in reviewer runs in a read-only sandbox and reads the changes itself (git diff);
    # we give it our review checklist and the brief as custom instructions.
    echo "(reviewer: codex exec review${CODEX_MODEL:+ -m $CODEX_MODEL})"
    git add -N . >/dev/null 2>&1 || true
    { echo "Review the uncommitted changes in demo-app/ (use git diff and git status; include new files)."
      echo; cat "$ROOT/demo/prompts/review.md"; echo; echo "## Brief"; cat "$BRIEF"; } > "$OUT/review-input.md"
    codex exec review ${CODEX_MODEL:+-m "$CODEX_MODEL"} -o "$OUT/review.md" - < "$OUT/review-input.md"
    echo; cat "$OUT/review.md"
  else
    echo "(reviewer: claude --model ${REVIEWER_MODEL:-sonnet})"
    { cat "$ROOT/demo/prompts/review.md"; echo; echo "## Brief"; cat "$BRIEF"; echo; echo "## Diff"; echo '```diff'; diff_since_start; echo '```'; } > "$OUT/review-input.md"
    claude -p --model "${REVIEWER_MODEL:-sonnet}" < "$OUT/review-input.md" | tee "$OUT/review.md"
  fi
}

if [ -n "$(git status --porcelain -- .)" ]; then
  echo "demo-app has uncommitted changes. Commit them or run demo/reset.sh first." >&2
  exit 1
fi

banner "1/4  Writer implements the brief"
cat "$BRIEF"
claude "${WRITER_ARGS[@]}" < "$BRIEF" | tee "$OUT/writer-1.md"

banner "2/4  A different model reviews the diff"
review

banner "3/4  Writer addresses the findings"
{
  echo "A reviewer looked at your change. Their findings are below."
  echo "Fix the ones you agree with. For any you disagree with, say why in one line."
  echo "Then run npm run verify and report the result."
  echo
  cat "$OUT/review.md"
} | claude "${WRITER_ARGS[@]}" --continue | tee "$OUT/writer-2.md"

banner "4/4  Your turn: review and approve"
git add -N . >/dev/null 2>&1 || true
git diff --stat -- .
cat <<MSG

The agents are done. What only you can judge:
  - Is this the right change at all?
  - Is the design sound? Would you be able to explain it?

  Full diff:      git -C demo-app diff
  Review notes:   .demo/review.md
  Ship it:        git checkout -b fix/login-401 && git commit -am "..."   (then open a PR)
  Throw it away:  demo/reset.sh
MSG
