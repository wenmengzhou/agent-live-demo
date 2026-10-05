// End-to-end tests. They run against a deployed build at E2E_BASE_URL
// (default: the local test environment started by `npm run deploy:test`).
import { test } from 'node:test';
import assert from 'node:assert/strict';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:4100';

async function call(method, path, { body, token } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
}

async function login() {
  const { status, body } = await call('POST', '/login', { body: { username: 'alice', password: 'correct-horse' } });
  assert.equal(status, 200);
  return body.token;
}

test('the deployed build is healthy', async () => {
  const { status, body } = await call('GET', '/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
});

test('a user can log in, write a note and read it back', async () => {
  const token = await login();
  const created = await call('POST', '/notes', { token, body: { title: 'Buy milk', body: '2 litres' } });
  assert.equal(created.status, 201);

  const listed = await call('GET', '/notes', { token });
  assert.equal(listed.status, 200);
  assert.ok(listed.body.notes.some((n) => n.id === created.body.id && n.title === 'Buy milk'));
});
