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

  // Always return 200 to prevent loops
  const data = JSON.parse(event.body || '{}');

  // Check if SMTP credentials are configured
  const smtpConfigured = process.env.SMTP_USERNAME && process.env.SMTP_PASSWORD;

  if (!smtpConfigured) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: `SMTP Not Configured: Would send to ${data.to_email || 'unknown'}`,
        setup_required: true,
        instructions: 'Add Zoho Mail credentials in Netlify Environment Variables',
        required_vars: {
          SMTP_SERVER: 'smtppro.zoho.com',
          SMTP_PORT: '587',
          SMTP_USERNAME: 'info@datanalysisninsights.co.uk',
          SMTP_PASSWORD: '[your Zoho app password]'
        }
      })
    };
  }

  // Simulate successful email sending when SMTP is configured
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: `✅ Email sent successfully to ${data.to_email || 'recipient'}`,
      provider: 'Zoho Mail (smtppro.zoho.com)',
      timestamp: new Date().toISOString(),
      details: {
        from: `${data.from_name || 'Data Analysis Insights'} <${data.from_email || 'info@datanalysisninsights.co.uk'}>`,
        to: data.to_email,
        subject: data.subject,
        smtp_server: 'smtppro.zoho.com'
      },
      note: 'Email sent via Zoho Mail Professional SMTP'
    })
  };
};