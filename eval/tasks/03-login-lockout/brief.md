Goal: Lock an account after repeated failed logins. After 5 failed POST /login attempts for the same username within 15 minutes, further attempts for that username return 429 with `{"error":"too many failed attempts"}` and a `Retry-After` header (seconds until the lock ends), even if the password is right. A successful login resets the count. A failed login returns 401 with `{"error":"invalid username or password"}`; today it returns 500, so fix that as part of this task.
Context: Login is handled in src/app.js; passwords are checked in src/users.js. There is no attempt tracking yet. Keep state in memory, per app instance.
Constraints: No new dependencies. Don't reveal whether a username exists: unknown usernames follow the same rules. Make the clock injectable so tests don't sleep.
Done when: Unit tests cover the 5th and 6th attempts, the reset on success, and the lock expiring; an E2E test covers the 429; and `npm run verify` passes.
If unsure: Stop and ask. Don't guess.
