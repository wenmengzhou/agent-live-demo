# Connect the agent to your tools: CLI, MCP, skills

The model is the brain; the tools decide what the agent can actually do.

| | CLI ("hands") | MCP ("reach") | Skills ("know-how") |
|---|---|---|---|
| What | The agent runs the command-line tools you already use and reads their output | Model Context Protocol: an open standard that plugs other systems into any agent as tools | A folder of instructions and scripts the agent loads only when a task needs it |
| Best for | git, gh, test runners, build tools, kubectl, cloud CLIs | Issue trackers, docs, databases, monitoring, internal APIs | Team playbooks: release, deploy to test, debugging, review checklist |
| Watch out | Allowlist safe commands; keep destructive ones behind approval | Every server costs context; start read-only | Keep them short and versioned in the repo |

**Rule of thumb:** use a CLI if one exists, add MCP where there is none, and write a skill for anything your team repeats.

## In this repo

- **CLI:** the demo's agents only get `npm` and `node` (`--allowedTools "Bash(npm *)" "Bash(node *)"` in [writer-reviewer.sh](../demo/writer-reviewer.sh)). That's an allowlist in practice.
- **Skill:** [demo-app/.claude/skills/deploy-to-test/SKILL.md](../demo-app/.claude/skills/deploy-to-test/SKILL.md) turns "deploy to test and run E2E" into a playbook any agent session can load.
- **MCP:** not needed for the demo. To try one, add a server to a `.mcp.json` in `demo-app/` (for example an issue tracker or docs server your team uses), start read-only, and check how much context its tool list costs.
