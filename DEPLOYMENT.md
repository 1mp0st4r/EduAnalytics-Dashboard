# 🚀 Deployment Guide

This guide will help you deploy the EduAnalytics Dashboard to various platforms.

## 🌐 Vercel Deployment (Recommended)

### Prerequisites
- GitHub account
- Vercel account
- MySQL database (local or cloud)

### Step 1: Prepare Repository
1. Ensure all code is committed and pushed to GitHub
2. Verify `.env.local` is in `.gitignore` (sensitive data should not be in repository)

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository: `1mp0st4r/EduAnalytics-Dashboard`
4. Configure project settings:
   - **Project Name**: `eduanalytics-dashboard`
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)

### Step 3: Environment Variables
Add these environment variables in Vercel dashboard:

```env
# Database Configuration
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=StudentAnalyticsDB
DB_PORT=3306

# Email Configuration
FROM_EMAIL=your-email@gmail.com
EMAIL_API_KEY=your-gmail-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# Application Configuration
NEXT_PUBLIC_API_URL=https://eduanalytics-dashboard.vercel.app
JWT_SECRET=your-secure-jwt-secret
NODE_ENV=production
```

### Step 4: Database Setup
1. Set up a cloud MySQL database (AWS RDS, PlanetScale, or similar)
2. Run the database setup scripts on your cloud database
3. Update environment variables with cloud database credentials

### Step 5: Deploy
1. Click "Deploy" in Vercel
2. Wait for deployment to complete
3. Your app will be available at: `https://eduanalytics-dashboard.vercel.app`

## 🐳 Docker Deployment

### Create Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run
```bash
# Build Docker image
docker build -t eduanalytics-dashboard .

# Run container
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  eduanalytics-dashboard
```

## ☁️ AWS Deployment

### Using AWS Amplify
1. Connect your GitHub repository to AWS Amplify
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```
3. Add environment variables in Amplify console
4. Deploy

### Using AWS EC2
1. Launch EC2 instance (Ubuntu 20.04+)
2. Install Node.js, MySQL, and PM2
3. Clone repository and install dependencies
4. Set up environment variables
5. Use PM2 to run the application:
   ```bash
   pm2 start npm --name "eduanalytics" -- start
   pm2 startup
   pm2 save
   ```

## 🐙 GitHub Pages (Static Export)

For static deployment, modify `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

export default nextConfig
```

Then deploy:
```bash
npm run build
# Upload 'out' folder to GitHub Pages
```

## 🔧 Environment Variables Reference

### Required Variables
- `DB_HOST` - Database host
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `FROM_EMAIL` - Sender email address
- `EMAIL_API_KEY` - Email service API key

### Optional Variables
- `DB_PORT` - Database port (default: 3306)
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - Environment (development/production)

## 📊 Database Setup for Production

### Cloud Database Options
1. **AWS RDS**: Managed MySQL service
2. **Google Cloud SQL**: Fully managed database
3. **PlanetScale**: Serverless MySQL platform
4. **Railway**: Simple database hosting

### Setup Steps
1. Create database instance
2. Configure security groups/firewall
3. Create database and user
4. Run setup scripts:
   ```bash
   # Connect to your cloud database
   mysql -h your-host -u your-user -p
   
   # Run setup script
   source scripts/03-create-mysql-schema.sql
   ```

## 🔒 Security Considerations

### Production Security
- Use strong passwords for database
- Enable SSL/TLS for database connections
- Use environment variables for secrets
- Enable CORS properly
- Use HTTPS in production
- Regular security updates

### Email Security
- Use app passwords for Gmail
- Enable 2FA on email accounts
- Use dedicated email service for production
- Monitor email delivery logs

## 📈 Performance Optimization

### Production Optimizations
- Enable Next.js production mode
- Use CDN for static assets
- Optimize images
- Enable compression
- Use database connection pooling
- Implement caching strategies

### Monitoring
- Set up error tracking (Sentry)
- Monitor performance (Vercel Analytics)
- Database monitoring
- Email delivery monitoring

## 🆘 Troubleshooting

### Common Issues
1. **Database Connection Failed**
   - Check database credentials
   - Verify network connectivity
   - Check firewall settings

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check app password for Gmail
   - Test SMTP connection

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Support
- Check [GitHub Issues](https://github.com/1mp0st4r/EduAnalytics-Dashboard/issues)
- Review deployment logs
- Contact support team

---

**Happy Deploying! 🚀**
