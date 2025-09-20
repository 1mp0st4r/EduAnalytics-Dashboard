# 🐓 CockroachDB Setup Guide

This guide will help you set up CockroachDB for your EduAnalytics Dashboard.

## 🌟 Why CockroachDB?

- **PostgreSQL Compatible**: Uses standard SQL
- **Serverless**: No server management required
- **Free Tier**: Generous free usage limits
- **Global Distribution**: Built for scale
- **ACID Compliance**: Reliable transactions

## 🚀 Quick Setup

### Step 1: Create CockroachDB Account

1. Go to [cockroachlabs.cloud](https://cockroachlabs.cloud)
2. Sign up for a free account
3. Choose **Serverless** plan (free tier)

### Step 2: Create Cluster

1. Click **"Create Cluster"**
2. Choose **"Serverless"** (free)
3. Select a region close to you
4. Name your cluster: `eduanalytics-cluster`
5. Click **"Create Cluster"**

### Step 3: Get Connection String

1. Once cluster is created, click **"Connect"**
2. Choose **"Connection string"**
3. Copy the connection string (looks like this):
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

### Step 4: Update Environment Variables

Add your CockroachDB connection string to `.env.local`:

```env
# CockroachDB Configuration
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
COCKROACHDB_URL=postgresql://username:password@host:port/database?sslmode=require
```

### Step 5: Setup Database Schema

Run the setup script:

```bash
npm run cockroach:setup
```

This will:
- ✅ Test your CockroachDB connection
- ✅ Create all required tables
- ✅ Insert sample data
- ✅ Verify setup

### Step 6: Test Connection

```bash
npm run cockroach:test
```

## 🔧 Configuration Details

### Environment Variables

```env
# Primary Database (CockroachDB)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
COCKROACHDB_URL=postgresql://username:password@host:port/database?sslmode=require

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
2. Add your CockroachDB connection string:

```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
COCKROACHDB_URL=postgresql://username:password@host:port/database?sslmode=require
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
3. Your app will connect to CockroachDB

## 🧪 Testing Your Setup

### Local Testing

```bash
# Test CockroachDB connection
npm run cockroach:test

# Start development server
npm run dev

# Visit http://localhost:3000
# Click "Test Database Connection"
```

### Production Testing

1. Visit your Vercel URL
2. Click "Test Database Connection"
3. Should show successful connection to CockroachDB

## 📊 CockroachDB Features

### Free Tier Limits

- **Storage**: 5 GB
- **Request Units**: 50 million per month
- **Connections**: 100 concurrent
- **Regions**: 1 region

### Performance

- **Latency**: < 10ms for most queries
- **Throughput**: Handles thousands of requests/second
- **Availability**: 99.99% uptime SLA

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
npm run cockroach:test

# Check environment variables
echo $DATABASE_URL
```

### Common Errors

1. **"SSL connection required"**
   - Make sure `sslmode=require` is in connection string

2. **"Authentication failed"**
   - Check username/password in connection string

3. **"Database does not exist"**
   - CockroachDB creates database automatically

### Support

- [CockroachDB Documentation](https://www.cockroachlabs.com/docs/)
- [CockroachDB Community](https://forum.cockroachlabs.com/)
- [GitHub Issues](https://github.com/1mp0st4r/EduAnalytics-Dashboard/issues)

## 🎯 Next Steps

1. ✅ Set up CockroachDB cluster
2. ✅ Update environment variables
3. ✅ Run setup script
4. ✅ Test connection
5. ✅ Deploy to Vercel
6. 🎉 Enjoy your scalable database!

---

**Your EduAnalytics Dashboard is now powered by CockroachDB!** 🐓✨
