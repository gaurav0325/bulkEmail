const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  console.log('Send bulk emails function called with method:', event.httpMethod);

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
    const { emails } = JSON.parse(event.body);

    if (!emails || !Array.isArray(emails)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: false, message: 'Invalid emails array' })
      };
    }

    // Configure email transport
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_SERVER || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const results = [];

    // Send emails with delay to avoid rate limiting
    for (const emailData of emails) {
      try {
        const mailOptions = {
          from: `${emailData.from_name || process.env.FROM_NAME} <${emailData.from_email || process.env.FROM_EMAIL}>`,
          to: emailData.to_email,
          subject: emailData.subject,
          text: emailData.content
        };

        await transporter.sendMail(mailOptions);
        results.push({ success: true, email: emailData.to_email });

        // Add delay between emails (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Failed to send to ${emailData.to_email}:`, error.message);
        results.push({ success: false, email: emailData.to_email, error: error.message });
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: `Bulk email process completed`,
        results: results
      })
    };

  } catch (error) {
    console.error('Bulk email error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: `Bulk email failed: ${error.message}`
      })
    };
  }
};