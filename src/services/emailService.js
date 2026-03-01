const nodemailer = require("nodemailer");

// ✅ Create transporter ONCE (not every request)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Generic send email function
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error; // important for debugging & retry
  }
};

// ✅ Registration Email
const sendRegistrationEmail = async (userEmail, name) => {
  const subject = "Welcome to Backend Ledger";

  const text = `Hello ${name},

Thank you for registering at Backend Ledger.
We are excited to have you onboard!

Best regards,
Backend Ledger Team`;

  const html = `
    <h2>Welcome, ${name} 👋</h2>
    <p>Thank you for registering at <b>Backend Ledger</b>.</p>
    <p>We are excited to have you onboard!</p>
    <br/>
    <p>Best regards,<br/>Backend Ledger Team</p>
  `;

  return sendEmail(userEmail, subject, text, html);
};

// ✅ Transaction Success Email
const sendTransactionEmail = async (userEmail, name, amount, toAccount) => {
  const subject = "✅ Transaction Successful";

  const text = `Hello ${name},

Your transaction of ₹${amount} to account ${toAccount} has been successfully completed.

Best regards,
Backend Ledger Team`;

  const html = `
    <h3>Transaction Successful ✅</h3>
    <p>Hello ${name},</p>
    <p>Your transaction of <b>₹${amount}</b> to account <b>${toAccount}</b> has been successfully completed.</p>
    <br/>
    <p>Best regards,<br/>Backend Ledger Team</p>
  `;

  return sendEmail(userEmail, subject, text, html);
};

// ❌ Transaction Failure Email
const sendTransactionFailureEmail = async (userEmail, name, amount, toAccount) => {
  const subject = "❌ Transaction Failed";

  const text = `Hello ${name},

We regret to inform you that your transaction of ₹${amount} to account ${toAccount} has failed.
Please try again later.

Best regards,
Backend Ledger Team`;

  const html = `
    <h3 style="color:red;">Transaction Failed ❌</h3>
    <p>Hello ${name},</p>
    <p>Your transaction of <b>₹${amount}</b> to account <b>${toAccount}</b> has failed.</p>
    <p>Please try again later.</p>
    <br/>
    <p>Best regards,<br/>Backend Ledger Team</p>
  `;

  return sendEmail(userEmail, subject, text, html);
};

// ✅ Export all
module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};