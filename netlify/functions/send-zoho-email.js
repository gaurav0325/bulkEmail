const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Handle CORS preflight
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

  try {
    const emailData = JSON.parse(event.body);
    const { smtp_config, ...messageData } = emailData;

    // Use environment variables first, then fallback to provided config
    const zohoEmail = process.env.FROM_EMAIL || process.env.SMTP_USERNAME || (smtp_config && smtp_config.auth && smtp_config.auth.user);
    const zohoPassword = process.env.SMTP_PASSWORD || (smtp_config && smtp_config.auth && smtp_config.auth.pass);
    const smtpServer = process.env.SMTP_SERVER || 'smtp.zoho.com';
    const smtpPort = parseInt(process.env.SMTP_PORT) || 587;

    console.log(`Attempting to send email via Zoho Mail...`);
    console.log(`From: ${zohoEmail}`);
    console.log(`To: ${messageData.to_email}`);

    if (!zohoEmail || !zohoPassword) {
      console.error('Missing SMTP credentials');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('SMTP') || key.includes('EMAIL')));
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({
          error: 'SMTP credentials not configured. Please set FROM_EMAIL/SMTP_USERNAME and SMTP_PASSWORD environment variables in Netlify.',
          success: false,
          debug: {
            hasEmail: !!zohoEmail,
            hasPassword: !!zohoPassword,
            smtpServer: smtpServer,
            smtpPort: smtpPort
          }
        })
      };
    }

    // Create transporter for Zoho Mail
    const transporter = nodemailer.createTransporter({
      host: smtpServer,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: zohoEmail,
        pass: zohoPassword
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Prepare email options
    const mailOptions = {
      from: `"${messageData.from_name || 'Bulk Email Sender'}" <${zohoEmail}>`,
      to: messageData.to_email,
      subject: messageData.subject,
      html: messageData.html_content,
      text: messageData.text_content || messageData.html_content.replace(/<[^>]*>/g, ''),
      replyTo: zohoEmail
    };

    // Add attachments if any
    if (emailData.attachments && emailData.attachments.length > 0) {
      mailOptions.attachments = emailData.attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: 'base64',
        contentType: attachment.contentType
      }));
    }

    // Verify SMTP connection first
    await transporter.verify();
    console.log('SMTP connection verified successfully');

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully via Zoho Mail:', info.messageId);
    console.log('Email details:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      attachments: emailData.attachments ? emailData.attachments.length : 0
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        service: 'Zoho Mail SMTP',
        details: `Email sent from ${zohoEmail} to ${messageData.to_email}`
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};