/**
 * Socket.IO wiring for Express — plain-JS equivalent of the NestJS
 * `@WebSocketGateway({ cors: { origin: '*', credentials: true },
 *                        namespace: '/notifications' })`
 * declared in backend/src/admin/gateways/notifications.gateway.ts.
 *
 * What the old gateway did (and what we reproduce exactly):
 *   - namespace ............ '/notifications'   (FE: io(`${SOCKET_URL}/notifications`))
 *   - CORS ................. { origin: '*', credentials: true }
 *   - connection lifecycle . logs connect / disconnect
 *   - @SubscribeMessage .... NONE. The server never listens for client events;
 *                            it only EMITS. So there is nothing to handle.
 *   - emitted events ....... notification.created / notification.read /
 *                            notification.readAll / notification.deleted /
 *                            job.viewsUpdated / job.applicationsUpdated /
 *                            dashboard.updateNeeded
 *
 * In Nest the io server was created automatically from the HTTP server; here we
 * attach it explicitly via `attach(httpServer)` before `server.listen()`.
 */
const { Server } = require('socket.io');
const gateway = require('./notifications.gateway');
const { AppLogger } = require('../utils/logger');

const logger = AppLogger.forContext('NotificationSocket');

/** @type {import('socket.io').Server|null} */
let io = null;

/**
 * Create the Socket.IO server, bind it to the HTTP server and hook up the
 * `/notifications` namespace (all emit helpers live in notifications.gateway).
 *
 * @param {import('http').Server} httpServer
 * @param {object} [options] extra socket.io options (rarely needed)
 * @returns {import('socket.io').Server}
 */
function attach(httpServer, options = {}) {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: '*',
      credentials: true,
    },
    ...options,
  });

  // Registers the '/notifications' namespace + connection logging and makes
  // every gateway emit helper go live.
  gateway.init(io);

  logger.log('Socket.IO server attached (namespace /notifications)');
  return io;
}

/**
 * @returns {import('socket.io').Server|null} the io instance, or null before attach()
 */
function getIO() {
  return io;
}

/**
 * Close the Socket.IO server (used by the graceful shutdown handler).
 * @returns {Promise<void>}
 */
async function close() {
  if (!io) return;
  await io.close();
  io = null;
}

module.exports = {
  attach,
  getIO,
  close,
  // Re-export the gateway emitters so the bootstrap can import a single module.
  ...gateway,
};
