const nodemailer = require("nodemailer");

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!process.env.SMTP_HOST) {
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  });

  return cachedTransporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    return {
      delivered: false,
      reason: "SMTP is not configured"
    };
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "SOCNITI <noreply@socniti.com>",
    to,
    subject,
    html
  });

  return { delivered: true };
};

module.exports = sendEmail;
