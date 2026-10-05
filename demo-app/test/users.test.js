import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createUserStore, verifyPassword } from '../src/users.js';

test('verifyPassword accepts the right password', () => {
  const users = createUserStore([{ username: 'bob', password: 'secret' }]);
  assert.equal(verifyPassword(users.get('bob'), 'secret'), true);
});

test('passwords are stored hashed, not in plain text', () => {
  const users = createUserStore([{ username: 'bob', password: 'secret' }]);
  const stored = users.get('bob');
  assert.equal(stored.password, undefined);
  assert.notEqual(stored.hash.toString(), 'secret');
});
