# 🚀 Enhanced Bulk Email Sender - Intex Technologies

A professional, web-accessible email campaign platform with Brevo integration for sending personalized business opportunity emails.

## 🌟 Key Features

### ✅ Web Accessibility
- **Accessible from anywhere** on the internet
- **Responsive design** for desktop and mobile
- **Real-time API integration** with status monitoring

### ✅ Brevo Email Integration
- **Professional email sending** via Brevo API
- **300 free emails/day** on free tier
- **Real-time delivery status** and error handling
- **High deliverability** (99.98% delivery rate)

### ✅ Advanced File Processing
- **Multi-worksheet Excel support** (all countries)
- **Automatic Word document parsing**
- **Default file loading** from specified directory
- **Drag & drop file uploads**

### ✅ Smart Personalization
- **Firm name extraction** and customization
- **Contact person personalization** or "Dear Valued Prospective Partner"
- **Country-specific content** adaptation
- **vishwas.agarwal@gmail.com** as default sender

### ✅ Professional Email Management
- **One-by-one email sending** with review
- **Bulk email campaigns** with progress tracking
- **Email preview** before sending
- **Success/failure tracking** with statistics

## 🚀 Quick Start

### 1. Setup and Run
```bash
setup_brevo.bat
```

### 2. Configure Brevo API (Optional)
1. Visit: https://app.brevo.com/settings/keys/api
2. Create a new API key
3. Set environment variable: `BREVO_API_KEY=your_key_here`

### 3. Access Application
- **Local**: http://localhost:8080
- **Network**: http://your-ip-address:8080

## 📁 File Structure Analysis

### Excel File Structure
The application reads from: `C:\Gaurav\BranchSpace BA\Vouchers\Importers Data Sept 25.xlsx`

**Supported Worksheets:**
- Kenya
- Uganda
- Nigeria
- Ethiopia
- Philippines
- Sri Lanka

**Column Mapping:**
- **Firm**: Company name for personalization
- **Contact Person**: Individual contact name
- **Email**: Recipient email address
- **Address**: Company address
- **Contact Number**: Phone number
- **Category**: Business category

### Word Template Structure
The application reads from: `C:\Gaurav\BranchSpace BA\Vouchers\Dear Valued Prospective Partner.docx`

**Content includes:**
- Intex Technologies introduction
- 29-year legacy mention
- Product range details
- Partnership opportunity
- Contact information (Vishwas Agarwal)

## 🎯 Email Template Format

```
From: vishwas.agarwal@gmail.com
From-Name: Intex Technologies
To: {email}
Subject: Business Partnership Opportunity - {country}

Dear {contactName},

We are pleased to introduce Intex Technologies, a globally recognized brand...
```

### Available Placeholders:
- `{contactName}` → Contact person or "Valued Prospective Partner"
- `{country}` → Recipient's country
- `{email}` → Recipient's email
- `{firm}` → Company/firm name

## 🔧 API Endpoints

### File Management
- `GET /api/default-files` - Load default Excel and Word files
- `POST /api/upload-excel` - Upload and parse Excel file
- `POST /api/upload-word` - Upload and parse Word document

### Email Operations
- `POST /api/send-email` - Send single email
- `POST /api/send-bulk-emails` - Send multiple emails

## 📊 Features in Detail

### Multi-Country Support
- **Automatic country detection** from worksheet names
- **Country-specific personalization** in subject and body
- **Grouped contact display** by country

### Smart Contact Processing
- **Email validation** (only contacts with emails included)
- **Missing data handling** with fallbacks
- **Duplicate prevention**

### Professional Email Composition
- **Automatic template parsing**
- **Header extraction** (From, Subject, etc.)
- **Real-time preview** before sending
- **Edit capability** for all fields

### Campaign Tracking
- **Real-time statistics** (Total, Sent, Remaining, Success Rate)
- **Progress visualization** with animated progress bar
- **Success/failure indicators** per contact
- **Campaign completion tracking**

## 🔒 Security & Configuration

### Brevo API Security
- **Environment variable storage** for API keys
- **No hardcoded credentials**
- **Secure API communication**

### Network Security
- **CORS support** for web accessibility
- **Input validation** on all endpoints
- **Error handling** with user-friendly messages

## 📧 Email Service Details

### Brevo Integration Benefits
- **Free Tier**: 300 emails/day
- **High Deliverability**: 99.98% delivery rate
- **Fast Sending**: Under 20 seconds delivery
- **Professional Authentication**: SPF, DKIM, DMARC support

### Fallback Options
- **Simulation mode** when API key not configured
- **Error handling** for rate limits
- **Retry logic** for failed sends

## 🎨 User Interface

### Modern Design
- **Gradient backgrounds** with glass-morphism
- **Responsive layout** for all screen sizes
- **Animated interactions** and hover effects
- **Professional color scheme**

### Intuitive Workflow
- **Step-by-step process** clearly indicated
- **Real-time feedback** for all operations
- **Loading indicators** for async operations
- **Alert system** for status updates

## 🔧 Technical Stack

### Backend
- **Python 3** with built-in HTTP server
- **Pandas** for Excel processing
- **python-docx** for Word document parsing
- **Requests** for Brevo API integration

### Frontend
- **Vanilla JavaScript** (no dependencies)
- **Modern CSS3** with animations
- **Responsive design** principles
- **XLSX.js** for client-side Excel preview

## 🚀 Deployment

### Local Development
```bash
python enhanced_email_server.py
```

### Network Access
- Configure firewall to allow port 8080
- Access via LAN IP address
- Suitable for team/office use

### Production Deployment
- Use reverse proxy (nginx) for SSL
- Configure domain name
- Set up monitoring and logging

## 📈 Usage Analytics

### Campaign Metrics
- **Total contacts loaded**
- **Emails sent successfully**
- **Failed delivery attempts**
- **Overall success rate**
- **Country-wise distribution**

### Performance Tracking
- **Processing time** for file uploads
- **Email sending speed**
- **API response times**
- **Error rate monitoring**

## 🛠 Troubleshooting

### Common Issues

**1. API Connection Failed**
- Check internet connection
- Verify server is running on port 8080
- Ensure no firewall blocking

**2. Brevo Email Sending Failed**
- Verify API key is set correctly
- Check daily sending limit (300/day free)
- Ensure sender email is verified

**3. File Upload Issues**
- Check file format (.xlsx for Excel, .docx for Word)
- Verify file is not corrupted
- Ensure file size is reasonable

**4. Template Parsing Problems**
- Check template format and headers
- Verify placeholders are correct
- Ensure Word document is accessible

## 📞 Support

### Getting Help
- Check browser console for errors
- Review server logs for API issues
- Verify Brevo account status
- Test with small contact batches first

### Best Practices
- **Start with test emails** to verify setup
- **Monitor success rates** and adjust if needed
- **Respect sending limits** (300/day free tier)
- **Keep templates professional** and compliant

---

**🎯 Built for Intex Technologies Business Development**
**📧 Professional Email Campaign Management**
**🌍 Global Market Expansion Tool**
