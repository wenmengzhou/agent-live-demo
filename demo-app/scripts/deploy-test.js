// A stand-in for "deploy this branch to the test environment".
// `up` starts the current code as a background server on TEST_PORT (default 4100)
// and waits until /health answers; `down` stops it.
// In a real project this script would call your deploy tool instead.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, rmSync, existsSync, openSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.TEST_PORT ?? 4100);
const pidFile = join(root, '.test-env.pid');
const logFile = join(root, '.test-env.log');

function stop() {
  if (!existsSync(pidFile)) return;
  const pid = Number(readFileSync(pidFile, 'utf8'));
  try { process.kill(pid); } catch { /* already gone */ }
  rmSync(pidFile);
  console.log(`test env: stopped (pid ${pid})`);
}

async function up() {
  stop();
  const log = openSync(logFile, 'w');
  const child = spawn(process.execPath, ['src/server.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    detached: true,
    stdio: ['ignore', log, log],
  });
  child.unref();
  writeFileSync(pidFile, String(child.pid));

  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://localhost:${port}/health`);
      if (res.ok) {
        console.log(`test env: up at http://localhost:${port} (pid ${child.pid}, logs in .test-env.log)`);
        return;
      }
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  stop();
  console.error(`test env: failed to start, see ${logFile}`);
  process.exit(1);
}

const cmd = process.argv[2];
if (cmd === 'up') await up();
else if (cmd === 'down') stop();
else {
  console.error('usage: node scripts/deploy-test.js up|down');
  process.exit(2);
}
