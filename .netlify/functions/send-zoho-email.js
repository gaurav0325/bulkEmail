const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const emailData = JSON.parse(event.body);

    // Extract SMTP configuration
    const { smtp_config, ...messageData } = emailData;

    if (!smtp_config || !smtp_config.auth) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'SMTP configuration missing' })
      };
    }

    // Create transporter for Zoho Mail
    const transporter = nodemailer.createTransporter({
      host: 'smtp.zoho.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtp_config.auth.user,
        pass: smtp_config.auth.pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Prepare email options
    const mailOptions = {
      from: `"${messageData.from_name}" <${smtp_config.auth.user}>`,
      to: messageData.to_email,
      subject: messageData.subject,
      html: messageData.html_content,
      text: messageData.text_content || messageData.html_content.replace(/<[^>]*>/g, ''),
      replyTo: smtp_config.auth.user
    };

    // Add attachments if any
    if (emailData.attachments && emailData.attachments.length > 0) {
      mailOptions.attachments = emailData.attachments.map(attachment => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: 'base64',
        contentType: attachment.contentType
      }));
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
        service: 'Zoho Mail SMTP'
      })
    };

  } catch (error) {
    console.error('Error sending email:', error);

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};