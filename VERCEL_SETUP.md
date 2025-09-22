# 🚀 Vercel Environment Variables Setup

## ❌ **CURRENT ISSUE**
The application is deployed but **environment variables are missing** in Vercel, causing:
- Database connection failures (500 error)
- Email service failures (405 error)
- No data displayed on dashboard

## ✅ **SOLUTION: Set Environment Variables in Vercel**

### **Step 1: Access Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Sign in to your account
3. Navigate to your project: `eduanalytics-dashboard`

### **Step 2: Add Environment Variables**
1. Click on your project
2. Go to **Settings** tab
3. Click **Environment Variables** in the left sidebar
4. Add the following variables:

#### **Database Configuration:**
```
DATABASE_URL = postgresql://neondb_owner:npg_8QabD3LcUHWE@ep-crimson-cloud-adl8of9h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_URL = postgresql://neondb_owner:npg_8QabD3LcUHWE@ep-crimson-cloud-adl8of9h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### **Email Configuration:**
```
FROM_EMAIL = 6inary6usters@gmail.com
FROM_NAME = EduAnalytics Support
EMAIL_API_KEY = aszz dzsk ecyh npkp
SMTP_HOST = smtp.gmail.com
SMTP_PORT = 587
SMTP_SECURE = false
```

#### **Application Configuration:**
```
NEXT_PUBLIC_API_URL = https://eduanalytics-dashboard.vercel.app/
JWT_SECRET = your_jwt_secret_key_here
NODE_ENV = production
```

### **Step 3: Redeploy**
1. After adding all environment variables
2. Go to **Deployments** tab
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger automatic deployment

## 🧪 **Test After Setup**

### **Database Test:**
```bash
curl https://eduanalytics-dashboard.vercel.app/api/test-db
```
**Expected:** `{"success":true,"message":"Database connection successful"}`

### **Email Test:**
```bash
curl https://eduanalytics-dashboard.vercel.app/api/test-email
```
**Expected:** `{"success":true,"message":"Email service is configured and ready"}`

### **Dashboard Test:**
1. Go to: https://eduanalytics-dashboard.vercel.app/login
2. Click "Quick Admin Access"
3. Should see dashboard with data (not fallback content)

## 🔍 **Troubleshooting**

### **If Database Still Fails:**
- Check if Neon database is active
- Verify connection string is correct
- Check Neon dashboard for any restrictions

### **If Email Still Fails:**
- Verify Gmail App Password is correct
- Check if 2FA is enabled on Gmail account
- Ensure "Less secure app access" is enabled (if not using App Password)

### **If Dashboard Still Shows Fallback:**
- Check browser console for errors
- Verify all environment variables are set
- Check Vercel function logs

## 📊 **Expected Results After Fix**

✅ **Database Test Button:** Shows "Database connection successful!"  
✅ **Email Test Button:** Shows "Email test successful!"  
✅ **Dashboard:** Shows real data instead of fallback content  
✅ **Student Dashboard:** Shows student data instead of "Failed to fetch student data"  

## 🚨 **CRITICAL**
**Without these environment variables, the application will not work on Vercel!**

The local version works because it reads from `.env.local`, but Vercel needs these variables configured in its dashboard.
