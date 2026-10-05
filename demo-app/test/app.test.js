import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from './helpers.js';

let app;
before(async () => { app = await startApp(); });
after(() => app.close());

test('GET /health', async () => {
  const res = await app.request('GET', '/health');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('login with the right password returns a token', async () => {
  const res = await app.request('POST', '/login', { body: { username: 'alice', password: 'correct-horse' } });
  assert.equal(res.status, 200);
  assert.match((await res.json()).token, /^[0-9a-f]{48}$/);
});

test('login without a password is a 400', async () => {
  const res = await app.request('POST', '/login', { body: { username: 'alice' } });
  assert.equal(res.status, 400);
});

test('notes require a token', async () => {
  const res = await app.request('GET', '/notes');
  assert.equal(res.status, 401);
});
