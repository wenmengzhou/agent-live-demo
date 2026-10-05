# Coding First, Work Next, AGI Ahead

Slide-by-slide outline, with a link to where each idea lives in this repo.

The title is the story: in coding, agents have already proven themselves; in everyday work, teams are trying them now; the direction after that is AGI. So the useful question isn't whether AI can write code. It's which work to hand to an agent, and how.

## Opening

| # | Slide | Key point | In this repo |
|---|---|---|---|
| 1 | Cover | Coding first, work next, AGI ahead | |
| 2 | Agenda | Three parts, mapped to the six questions the host team sent (Q1–Q6) | |

## Part 1: what agents are, and where they fit (Q1, Q2)

| # | Slide | Key point | In this repo |
|---|---|---|---|
| 3 | At AI labs, agents already write most of the code | 80%+ of approved code at Anthropic is AI-written (Jan 2025 → May 2026); the share of R&D work done by AI with only high-level supervision went from 1% to 26% (Mar → Aug 2026); tasks AI can finish went from seconds (2023) to hours or days. Not hands-off yet: agents still sometimes ignore instructions or misreport their work. *Source: Chan, Hinton, Bengio, Clark et al., "What if automating AI R&D triggers an intelligence explosion?", Sept 2026, arXiv 2609.36054.* | |
| 4 | How we write code is changing | Humans write, AI autocompletes → humans delegate, agents execute → your job: set direction, then review | |
| 5 | What is an agent? | Model + tools + loop + environment | [playbook/01](../playbook/01-where-agents-fit.md#what-an-agent-is) |
| 6 | Four questions before you hand off a task | Clear goal? Verifiable? Context available? Mistake cheap? | [playbook/01](../playbook/01-where-agents-fit.md#four-questions-before-you-hand-off-a-task) |
| 7 | Scenario map | Clear scope × easy to verify, four quadrants | [playbook/01](../playbook/01-where-agents-fit.md#scenario-map-clear-scope--easy-to-verify) |
| 8 | What agents can take on today | In and around the codebase | [playbook/01](../playbook/01-where-agents-fit.md#what-agents-can-take-on-today) |
| 9 | Where the biggest gains are, and why | The common thread is a tight feedback loop | [playbook/01](../playbook/01-where-agents-fit.md#where-the-biggest-gains-are) |

## Part 2: how to use agents (Q1)

| # | Slide | Key point | In this repo |
|---|---|---|---|
| 10 | Two ways to work with one agent | Interactive pairing vs. async hosted | [playbook/02](../playbook/02-single-agent.md#two-ways-to-work) |
| 11 | A reliable loop | Break down → describe → execute → verify → review → merge | [playbook/02](../playbook/02-single-agent.md#a-reliable-loop) |
| 12 | Brief the agent like a new teammate | Goal, context, constraints, done when, if unsure | [brief template](../playbook/brief-template.md), [demo brief](../demo/briefs/fix-login-401.md) |
| 13 | Set up the agent's workbench | Instructions file, one-command verification, permissions, tools | [demo-app/CLAUDE.md](../demo-app/CLAUDE.md), `npm run verify` |
| 14 | CLI, MCP, skills | Use a CLI if one exists, add MCP where there is none, write a skill for anything your team repeats | [playbook/03](../playbook/03-cli-mcp-skills.md), [skill](../demo-app/.claude/skills/deploy-to-test/SKILL.md) |
| 15 | Example: from code change to tested build | Brief → code → deploy to test → E2E → PR | **[live demo](../demo/RUN-OF-SHOW.md)** |
| 16 | Why more than one agent: four patterns | Fan-out, orchestrator, writer + reviewer, relay handoff | [playbook/04](../playbook/04-multi-agent.md) |
| 17 | Writer + reviewer in team code review | A different model reviews; humans own design and approval | [demo/writer-reviewer.sh](../demo/writer-reviewer.sh) |
| 18 | Relay handoff | Pass the baton, not the mess | [demo/handoff.sh](../demo/handoff.sh), [template](../playbook/handoff-template.md) |
| 19 | More agents, more cost | If one agent can do it, use one agent | [playbook/04](../playbook/04-multi-agent.md#the-cost-of-more-agents) |

## Part 3: your questions (Q3–Q6), then open Q&A

| # | Slide | Key point | In this repo |
|---|---|---|---|
| 20 | Beyond code generation and review (Q6) | Operate, plan, communicate, learn | [playbook/06](../playbook/06-team-adoption.md#beyond-code-generation-and-review) |
| 21 | Challenges during adoption (Q3) | Review becomes the bottleneck, and six more | [playbook/06](../playbook/06-team-adoption.md#challenges-and-what-helped) |
| 22 | A playbook for a team of 10 (Q4) | Conventions matter more than tools | [playbook/06](../playbook/06-team-adoption.md#a-playbook-for-a-team-of-about-10-engineers) |
| 23 | Common models, and what each tier is for (Q5) | Frontier, balanced, small, open weights | [playbook/05](../playbook/05-choosing-a-model.md#tiers-not-versions) |
| 24 | How to choose: step down until it breaks (Q5) | Start at the top, step down, confirm on your own test set | [playbook/05](../playbook/05-choosing-a-model.md), **[eval/](../eval)** |
| 25 | Summary | Let agents do what they're good at. Let people do what only people can. | |
