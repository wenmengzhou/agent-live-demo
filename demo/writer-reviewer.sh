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
# VERBOSE=1 streams each agent's raw output instead of a spinner.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BRIEF="$(cd "$(dirname "${1:?usage: demo/writer-reviewer.sh <brief.md>}")" && pwd)/$(basename "$1")"
OUT="$ROOT/.demo"
mkdir -p "$OUT"
cd "$ROOT/demo-app"

WRITER_ARGS=(-p --permission-mode acceptEdits --allowedTools "Bash(npm *)" "Bash(node *)" "Bash(git diff *)" "Bash(git status *)" "Bash(git stash *)")
[ -n "${WRITER_MODEL:-}" ] && WRITER_ARGS+=(--model "$WRITER_MODEL")

# ---- output helpers ---------------------------------------------------------
# Each agent runs quietly (its raw output goes to .demo/*.log); we show a spinner while it
# works, then print its final answer in a labelled box. VERBOSE=1 streams raw output instead.
if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'; DIM=$'\033[2m'; RESET=$'\033[0m'
  YELLOW=$'\033[33m'; BLUE=$'\033[34m'; MAGENTA=$'\033[35m'; GREEN=$'\033[32m'; RED=$'\033[31m'
else
  BOLD=; DIM=; RESET=; YELLOW=; BLUE=; MAGENTA=; GREEN=; RED=
fi
WIDTH=$(( $(tput cols 2>/dev/null || echo 100) ))
[ "$WIDTH" -gt 100 ] && WIDTH=100
line() { local n="$1" s; printf -v s '%*s' "$n" ''; printf '%s' "${s// /$2}"; }  # line N CHAR

step() {  # step "1/4" "WRITER" "Claude Code" "what happens"
  echo; echo
  printf '%s%s\n' "$BOLD$YELLOW" "$(line "$WIDTH" '━')"
  printf ' STEP %s  ·  %s  ·  %s\n' "$1" "$2" "$3"
  printf '%s%s\n' "$(line "$WIDTH" '━')" "$RESET"
  printf '%s%s%s\n' "$DIM" "$4" "$RESET"
}

box() {  # box COLOR "title" file
  local color="$1" title="$2" file="$3"
  echo
  local rest=$(( WIDTH - ${#title} - 4 )); [ "$rest" -lt 3 ] && rest=3
  printf '%s┌─ %s %s%s\n' "$color$BOLD" "$title" "$(line "$rest" '─')" "$RESET"
  fold -s -w $((WIDTH - 4)) < "$file" | sed "s/^/${color}│${RESET} /"
  printf '%s└%s%s\n' "$color$BOLD" "$(line $((WIDTH - 1)) '─')" "$RESET"
}

run_agent() {  # run_agent LOGFILE INPUTFILE cmd... ; stdout of cmd also saved to LOGFILE
  local log="$1" input="$2"; shift 2
  if [ -n "${VERBOSE:-}" ]; then "$@" < "$input" 2>&1 | tee "$log"; return; fi
  "$@" < "$input" > "$log" 2>&1 &
  local pid=$! start=$SECONDS frames='|/-\' i=0
  while kill -0 "$pid" 2>/dev/null; do
    printf '\r  %s working... %ds  %s(log: %s)%s ' "${frames:i++%4:1}" "$((SECONDS - start))" "$DIM" "${log#$ROOT/}" "$RESET"
    sleep 0.2
  done
  local code=0; wait "$pid" || code=$?
  if [ "$code" -eq 0 ]; then printf '\r  %s✓ done in %ds%s%*s\n' "$GREEN" "$((SECONDS - start))" "$RESET" 30 ''
  else printf '\r  %s✗ failed (exit %d) after %ds, see %s%s\n' "$RED" "$code" "$((SECONDS - start))" "${log#$ROOT/}" "$RESET"; fi
  return "$code"
}

changes() {
  git add -N . >/dev/null 2>&1 || true
  echo; printf '%sFiles changed so far:%s\n' "$BOLD" "$RESET"
  git diff --stat -- . | sed 's/^/  /'
}

diff_since_start() {
  git add -N . >/dev/null 2>&1 || true   # include new files in the diff
  git diff -- .
}

REVIEWER="${REVIEWER:-$(command -v codex >/dev/null 2>&1 && echo codex || echo claude)}"

review() {
  if [ "$REVIEWER" = codex ]; then
    # Codex's built-in reviewer runs in a read-only sandbox and reads the changes itself (git diff);
    # we give it our review checklist and the brief as custom instructions.
    git add -N . >/dev/null 2>&1 || true
    { echo "Review the uncommitted changes in demo-app/ (use git diff and git status; include new files)."
      echo; cat "$ROOT/demo/prompts/review.md"; echo; echo "## Brief"; cat "$BRIEF"; } > "$OUT/review-input.md"
    run_agent "$OUT/reviewer.log" "$OUT/review-input.md" \
      codex exec review ${CODEX_MODEL:+-m "$CODEX_MODEL"} -o "$OUT/review.md" -
  else
    { cat "$ROOT/demo/prompts/review.md"; echo; echo "## Brief"; cat "$BRIEF"; echo; echo "## Diff"; echo '```diff'; diff_since_start; echo '```'; } > "$OUT/review-input.md"
    run_agent "$OUT/reviewer.log" "$OUT/review-input.md" claude -p --model "${REVIEWER_MODEL:-sonnet}"
    cp "$OUT/reviewer.log" "$OUT/review.md"
  fi
}

if [ -n "$(git status --porcelain -- .)" ]; then
  echo "demo-app has uncommitted changes. Commit them or run demo/reset.sh first." >&2
  exit 1
fi

if [ "$REVIEWER" = codex ]; then REVIEWER_NAME="Codex${CODEX_MODEL:+ ($CODEX_MODEL)}"; else REVIEWER_NAME="Claude Code (${REVIEWER_MODEL:-sonnet})"; fi
WRITER_NAME="Claude Code${WRITER_MODEL:+ ($WRITER_MODEL)}"

step 1/4 WRITER "$WRITER_NAME" "Implements the brief, adds tests, runs npm run verify (unit → deploy to test → E2E)."
box "$DIM" "BRIEF" "$BRIEF"
run_agent "$OUT/writer-1.log" "$BRIEF" claude "${WRITER_ARGS[@]}"
cp "$OUT/writer-1.log" "$OUT/writer-1.md"
box "$BLUE" "WRITER | $WRITER_NAME | result" "$OUT/writer-1.md"
changes

step 2/4 REVIEWER "$REVIEWER_NAME" "A different model reviews the diff against the brief. It does not edit code."
review
box "$MAGENTA" "REVIEWER | $REVIEWER_NAME | findings" "$OUT/review.md"

step 3/4 WRITER "$WRITER_NAME" "Fixes the findings it agrees with, explains the rest, runs npm run verify again."
{
  echo "A reviewer looked at your change. Their findings are below."
  echo "Fix the ones you agree with. For any you disagree with, say why in one line."
  echo "Then run npm run verify and report the result."
  echo
  cat "$OUT/review.md"
} > "$OUT/writer-2-input.md"
run_agent "$OUT/writer-2.log" "$OUT/writer-2-input.md" claude "${WRITER_ARGS[@]}" --continue
cp "$OUT/writer-2.log" "$OUT/writer-2.md"
box "$BLUE" "WRITER | $WRITER_NAME | response to review" "$OUT/writer-2.md"
changes

step 4/4 HUMAN "you" "The agents are done. Only you can judge: is this the right change, and is the design sound?"
cat <<MSG

  Full diff:       git -C demo-app diff
  Each step:       .demo/writer-1.md   .demo/review.md   .demo/writer-2.md
  Raw agent logs:  .demo/*.log
  Ship it:         git checkout -b fix/login-401 && git commit -am "..."   (then open a PR)
  Throw it away:   demo/reset.sh
MSG
