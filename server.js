const http = require('http');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = Number(process.env.PORT || 3000);

let handle;
const server = http.createServer(async (req, res) => {
  if (!handle) {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '2', 'Cache-Control': 'no-store' });
    res.end('<!doctype html><meta http-equiv="refresh" content="2"><title>Starting portfolio</title><p>Starting Srihari\'s portfolio. This page will refresh automatically.</p>');
    return;
  }
  try {
    await handle(req, res);
  } catch (err) {
    console.error('Error handling request:', err);
    if (!res.headersSent) res.writeHead(500);
    if (!res.writableEnded) res.end('Internal Server Error');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`> Port ${port} is already in use. Open http://localhost:${port} to use the existing server.`);
    console.log('> No duplicate server started; Next.js cache was left untouched.');
    process.exit(0);
  }
  console.error('Unable to start portfolio:', err.message);
  process.exit(1);
});

// Claim the port BEFORE preparing Next. A duplicate startup must never rewrite
// the running development server's route manifests or register extra handlers.
server.listen(port, hostname, async () => {
  try {
    const next = require('next');
    const app = next({ dev, hostname, port });
    await app.prepare();
    handle = app.getRequestHandler();
    if (typeof app.setupWebSocketHandler === 'function') app.setupWebSocketHandler(server);
    console.log(`> Srihari Portfolio ready on http://localhost:${port} and http://127.0.0.1:${port}`);
  } catch (err) {
    console.error('Unable to prepare portfolio:', err.stack || err.message);
    server.close(() => process.exit(1));
  }
});
