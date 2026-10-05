Goal: POST /login must return 401 with `{"error":"invalid username or password"}` when the password is wrong. Today it returns 500.
Context: `verifyPassword` in src/users.js throws an AuthError, and the /login handler in src/app.js does not handle it, so the generic handler turns it into a 500.
Constraints: Keep the API paths and the success response unchanged. No new dependencies.
Done when: A new unit test and a new E2E test reproduce the bug and now pass, and `npm run verify` passes.
If unsure: Stop and ask. Don't guess.
