exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    console.log('🚀 Starting simple email function...');

    // Try to import nodemailer with different methods
    let nodemailer;
    try {
      nodemailer = require('nodemailer');
      console.log('✅ Nodemailer imported successfully');
      console.log('📦 Nodemailer type:', typeof nodemailer);
      console.log('📦 Nodemailer keys:', Object.keys(nodemailer));
      console.log('📦 createTransporter type:', typeof nodemailer.createTransporter);

      // Try alternative access methods if standard doesn't work
      if (typeof nodemailer.createTransporter !== 'function') {
        console.log('⚠️ createTransporter not found, trying alternative access...');
        if (nodemailer.default && typeof nodemailer.default.createTransporter === 'function') {
          console.log('✅ Found createTransporter on default export');
          nodemailer = nodemailer.default;
        } else if (typeof nodemailer === 'function') {
          console.log('✅ Nodemailer itself is the createTransporter function');
          // Some versions export the createTransporter function directly
        } else {
          console.error('❌ Cannot find createTransporter method anywhere');
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              success: false,
              message: 'Nodemailer createTransporter method not found',
              debug: {
                type: typeof nodemailer,
                keys: Object.keys(nodemailer),
                hasDefault: !!nodemailer.default,
                defaultType: typeof nodemailer.default
              }
            })
          };
        }
      }
    } catch (importError) {
      console.error('❌ Failed to import nodemailer:', importError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Nodemailer dependency not available',
          error: importError.message
        })
      };
    }

    // Parse request body
    const { from_email, from_name, to_email, subject, content } = JSON.parse(event.body);
    console.log('📧 Email request:', { from_email, to_email, subject: subject?.substring(0, 50) });

    // Check environment variables
    const requiredEnvVars = ['SMTP_USERNAME', 'SMTP_PASSWORD', 'SMTP_SERVER', 'SMTP_PORT'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: `Missing environment variables: ${missingVars.join(', ')}`,
          available_vars: Object.keys(process.env).filter(key => key.includes('SMTP') || key.includes('EMAIL'))
        })
      };
    }

    // Configure transporter
    const smtpPort = parseInt(process.env.SMTP_PORT);
    const transporterConfig = {
      host: process.env.SMTP_SERVER,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    };

    console.log('🔧 SMTP Config:', {
      host: transporterConfig.host,
      port: transporterConfig.port,
      secure: transporterConfig.secure,
      user: transporterConfig.auth.user
    });

    // Create transporter
    let transporter;
    try {
      transporter = nodemailer.createTransporter(transporterConfig);
      console.log('✅ Transporter created successfully');
    } catch (transporterError) {
      console.error('❌ Failed to create transporter:', transporterError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Failed to create email transporter',
          error: transporterError.message
        })
      };
    }

    // Verify connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP verification failed:', verifyError);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'SMTP connection failed',
          error: verifyError.message,
          config: transporterConfig
        })
      };
    }

    // Send email
    const mailOptions = {
      from: `"${from_name || 'Bulk Email Sender'}" <${process.env.SMTP_USERNAME}>`,
      to: to_email,
      subject: subject,
      html: content,
      text: content.replace(/<[^>]*>/g, '')
    };

    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: result.messageId,
        service: 'Zoho SMTP',
        details: `Email sent from ${process.env.SMTP_USERNAME} to ${to_email}`
      })
    };

  } catch (error) {
    console.error('💥 Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Email sending failed',
        error: error.message,
        stack: error.stack
      })
    };
  }
};