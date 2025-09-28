const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  console.log('Send email function called with method:', event.httpMethod);

  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    console.log('Processing email send request...');
    if (!event.body) {
      throw new Error('No request body provided');
    }

    const { from_email, from_name, to_email, subject, content } = JSON.parse(event.body);
    console.log('Email data received:', { from_email, from_name, to_email, subject: subject?.substring(0, 50) });

    // Validate required environment variables
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP credentials not configured. Please set SMTP_USERNAME and SMTP_PASSWORD environment variables.');
    }

    // Configure email transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    });

    console.log('Transporter configured with:', {
      host: process.env.SMTP_SERVER || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USERNAME
    });

    // Email options
    const mailOptions = {
      from: `${from_name || process.env.FROM_NAME} <${from_email || process.env.FROM_EMAIL}>`,
      to: to_email,
      subject: subject,
      text: content
    };

    // Send email
    console.log('Attempting to send email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: `Email sent successfully to ${to_email}`,
        messageId: result.messageId
      })
    };

  } catch (error) {
    console.error('Email sending error:', error);

    // Provide more specific error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Please check your email credentials.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Failed to connect to SMTP server. Please check your network connection.';
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: `Failed to send email: ${errorMessage}`,
        error: error.code || 'UNKNOWN'
      })
    };
  }
};