import { createApp } from '../src/app.js';

// Starts the app on a random port and returns a small client for it.
export async function startApp(options) {
  const server = createApp(options);
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://localhost:${server.address().port}`;
  return {
    base,
    request: (method, path, { body, token } = {}) =>
      fetch(base + path, {
        method,
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
