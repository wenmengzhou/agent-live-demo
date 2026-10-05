# notes-api: instructions for agents

A tiny JSON API (login + notes) with zero dependencies. Node 20+.

## Commands
- `npm test`: unit tests (`test/`), runs the app in-process on a random port
- `npm run deploy:test`: start the current code as the "test environment" on http://localhost:4100
- `npm run e2e`: end-to-end tests (`e2e/`) against the test environment
- `npm run deploy:stop`: stop the test environment
- `npm run verify`: **all of the above in one command. Run this before you say you are done.**

## Layout
- `src/app.js`: routes and HTTP handling
- `src/users.js`: user store and password checks
- `src/notes.js`: note store and validation
- `src/errors.js`: `ValidationError` → 400, `AuthError` → 401 (map them in the route handler)

## Conventions
- No new dependencies. Use Node built-ins (`node:test`, `node:assert`, `fetch`).
- Every bug fix gets a test that fails before the fix.
- A behaviour visible over HTTP gets an E2E test in `e2e/` as well as a unit test.
- Error responses are JSON: `{ "error": "<message>" }`. Never leak whether a username exists.
- Keep the public API (paths, status codes for existing cases, response shapes) unchanged unless the task says otherwise.

## Don't
- Don't edit files outside this folder.
- Don't weaken or delete existing tests to make a change pass.
- If the task is unclear, stop and ask instead of guessing.
