# 📧 Bulk Email Sender - Business Opportunities

A professional web application for sending personalized business opportunity emails to multiple recipients with review and editing capabilities.

## 🚀 Quick Start

1. **Run the setup script:**
   ```
   setup_and_run.bat
   ```

2. **Or run manually:**
   ```
   python email_server.py
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:8000
   ```

## 📋 Features

### ✅ File Upload & Processing
- **Excel File Support**: Upload your importers data Excel file
- **Word Template Support**: Upload your business letter template
- **Automatic Data Parsing**: Intelligently detects email, name, and country columns

### ✅ Email Personalization
- **Dynamic Content**: Automatically replaces `{contactName}` and `{country}` placeholders
- **Fallback Addressing**: Uses "Dear Valued Prospective Partner" when contact name is unavailable
- **Template Editing**: Review and edit email content before sending

### ✅ Review & Validation
- **Individual Preview**: Review each email before sending
- **Editable Content**: Modify recipient email, subject, and body content
- **Contact List View**: See all contacts with their details and sending status

### ✅ Bulk Operations
- **One-by-One Sending**: Send emails individually with review
- **Bulk Send All**: Send all remaining emails at once
- **Progress Tracking**: Real-time statistics and progress bar
- **Status Indicators**: Visual feedback for sent/pending emails

## 🔧 Email Configuration

### For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Set environment variables:
   ```
   set SMTP_SERVER=smtp.gmail.com
   set SMTP_PORT=587
   set SMTP_USERNAME=your-email@gmail.com
   set SMTP_PASSWORD=your-app-password
   set FROM_EMAIL=your-email@gmail.com
   set FROM_NAME=Your Company Name
   ```

### For Other Email Providers:
Update the environment variables with your SMTP settings:
- `SMTP_SERVER`: Your SMTP server address
- `SMTP_PORT`: SMTP port (usually 587 for TLS)
- `SMTP_USERNAME`: Your email username
- `SMTP_PASSWORD`: Your email password
- `FROM_EMAIL`: Sender email address
- `FROM_NAME`: Sender name

## 📁 File Requirements

### Excel File Format
Your Excel file should contain columns with headers like:
- **Email**: `email`, `e-mail`, `Email Address`, `mail`
- **Name**: `name`, `contact_name`, `company_name`, `Contact Name`
- **Country**: `country`, `nation`, `Country`, `Location`

### Email Template Format
Your template should contain email headers followed by the body:

```
From: your-email@company.com
From-Name: Your Company Name
To: {email}
Subject: Your Email Subject Here

Email body content goes here...
Use {contactName} for personalization
Use {country} for country-specific content
Use {email} for recipient email address
```

**Supported Headers:**
- `From:` - Sender email address
- `From-Name:` - Sender display name
- `To:` - Recipient email (use {email} placeholder)
- `Subject:` - Email subject line

**Placeholders:**
- `{contactName}` - Contact name or "Valued Prospective Partner"
- `{country}` - Contact's country
- `{email}` - Contact's email address

## 🎯 Usage Workflow

1. **Upload Files**:
   - Upload your Excel file with contact data
   - Upload your Word template (or use the default template)

2. **Review Template**:
   - Edit the email template in the left panel
   - Template supports placeholders for personalization

3. **Select Contacts**:
   - Click on any contact from the list
   - Review the generated email content

4. **Send Emails**:
   - **Individual**: Click "Send Email" for current contact
   - **Bulk**: Click "Send All Remaining" for batch sending

5. **Monitor Progress**:
   - Track sending progress with real-time statistics
   - See which emails have been sent successfully

## 🛠 Technical Details

### Frontend Technologies:
- **HTML5 & CSS3**: Modern responsive design
- **JavaScript ES6**: Client-side functionality
- **XLSX.js**: Excel file parsing
- **Mammoth.js**: Word document reading

### Backend Technologies:
- **Python 3**: HTTP server and email handling
- **SMTP**: Email sending protocol
- **JSON API**: Communication between frontend and backend

### Security Features:
- **Environment Variables**: Secure credential storage
- **CORS Support**: Cross-origin request handling
- **Input Validation**: Email and data validation

## 🔒 Security Notes

1. **Never commit credentials**: Use environment variables for email settings
2. **App Passwords**: Use app-specific passwords for Gmail
3. **Local Hosting**: Application runs locally for security
4. **Data Privacy**: Contact data is processed locally only

## 🐛 Troubleshooting

### Common Issues:

**Python not found:**
- Install Python from https://python.org
- Make sure Python is added to your PATH

**Email sending fails:**
- Check your SMTP credentials
- Verify internet connection
- For Gmail, ensure 2FA is enabled and app password is used

**File upload issues:**
- Ensure Excel file has proper column headers
- Check that Word document is not corrupted
- Verify file permissions

**Port already in use:**
- Close other applications using port 8000
- Or modify the PORT variable in email_server.py

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your email configuration
3. Ensure all files are in the correct format
4. Contact technical support if needed

## 📄 License

This application is for internal business use only.

---
**Created for professional business email campaigns**
**IT Peripherals & Home Appliances Business Opportunities**