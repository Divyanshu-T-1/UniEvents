
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetURL) => {
  await transporter.sendMail({
    from: `"UniEvents" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your UniEvents Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your UniEvents password.</p>
        <p>Click the button below to create a new password:</p>
        <a href="${resetURL}"
           style="display: inline-block; padding: 12px 20px;
           background: #4f46e5; color: white; text-decoration: none;
           border-radius: 6px;">
          Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};

