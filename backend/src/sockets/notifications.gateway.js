/**
 * Notifications socket gateway — plain-JS port of
 * backend/src/admin/gateways/notifications.gateway.ts
 *
 * Namespace: '/notifications' with CORS `{ origin: '*', credentials: true }`.
 *
 * In Nest the `@WebSocketServer()` was injected automatically; in Express the
 * socket.io instance is wired explicitly via `init(io)` from the HTTP server
 * bootstrap. All emit helpers are safe no-ops until `init()` has been called.
 */
const { AppLogger } = require('../utils/logger');

const logger = AppLogger.forContext('NotificationsGateway');

/** @type {import('socket.io').Namespace|null} */
let nsp = null;

/**
 * Attach the gateway to a socket.io server.
 * @param {import('socket.io').Server} io
 * @returns {import('socket.io').Namespace}
 */
function init(io) {
  nsp = io.of('/notifications');

  nsp.on('connection', (client) => {
    logger.log(`Client connected: ${client.id}`);
    client.on('disconnect', () => {
      logger.log(`Client disconnected: ${client.id}`);
    });
  });

  logger.log('Notifications WebSocket Gateway initialized');
  return nsp;
}

/**
 * Internal broadcast helper.
 * @param {string} event
 * @param {any} payload
 */
function emit(event, payload) {
  if (!nsp) return;
  nsp.emit(event, payload);
}

// ─── Notification events ──────────────────────────────────────────────

function emitNotificationCreated(notification) {
  emit('notification.created', notification);
  logger.debug(
    `Emitted notification.created: ${notification?.id || notification?._id}`,
  );
}

function emitNotificationRead(notificationId) {
  emit('notification.read', { id: notificationId });
  logger.debug(`Emitted notification.read: ${notificationId}`);
}

function emitAllNotificationsRead() {
  emit('notification.readAll', {});
  logger.debug('Emitted notification.readAll');
}

function emitNotificationDeleted(notificationId) {
  emit('notification.deleted', { id: notificationId });
  logger.debug(`Emitted notification.deleted: ${notificationId}`);
}

// ─── Job events ───────────────────────────────────────────────────────

function emitJobViewsUpdated(jobId, views) {
  emit('job.viewsUpdated', { jobId, views });
  logger.debug(`Emitted job.viewsUpdated: ${jobId} → ${views}`);
}

function emitJobApplicationsUpdated(jobId, applied) {
  emit('job.applicationsUpdated', { jobId, applied });
  logger.debug(`Emitted job.applicationsUpdated: ${jobId} → ${applied}`);
}

/**
 * Emit event to notify admin dashboard to refresh data
 * (e.g. new user registration).
 */
function emitDashboardUpdateNeeded() {
  emit('dashboard.updateNeeded', { timestamp: new Date().toISOString() });
  logger.debug('Emitted dashboard.updateNeeded');
}

module.exports = {
  init,
  emitNotificationCreated,
  emitNotificationRead,
  emitAllNotificationsRead,
  emitNotificationDeleted,
  emitJobViewsUpdated,
  emitJobApplicationsUpdated,
  emitDashboardUpdateNeeded,
};
