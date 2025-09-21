exports.handler = async (event, context) => {
  console.log('Default files function called with method:', event.httpMethod);

  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    console.log('Invalid method:', event.httpMethod);
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
    console.log('Processing default files request...');
    // Default template content
    const defaultTemplate = `From: vishwas.agarwal@gmail.com
From-Name: Intex Technologies
To: {email}
Subject: Business Partnership Opportunity - {country}

Dear {contactName},

We are pleased to introduce Intex Technologies, a globally recognized brand with a rich legacy spanning 29 years in the consumer electronics and technology sectors.

Since our inception in 1996, we have been at the forefront of innovation, designing and manufacturing cutting-edge products that enhance the daily lives of millions of consumers worldwide. Our commitment to excellence has made us a trusted name in markets across the globe.

Our Product Portfolio:
• IT Peripherals: Speakers, keyboards, mice, webcams, and computer accessories
• Home Appliances: Air coolers, room heaters, water purifiers, and kitchen appliances
• Mobile Accessories: Power banks, chargers, cables, and smartphone accessories
• Audio Solutions: Wireless speakers, headphones, and sound systems

We are actively seeking distribution partners in {country} who share our vision of delivering high-quality, innovative products to consumers. We believe your organization, with its established market presence and distribution network, would be an ideal partner for expanding our reach in your region.

What We Offer:
✓ Competitive pricing and attractive margins
✓ Comprehensive marketing support
✓ Technical training and product support
✓ Flexible payment terms
✓ Exclusive territory rights (subject to discussion)

We would welcome the opportunity to discuss how we can work together to bring Intex Technologies' innovative products to your market. Our team is available to provide detailed product catalogs, pricing information, and partnership terms that align with your business objectives.

Please feel free to contact us at your earliest convenience to explore this exciting business opportunity.

Thank you for your time and consideration. We look forward to hearing from you soon.

Best regards,

Vishwas Agarwal
Business Development Manager
Intex Technologies
Email: vishwas.agarwal@gmail.com
Website: www.intex.in

P.S. We are also interested in exploring private label manufacturing opportunities for established brands in your market.`;

    // Sample contact data (you can replace this with actual default data)
    const sampleContacts = [
      {
        email: "contact@example.com",
        contact_person: "John Smith",
        firm: "Tech Solutions Ltd",
        country: "United Kingdom",
        address: "123 Business Street, London",
        phone: "+44 20 1234 5678"
      }
    ];

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        word_content: defaultTemplate,
        excel_data: sampleContacts,
        message: 'Default files loaded successfully'
      })
    };

  } catch (error) {
    console.error('Default files error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: `Failed to load default files: ${error.message}`
      })
    };
  }
};