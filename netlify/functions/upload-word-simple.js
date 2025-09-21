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
    const defaultTemplate = `From: vishwas.agarwal@gmail.com
From-Name: Intex Technologies
To: {email}
Subject: Business Partnership Opportunity - {country}

Dear {contactName},

We are pleased to introduce Intex Technologies, a globally recognized brand with a rich legacy spanning 29 years in the consumer electronics and technology sectors.

Best regards,
Vishwas Agarwal
Intex Technologies`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Template loaded successfully (default template)',
        content: defaultTemplate,
        note: 'Upload actual Word documents for custom templates'
      })
    };

  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Word processing failed: ' + error.message
      })
    };
  }
};