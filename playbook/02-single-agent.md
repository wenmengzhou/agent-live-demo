# Working with one agent

## Two ways to work

| | Interactive pairing | Async, hosted |
|---|---|---|
| How | You and the agent in the same IDE or terminal, steering every few minutes | Send the task to a cloud agent, go to your meeting, come back to a pull request |
| Best for | Exploring, fuzzy tasks, learning a new codebase | Well-scoped tasks with tests. It can watch its own PR and fix CI failures and review comments |

**Rule of thumb:** fuzzy work stays interactive; well-scoped work goes async. Rework on a fuzzy async task is async too, and that's slower than pairing.

## A reliable loop

| Step | Who | What |
|---|---|---|
| 1. Break down | Human | Split work into pieces you can verify on their own |
| 2. Describe | Human | Goal, constraints, acceptance criteria ([brief template](brief-template.md)) |
| 3. Execute | Agent | Reads, edits and runs the code itself |
| 4. Verify | Machine | Tests, lint, type checks, CI |
| 5. Review | Human | Read the diff and ask why |
| 6. Merge | Human | Small PRs, easy to roll back |

Spend your effort at both ends: a clear brief at the start, a careful review at the end. When "agents don't work for us", the problem is usually at one of the ends.

## Set up the agent's workbench

1. **A project instructions file** written for agents (`CLAUDE.md`, `AGENTS.md`): how to build, how to test, conventions, what not to touch. See [demo-app/CLAUDE.md](../demo-app/CLAUDE.md).
2. **One-command verification.** Tests, lint and type checks run with one command so the agent can check its own work. In the demo: `npm run verify`.
3. **Clear permission boundaries.** Run in a sandbox. Keep production secrets out of the context. Risky actions need a human.
4. **Access to your tools.** The CLIs, systems and team playbooks it can use; see [CLI, MCP and skills](03-cli-mcp-skills.md).

All four help new human teammates too.

## Example: from code change to tested build

1. **Brief:** you describe the change and what "done" means.
2. **Code:** the agent implements it with unit tests.
3. **Deploy:** it deploys the branch to the test environment.
4. **E2E:** it runs end-to-end tests against the deployed build. Failures loop back to step 2.
5. **PR:** it opens a pull request with the test results attached.

The agent doesn't stop at "it compiles". By the time you review, the question isn't "does this even work?" but "is this the right design?" The [live demo](../demo/RUN-OF-SHOW.md) runs exactly this loop on `demo-app/`.
