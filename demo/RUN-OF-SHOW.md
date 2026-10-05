# Live demo: from brief to reviewed, tested change

About 8 minutes. One small, well-scoped bug goes from a written brief to a reviewed, tested change, with the human only at the start and the end. It shows the single-agent loop (code → deploy to test → E2E) and pattern 3 (writer + reviewer).

## Before the demo

- [ ] `git clone https://github.com/wenmengzhou/agent-live-demo.git && cd agent-live-demo`; Node 20+; `cd demo-app && npm run verify` passes (no install step, zero dependencies).
- [ ] Claude Code installed and logged in (`claude -p "hi"` answers).
- [ ] Codex installed and logged in for the review step (see [Codex as the reviewer](#codex-as-the-reviewer)).
- [ ] Do a full dry run, then `demo/reset.sh -y`.
- [ ] **Backup:** 30 minutes before, run the whole demo once in a second clone and leave that terminal open. If the live run is slow: "Here's the same task I started earlier."
- [ ] Record a 2-minute screen capture of a full run in case the network fails.
- [ ] Large terminal font, notifications off.

## Codex as the reviewer

Claude Code writes; Codex reviews. The script uses Codex automatically when `codex` is on your PATH.

**One-time setup**

```bash
npm install -g @openai/codex
codex login                 # ChatGPT account or API key
codex exec "say hi"         # should answer
```

**What the script runs** in step 2/4 (`demo/writer-reviewer.sh`):

```bash
codex exec review -o .demo/review.md - < .demo/review-input.md
```

`codex exec review` is Codex's built-in code reviewer. It runs in a read-only sandbox, reads the uncommitted changes itself with `git diff`, and gets [our review checklist](prompts/review.md) plus the brief as instructions. Its findings land in `.demo/review.md`, and step 3/4 feeds them back to Claude to fix.

**Options**

| You want | Run |
|---|---|
| Force Codex | `REVIEWER=codex demo/writer-reviewer.sh demo/briefs/fix-login-401.md` |
| Pick the Codex model | `CODEX_MODEL=<model> demo/writer-reviewer.sh ...` |
| Fall back to Claude (no Codex, or network trouble) | `REVIEWER=claude REVIEWER_MODEL=sonnet demo/writer-reviewer.sh ...` |

**By hand, without the script.** After Claude has made its change in `demo-app/`:

```bash
cd demo-app
codex exec review --uncommitted        # Codex's default review of everything not yet committed
```

Then paste Codex's findings back into your Claude session: "A reviewer left these findings. Fix the ones you agree with, explain the rest, and run npm run verify."

## The bug

`POST /login` with a wrong password returns **500** instead of 401. (So does an unknown username; the brief doesn't say so, which gives the reviewer something to find.)

```bash
cd demo-app && npm start
# in a second terminal:
curl -i -X POST localhost:3000/login -d '{"username":"alice","password":"wrong"}'
# HTTP/1.1 500 Internal Server Error
```

## Run of show

| Time | Step | Command / what to show | What to say |
|---|---|---|---|
| 0:00 | Show the bug | the `curl` above | "A small, well-scoped bug. It passes all four questions." |
| 0:45 | Show the workbench | `demo-app/CLAUDE.md`, `npm run verify` | "The agent reads this every time. One command checks everything." |
| 1:15 | Show the brief | [demo/briefs/fix-login-401.md](briefs/fix-login-401.md) (the slide 12 brief) | "Notice 'Done when'. That's the agent's feedback loop." |
| 1:45 | Start the run | `demo/writer-reviewer.sh demo/briefs/fix-login-401.md` | Narrate while it works; don't wait in silence |
| 2:00 | Writer: code + tests | (step 1/4 output) | "It writes a failing test first, then the fix." |
| 3:30 | Writer: deploy + E2E | `npm run verify` inside the run | "It doesn't stop at 'it compiles'. It deploys and runs end-to-end tests." |
| 5:00 | Codex reviews | (step 2/4 output, `codex exec review`) | "Now Codex, a different model from a different company, reviews the diff. It has its own blind spots, so it catches what Claude missed." |
| 6:00 | Writer fixes findings | (step 3/4 output) | |
| 6:30 | Human review | `git -C demo-app diff` | "My job: is this the right change, and is the design sound?" |
| 8:00 | Back to slides | `demo/reset.sh -y` afterwards | |

## Variations

- **Single agent only, interactive:** `cd demo-app && claude`, paste the brief, and watch it work.
- **Vague vs. clear brief:** run `demo/writer-reviewer.sh demo/briefs/vague.md` in a throwaway clone first and compare the diff with the brief's.
- **Relay handoff:** start a harder task (`eval/tasks/03-login-lockout/brief.md`) with `cd demo-app && claude`, stop it partway, then run `demo/handoff.sh`. The current agent writes `HANDOFF.md`; a fresh agent (Codex if installed) finishes from the note alone.
- **Model selection:** `node eval/run.js --models opus,sonnet,haiku --tasks 01-login-401,03-login-lockout` and show the accuracy table.
- **Async, hosted:** push the repo, give a hosted agent (Claude Code on the web, Codex cloud) the same brief, and come back to a pull request.
