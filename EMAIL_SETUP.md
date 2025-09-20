# Email Configuration Guide

## SMTP Setup Instructions

### 1. Gmail Setup (Recommended)
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Add to your `.env.local`:
```
FROM_EMAIL=your-email@gmail.com
EMAIL_API_KEY=your_16_character_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 2. Outlook/Hotmail Setup
Add to your `.env.local`:
```
FROM_EMAIL=your-email@outlook.com
EMAIL_API_KEY=your_password
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 3. Yahoo Setup
Add to your `.env.local`:
```
FROM_EMAIL=your-email@yahoo.com
EMAIL_API_KEY=your_app_password
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
```

### 4. Custom SMTP Server
Add to your `.env.local`:
```
FROM_EMAIL=noreply@yourdomain.com
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
SMTP_SECURE=false
```

## Testing Email Configuration

After setting up, test with:
```bash
curl -X POST "http://localhost:3000/api/notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "RJ_2025",
    "type": "risk-alert",
    "recipientEmail": "your-test-email@example.com"
  }'
```
