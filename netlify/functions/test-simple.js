exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: true,
      message: 'Simple function working!',
      timestamp: new Date().toISOString(),
      environment: {
        smtp_configured: !!process.env.SMTP_USERNAME,
        username: process.env.SMTP_USERNAME ? 'SET' : 'NOT SET',
        server: process.env.SMTP_SERVER || 'NOT SET'
      }
    })
  };
};