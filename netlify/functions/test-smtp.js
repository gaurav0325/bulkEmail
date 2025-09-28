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

  try {
    console.log('Starting SMTP connection test...');

    // Check if SMTP credentials are configured
    const requiredEnvVars = ['SMTP_SERVER', 'SMTP_PORT', 'SMTP_USERNAME', 'SMTP_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          test_result: 'configuration_missing',
          message: 'SMTP credentials not configured in Netlify Environment Variables',
          missing_variables: missingVars,
          instructions: {
            step1: 'Go to Netlify Dashboard → Site Settings → Environment Variables',
            step2: 'Add the following variables:',
            variables: {
              SMTP_SERVER: 'smtppro.zoho.com',
              SMTP_PORT: '587',
              SMTP_USERNAME: 'info@datanalysisninsights.co.uk',
              SMTP_PASSWORD: 'Your Zoho App Password (not regular password)'
            },
            step3: 'Redeploy your site after adding variables'
          }
        })
      };
    }

    // Create transporter with environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: parseInt(process.env.SMTP_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('Testing SMTP connection...');

    // Test the connection
    await transporter.verify();

    console.log('SMTP connection successful!');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        test_result: 'connection_successful',
        message: '✅ SMTP connection test passed!',
        smtp_config: {
          server: process.env.SMTP_SERVER,
          port: process.env.SMTP_PORT,
          username: process.env.SMTP_USERNAME,
          connection_status: 'verified'
        },
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('SMTP test error:', error);

    let errorMessage = error.message;
    let troubleshooting = [];

    // Provide specific troubleshooting based on error type
    if (error.code === 'EAUTH') {
      errorMessage = 'Authentication failed - Invalid username or password';
      troubleshooting = [
        'Verify your Zoho email address is correct',
        'Use App Password instead of regular password',
        'Generate new App Password in Zoho Mail Settings',
        'Ensure IMAP access is enabled in Zoho Mail'
      ];
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Cannot connect to SMTP server';
      troubleshooting = [
        'Check if SMTP server is correct: smtppro.zoho.com',
        'Verify port 587 is being used',
        'Check network connectivity',
        'Try smtp.zoho.com as alternative server'
      ];
    } else if (error.responseCode === 535) {
      errorMessage = 'SMTP login failed - Authentication error';
      troubleshooting = [
        'Generate new App Password in Zoho Security settings',
        'Enable "Less secure app access" if using regular password',
        'Verify domain is active in Zoho Mail'
      ];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        test_result: 'connection_failed',
        message: `❌ SMTP test failed: ${errorMessage}`,
        error_details: {
          code: error.code,
          response_code: error.responseCode,
          command: error.command
        },
        troubleshooting: troubleshooting,
        smtp_config: {
          server: process.env.SMTP_SERVER || 'not_set',
          port: process.env.SMTP_PORT || 'not_set',
          username: process.env.SMTP_USERNAME || 'not_set'
        }
      })
    };
  }
};