# Brief template

Brief the agent like a smart new teammate who doesn't know the background. If they couldn't start from your message, neither can the agent.

```
Goal:        <the outcome, in one or two sentences>
Context:     <where the relevant code lives, what you already know about the cause>
Constraints: <what must not change; no new dependencies; style rules>
Done when:   <a check the agent can run itself: which tests, which command must pass>
If unsure:   Stop and ask. Don't guess.
```

## Vague vs. clear

**Vague:** "Improve the login module."
"Improve" how? The agent will guess. It might tune performance, or rewrite the whole module.

**Clear:**
```
Goal:        Return 401 on a wrong password. Today it returns 500.
Context:     The password check throws an uncaught exception.
Constraints: Keep the API signature. No new dependencies.
Done when:   A new test reproduces the bug, and the full test suite passes.
If unsure:   Stop and ask. Don't guess.
```

"Done when" matters most: it gives the agent its own way to check the result. "If unsure, stop and ask" prevents confident guessing.

Real briefs for the demo app: [demo/briefs/](../demo/briefs) and [eval/tasks/*/brief.md](../eval/tasks).
