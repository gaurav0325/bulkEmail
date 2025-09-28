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

  // ALWAYS return 200 with data - no try/catch to prevent errors
  const response = {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'Default files loaded successfully',
      timestamp: new Date().toISOString(),
      word_content: getDefaultTemplate(),
      excel_data: getSampleContacts()
    })
  };

  return response;
};

function getDefaultTemplate() {
  return `From: info@datanalysisninsights.co.uk
From-Name: Data Analysis Insights
To: {email}
Subject: Business Partnership Opportunity - {country}

Dear {contactName},

We are pleased to introduce Data Analysis Insights, your trusted partner for comprehensive business intelligence and market research solutions.

Since our establishment, we have been at the forefront of providing cutting-edge analytics and insights that drive business growth and strategic decision-making across various industries.

Our Services:
• Market Research & Analysis
• Business Intelligence Solutions
• Data Visualization & Reporting
• Strategic Consulting
• Industry Trend Analysis

We are actively seeking business partnerships in {country} with organizations that value data-driven insights and strategic intelligence.

We believe your organization, with its established market presence and commitment to excellence, would be an ideal partner for expanding our services in your region.

Partnership Benefits:
✓ Comprehensive training and support
✓ Marketing assistance and co-branding opportunities
✓ Flexible partnership terms
✓ Exclusive territorial rights (subject to discussion)
✓ Ongoing technical and business support

We would welcome the opportunity to discuss how we can work together to bring our innovative solutions to your market.

Please feel free to contact us to explore this exciting business opportunity.

Best regards,

Data Analysis Insights Team
Email: info@datanalysisninsights.co.uk
Website: www.datanalysisninsights.co.uk

P.S. We are also interested in exploring joint ventures and collaborative projects in the business intelligence sector.`;
}

function getSampleContacts() {
  return [
    {
      email: "john.smith@techsolutions.co.uk",
      contact_person: "John Smith",
      firm: "Tech Solutions UK Ltd",
      country: "United Kingdom",
      address: "123 Business Park, London EC1A 1BB",
      phone: "+44 20 7123 4567"
    },
    {
      email: "sarah.jones@innovate.com",
      contact_person: "Sarah Jones",
      firm: "Innovate Corp",
      country: "United States",
      address: "456 Innovation Drive, New York, NY 10001",
      phone: "+1 212 555 0123"
    },
    {
      email: "raj.patel@globaltech.in",
      contact_person: "Raj Patel",
      firm: "Global Tech Solutions",
      country: "India",
      address: "789 Tech Hub, Mumbai 400001",
      phone: "+91 22 1234 5678"
    }
  ];
}