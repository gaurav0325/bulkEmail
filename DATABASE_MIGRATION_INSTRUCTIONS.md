# Database Migration Instructions - October 5, 2025

## 🎯 Purpose

This migration adds support for storing ALL company fields in the Supabase database, enabling full persistence of company data across login sessions.

## 📋 What's Changed

### Database Schema Updates
1. **Added `additional_data` JSONB column** to `companies` table
   - Stores all additional company fields (email templates, portfolio, offerings, images, etc.)
   - Allows flexible storage without schema changes for new fields

2. **Added `is_default` BOOLEAN column** to `companies` table
   - Marks one company as default for email personalization
   - Indexed for faster lookups

### Backend Updates
1. **Updated `saveCompanies()` function** in `data-sync.js`
   - Properly splits core fields and additional data
   - Saves all 20+ company fields to database

2. **Updated `getAllUserData()` function** in `data-sync.js`
   - Restores all company fields from `additional_data` JSONB
   - Maintains backward compatibility with existing data

## 🚀 Migration Steps

### Step 1: Run SQL Migration

**Option A: New Database Setup**
- Run the complete schema: `database/schema.sql`
- This includes the new columns by default

**Option B: Existing Database Update**
- Run the migration file: `database/migration_add_company_fields.sql`
- This safely adds the new columns if they don't exist

#### How to Run Migration:

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your project

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste Migration SQL**
   ```sql
   -- Copy contents from: database/migration_add_company_fields.sql
   ```

4. **Execute Migration**
   - Click "Run" button
   - Verify success message
   - Check output shows both columns exist

5. **Verify Migration**
   ```sql
   SELECT
       column_name,
       data_type,
       column_default
   FROM information_schema.columns
   WHERE table_schema = 'public'
   AND table_name = 'companies'
   AND column_name IN ('additional_data', 'is_default')
   ORDER BY column_name;
   ```

   **Expected Output:**
   ```
   column_name      | data_type | column_default
   ----------------+-----------+------------------------
   additional_data  | jsonb     | '{}'::jsonb
   is_default       | boolean   | false
   ```

### Step 2: Deploy Updated Netlify Functions

The updated `data-sync.js` function has already been committed. Netlify will auto-deploy when you push to GitHub.

**Verification:**
1. Check Netlify deployment status
2. Look for successful deploy of `data-sync` function
3. Test company save operation

### Step 3: Test the Complete Flow

#### Test 1: Save Company Data
1. Login to application
2. Open Company Onboarding
3. Fill in ALL fields:
   - Company Name
   - Company Email
   - Email Template
   - Product Portfolio Points
   - Offerings
   - Images/Links
   - etc.
4. Check console for:
   ```
   [CompanyOnboarding] Companies saved to centralized database
   [CompanyOnboarding] ✅ Companies saved to centralized database
   ```

#### Test 2: Verify Database Storage
1. Go to Supabase Dashboard → Table Editor
2. Select `companies` table
3. Find your company record
4. Check columns:
   - Core fields: `company_name`, `company_email`, etc. should be filled
   - `additional_data`: Should contain JSON with all extra fields
   - `is_default`: Should be `true` for your default company

#### Test 3: Test Persistence Across Login
1. Logout from application
2. Close browser completely
3. Reopen and login again
4. Open Company Onboarding
5. Verify ALL company fields are restored:
   - Company name, email, website
   - Email template
   - Portfolio points
   - Offerings
   - Links and images
   - etc.

## 📊 Database Structure

### Before Migration
```
companies table:
├── id (UUID)
├── user_id (UUID)
├── company_name (VARCHAR)
├── company_email (VARCHAR)
├── company_phone (VARCHAR)
├── company_website (VARCHAR)
├── company_address (TEXT)
├── company_industry (VARCHAR)
├── company_years (INTEGER)
├── company_description (TEXT)
├── is_active (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

❌ Problem: Email templates, portfolio, offerings NOT saved!
```

### After Migration
```
companies table:
├── id (UUID)
├── user_id (UUID)
├── company_name (VARCHAR)
├── company_email (VARCHAR)
├── company_phone (VARCHAR)
├── company_website (VARCHAR)
├── company_address (TEXT)
├── company_industry (VARCHAR)
├── company_years (INTEGER)
├── company_description (TEXT)
├── is_active (BOOLEAN)
├── is_default (BOOLEAN) ⭐ NEW
├── additional_data (JSONB) ⭐ NEW
│   ├── companyLogo
│   ├── companyShortName
│   ├── businesDevelopementManagerName
│   ├── businesDevelopementManagerDesignation
│   ├── productPortfolioPoints
│   ├── OfferingPoints
│   ├── Link1, Link2, Link3
│   ├── Image1, Image2
│   ├── emailTemplate ⭐ CRITICAL
│   ├── companyZohoEmail
│   ├── companyZohoPassword
│   ├── companySenderName
│   ├── companyEmailEnabled
│   ├── companyEmailJSService
│   ├── companyEmailJSTemplate
│   ├── ownerId
│   ├── lastModified
│   └── dataVersion
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

✅ All company fields now persisted to database!
```

## 🔍 Troubleshooting

### Issue 1: Migration SQL Fails
**Error**: Column already exists

**Solution**: This is fine - it means the migration ran before. The migration is idempotent (safe to run multiple times).

### Issue 2: Company Data Not Saving
**Symptoms**: Console shows "Error saving companies to database"

**Debug Steps**:
1. Check Supabase connection:
   ```javascript
   // In browser console
   console.log(dbManager.isAuthenticated())
   // Should return: true
   ```

2. Check environment variables in Netlify:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Check Netlify function logs:
   - Netlify Dashboard → Functions → data-sync
   - Look for error messages

### Issue 3: Company Data Not Restoring on Login
**Symptoms**: Company fields empty after re-login

**Debug Steps**:
1. Check database has data:
   ```sql
   SELECT * FROM companies WHERE user_id = 'YOUR_USER_ID';
   ```

2. Check console during login:
   ```
   [CompanyOnboarding] Loading companies from centralized database
   [CompanyOnboarding] ✅ Loaded X companies from database
   ```

3. Verify `additional_data` is not empty:
   ```sql
   SELECT
       company_name,
       additional_data->>'emailTemplate' as email_template,
       additional_data->>'productPortfolioPoints' as portfolio
   FROM companies
   WHERE user_id = 'YOUR_USER_ID';
   ```

### Issue 4: Default Company Not Working
**Symptoms**: Wrong company used for personalization

**Debug Steps**:
1. Check database:
   ```sql
   SELECT company_name, is_default
   FROM companies
   WHERE user_id = 'YOUR_USER_ID';
   ```
   Only ONE should have `is_default = true`

2. Check console logs:
   ```
   [CompanyOnboarding] Default company: [Company Name] (DEFAULT)
   [CompanyOnboarding] Using company for personalization: [Company Name] (DEFAULT)
   ```

## 📝 Rollback Plan

If the migration causes issues:

### Option 1: Remove New Columns
```sql
-- WARNING: This will delete all additional_data
ALTER TABLE public.companies DROP COLUMN IF EXISTS additional_data;
ALTER TABLE public.companies DROP COLUMN IF EXISTS is_default;
```

### Option 2: Revert Netlify Function
1. In GitHub, revert the commit that updated `data-sync.js`
2. Netlify will auto-deploy the old version
3. Companies will fall back to localStorage

## ✅ Success Criteria

Migration is successful when:

1. ✅ Migration SQL runs without errors
2. ✅ Both `additional_data` and `is_default` columns exist
3. ✅ Netlify function deploys successfully
4. ✅ Company data saves to database (console confirms)
5. ✅ All company fields visible in Supabase table editor
6. ✅ Company data persists across logout/login
7. ✅ Default company selection works correctly
8. ✅ Email personalization uses default company

## 📞 Support

If issues persist:
1. Check console logs for detailed error messages
2. Check Netlify function logs for backend errors
3. Verify Supabase environment variables
4. Test with a fresh company (create new company and test persistence)

---

**Migration Created**: October 5, 2025
**Status**: Ready to deploy
**Priority**: HIGH - Required for company data persistence
