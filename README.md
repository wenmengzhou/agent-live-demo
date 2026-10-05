# Coding First, Work Next, AGI Ahead

[![ci](https://github.com/wenmengzhou/agent-live-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/wenmengzhou/agent-live-demo/actions/workflows/ci.yml)

Companion repo for the talk by zhouwenmeng (October 2026) on using coding agents day to day: when to hand work to an agent, how to brief one, how several agents work together, and how to choose a model.

It has two halves:

- **The ideas**, written up so you can use them without the slides: [talk/](talk) and [playbook/](playbook).
- **Something to run**: a tiny app with a seeded bug, scripts for the multi-agent patterns, and a harness that measures models on your own tasks.

## Try it in two minutes

You need Node 20+ and [Claude Code](https://docs.anthropic.com/en/docs/claude-code), logged in. There is no `npm install` step: the demo has zero dependencies.

```bash
git clone https://github.com/wenmengzhou/agent-live-demo.git
cd agent-live-demo

# 1. The workbench: one command runs unit tests, deploys to a local "test env", and runs E2E tests
cd demo-app && npm run verify && cd ..

# 2. Single agent + writer/reviewer: an agent fixes the seeded bug, a different model reviews it
demo/writer-reviewer.sh demo/briefs/fix-login-401.md

# 3. Model selection: run the same tasks on several models and compare accuracy
node eval/run.js --models opus,sonnet,haiku

# Start over
demo/reset.sh
```

For the writer + reviewer pattern with two different vendors, also install [Codex](https://github.com/openai/codex) (`npm install -g @openai/codex && codex login`). When it's on your PATH, Codex reviews in step 2 and takes over in a handoff; without it, Claude on a different model plays that role. Details: [demo/RUN-OF-SHOW.md](demo/RUN-OF-SHOW.md#codex-as-the-reviewer).

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
| [demo/](demo) | [Run of show](demo/RUN-OF-SHOW.md), briefs, `writer-reviewer.sh`, `handoff.sh`, `reset.sh`, prompts | 15, 17, 18 |
| [eval/](eval) | Model-selection harness: briefs + hidden tests + reference solutions | 24 |

## The one-slide version

Ask four questions before you hand off a task: **Is the goal clear? Can it be verified? Is the context there? Is a mistake cheap?** Four yeses: hand it off. Any no: a human covers that gap.

Spend your effort at both ends: a clear brief at the start, a careful review at the end. If one agent can do it, use one agent. Pick models by measuring them on your own tasks, not by leaderboards.

Let agents do what they're good at. Let people do what only people can.

## License

[MIT](LICENSE)
