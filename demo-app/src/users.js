import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { AuthError } from './errors.js';

function hashPassword(password, salt) {
  return scryptSync(password, salt, 32);
}

export function createUserStore(seed = []) {
  const users = new Map();

  function add(username, password) {
    const salt = randomBytes(16);
    users.set(username, { username, salt, hash: hashPassword(password, salt) });
  }

  for (const { username, password } of seed) add(username, password);

  return {
    add,
    get: (username) => users.get(username),
  };
}

// Throws AuthError when the password does not match.
export function verifyPassword(user, password) {
  const hash = hashPassword(password, user.salt);
  if (!timingSafeEqual(hash, user.hash)) {
    throw new AuthError('wrong password');
  }
  return true;
}
