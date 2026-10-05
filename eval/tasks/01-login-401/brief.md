Goal: POST /login must return 401 with `{"error":"invalid username or password"}` when the password is wrong or the username does not exist. Today both return 500. The two cases must be indistinguishable to the caller.
Context: `verifyPassword` in src/users.js throws an AuthError on a wrong password and crashes on an unknown user (it reads `user.salt` on `undefined`). The /login handler in src/app.js does not handle either, so the generic handler turns them into a 500.
Constraints: Keep the API paths and the success response unchanged. No new dependencies.
Done when: New unit and E2E tests cover both cases and now pass, and `npm run verify` passes.
If unsure: Stop and ask. Don't guess.
