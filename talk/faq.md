# Frequently asked questions

**Is it safe to give an agent our source code?**
It depends on the provider's data policy and your company's rules, so check both. In practice: run agents in a sandbox, keep secrets out of the context, use least-privilege credentials, and start with non-sensitive repos.

**Does code quality go down?**
It can if review gets sloppy. That's why the loop keeps humans at both ends, requires tests in the brief, and uses a second model for review. Code that looks right but isn't is the main risk.

**Will junior engineers stop learning?**
A real risk. Ask juniors to explain every agent change they merge, and use agent reviews as a learning tool. Humans must still understand critical modules.

**How much does it cost?**
It varies a lot by tool, model and usage. Compare it with engineer time on your pilot tasks, and track it during the pilot. `eval/run.js` reports time per task, so you can add token cost from your provider's dashboard.

**Which tools do you use?**
Claude Code and Codex, often together: one writes and the other reviews, or one takes over from the other with a handoff doc. The patterns matter more than the specific tool.

**Does it work with comments and docs in Japanese?**
Modern models handle Japanese well. Keep the brief and instructions file in whichever language the team actually uses, and stay consistent. Test it on your own codebase during the pilot.

**What about legacy code with no tests?**
That fails question 2 (can it be verified?). Start by having the agent write characterization tests for the current behavior; then the code becomes a good fit for agents.

**How do I convince my manager?**
Run a small pilot on one or two low-risk scenarios and bring your own numbers: time from delegation to merge, rounds of rework, and issues found in review.

**When do you NOT use an agent?**
Unclear requirements, architecture decisions, security- or money-critical code, and bugs that only reproduce in production. The agent can still research and draft there, but a person decides.

**Who is responsible when agent code breaks production?**
The engineer who approved and merged it, the same as with any code. Agents don't change accountability; review is still a human sign-off.

**Isn't multi-agent overkill?**
Often, yes. If one agent can do it, use one. Add a second agent when you hit a real limit: context, speed, or the need for an independent review.

**How do you handle licensing and copied code?**
Follow your company's open-source policy, and use the code-provenance or license-scanning tools you already have in CI. Treat agent output like code from a new contributor.
