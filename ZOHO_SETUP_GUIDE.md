# 📧 Zoho Mail Setup Guide for Bulk Email Sender

## Quick Setup Checklist

### ✅ **Step 1: Enable IMAP Access in Zoho Mail**
1. Log into [Zoho Mail](https://mail.zoho.com)
2. Click **Settings** (gear icon) → **Mail Accounts**
3. Select your account: **info@datanalysisninsights.co.uk**
4. Go to **IMAP Access** tab
5. **Enable IMAP access** (toggle to ON)
6. Save settings

### ✅ **Step 2: Generate App Password (REQUIRED)**
1. In Zoho Mail, go to **Security** → **App Passwords**
2. Click **Generate App Password**
3. Select application type: **Mail Client** or **Other**
4. Enter name: **Netlify Bulk Email Sender**
5. **Copy the generated password** (you won't see it again!)
6. Keep this password safe - you'll need it for SMTP_PASSWORD

### ✅ **Step 3: Configure Netlify Environment Variables**
Go to your Netlify dashboard → **Site Settings** → **Environment Variables** and add:

```
Key: SMTP_SERVER
Value: smtppro.zoho.com

Key: SMTP_PORT
Value: 587

Key: SMTP_USERNAME
Value: info@datanalysisninsights.co.uk

Key: SMTP_PASSWORD
Value: [paste your App Password from Step 2]

Key: FROM_EMAIL
Value: info@datanalysisninsights.co.uk

Key: FROM_NAME
Value: Data Analysis Insights
```

### ✅ **Step 4: Test Email Sending**
1. Visit your application: https://bulkemailvishwas.netlify.app
2. Click **Load Default Files** to get sample contacts
3. Select a contact and try sending a test email
4. Check for success/error messages

## 🔧 **Troubleshooting Common Issues**

### **"Authentication Failed" Error:**
- ✅ Make sure you're using the **App Password**, not your regular Zoho password
- ✅ Verify IMAP access is enabled in Zoho Mail settings
- ✅ Check that username is exactly: **info@datanalysisninsights.co.uk**

### **"Connection Refused" Error:**
- ✅ Try alternative SMTP server: **smtp.zoho.com**
- ✅ Verify port is **587** (not 465 or 25)
- ✅ Check if your hosting provider blocks SMTP ports

### **"Domain Not Verified" Error:**
- ✅ Ensure your domain **datanalysisninsights.co.uk** is properly configured in Zoho
- ✅ Verify MX records are pointing to Zoho servers

## 📱 **Alternative SMTP Servers (if primary doesn't work):**

```
# Standard Zoho SMTP
SMTP_SERVER=smtp.zoho.com

# For India region
SMTP_SERVER=smtp.zoho.in

# For Europe region
SMTP_SERVER=smtp.zoho.eu

# Professional (usually fastest)
SMTP_SERVER=smtppro.zoho.com
```

## 🚀 **After Setup:**

1. **Test Single Email**: Send one email to verify setup
2. **Test Bulk Emails**: Try sending to multiple contacts
3. **Monitor Logs**: Check Netlify function logs for any errors
4. **Rate Limits**: Zoho has sending limits - space out bulk emails

## 📞 **Still Having Issues?**

1. **Check Netlify Function Logs**:
   - Netlify Dashboard → Functions → send-email-zoho → View logs

2. **Verify Zoho Mail Status**:
   - Log into Zoho Mail and send a test email manually

3. **Test SMTP Settings**:
   - Use an email client (Outlook, Thunderbird) with same settings

## 🔐 **Security Notes:**

- ✅ **Never commit passwords** to Git
- ✅ **Use App Passwords** for better security
- ✅ **Enable 2FA** on your Zoho account
- ✅ **Monitor email usage** for suspicious activity

---

**Need Help?** Check the function logs in Netlify or test the configuration with the troubleshooting steps above.