const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  console.log('Function started, nodemailer type:', typeof nodemailer);
  console.log('nodemailer.createTransporter type:', typeof nodemailer.createTransporter);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    console.log('Processing Zoho email send request...');

    if (!event.body) {
      throw new Error('No request body provided');
    }

    const { from_email, from_name, to_email, subject, content } = JSON.parse(event.body);
    console.log('Email data:', { from_email, from_name, to_email, subject: subject?.substring(0, 50) });

    // Validate required environment variables for Zoho Mail
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Zoho Mail SMTP credentials not configured',
          setup_required: {
            SMTP_SERVER: 'smtppro.zoho.com',
            SMTP_PORT: '587',
            SMTP_USERNAME: 'info@datanalysisninsights.co.uk',
            SMTP_PASSWORD: '[Your Zoho App Password]',
            FROM_EMAIL: 'info@datanalysisninsights.co.uk',
            FROM_NAME: 'Data Analysis Insights'
          },
          instructions: 'Set these environment variables in Netlify Dashboard → Site Settings → Environment Variables'
        })
      };
    }

    // Configure Zoho Mail SMTP transport
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_SERVER || 'smtppro.zoho.com',
      port: smtpPort,
      secure: smtpPort === 465, // true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });

    console.log('Zoho Mail transporter configured:', {
      host: process.env.SMTP_SERVER || 'smtppro.zoho.com',
      port: smtpPort,
      secure: smtpPort === 465,
      user: process.env.SMTP_USERNAME
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Email options
    const mailOptions = {
      from: `${from_name || process.env.FROM_NAME || 'Data Analysis Insights'} <${from_email || process.env.FROM_EMAIL}>`,
      to: to_email,
      subject: subject,
      text: content,
      html: content.replace(/\n/g, '<br>') // Convert line breaks to HTML
    };

    console.log('Sending email via Zoho Mail...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Email sent successfully to ${to_email}`,
        messageId: result.messageId,
        provider: 'Zoho Mail',
        from: mailOptions.from
      })
    };

  } catch (error) {
    console.error('Zoho Mail sending error:', error);

    // Provide specific error messages for common Zoho Mail issues
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Zoho Mail authentication failed. Check your username/password or use App Password if 2FA is enabled.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Cannot connect to Zoho Mail server. Check your internet connection.';
    } else if (error.responseCode === 535) {
      errorMessage = 'Zoho Mail authentication failed. Enable IMAP access and use App Password.';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: `Zoho Mail error: ${errorMessage}`,
        error_code: error.code || 'UNKNOWN',
        troubleshooting: [
          '1. Enable IMAP access in Zoho Mail settings',
          '2. Generate App Password if 2FA is enabled',
          '3. Use App Password instead of regular password',
          '4. Verify SMTP settings: smtppro.zoho.com:587'
        ]
      })
    };
  }
};