/**
 * EmailService — plain-JS port of backend/src/common/email.service.ts
 *
 * Behaves identically:
 *   - if SMTP_HOST is not configured, email sending is disabled (warn once)
 *   - transporter forced to IPv4 (family: 4) and verified on startup
 *   - `from` falls back to 'noreply@nexcv.vn' when SMTP_FROM is not set
 *   - the same Vietnamese HTML/text password-reset template
 */
const nodemailer = require('nodemailer');
const config = require('../config/env');
const { AppLogger } = require('../utils/logger');

const logger = AppLogger.forContext('EmailService');

/** @type {import('nodemailer').Transporter|null} */
let transporter = null;

/**
 * Initialise the SMTP transporter from environment configuration.
 * Safe to call more than once.
 */
function initTransporter() {
  const host = config.smtp.host;
  if (!host) {
    logger.warn('SMTP not configured — email sending is disabled');
    return;
  }

  transporter = nodemailer.createTransport({
    host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    family: 4, // force IPv4 — IPv6 not available on this network
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  // Verify SMTP connection on startup (non-blocking)
  transporter
    .verify()
    .then(() => {
      logger.success('Email transporter initialized', {
        host,
        action: 'smtp_init',
      });
    })
    .catch((err) => {
      logger.error('SMTP connection verification failed', err, {
        host,
        action: 'smtp_init',
      });
    });
}

/**
 * Escape user-provided text before embedding it in HTML.
 * @param {string} text
 * @returns {string}
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send the password-reset email.
 * @param {string} to recipient email
 * @param {string} resetToken password-reset token
 * @param {string} userName recipient display name
 * @returns {Promise<void>}
 */
async function sendPasswordResetEmail(to, resetToken, userName) {
  if (!transporter) {
    logger.warn('Cannot send email — SMTP not configured', {
      email: to,
      action: 'send_reset_email',
    });
    return;
  }

  const frontendUrl = config.frontendUrl;
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
  const safeName = escapeHtml(userName);

  const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 0 auto; padding: 40px 24px; }
          .card { background: white; border-radius: 16px; padding: 40px 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }
          .logo { font-size: 24px; font-weight: 900; color: #1549B8; margin-bottom: 24px; text-align: center; }
          .logo span { color: #2563EB; }
          h1 { font-size: 22px; font-weight: 800; color: #0F172A; margin-bottom: 8px; text-align: center; }
          p { font-size: 15px; color: #475569; line-height: 1.7; margin-bottom: 24px; text-align: center; }
          .btn-wrap { text-align: center; margin-bottom: 24px; }
          .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1549B8, #1E40AF); color: white !important; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; }
          .footer { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 32px; }
          .footer a { color: #94A3B8; }
          .expiry { text-align: center; font-size: 13px; color: #94A3B8; margin-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">Nex<span>CV</span></div>
            <h1>Đặt lại mật khẩu</h1>
            <p>Xin chào <strong>${safeName}</strong>,<br>
            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại NexCV. 
            Nhấn nút bên dưới để tạo mật khẩu mới.</p>
            <div class="btn-wrap">
              <a href="${resetLink}" class="btn">Đặt lại mật khẩu</a>
            </div>
            <p style="font-size: 14px; color: #64748B;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            <div class="expiry">Liên kết có hiệu lực trong <strong>1 giờ</strong></div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} NexCV. Mọi quyền được bảo lưu.</p>
              <p>Nếu nút không hoạt động, hãy sao chép và dán link sau vào trình duyệt:<br>
              <a href="${resetLink}" style="word-break: break-all;">${resetLink}</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

  const text = `Đặt lại mật khẩu NexCV\n\nXin chào ${safeName},\n\nChúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại NexCV.\n\nVui lòng truy cập link sau để đặt lại mật khẩu:\n${resetLink}\n\nLiên kết có hiệu lực trong 1 giờ.\n\nNếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`;

  try {
    await transporter.sendMail({
      from: config.smtp.from || 'noreply@nexcv.vn',
      to,
      subject: 'NexCV — Đặt lại mật khẩu của bạn',
      text,
      html,
    });
    logger.success('Password reset email sent', {
      email: to,
      action: 'send_reset_email',
    });
  } catch (error) {
    logger.error('Failed to send password reset email', error, {
      email: to,
      action: 'send_reset_email',
    });
    throw new Error(
      'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.',
    );
  }
}

// Initialise on module load (mirrors the old service constructor).
initTransporter();

module.exports = {
  sendPasswordResetEmail,
  initTransporter,
  escapeHtml,
};
