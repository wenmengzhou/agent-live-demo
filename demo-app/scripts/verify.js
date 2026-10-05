// One command for every check: unit tests, deploy to the test env, E2E tests, tear down.
import { spawnSync } from 'node:child_process';

const run = (...args) => spawnSync(process.execPath, args, { stdio: 'inherit' }).status;

let code = run('--test', 'test/**/*.test.js');
if (code === 0) {
  code = run('scripts/deploy-test.js', 'up');
  if (code === 0) code = run('--test', 'e2e/**/*.test.js');
  run('scripts/deploy-test.js', 'down');
}
console.log(code === 0 ? '\nverify: all checks passed' : '\nverify: FAILED');
process.exit(code);
