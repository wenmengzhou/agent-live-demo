---
name: deploy-to-test
description: Deploy the current branch to the test environment and run the end-to-end tests against it. Use after a code change, before opening a pull request.
---

# Deploy to test and run E2E

1. Run the unit tests first: `npm test`. Fix failures before deploying.
2. Deploy: `npm run deploy:test`. It prints the URL (default http://localhost:4100). If it fails, read `.test-env.log`.
3. Run E2E: `npm run e2e`.
4. If an E2E test fails, read the failing assertion, fix the code (not the test, unless the test is wrong), and go back to step 1.
5. Always stop the environment when you finish: `npm run deploy:stop`.
6. In your summary, paste the pass/fail counts from both test runs.

`npm run verify` does steps 1–5 in one go; use the steps above when you need to debug a failing run.
