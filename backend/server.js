/**
 * Server entry point — port of backend/src/main.ts `bootstrap()`.
 *
 * Boot order:
 *   1. connect to PostgreSQL (Prisma)
 *   2. build the Express app
 *   3. create the raw HTTP server (so Socket.IO can share the same port)
 *   4. attach Socket.IO (`/notifications` namespace)
 *   5. listen on PORT (default 3000)
 *
 * Lives at the project root (outside `src/`) and pulls the application in from
 * `src/` — run with `npm start` / `npm run dev`.
 */
const http = require('http');

const config = require('./src/config/env');
const { connectDB, disconnectDB } = require('./src/config/prisma');
const { createApp } = require('./src/app');
const notificationSocket = require('./src/sockets/notification.socket');
const { AppLogger } = require('./src/utils/logger');

const logger = AppLogger.forContext('Bootstrap');

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);

  // Socket.IO shares the HTTP server (same port as the REST API).
  notificationSocket.attach(server);

  const port = config.port;
  server.listen(port, () => {
    logger.log(`🚀 Server running on http://localhost:${port}/api`);
  });

  // ── Graceful shutdown ───────────────────────────────────────────────
  const shutdown = async () => {
    await notificationSocket.close().catch(() => {});
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error', err.stack || String(err));
  process.exit(1);
});
