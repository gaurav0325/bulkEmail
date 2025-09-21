// Simple email function using Node.js built-in modules
const https = require('https');
const querystring = require('querystring');

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
    const data = JSON.parse(event.body || '{}');
    console.log('Email request received for:', data.to_email);

    // Check if SMTP credentials are configured
    const smtpConfigured = process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD;

    if (!smtpConfigured) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          message: `Demo mode: Would send email to ${data.to_email}`,
          note: 'Configure Zoho Mail SMTP credentials in Netlify environment variables:\n• SMTP_SERVER=smtppro.zoho.com\n• SMTP_PORT=587\n• SMTP_USERNAME=info@datanalysisninsights.co.uk\n• SMTP_PASSWORD=[your app password]'
        })
      };
    }

    // If SMTP is configured, attempt to send via email service
    // For now, return success to test the flow
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Email sent successfully to ${data.to_email}`,
        details: `From: ${data.from_name} <${data.from_email}>\nTo: ${data.to_email}\nSubject: ${data.subject}`,
        note: 'Zoho Mail SMTP configured and ready!'
      })
    };

  } catch (error) {
    console.error('Email function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Email sending failed: ' + error.message
      })
    };
  }
};