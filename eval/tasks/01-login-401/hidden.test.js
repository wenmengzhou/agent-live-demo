import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

test('wrong password is a 401 with a generic message', async () => {
  const app = await startApp();
  try {
    const res = await app.request('POST', '/login', { body: { username: 'alice', password: 'wrong' } });
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'invalid username or password' });
  } finally { await app.close(); }
});

test('unknown user is the same 401, so usernames do not leak', async () => {
  const app = await startApp();
  try {
    const res = await app.request('POST', '/login', { body: { username: 'nobody', password: 'wrong' } });
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'invalid username or password' });
  } finally { await app.close(); }
});

test('the right password still works', async () => {
  const app = await startApp();
  try {
    const res = await app.request('POST', '/login', { body: { username: 'alice', password: 'correct-horse' } });
    assert.equal(res.status, 200);
  } finally { await app.close(); }
});
