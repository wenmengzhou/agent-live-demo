import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { AuthError, ValidationError } from './errors.js';
import { createUserStore, verifyPassword } from './users.js';
import { createNoteStore } from './notes.js';

const DEMO_USERS = [{ username: 'alice', password: 'correct-horse' }];

function send(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new ValidationError('body must be valid JSON');
  }
}

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function createApp({ users = createUserStore(DEMO_USERS), notes = createNoteStore(), now = Date.now } = {}) {
  const sessions = new Map(); // token -> username
  const failures = new Map(); // username -> { count, first, lockedUntil }

  function lockedFor(username) {
    const f = failures.get(username);
    if (!f) return 0;
    if (f.lockedUntil && f.lockedUntil > now()) return Math.ceil((f.lockedUntil - now()) / 1000);
    if (now() - f.first > WINDOW_MS || f.lockedUntil) failures.delete(username);
    return 0;
  }

  function recordFailure(username) {
    const f = failures.get(username) ?? { count: 0, first: now(), lockedUntil: 0 };
    f.count += 1;
    if (f.count >= MAX_FAILURES) f.lockedUntil = now() + WINDOW_MS;
    failures.set(username, f);
  }

  function currentUser(req) {
    const auth = req.headers.authorization ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    return token ? sessions.get(token) : undefined;
  }

  const routes = {
    'GET /health': async (req, res) => send(res, 200, { status: 'ok' }),

    'POST /login': async (req, res) => {
      try {
        const { username, password } = await readJson(req);
        if (!username || !password) throw new ValidationError('username and password are required');
        const wait = lockedFor(username);
        if (wait > 0) {
          res.setHeader('retry-after', String(wait));
          return send(res, 429, { error: 'too many failed attempts' });
        }
        try {
          verifyPassword(users.get(username), password);
        } catch (err) {
          if (err instanceof AuthError) recordFailure(username);
          throw err;
        }
        failures.delete(username);
        const token = randomBytes(24).toString('hex');
        sessions.set(token, username);
        send(res, 200, { token });
      } catch (err) {
        if (err instanceof ValidationError) return send(res, 400, { error: err.message });
        if (err instanceof AuthError) return send(res, 401, { error: 'invalid username or password' });
        throw err;
      }
    },

    'GET /notes': async (req, res) => {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: 'unauthorized' });
      send(res, 200, { notes: notes.list(user) });
    },

    'POST /notes': async (req, res) => {
      const user = currentUser(req);
      if (!user) return send(res, 401, { error: 'unauthorized' });
      try {
        const note = notes.create(user, await readJson(req));
        send(res, 201, note);
      } catch (err) {
        if (err instanceof ValidationError) return send(res, 400, { error: err.message });
        throw err;
      }
    },
  };

  return createServer(async (req, res) => {
    const path = new URL(req.url, 'http://localhost').pathname;
    const handler = routes[`${req.method} ${path}`];
    if (!handler) return send(res, 404, { error: 'not found' });
    try {
      await handler(req, res);
    } catch (err) {
      console.error(err);
      if (!res.headersSent) send(res, 500, { error: 'internal error' });
    }
  });
}
