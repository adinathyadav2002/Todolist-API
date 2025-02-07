const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

async function main({ email, subject, text }) {
  const info = await transporter.sendMail({
    from: `"To-do List" <${process.env.MAIL_FROM}>`,
    to: `${email}`,
    subject: `${subject}`,
    text: `${text}`,
  });

  console.log('Message sent: %s', info.messageId);
}

module.exports = main;
