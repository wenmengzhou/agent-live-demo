import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../helpers.js';

let app, token;
before(async () => {
  app = await startApp();
  const res = await app.request('POST', '/login', { body: { username: 'alice', password: 'correct-horse' } });
  token = (await res.json()).token;
  for (let i = 1; i <= 45; i++) {
    await app.request('POST', '/notes', { token, body: { title: `note ${i}` } });
  }
});
after(() => app.close());

const get = async (query = '') => {
  const res = await app.request('GET', `/notes${query}`, { token });
  return { status: res.status, body: await res.json() };
};

test('default page is 20 notes, oldest first, with a cursor', async () => {
  const { status, body } = await get();
  assert.equal(status, 200);
  assert.equal(body.notes.length, 20);
  assert.equal(body.notes[0].title, 'note 1');
  assert.equal(typeof body.nextCursor, 'string');
});

test('walking the cursor returns every note exactly once', async () => {
  const titles = [];
  let cursor = null;
  for (let pages = 0; pages < 20; pages++) {
    const query = `?limit=7${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`;
    const { status, body } = await get(query);
    assert.equal(status, 200);
    assert.ok(body.notes.length <= 7);
    titles.push(...body.notes.map((n) => n.title));
    cursor = body.nextCursor;
    if (cursor === null) break;
  }
  assert.equal(cursor, null);
  assert.deepEqual(titles, Array.from({ length: 45 }, (_, i) => `note ${i + 1}`));
});

for (const bad of ['0', '101', 'abc', '2.5']) {
  test(`limit=${bad} is a 400`, async () => {
    const { status, body } = await get(`?limit=${bad}`);
    assert.equal(status, 400);
    assert.equal(typeof body.error, 'string');
  });
}

test('a garbage cursor is a 400', async () => {
  const { status } = await get('?cursor=%%%not-a-cursor');
  assert.equal(status, 400);
});
