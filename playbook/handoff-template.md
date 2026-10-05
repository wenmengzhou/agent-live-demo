# Handoff template

Save as `HANDOFF.md` in the working tree. Under 60 lines. Facts, not the story of the session.

```markdown
## Goal
<The task and its acceptance criteria, copied from the brief.>

## Done so far
<What changed, file by file, on which branch. Does the full check pass right now?>

## Where it's stuck
<The current failure or open question, with the exact error message.>

## What was tried
- <Approach 1>: <why it didn't work>
- <Approach 2>: <why it didn't work>

## Suggested next step
<The single next thing to do, and why.>
```

The prompt that asks an agent to write this is in [demo/prompts/handoff.md](../demo/prompts/handoff.md).
