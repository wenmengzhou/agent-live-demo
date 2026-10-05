# Adopting agents as a team

## Challenges, and what helped

| Challenge | What helped |
|---|---|
| Review becomes the bottleneck | Small PRs, and an agent pre-review before humans look |
| Vague briefs waste runs | A shared [brief template](brief-template.md) with a clear "done when" |
| Code looks right but isn't | Tests required in every brief; humans own approval |
| Agents lack team context | A project instructions file, kept up to date |
| Uneven adoption across the team | Champions, plus a short weekly show-and-tell |
| Security and cost concerns | Sandbox, least privilege, a monthly budget |
| Skills fade on critical code | Humans must be able to explain what they merge |

## A playbook for a team of about 10 engineers

**Shared setup**
- One instructions file per repo
- One brief template for everyone
- Agent pre-review on every PR

**People**
- One or two champions
- A 15-minute weekly show-and-tell
- Juniors use agents, seniors review

**Measure**
- Pilot two scenarios for 4–6 weeks
- Track time from delegation to merge, and rounds of rework
- Set a monthly cost budget

At ten people, conventions matter more than tools: everyone briefs and reviews the same way.

## Beyond code generation and review

| Area | Examples |
|---|---|
| Operate | Triage alerts and logs, draft incident timelines and postmortems |
| Plan | Turn meeting notes into tickets, draft design docs, research tools and libraries |
| Communicate | Status reports, release notes, translating docs between Japanese and English |
| Learn and onboard | Answer "how does this work?" for new teammates, analyze data, generate test data |

The same four questions apply: is the goal clear, and can someone check the result?

## Guardrails

- Never skip reading the diff.
- One task per PR.
- Keep secrets out of the context.
- Humans must still be able to explain critical modules.
- Cross-check important conclusions, ideally with a second model.
