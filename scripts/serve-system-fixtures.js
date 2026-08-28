#!/usr/bin/env node

import { createReadStream, existsSync, realpathSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = realpathSync(resolve(fileURLToPath(new URL('..', import.meta.url))));
const MIME_TYPES = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`--${name} requires a value`);
  }
  return value;
}

const host = argument('host', '127.0.0.1');
const portText = argument('port', '4173');
const port = Number(portText);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`invalid --port ${JSON.stringify(portText)}`);
}
if (host !== '127.0.0.1' && host !== 'localhost') {
  throw new Error('fixture server may bind only to localhost');
}

function send(response, statusCode, body, headers = {}) {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': 'text/plain; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  response.end(body);
}

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    send(response, 405, 'Method Not Allowed\n', { Allow: 'GET, HEAD' });
    return;
  }

  const requestUrl = new URL(request.url ?? '/', `http://${host}:${port}`);
  if (requestUrl.pathname === '/__health') {
    send(response, 200, request.method === 'HEAD' ? '' : 'ok\n');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(requestUrl.pathname);
  } catch {
    send(response, 400, 'Bad Request\n');
    return;
  }
  if (pathname.includes('\0')) {
    send(response, 400, 'Bad Request\n');
    return;
  }

  const candidate = resolve(ROOT, `.${pathname}`);
  if (candidate !== ROOT && !candidate.startsWith(`${ROOT}${sep}`)) {
    send(response, 403, 'Forbidden\n');
    return;
  }
  if (!existsSync(candidate) || !statSync(candidate).isFile()) {
    send(response, 404, 'Not Found\n');
    return;
  }

  const realCandidate = realpathSync(candidate);
  if (!realCandidate.startsWith(`${ROOT}${sep}`)) {
    send(response, 403, 'Forbidden\n');
    return;
  }

  const contentType = MIME_TYPES.get(extname(realCandidate).toLowerCase());
  if (!contentType) {
    send(response, 415, 'Unsupported Media Type\n');
    return;
  }

  response.writeHead(200, {
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  const stream = createReadStream(realCandidate);
  stream.on('error', (error) => {
    if (!response.headersSent) send(response, 500, 'Internal Server Error\n');
    else response.destroy(error);
  });
  stream.pipe(response);
});

server.listen(port, host, () => {
  console.log(`system fixture server listening at http://${host}:${port}`);
});

function close() {
  server.close((error) => {
    if (error) throw error;
  });
}

process.on('SIGINT', close);
process.on('SIGTERM', close);
