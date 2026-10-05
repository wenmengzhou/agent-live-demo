import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

const login = (app, password, username = 'alice') =>
  app.request('POST', '/login', { body: { username, password } });

test('five failures are 401, the sixth attempt is 429 even with the right password', async () => {
  const app = await startApp();
  try {
    for (let i = 0; i < 5; i++) assert.equal((await login(app, 'wrong')).status, 401);
    const res = await login(app, 'correct-horse');
    assert.equal(res.status, 429);
    assert.deepEqual(await res.json(), { error: 'too many failed attempts' });
    const retryAfter = Number(res.headers.get('retry-after'));
    assert.ok(retryAfter > 0 && retryAfter <= 900, `Retry-After was ${retryAfter}`);
  } finally { await app.close(); }
});

test('a successful login resets the count', async () => {
  const app = await startApp();
  try {
    for (let i = 0; i < 4; i++) assert.equal((await login(app, 'wrong')).status, 401);
    assert.equal((await login(app, 'correct-horse')).status, 200);
    for (let i = 0; i < 4; i++) assert.equal((await login(app, 'wrong')).status, 401);
    assert.equal((await login(app, 'correct-horse')).status, 200);
  } finally { await app.close(); }
});

test('unknown usernames get 401 then 429, like real ones', async () => {
  const app = await startApp();
  try {
    for (let i = 0; i < 5; i++) assert.equal((await login(app, 'wrong', 'nobody')).status, 401);
    assert.equal((await login(app, 'wrong', 'nobody')).status, 429);
  } finally { await app.close(); }
});

test('locks are per username', async () => {
  const app = await startApp();
  try {
    for (let i = 0; i < 6; i++) await login(app, 'wrong', 'nobody');
    assert.equal((await login(app, 'correct-horse')).status, 200);
  } finally { await app.close(); }
});
