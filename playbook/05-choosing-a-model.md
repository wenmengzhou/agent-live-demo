# Choosing a model

## Tiers, not versions

Versions change every few months; tiers are stable. Examples as of October 2026; check the current lineup before you rely on them.

| Tier | Examples | Use it for |
|---|---|---|
| Frontier | Claude Fable 5.1 · Opus 5.5 · GPT-6 Astra | Long agent runs, hard bugs, design |
| Balanced | Claude Sonnet 5.5 · GPT-6.1 Sol · Gemini 3.8 Flash | The daily default for most coding tasks |
| Small and fast | Claude Haiku 4.5 · GPT-6 Luna · Gemini Flash-Lite | High volume: triage, summaries, sub-agents |
| Open weights | DeepSeek V4.1 Flash · GLM-5.3 · MiMo-V2.6-Pro | Self-hosting, data residency, cost control (check each license) |

Two habits: use a different model family for the reviewer than the writer, and expect this table to change.

## How to choose: step down until it breaks

1. **Pick 1–2 hard tasks.** Real tasks from your backlog, typical of what you want to hand off.
2. **Start at the top.** Strongest model, most complex mode: full agent, multi-step, no hand-holding. If even that fails, the task isn't ready for an agent, or the brief needs work.
3. **Step down.** Each round, a smaller or cheaper model, until it fails. Note where it broke: that's the minimum capability the task needs.
4. **Confirm on a test set.** Run the candidates around that boundary on 20–50 of your own tasks and measure accuracy.

**Then pick** the cheapest model that meets your accuracy bar, with one tier above it for the hardest cases. Weigh cost, speed and rework, not accuracy alone.

**Keep it honest:** check the data policy and where data is processed; keep the test set and re-run it when new models ship. Leaderboards are a hint; your own tasks decide.

## Do it with this repo

[eval/](../eval) is a small version of step 4. Each task is a brief plus hidden acceptance tests the agent never sees:

```bash
node eval/run.js --models opus,sonnet,haiku          # step down through the tiers
node eval/run.js --models sonnet --runs 3            # repeat to see variance
```

Swap in your own tasks: add a folder under `eval/tasks/` with a `brief.md`, a `hidden.test.js`, and a `reference/` solution, then check it with `node eval/run.js --self-test`. See [eval/README.md](../eval/README.md).
