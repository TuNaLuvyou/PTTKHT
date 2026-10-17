/**
 * AppLogger — plain-JS port of backend/src/common/logger.service.ts
 *
 * The old implementation wrapped Nest's built-in Logger. Here we keep the
 * exact same public API (forContext / log / warn / error / debug / verbose /
 * success / fail) and the same human-readable message format, but print via
 * the Node console instead.
 */

class AppLogger {
  /**
   * @param {string} context logical name of the caller (module/class name)
   */
  constructor(context = 'App') {
    this.context = context;
  }

  /**
   * Build a logger bound to a context (mirrors `AppLogger.forContext(name)`).
   * @param {string} context
   * @returns {AppLogger}
   */
  static forContext(context) {
    return new AppLogger(context);
  }

  /**
   * Format a message with emoji metadata (copied from the old service so logs
   * look identical).
   * @param {string} message
   * @param {object} [metadata]
   * @returns {string}
   */
  formatMessage(message, metadata) {
    if (!metadata) return message;

    const parts = [message];
    const { userId, userRole, email, action, duration, ...rest } = metadata;

    if (userId) parts.push(`👤 ${String(userId).slice(-6)}`);
    if (userRole) parts.push(`🎭 ${userRole}`);
    if (email) parts.push(`📧 ${email}`);
    if (action) parts.push(`⚡ ${action}`);
    if (duration !== undefined) parts.push(`⏱ ${duration}ms`);

    const extraKeys = Object.keys(rest);
    if (extraKeys.length > 0) {
      const extra = Object.entries(rest)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
        .join(' ');
      if (extra) parts.push(`📎 ${extra}`);
    }

    return parts.join(' | ');
  }

  log(message, metadata) {
    console.log(`[${this.context}] ${this.formatMessage(message, metadata)}`);
  }

  warn(message, metadata) {
    console.warn(`[${this.context}] ${this.formatMessage(message, metadata)}`);
  }

  /**
   * @param {string} message
   * @param {string} [trace] stack trace
   * @param {object} [metadata]
   */
  error(message, trace, metadata) {
    console.error(`[${this.context}] ${this.formatMessage(message, metadata)}`);
    if (trace) console.error(trace);
  }

  debug(message, metadata) {
    console.debug(`[${this.context}] ${this.formatMessage(message, metadata)}`);
  }

  verbose(message, metadata) {
    console.log(`[${this.context}] ${this.formatMessage(message, metadata)}`);
  }

  // ─── Action shortcuts ───────────────────────────────────────────

  success(action, metadata) {
    this.log(`✅ ${action}`, metadata);
  }

  fail(action, metadata) {
    this.error(`❌ ${action}`, undefined, metadata);
  }
}

module.exports = { AppLogger };
module.exports.default = AppLogger;
