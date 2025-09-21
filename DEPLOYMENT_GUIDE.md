# Netlify Deployment Guide for Bulk Email Sender

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
3. **Email SMTP Credentials**: Gmail App Password or other SMTP service

## Deployment Steps

### 1. Connect Repository to Netlify

1. Login to your Netlify dashboard
2. Click "New site from Git"
3. Choose your Git provider (GitHub, GitLab, etc.)
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm install`
   - **Publish directory**: `.` (dot)
   - **Functions directory**: `netlify/functions`

### 2. Configure Environment Variables

In your Netlify dashboard, go to **Site settings > Environment variables** and add:

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Intex Technologies
```

**For Gmail Users:**
1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password (not your regular password) in `SMTP_PASSWORD`

### 3. Deploy

1. Click "Deploy site" in Netlify
2. Wait for the build to complete
3. Your site will be available at a Netlify URL (e.g., `https://amazing-site-123456.netlify.app`)

### 4. Custom Domain (Optional)

To use your custom domain (`www.datanalysisninsights.co.uk`):

1. In Netlify dashboard, go to **Site settings > Domain management**
2. Click "Add custom domain"
3. Enter `www.datanalysisninsights.co.uk`
4. Follow the DNS configuration instructions
5. Netlify will provide SSL certificate automatically

### 5. DNS Configuration

For your domain `www.datanalysisninsights.co.uk`, you need to:

1. **If using Netlify DNS:**
   - Point your domain's nameservers to Netlify's nameservers
   - Netlify will handle everything automatically

2. **If using external DNS:**
   - Create a CNAME record: `www` → `bulkemailvishwas.netlify.app`
   - Or create an A record pointing to Netlify's IP addresses

## File Structure

Your deployed site should have this structure:

```
bulkEmail/
├── index.html                 # Main application file
├── package.json              # Dependencies
├── netlify.toml              # Netlify configuration
├── _redirects                # Redirect rules
├── .env.example             # Environment variables template
├── netlify/
│   └── functions/
│       ├── send-email.js
│       ├── send-bulk-emails.js
│       ├── upload-excel.js
│       ├── upload-word.js
│       └── default-files.js
└── README.md
```

## Testing

After deployment, test these features:

1. **API Connection**: Check if the status shows "API Connected"
2. **File Upload**: Try uploading an Excel file and Word template
3. **Email Sending**: Test sending a single email
4. **Bulk Sending**: Test bulk email functionality

## Troubleshooting

### Common Issues:

1. **API Connection Failed**
   - Check environment variables are set correctly
   - Verify SMTP credentials
   - Check Netlify function logs

2. **Email Sending Fails**
   - Verify SMTP settings
   - For Gmail, ensure App Password is used
   - Check spam/security settings

3. **File Upload Issues**
   - Check file format (Excel: .xlsx, Word: .docx)
   - Verify file size limits
   - Check browser console for errors

### Netlify Function Logs

To check function logs:
1. Go to Netlify dashboard
2. Navigate to **Functions** tab
3. Click on any function to see logs and usage

## Custom Domain Setup

For `bulkemailvishwas.netlify.app` → `www.datanalysisninsights.co.uk`:

1. In Netlify: **Site settings > Domain management > Custom domains**
2. Add domain: `www.datanalysisninsights.co.uk`
3. Configure DNS:
   - **CNAME record**: `www` → `bulkemailvishwas.netlify.app`
   - Or use Netlify DNS for automatic configuration

## Security Notes

- Environment variables are secure in Netlify
- HTTPS is automatically provided
- App passwords are more secure than regular passwords
- Never commit `.env` files to Git

## Support

If you encounter issues:
1. Check Netlify function logs
2. Verify environment variables
3. Test SMTP settings separately
4. Check browser console for JavaScript errors

Your application will be accessible at:
- Netlify URL: `https://bulkemailvishwas.netlify.app`
- Custom domain: `https://www.datanalysisninsights.co.uk` (after DNS configuration)