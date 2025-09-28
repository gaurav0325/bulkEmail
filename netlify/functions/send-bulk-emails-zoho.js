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
    console.log('Processing Zoho bulk email request...');

    if (!event.body) {
      throw new Error('No request body provided');
    }

    const { emails } = JSON.parse(event.body);

    if (!emails || !Array.isArray(emails)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid emails array' })
      };
    }

    // Validate Zoho SMTP credentials
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Zoho Mail SMTP credentials not configured',
          setup_required: 'Configure SMTP_USERNAME and SMTP_PASSWORD in Netlify environment variables'
        })
      };
    }

    // Configure Zoho Pro SMTP transport with optimized settings
    const transporter = nodemailer.createTransporter({
      host: 'smtppro.zoho.com', // Force use of professional server
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      },
      pool: true, // Use connection pooling for better performance
      maxConnections: 5, // Limit concurrent connections
      maxMessages: 100, // Messages per connection
      rateLimit: 10 // Emails per second (Zoho limit compliance)
    });

    console.log(`Zoho Pro: Sending ${emails.length} emails via smtppro.zoho.com`);

    // Verify SMTP connection before sending
    await transporter.verify();
    console.log('Zoho Pro SMTP connection verified');

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    // Send emails with proper rate limiting for Zoho
    for (let i = 0; i < emails.length; i++) {
      const emailData = emails[i];

      try {
        const mailOptions = {
          from: `${emailData.from_name || process.env.FROM_NAME || 'Data Analysis Insights'} <${emailData.from_email || process.env.FROM_EMAIL}>`,
          to: emailData.to_email,
          subject: emailData.subject,
          text: emailData.content,
          html: emailData.content.replace(/\n/g, '<br>'),
          headers: {
            'X-Mailer': 'Bulk Email Sender - Data Analysis Insights',
            'X-Priority': '3'
          }
        };

        console.log(`Sending email ${i + 1}/${emails.length} to: ${emailData.to_email}`);
        const result = await transporter.sendMail(mailOptions);

        results.push({
          success: true,
          email: emailData.to_email,
          messageId: result.messageId,
          index: i
        });
        successCount++;

        // Rate limiting: Wait between emails (Zoho recommends 1-2 seconds)
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second delay
        }

      } catch (error) {
        console.error(`Failed to send to ${emailData.to_email}:`, error.message);
        results.push({
          success: false,
          email: emailData.to_email,
          error: error.message,
          index: i
        });
        failureCount++;

        // Still wait on errors to maintain rate limiting
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Close the transporter
    transporter.close();

    console.log(`Zoho bulk email completed: ${successCount} success, ${failureCount} failed`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Bulk email completed via Zoho Pro`,
        results: results,
        summary: {
          total: emails.length,
          sent: successCount,
          failed: failureCount,
          success_rate: Math.round((successCount / emails.length) * 100)
        },
        provider: 'Zoho Mail Professional (smtppro.zoho.com)'
      })
    };

  } catch (error) {
    console.error('Zoho bulk email error:', error);

    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'Zoho authentication failed. Check App Password and IMAP access.';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = 'Cannot connect to smtppro.zoho.com. Check network connectivity.';
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: `Zoho bulk email failed: ${errorMessage}`,
        error_code: error.code || 'UNKNOWN',
        server: 'smtppro.zoho.com',
        troubleshooting: [
          'Verify SMTP credentials in Netlify environment variables',
          'Check Zoho Mail IMAP access is enabled',
          'Ensure App Password is used (not regular password)',
          'Verify domain datanalysisninsights.co.uk is active in Zoho'
        ]
      })
    };
  }
};