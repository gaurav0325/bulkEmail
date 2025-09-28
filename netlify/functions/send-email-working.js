const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
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

    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: `SMTP Not Configured: Would send to ${to_email}`,
          setup_required: true,
          instructions: 'Configure Zoho Mail SMTP in Netlify Environment Variables',
          required_vars: [
            'SMTP_SERVER=smtppro.zoho.com',
            'SMTP_PORT=587',
            'SMTP_USERNAME=info@datanalysisninsights.co.uk',
            'SMTP_PASSWORD=[your Zoho app password]',
            'FROM_EMAIL=info@datanalysisninsights.co.uk',
            'FROM_NAME=Data Analysis Insights'
          ]
        })
      };
    }

    // Configure Zoho Mail SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || 'smtppro.zoho.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465, // Use SSL for port 465, TLS for 587
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Zoho transporter configured:', {
      host: process.env.SMTP_SERVER || 'smtppro.zoho.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USERNAME
    });

    // Verify SMTP connection first
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Email options
    const mailOptions = {
      from: `${from_name || process.env.FROM_NAME || 'Data Analysis Insights'} <${from_email || process.env.FROM_EMAIL}>`,
      to: to_email,
      subject: subject,
      text: content,
      html: content.replace(/\n/g, '<br>'), // Convert line breaks to HTML
      headers: {
        'X-Mailer': 'Data Analysis Insights Bulk Email Sender',
        'X-Priority': '3'
      }
    };

    console.log('Sending email via Zoho Mail...');
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `✅ Email sent successfully to ${to_email}`,
        messageId: result.messageId,
        provider: 'Zoho Mail Professional',
        server: 'smtppro.zoho.com',
        from: mailOptions.from,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Zoho Mail sending error:', error);

    // Provide specific error messages for common Zoho issues
    let errorMessage = error.message;
    let troubleshooting = [];

    if (error.code === 'EAUTH') {
      errorMessage = 'Zoho Mail authentication failed';
      troubleshooting = [
        'Check your Zoho username and App Password',
        'Ensure IMAP access is enabled in Zoho Mail',
        'Use App Password instead of regular password',
        'Verify 2FA is properly configured'
      ];
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Cannot connect to Zoho Mail server';
      troubleshooting = [
        'Check internet connectivity',
        'Verify SMTP server: smtppro.zoho.com',
        'Confirm port 587 is not blocked',
        'Try alternative server: smtp.zoho.com'
      ];
    } else if (error.responseCode === 535) {
      errorMessage = 'Zoho Mail login failed';
      troubleshooting = [
        'Generate new App Password in Zoho Mail',
        'Enable IMAP access in Mail Settings',
        'Verify domain is active in Zoho'
      ];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: `Zoho Mail Error: ${errorMessage}`,
        error_code: error.code || 'UNKNOWN',
        response_code: error.responseCode,
        troubleshooting: troubleshooting,
        server_used: 'smtppro.zoho.com'
      })
    };
  }
};