# notes-api

The live-demo target: a tiny JSON API with login and notes, zero dependencies, Node 20+.

```bash
npm start          # http://localhost:3000
npm run verify     # unit tests → deploy to the local test env (port 4100) → E2E tests → tear down
```

| Endpoint | |
|---|---|
| `GET /health` | `{ "status": "ok" }` |
| `POST /login` | `{ "username", "password" }` → `{ "token" }`. Demo user: `alice` / `correct-horse` |
| `GET /notes` | Your notes (needs `Authorization: Bearer <token>`) |
| `POST /notes` | `{ "title", "body" }` → the new note |

**It has a seeded bug:** a wrong password returns 500 instead of 401. That's the live demo's task; see [Run the live demo](../README.md#run-the-live-demo).

`CLAUDE.md` and `AGENTS.md` are the instructions agents read; `.claude/skills/deploy-to-test/` is an example skill; `scripts/deploy-test.js` stands in for a real deploy to a test environment.
