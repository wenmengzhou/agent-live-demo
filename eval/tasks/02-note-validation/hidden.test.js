import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

let app, token;
before(async () => {
  app = await startApp();
  const res = await app.request('POST', '/login', { body: { username: 'alice', password: 'correct-horse' } });
  token = (await res.json()).token;
});
after(() => app.close());

for (const [name, title] of [['missing', undefined], ['empty', ''], ['whitespace', '   ']]) {
  test(`${name} title is a 400`, async () => {
    const res = await app.request('POST', '/notes', { token, body: { title } });
    assert.equal(res.status, 400);
    assert.deepEqual(await res.json(), { error: 'title is required' });
  });
}

test('a 201-character title is a 400', async () => {
  const res = await app.request('POST', '/notes', { token, body: { title: 'x'.repeat(201) } });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: 'title must be at most 200 characters' });
});

test('a 200-character title is fine', async () => {
  const res = await app.request('POST', '/notes', { token, body: { title: 'x'.repeat(200) } });
  assert.equal(res.status, 201);
});

test('titles are stored trimmed', async () => {
  const res = await app.request('POST', '/notes', { token, body: { title: '  Buy milk  ' } });
  assert.equal(res.status, 201);
  assert.equal((await res.json()).title, 'Buy milk');
});
