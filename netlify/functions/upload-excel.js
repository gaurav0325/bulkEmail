const XLSX = require('xlsx');

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
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
    const { content } = JSON.parse(event.body);

    if (!content) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: false, message: 'No file content provided' })
      };
    }

    // Decode base64 content
    const buffer = Buffer.from(content, 'base64');

    // Parse Excel file
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const allData = [];

    // Process all worksheets
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Normalize column names and extract relevant data
      const processedData = jsonData.map(row => {
        const normalizedRow = {};

        // Normalize keys to lowercase for easier matching
        Object.keys(row).forEach(key => {
          normalizedRow[key.toLowerCase().trim()] = row[key];
        });

        // Extract standard fields with multiple possible column names
        const contact = {
          email: normalizedRow.email || normalizedRow['e-mail'] || normalizedRow['email address'] || normalizedRow.mail || '',
          contact_person: normalizedRow.name || normalizedRow.contact_name || normalizedRow['contact name'] || normalizedRow.person || '',
          firm: normalizedRow.firm || normalizedRow.company || normalizedRow['company name'] || normalizedRow.organization || '',
          country: normalizedRow.country || normalizedRow.nation || normalizedRow.location || '',
          address: normalizedRow.address || normalizedRow.location || normalizedRow['full address'] || '',
          phone: normalizedRow.phone || normalizedRow.telephone || normalizedRow.mobile || normalizedRow.contact || '',
          city: normalizedRow.city || normalizedRow.town || '',
          state: normalizedRow.state || normalizedRow.province || normalizedRow.region || ''
        };

        // Only include contacts with valid email addresses
        if (contact.email && contact.email.includes('@')) {
          return contact;
        }
        return null;
      }).filter(contact => contact !== null);

      allData.push(...processedData);
    });

    if (allData.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          message: 'No valid contacts found. Please ensure your Excel file has email addresses.'
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: `Successfully processed ${allData.length} contacts`,
        data: allData
      })
    };

  } catch (error) {
    console.error('Excel processing error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        message: `Failed to process Excel file: ${error.message}`
      })
    };
  }
};