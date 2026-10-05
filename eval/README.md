# eval: choose a model on your own tasks

The model-selection method from [playbook/05](../playbook/05-choosing-a-model.md), step 4: run candidate models on a test set of your own tasks and measure accuracy. This folder is a small working version of that.

## How it works

Each folder in `tasks/` is one task:

| File | Purpose |
|---|---|
| `brief.md` | What the agent gets: goal, context, constraints, done when |
| `hidden.test.js` | Acceptance tests the agent never sees, added only after it finishes |
| `reference/` | A known-good solution, used to check the task itself |

For every model × task × run, `run.js`:
1. copies `demo-app/` into a fresh temp folder,
2. runs the agent there with the brief,
3. adds the hidden tests and runs them together with the existing tests,
4. records pass/fail, time and lines changed.

A task passes only if the hidden tests pass **and** no existing test broke.

## Run it

```bash
node eval/run.js --self-test                       # no agent, no API key: checks every task fails on the baseline and passes with its reference
node eval/run.js --models opus,sonnet,haiku        # step down through the tiers
node eval/run.js --models sonnet --runs 3          # repeat to see variance
node eval/run.js --models sonnet --tasks 01-login-401 --keep   # keep the working copy to inspect the diff
```

Output is a table like this, plus `eval/results/<timestamp>/` with `results.json` and one agent log per run:

```
| model | passed | accuracy | avg seconds | avg lines changed |
|---|---|---|---|---|
| <model a> | 4/4 | 100% | ... | ... |
| <model b> | 3/4 | 75% | ... | ... |
```

## Other agents

`--agent` is a shell command run inside the working copy, with `{model}`, `{brief}` and `{workdir}` placeholders. The default is Claude Code:

```bash
claude -p --model {model} --permission-mode acceptEdits --allowedTools "Bash(npm *)" "Bash(node *)" "Bash(git stash *)" < {brief}
```

For Codex:

```bash
node eval/run.js --models <model> --agent 'codex exec -m {model} --sandbox workspace-write - < {brief}'
```

The agent edits files in a throwaway copy, but it runs real commands on your machine. Run it in a container or VM if that matters to you.

## The tasks

| Task | Difficulty | What it tests |
|---|---|---|
| `01-login-401` | Easy | The live-demo bug, with unknown usernames spelled out in the brief |
| `02-note-validation` | Easy | Input validation with exact messages and boundaries |
| `03-login-lockout` | Medium | State, time, and not leaking whether a username exists |
| `04-notes-pagination` | Medium | Cursor pagination with input validation |

## Lesson from the first run: you are also grading your briefs

The first version of task 01 used the live-demo brief, which only mentions wrong passwords, while the hidden tests also checked unknown usernames. Two models fixed exactly what was asked. One of them noticed the unknown-username leak, but it followed "if unsure, stop and ask" and left it alone. Both "failed".

If a hidden test checks something the brief doesn't say, you are measuring the brief, not the model. Every behaviour a hidden test checks should be stated in the brief.

## Add your own

Four tasks are enough to see the method, not to choose a model. For a real decision, add 20–50 tasks from your own backlog:

1. Create `tasks/<id>/` with a `brief.md` written the way your team writes briefs.
2. Write `hidden.test.js` (it is copied to `test/hidden/` in the working copy, so import helpers from `../helpers.js`).
3. Put a known-good solution in `reference/`, as files at their paths relative to `demo-app/`.
4. `node eval/run.js --self-test` must say `ok` for it.

To use your own codebase instead of `demo-app/`, change `appDir` at the top of `run.js`.
