#!/usr/bin/env node
// Model selection harness: run the same task set against several models and
// measure how many tasks each one gets right.
//
//   node eval/run.js --models sonnet,opus                 # run every task on two models
//   node eval/run.js --models sonnet --tasks 01-login-401 # one task
//   node eval/run.js --models gpt-5 --agent 'codex exec -m {model} --sandbox workspace-write - < {brief}'
//   node eval/run.js --self-test                          # check the harness itself (no agent, no API key)
//
// Each run copies demo-app/ into a fresh temp folder, hands the task brief to the
// agent, then drops in hidden acceptance tests the agent never saw and runs them
// together with the existing tests. A task passes only if both pass.

import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..', 'demo-app');
const tasksDir = join(here, 'tasks');

const DEFAULT_AGENT =
  'claude -p --model {model} --permission-mode acceptEdits ' +
  '--allowedTools "Bash(npm *)" "Bash(node *)" "Bash(git stash *)" < {brief}';

const { values: opts } = parseArgs({
  options: {
    models: { type: 'string', default: '' },
    tasks: { type: 'string', default: '' },
    agent: { type: 'string', default: DEFAULT_AGENT },
    runs: { type: 'string', default: '1' },
    timeout: { type: 'string', default: '900' },
    keep: { type: 'boolean', default: false },
    'self-test': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (opts.help || (!opts.models && !opts['self-test'])) {
  console.log(`usage: node eval/run.js --models a,b [--tasks t1,t2] [--runs N] [--agent '<command>'] [--timeout seconds] [--keep]
       node eval/run.js --self-test

--agent is a shell command run inside the task's working copy. Placeholders:
  {model}  the model name     {brief}  path to the task brief     {workdir}  the working copy
Default: ${DEFAULT_AGENT}`);
  process.exit(opts.help ? 0 : 2);
}

const allTasks = readdirSync(tasksDir).filter((t) => existsSync(join(tasksDir, t, 'brief.md'))).sort();
const tasks = opts.tasks ? opts.tasks.split(',') : allTasks;
for (const t of tasks) {
  if (!allTasks.includes(t)) throw new Error(`unknown task ${t}; have: ${allTasks.join(', ')}`);
}

function freshCopy() {
  const dir = mkdtempSync(join(tmpdir(), 'agent-eval-'));
  cpSync(appDir, dir, {
    recursive: true,
    filter: (src) => !/\.test-env\.(pid|log)$|node_modules/.test(src),
  });
  if (git(dir, 'init', '-q').status === 0) {
    git(dir, 'add', '-A');
    git(dir, '-c', 'user.name=eval', '-c', 'user.email=eval@example.com', 'commit', '-qm', 'baseline');
  }
  return dir;
}

function git(cwd, ...args) {
  return spawnSync('git', args, { cwd, encoding: 'utf8' });
}

function linesChanged(dir) {
  git(dir, 'add', '-A');
  const out = git(dir, 'diff', '--cached', '--shortstat').stdout ?? '';
  const n = (re) => Number(out.match(re)?.[1] ?? 0);
  return n(/(\d+) insertion/) + n(/(\d+) deletion/);
}

function nodeTest(dir, pattern) {
  const r = spawnSync(process.execPath, ['--test', pattern], { cwd: dir, encoding: 'utf8' });
  return { ok: r.status === 0, output: r.stdout + r.stderr };
}

// Hidden tests go in after the agent has finished, so it can't read or tweak them.
function grade(dir, task) {
  mkdirSync(join(dir, 'test', 'hidden'), { recursive: true });
  cpSync(join(tasksDir, task, 'hidden.test.js'), join(dir, 'test', 'hidden', `${task}.test.js`));
  const hidden = nodeTest(dir, 'test/hidden/*.test.js');
  const existing = nodeTest(dir, 'test/*.test.js');
  return { hidden: hidden.ok, existing: existing.ok, output: hidden.output + existing.output };
}

function applyReference(dir, task) {
  cpSync(join(tasksDir, task, 'reference'), dir, { recursive: true });
}

if (opts['self-test']) {
  // Every task must fail on the untouched app and pass with its reference solution.
  let failed = 0;
  for (const task of tasks) {
    const base = freshCopy();
    const before = grade(base, task);
    const ref = freshCopy();
    applyReference(ref, task);
    const after = grade(ref, task);
    const ok = !before.hidden && after.hidden && after.existing;
    if (!ok) failed++;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${task}  baseline hidden=${before.hidden ? 'pass' : 'fail'}  reference hidden=${after.hidden ? 'pass' : 'fail'} existing=${after.existing ? 'pass' : 'fail'}`);
    if (!ok) console.log(after.output);
    rmSync(base, { recursive: true, force: true });
    rmSync(ref, { recursive: true, force: true });
  }
  process.exit(failed ? 1 : 0);
}

const models = opts.models.split(',').map((m) => m.trim()).filter(Boolean);
const runs = Number(opts.runs);
const results = [];
const outDir = join(here, 'results', new Date().toISOString().replace(/[:.]/g, '-'));
mkdirSync(outDir, { recursive: true });

for (const model of models) {
  for (const task of tasks) {
    for (let run = 1; run <= runs; run++) {
      const dir = freshCopy();
      const brief = join(tasksDir, task, 'brief.md');
      const cmd = opts.agent
        .replaceAll('{model}', model)
        .replaceAll('{brief}', JSON.stringify(brief))
        .replaceAll('{workdir}', JSON.stringify(dir));
      process.stdout.write(`${model}  ${task}  run ${run}/${runs} ... `);
      const started = Date.now();
      const agent = spawnSync(cmd, {
        cwd: dir,
        shell: true,
        encoding: 'utf8',
        timeout: Number(opts.timeout) * 1000,
        maxBuffer: 64 * 1024 * 1024,
      });
      const seconds = Math.round((Date.now() - started) / 1000);
      const timedOut = agent.error?.code === 'ETIMEDOUT';
      const changed = linesChanged(dir);
      const g = grade(dir, task);
      const pass = g.hidden && g.existing;
      const result = {
        model, task, run, pass,
        hiddenTests: g.hidden, existingTests: g.existing,
        agentExit: agent.status, timedOut, seconds, linesChanged: changed,
        workdir: opts.keep ? dir : undefined,
      };
      results.push(result);
      console.log(`${pass ? 'PASS' : 'fail'} (${seconds}s${timedOut ? ', timed out' : ''})`);
      const logName = `${model.replace(/[^\w.-]/g, '_')}-${task}-${run}.log`;
      writeFileSync(join(outDir, logName), `$ ${cmd}\n\n${agent.stdout ?? ''}\n${agent.stderr ?? ''}\n\n--- grading ---\n${g.output}`);
      if (!opts.keep) rmSync(dir, { recursive: true, force: true });
    }
  }
}

console.log('\n| model | passed | accuracy | avg seconds | avg lines changed |');
console.log('|---|---|---|---|---|');
for (const model of models) {
  const mine = results.filter((r) => r.model === model);
  const passed = mine.filter((r) => r.pass).length;
  const avg = (k) => Math.round(mine.reduce((s, r) => s + r[k], 0) / mine.length);
  console.log(`| ${model} | ${passed}/${mine.length} | ${Math.round((100 * passed) / mine.length)}% | ${avg('seconds')} | ${avg('linesChanged')} |`);
}

const outFile = join(outDir, 'results.json');
writeFileSync(outFile, JSON.stringify({ agent: opts.agent, results }, null, 2));
console.log(`\nDetails and agent logs: ${outDir}${opts.keep ? ' (working copies kept, see workdir in results.json)' : ''}`);
