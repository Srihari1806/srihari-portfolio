const http = require('http');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = http.createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  if (typeof app.setupWebSocketHandler === 'function') {
    app.setupWebSocketHandler(server);
  }

  server.listen(port, '0.0.0.0', (err) => {
    if (err) throw err;
    console.log(`> Srihari Portfolio ready on http://localhost:${port} and http://127.0.0.1:${port}`);
  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});
