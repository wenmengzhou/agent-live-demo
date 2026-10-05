You are reviewing a pull request written by another coding agent. You did not write it.
The brief it was given and the full diff follow.

Review for:
1. Correctness: does the change do what the brief asks, including edge cases the brief implies but does not spell out?
2. Risk: security (leaking information, auth bypass), data loss, behaviour changes for existing callers.
3. Tests: does each new behaviour have a test that would fail without the change? Are any existing tests weakened?
4. Scope: anything changed that the brief did not ask for.

Output a short list of findings. For each: severity (blocking / should fix / nit), file and line, what is wrong, and a concrete fix.
If there is nothing blocking, say "No blocking findings" on the first line.
Do not rewrite the code yourself.
