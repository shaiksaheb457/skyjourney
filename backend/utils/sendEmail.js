// utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

const sendOTPEmail = async (email, otp, name) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1e3a5f;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">✈️ SkyJourney</h1>
      </div>
      <div style="padding:30px;">
        <h2>Hello ${name},</h2>
        <p>Your OTP for password reset:</p>
        <div style="background:#f0f4ff;border:2px dashed #1e3a5f;padding:20px;text-align:center;border-radius:8px;margin:20px 0;">
          <h1 style="color:#1e3a5f;font-size:48px;letter-spacing:10px;margin:0;">${otp}</h1>
        </div>
        <p style="color:#666;">Valid for <strong>10 minutes</strong> only.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: 'SkyJourney — Password Reset OTP', html });
};

const sendBookingConfirmationEmail = async (email, booking, user) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <div style="background:#1e3a5f;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">✈️ SkyJourney</h1>
      </div>
      <div style="padding:30px;">
        <h2>Booking Confirmed! 🎉</h2>
        <p>Hello ${user.name}, your booking is confirmed.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px;color:#666;">PNR</td><td style="padding:8px;font-weight:bold;">${booking.pnr}</td></tr>
          <tr style="background:#f9f9f9;"><td style="padding:8px;color:#666;">Total Paid</td><td style="padding:8px;font-weight:bold;">₹${booking.pricing?.totalAmount?.toLocaleString()}</td></tr>
        </table>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: `SkyJourney — Booking Confirmed | ${booking.pnr}`, html });
};

module.exports = { sendEmail, sendOTPEmail, sendBookingConfirmationEmail };