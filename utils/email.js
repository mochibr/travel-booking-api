const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email transporter configuration failed:', error);
  } else {
    console.log('✅ Email transporter is ready to send emails');
  }
});

// Render email template
const renderTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '../views/emails', `${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, data);
    return html;
  } catch (error) {
    console.error('❌ Email template rendering failed:', error);
    throw new Error('Email template rendering failed');
  }
};

// Send email with template
const sendTemplatedEmail = async (to, subject, templateName, templateData) => {
  try {
    const html = await renderTemplate(templateName, {
      ...templateData,
      appName: process.env.APP_NAME,
      currentYear: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    return result;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Email sending failed: ' + error.message);
  }
};

// Specific email functions
const sendPasswordResetEmail = async (email, resetToken, isAdmin = false) => {
  const resetUrl = isAdmin 
    ? `${process.env.ADMIN_URL}/reset-password/${resetToken}`
    : `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  const templateName = isAdmin ? 'reset-password-admin' : 'reset-password-web';

  await sendTemplatedEmail(
    email,
    'Reset Your Password',
    templateName,
    {
      resetUrl,
      email,
      expiresIn: '1 hour'
    }
  );
};

const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  await sendTemplatedEmail(
    email,
    'Verify Your Email Address',
    'verify-email',
    {
      verificationUrl,
      email
    }
  );
};

module.exports = {
  transporter,
  sendTemplatedEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};