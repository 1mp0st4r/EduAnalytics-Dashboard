# 🌟 Neon PostgreSQL Setup Guide

This guide will help you set up Neon PostgreSQL for your EduAnalytics Dashboard.

## 🌟 Why Neon?

- **Serverless**: No server management required
- **Vercel Integration**: Seamless deployment with Vercel
- **Free Tier**: Generous free usage limits
- **PostgreSQL**: Full PostgreSQL compatibility
- **Auto-scaling**: Scales to zero when not in use

## 🚀 Quick Setup

### Step 1: Create Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Connect your GitHub account (optional but recommended)

### Step 2: Create Database

1. Click **"Create Project"**
2. Choose a project name: `eduanalytics-dashboard`
3. Select a region close to you
4. Choose **"Free"** plan
5. Click **"Create Project"**

### Step 3: Get Connection String

1. Once project is created, go to **"Dashboard"**
2. Click **"Connection Details"**
3. Copy the connection string (looks like this):
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

### Step 4: Update Environment Variables

Add your Neon connection string to `.env.local`:

```env
# Neon PostgreSQL Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEON_URL=postgresql://username:password@host:port/database?sslmode=require
```

### Step 5: Setup Database Schema

Run the setup script:

```bash
npm run neon:setup
```

This will:
- ✅ Test your Neon connection
- ✅ Create all required tables
- ✅ Insert sample data
- ✅ Verify setup

### Step 6: Test Connection

```bash
npm run neon:test
```

## 🔧 Configuration Details

### Environment Variables

```env
# Primary Database (Neon)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEON_URL=postgresql://username:password@host:port/database?sslmode=require

# Fallback Database (MySQL - optional)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=StudentAnalyticsDB
DB_PORT=3306
```

### Database Schema

The setup creates these main tables:

- **users** - User authentication
- **students** - Student profiles and data
- **mentors** - Mentor information
- **schools** - School details
- **academic_records** - Grades and performance
- **attendance** - Attendance tracking
- **ai_predictions** - ML model results
- **email_notifications** - Email logs

## 🚀 Deployment to Vercel

### Step 1: Add Environment Variables to Vercel

In your Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add your Neon connection string:

```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEON_URL=postgresql://username:password@host:port/database?sslmode=require
FROM_EMAIL=6inary6usters@gmail.com
EMAIL_API_KEY=aszz dzsk ecyh npkp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
NEXT_PUBLIC_API_URL=https://eduanalytics-dashboard.vercel.app
JWT_SECRET=your_secure_jwt_secret
NODE_ENV=production
```

### Step 2: Deploy

1. Push your changes to GitHub
2. Vercel will automatically deploy
3. Your app will connect to Neon

## 🧪 Testing Your Setup

### Local Testing

```bash
# Test Neon connection
npm run neon:test

# Start development server
npm run dev

# Visit http://localhost:3000
# Click "Test Database Connection"
```

### Production Testing

1. Visit your Vercel URL
2. Click "Test Database Connection"
3. Should show successful connection to Neon

## 📊 Neon Features

### Free Tier Limits

- **Storage**: 3 GB
- **Compute**: 100 hours/month
- **Connections**: 100 concurrent
- **Regions**: Multiple regions available

### Performance

- **Latency**: < 10ms for most queries
- **Throughput**: Handles thousands of requests/second
- **Auto-scaling**: Scales to zero when idle

## 🔒 Security

### SSL/TLS

- All connections are encrypted
- SSL certificate verification
- Secure connection strings

### Access Control

- User-based authentication
- Role-based permissions
- IP allowlisting (optional)

## 🆘 Troubleshooting

### Connection Issues

```bash
# Test connection
npm run neon:test

# Check environment variables
echo $DATABASE_URL
```

### Common Errors

1. **"SSL connection required"**
   - Make sure `sslmode=require` is in connection string

2. **"Authentication failed"**
   - Check username/password in connection string

3. **"Database does not exist"**
   - Neon creates database automatically

### Support

- [Neon Documentation](https://neon.tech/docs/)
- [Neon Community](https://community.neon.tech/)
- [GitHub Issues](https://github.com/1mp0st4r/EduAnalytics-Dashboard/issues)

## 🎯 Next Steps

1. ✅ Set up Neon project
2. ✅ Update environment variables
3. ✅ Run setup script
4. ✅ Test connection
5. ✅ Deploy to Vercel
6. 🎉 Enjoy your serverless database!

## 🌟 Neon + Vercel Integration

### Automatic Integration

- Neon automatically integrates with Vercel
- Environment variables are synced
- Database connections are optimized
- Zero configuration required

### Benefits

- **Fast Deployments**: No database setup delays
- **Automatic Scaling**: Database scales with your app
- **Cost Effective**: Pay only for what you use
- **Global Performance**: Edge-optimized connections

---

**Your EduAnalytics Dashboard is now powered by Neon PostgreSQL!** 🌟✨
