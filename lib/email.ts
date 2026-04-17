import nodemailer from "nodemailer";

// Initialize transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.sendgrid.net",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "apikey",
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  body: string; // HTML content
  cc?: string;
  bcc?: string;
}

export async function sendEmailAlert(options: EmailOptions) {
  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "Fortress <noreply@fortressintelligence.space>",
      to: options.to,
      cc: options.cc,
      bcc: options.bcc,
      subject: options.subject,
      html: options.body,
    });

    console.log("Email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
}

// Specific email templates
export async function sendPasswordResetEmail({
  email,
  resetLink,
  expiryMinutes,
}: {
  email: string;
  resetLink: string;
  expiryMinutes: number;
}) {
  return sendEmailAlert({
    to: email,
    subject: "Reset Your Fortress Intelligence Password",
    body: `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password. This link will expire in <strong>${expiryMinutes} minutes</strong>.</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
        Reset Password
      </a>
      <p style="color: #666; margin-top: 20px; font-size: 12px;">
        If you didn't request this, you can safely ignore this email. Your password will not change.
      </p>
    `,
  });
}

export async function sendWelcomeEmail({
  email,
  userName,
}: {
  email: string;
  userName: string;
}) {
  return sendEmailAlert({
    to: email,
    subject: "Welcome to Fortress Intelligence",
    body: `
      <h2>Welcome, ${userName}!</h2>
      <p>Your Fortress Intelligence account is ready.</p>
      <p><a href="https://fortressintelligence.space/guide">Get Started with Our Guide →</a></p>
      <p>Happy investing!</p>
    `,
  });
}
