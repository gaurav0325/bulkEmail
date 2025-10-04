# 🗄️ Centralized Database Setup Guide

This guide will help you set up a centralized database system for your Bulk Email Sender application, allowing user accounts to be accessed from any device/browser.

## 📋 Prerequisites

- [Netlify](https://netlify.com) account (you already have this)
- [Supabase](https://supabase.com) account (free tier available)
- [Node.js](https://nodejs.org) installed locally

## 🏗️ Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Name your project: `bulk-email-sender`
5. Create a strong database password
6. Select your region (closest to your users)
7. Click "Create new project"

### 1.2 Set Up Database Schema
1. Wait for your project to finish setting up
2. Go to the "SQL Editor" in your Supabase dashboard
3. Copy the entire contents of `database/schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

### 1.3 Get Your API Keys
1. Go to "Settings" → "API"
2. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🔧 Step 2: Configure Environment Variables

### 2.1 Create .env File
1. Copy `.env.template` to `.env`
2. Fill in your Supabase credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# Email Configuration (existing)
SMTP_HOST=smtppro.zoho.eu
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Application Configuration
APP_URL=https://your-app-domain.netlify.app
APP_NAME=Bulk Email Sender
```

### 2.2 Set Netlify Environment Variables
1. Go to your Netlify site dashboard
2. Navigate to "Site settings" → "Environment variables"
3. Add the following variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`
   - Keep your existing email variables

## 📦 Step 3: Install Dependencies

Run this command in your project directory:

```bash
npm install
```

This will install the Supabase JavaScript client library.

## 🚀 Step 4: Deploy to Netlify

### 4.1 Commit Your Changes
```bash
git add .
git commit -m "Add centralized database system with Supabase"
git push
```

### 4.2 Netlify Auto-Deploy
Your site will automatically redeploy with the new database system.

## 🔄 Step 5: Data Migration (Optional)

If you have existing users with localStorage data, the system will automatically offer to migrate their data to the database on their next login.

### Migration Process:
1. User logs in with existing credentials
2. System detects localStorage data
3. Prompts user to migrate data to cloud
4. Data is transferred to centralized database
5. User can now access their data from any device

## ✅ Step 6: Test the System

### 6.1 Test Registration
1. Open your application
2. Try registering a new account
3. Check Supabase dashboard → "Authentication" → "Users"
4. Verify the user appears in the database

### 6.2 Test Cross-Device Access
1. Register/login on one browser
2. Add some contacts or companies
3. Open the app on a different browser/device
4. Login with the same credentials
5. Verify your data appears

### 6.3 Test Data Persistence
1. Login and add some data
2. Close browser completely
3. Reopen and visit the site
4. Verify you're automatically logged in (if "Remember Me" was checked)
5. Verify all your data is still there

## 🎯 Benefits of Centralized Database

### ✅ **Universal Access**
- Access your account from any device
- Same data everywhere - phone, laptop, office, home
- No more device-specific data loss

### ✅ **Data Security**
- Professional-grade database security
- Automatic backups
- Encrypted data transmission

### ✅ **Scalability**
- Supports unlimited users
- Professional user management
- Real-time data synchronization

### ✅ **Reliability**
- 99.9% uptime SLA
- Automatic failover
- No more localStorage limitations

## 🔒 Security Features

### **Authentication**
- Secure password hashing
- Email verification
- Session management
- Password reset functionality

### **Data Protection**
- Row Level Security (RLS)
- Users can only access their own data
- Encrypted connections (HTTPS/SSL)
- API key protection

### **Access Control**
- JWT token-based authentication
- Configurable session expiration
- Secure password requirements

## 🛠️ API Endpoints

The system creates the following API endpoints:

- `/.netlify/functions/auth-register` - User registration
- `/.netlify/functions/auth-login` - User login
- `/.netlify/functions/auth-verify-session` - Session verification
- `/.netlify/functions/data-sync` - Data synchronization

## 📊 Database Tables

### **users**
- User profiles and account information
- Links to Supabase auth system

### **companies**
- Company onboarding data
- Associated with specific users

### **contacts**
- Contact lists and imports
- Status tracking for email campaigns

### **email_history**
- Complete email sending history
- Analytics and reporting data

## 🆘 Troubleshooting

### Common Issues:

#### **Environment Variables Not Working**
- Double-check variable names in Netlify dashboard
- Ensure no extra spaces in values
- Redeploy after adding variables

#### **Database Connection Errors**
- Verify Supabase URL is correct
- Check API keys are properly set
- Ensure RLS policies are correctly configured

#### **Migration Issues**
- Check browser console for errors
- Verify user has valid session
- Try logging out and back in

#### **Cross-Device Problems**
- Ensure "Remember Me" is checked
- Check if localStorage data exists on original device
- Verify migration completed successfully

## 📞 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Supabase dashboard for user data
3. Test API endpoints using the Netlify Functions logs
4. Check Supabase logs for database errors

## 🎉 Success!

Once set up, your users will enjoy:

- **Seamless cross-device experience**
- **Professional-grade data security**
- **No more device-specific limitations**
- **Reliable, scalable user management**

Your Bulk Email Sender application now has enterprise-level user management and data persistence!