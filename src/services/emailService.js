const nodemailer = require("nodemailer");
const { google } = require("googleapis");

async function createTransporter() {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oAuth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
  });

  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  return transporter;
}

// Send email function
const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Backend Ladger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Message sent:", info.messageId);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

// Registration email
async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ladger";

  const text = `Hello ${name},\n\nThank you for registration at Backend Ledger.
We are excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;

  const html = `
    <p>Hello ${name},</p>
    <p>Thank you for registration at Backend Ladger.</p>
    <p>We are excited to have you on board!</p>
    <p>Best regards,<br/>The Backend Ledger Team</p>
  `;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
};