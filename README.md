# Coding First, Work Next, AGI Ahead

[![ci](https://github.com/wenmengzhou/agent-live-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/wenmengzhou/agent-live-demo/actions/workflows/ci.yml)

This repo has two halves:

- **The ideas**, written up so you can use them without the slides: [talk/](talk) and [playbook/](playbook).
- **Something to run**: a tiny app with a seeded bug, scripts for the multi-agent patterns, and a harness that measures models on your own tasks.

## Run the live demo

One small, well-scoped bug goes from a written brief to a reviewed, tested change, with a human only at the start and the end. You'll see the single-agent loop (code → deploy to test → E2E tests) and the writer + reviewer pattern: Claude Code writes, Codex reviews. It takes about 8 minutes.

### 1. Set up

You need Node 20+, plus [Claude Code](https://docs.anthropic.com/en/docs/claude-code) and [Codex](https://github.com/openai/codex), both logged in. There is no `npm install` step: the demo app has zero dependencies.

```bash
git clone https://github.com/wenmengzhou/agent-live-demo.git
cd agent-live-demo

npm install -g @openai/codex   # if you don't have Codex yet
codex login                    # ChatGPT account or API key

claude -p "say hi"             # both should answer
codex exec "say hi"
```

No Codex? Everything still works: Claude on a different model takes the reviewer's place (see [options](#reviewer-options)).

### 2. Check the workbench

```bash
cd demo-app
npm run verify     # unit tests → deploy to a local "test env" on port 4100 → E2E tests → tear down
cd ..
```

This is the one command the agent uses to check its own work. The agent's instructions are in [demo-app/CLAUDE.md](demo-app/CLAUDE.md) (with [AGENTS.md](demo-app/AGENTS.md) pointing Codex and others to it).

### 3. See the bug

`POST /login` with a wrong password returns **500** instead of 401.

```bash
cd demo-app && npm start
# in a second terminal:
curl -i -X POST localhost:3000/login -d '{"username":"alice","password":"wrong"}'
# HTTP/1.1 500 Internal Server Error
```

Stop the server with Ctrl+C. The task for the agent is in [demo/briefs/fix-login-401.md](demo/briefs/fix-login-401.md):

```
Goal: POST /login must return 401 with {"error":"invalid username or password"} when the password is wrong. Today it returns 500.
Context: verifyPassword in src/users.js throws an AuthError, and the /login handler in src/app.js does not handle it ...
Constraints: Keep the API paths and the success response unchanged. No new dependencies.
Done when: A new unit test and a new E2E test reproduce the bug and now pass, and npm run verify passes.
If unsure: Stop and ask. Don't guess.
```

"Done when" is the agent's feedback loop.

### 4. Run writer + reviewer

From the repo root:

```bash
demo/writer-reviewer.sh demo/briefs/fix-login-401.md
```

The script runs four steps and prints a banner for each:

| Step | Who | What happens |
|---|---|---|
| 1/4 | Claude Code (writer) | Fixes the bug, adds unit and E2E tests, runs `npm run verify` (deploys to the test env and runs E2E) |
| 2/4 | Codex (reviewer) | `codex exec review` reads the diff in a read-only sandbox, with [our review checklist](demo/prompts/review.md) and the brief as instructions. Findings go to `.demo/review.md` |
| 3/4 | Claude Code (writer) | Fixes the findings it agrees with, explains the rest, runs `npm run verify` again |
| 4/4 | You | Read the diff: is this the right change, and is the design sound? |

In our test run, the writer noticed that unknown usernames also returned 500 (which would reveal which usernames exist) and fixed that too. The reviewer then caught something subtler: unknown users got their answer faster than wrong passwords because they skipped the slow password hash, so response timing still leaked which usernames exist. The writer fixed that before any human looked.

### 5. Review, then reset

```bash
git -C demo-app diff     # the full change
cat .demo/review.md      # the reviewer's findings
demo/reset.sh            # put demo-app back to the seeded bug, ready to run again
```

### Reviewer options

| You want | Run |
|---|---|
| Codex reviews (default when `codex` is installed) | `demo/writer-reviewer.sh demo/briefs/fix-login-401.md` |
| Pick the Codex model | `CODEX_MODEL=<model> demo/writer-reviewer.sh ...` |
| Claude reviews instead (no Codex, or network trouble) | `REVIEWER=claude REVIEWER_MODEL=sonnet demo/writer-reviewer.sh ...` |
| Pick the writer's model | `WRITER_MODEL=<model> demo/writer-reviewer.sh ...` |

By hand, without the script: after Claude has made its change, run `cd demo-app && codex exec review --uncommitted`, then paste the findings back into your Claude session: "A reviewer left these findings. Fix the ones you agree with, explain the rest, and run npm run verify."

### More to try

- **Single agent, interactive:** `cd demo-app && claude`, paste the brief, and watch it work.
- **Vague vs. clear brief:** `demo/writer-reviewer.sh demo/briefs/vague.md` ("Improve the login module."), then compare the diff with the clear brief's.
- **Relay handoff:** start a harder task with `cd demo-app && claude` and paste [eval/tasks/03-login-lockout/brief.md](eval/tasks/03-login-lockout/brief.md). Stop it partway, then run `demo/handoff.sh`. The current agent writes `HANDOFF.md`, and a fresh agent (Codex if installed) finishes from the note alone.
- **Model selection:** `node eval/run.js --models opus,sonnet,haiku` runs four tasks with hidden tests on each model and prints an accuracy table. See [eval/README.md](eval/README.md).
- **Async, hosted:** push your clone, give a hosted agent (Claude Code on the web, Codex cloud) the same brief, and come back to a pull request.

<details>
<summary><b>Presenting it live</b>: timing and backup plan</summary>

| Time | Step | What to say |
|---|---|---|
| 0:00 | Show the bug (step 3) | "A small, well-scoped bug. It passes all four questions." |
| 0:45 | Show `demo-app/CLAUDE.md` and `npm run verify` | "The agent reads this every time. One command checks everything." |
| 1:15 | Show the brief | "Notice 'Done when'. That's the agent's feedback loop." |
| 1:45 | Start `demo/writer-reviewer.sh` | Narrate while it works; don't wait in silence |
| 2:00 | Writer: code + tests | "It writes a test that reproduces the bug, then the fix." |
| 3:30 | Writer: deploy + E2E | "It doesn't stop at 'it compiles'. It deploys and runs end-to-end tests." |
| 5:00 | Codex reviews | "Now a different model from a different company reviews the diff. It has its own blind spots." |
| 6:00 | Writer fixes findings | |
| 6:30 | `git -C demo-app diff` | "My job: is this the right change, and is the design sound?" |
| 8:00 | Wrap up, `demo/reset.sh -y` | |

Before you go on stage:
- Do a full dry run, then `demo/reset.sh -y`.
- 30 minutes before, run the whole demo once in a second clone and leave that terminal open. If the live run is slow: "Here's the same task I started earlier."
- Record a 2-minute screen capture of a full run in case the network fails.
- Large terminal font, notifications off.

</details>

## What's here

| Folder | What it is | Slides |
|---|---|---|
| [talk/slides.md](talk/slides.md) | Slide-by-slide outline, with links into this repo | all |
| [playbook/01-where-agents-fit.md](playbook/01-where-agents-fit.md) | What an agent is, the four questions, the scenario map, where the gains are | 5–9 |
| [playbook/02-single-agent.md](playbook/02-single-agent.md) | Pairing vs. async, the six-step loop, the workbench | 10–13, 15 |
| [playbook/brief-template.md](playbook/brief-template.md) | The brief template, vague vs. clear | 12 |
| [playbook/03-cli-mcp-skills.md](playbook/03-cli-mcp-skills.md) | Connecting agents to your tools | 14 |
| [playbook/04-multi-agent.md](playbook/04-multi-agent.md) | Four patterns and their cost | 16–19 |
| [playbook/handoff-template.md](playbook/handoff-template.md) | The handoff note for relay handoffs | 18 |
| [playbook/05-choosing-a-model.md](playbook/05-choosing-a-model.md) | Model tiers, and "step down until it breaks" | 23–24 |
| [playbook/06-team-adoption.md](playbook/06-team-adoption.md) | Adoption challenges, a 10-person playbook, beyond code, guardrails | 20–22 |
| [talk/faq.md](talk/faq.md) | Common questions and answers | Q&A |
| [demo-app/](demo-app) | `notes-api`: a tiny login + notes API with a seeded bug, `CLAUDE.md`, `AGENTS.md`, a skill, one-command verification | 13–15 |
| [demo/](demo) | Briefs, `writer-reviewer.sh`, `handoff.sh`, `reset.sh`, prompts ([how to run](#run-the-live-demo)) | 15, 17, 18 |
| [eval/](eval) | Model-selection harness: briefs + hidden tests + reference solutions | 24 |

## The one-slide version

Ask four questions before you hand off a task: **Is the goal clear? Can it be verified? Is the context there? Is a mistake cheap?** Four yeses: hand it off. Any no: a human covers that gap.

Spend your effort at both ends: a clear brief at the start, a careful review at the end. If one agent can do it, use one agent. Pick models by measuring them on your own tasks, not by leaderboards.

Let agents do what they're good at. Let people do what only people can.

## License

[MIT](LICENSE)
