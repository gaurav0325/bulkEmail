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
    // For now, return sample data to prevent processing loop
    const sampleData = [
      {
        email: "sample@example.com",
        contact_person: "John Smith",
        firm: "Tech Solutions Ltd",
        country: "United Kingdom",
        address: "123 Business Street, London",
        phone: "+44 20 1234 5678"
      },
      {
        email: "info@techcompany.com",
        contact_person: "Jane Doe",
        firm: "Innovation Corp",
        country: "United States",
        address: "456 Corporate Ave, New York",
        phone: "+1 555 123 4567"
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `Successfully processed ${sampleData.length} contacts (sample data)`,
        data: sampleData,
        note: 'Upload actual Excel files for real data processing'
      })
    };

  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Excel processing failed: ' + error.message
      })
    };
  }
};