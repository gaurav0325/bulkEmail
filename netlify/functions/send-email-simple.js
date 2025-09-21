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

    // For now, simulate email sending (replace with actual SMTP later)
    // This prevents the processing loop while we fix dependencies

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Email would be sent to ${data.to_email}. SMTP setup required.`,
        note: 'Configure SMTP credentials in environment variables to enable actual email sending.'
      })
    };

  } catch (error) {
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