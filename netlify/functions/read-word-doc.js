const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

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
    // For now, return the content that would be in the Word document
    // In production, you would upload the Word document to Netlify or read from a URL
    const documentContent = `From: vishwas.agarwal@gmail.com
From-Name: Intex Technologies
To: {email}
Subject: Business Partnership Opportunity - Intex Technologies in {country}

Dear Valued Prospective Partner,

We are pleased to introduce Intex Technologies, a globally recognized brand with a rich legacy spanning 29 years in the consumer electronics and technology sectors.

Since our inception in 1996, we have been at the forefront of innovation, designing and manufacturing cutting-edge products that enhance the daily lives of millions of consumers worldwide. Our commitment to excellence has made us a trusted name in markets across the globe.

Our Product Portfolio:
• IT Peripherals: Speakers, keyboards, mice, webcams, and computer accessories
• Home Appliances: Air coolers, room heaters, water purifiers, and kitchen appliances
• Mobile Accessories: Power banks, chargers, cables, and smartphone accessories
• Audio Solutions: Wireless speakers, headphones, and sound systems

We are actively seeking distribution partners in {country} who share our vision of delivering high-quality, innovative products to consumers. We believe {firm}, with its established market presence and commitment to excellence, would be an ideal partner for expanding our reach in the {country} market.

Specific Opportunities for {firm} in {country}:
{businessOpportunities}

What We Offer Our Partners:
✓ Competitive pricing with attractive profit margins
✓ Comprehensive marketing support and co-branding opportunities
✓ Technical training and ongoing product support
✓ Flexible payment terms and credit facilities
✓ Exclusive territory rights (subject to discussion)
✓ Access to our complete product catalog and new launches

Why Partner with Intex Technologies:
- 29+ years of industry experience and innovation
- Global presence with operations in 40+ countries
- ISO certified manufacturing facilities
- Strong R&D capabilities with continuous product development
- Proven track record of successful partnerships worldwide

We would welcome the opportunity to discuss how we can work together to bring Intex Technologies' innovative products to the {country} market through {firm}. Our team is available to provide detailed product catalogs, pricing structures, and partnership terms that align with your business objectives.

Please feel free to contact us at your earliest convenience to explore this exciting business opportunity. We are confident that a partnership between Intex Technologies and {firm} will be mutually beneficial and contribute to significant growth in the {country} market.

Thank you for your time and consideration. We look forward to hearing from you soon and to the possibility of establishing a long-term, successful business relationship.

Best regards,

Vishwas Agarwal
Business Development Manager
Intex Technologies
Email: vishwas.agarwal@gmail.com
Phone: +91-11-4716-1111
Website: www.intex.in

P.S. We are also interested in exploring private label manufacturing opportunities and joint ventures for established brands in the {country} market. Please let us know if {firm} has any interest in such collaborations.`;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        content: documentContent,
        message: 'Word document template loaded successfully'
      })
    };

  } catch (error) {
    console.error('Word document reading error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to read Word document: ' + error.message
      })
    };
  }
};