# EduAnalytics API Documentation

## Overview

The EduAnalytics API provides comprehensive endpoints for managing students, mentors, interventions, and analytics in an educational dropout prevention system.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "message": "string",
  "data": object | array,
  "error": "string" // only present on error
}
```

## Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user-id",
      "email": "user@example.com",
      "fullName": "User Name",
      "userType": "admin|mentor|student",
      "isActive": true,
      "emailVerified": true
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "User Name",
  "userType": "admin|mentor|student"
}
```

#### POST /auth/refresh
Refresh an expired JWT token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

### Students

#### GET /students
Get all students (admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for student name
- `riskLevel` (optional): Filter by risk level (Low, Medium, High, Critical)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "student-id",
      "studentId": "STU001",
      "fullName": "Student Name",
      "classLevel": 10,
      "attendance": 85.5,
      "performance": 78.2,
      "riskLevel": "Medium",
      "riskScore": 0.65,
      "dropoutProbability": 0.15,
      "mentorName": "Mentor Name",
      "schoolName": "School Name"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

#### GET /students/[id]
Get a specific student by ID.

#### PUT /students/[id]
Update student information (admin only).

### Mentors

#### GET /mentors
Get all mentors (admin only).

#### GET /mentors/students
Get students assigned to the authenticated mentor.

#### GET /mentors/statistics
Get statistics for the authenticated mentor.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 25,
    "highRiskStudents": 3,
    "mediumRiskStudents": 8,
    "lowRiskStudents": 14,
    "averageAttendance": 82.5,
    "averagePerformance": 75.8,
    "recentInterventions": 5
  }
}
```

### Interventions

#### GET /interventions
Get all interventions (admin only).

#### POST /interventions
Create a new intervention.

**Request Body:**
```json
{
  "studentId": "student-id",
  "type": "Academic Support",
  "description": "Provide additional tutoring",
  "priority": "high",
  "scheduledDate": "2024-01-15"
}
```

#### GET /interventions/[id]
Get a specific intervention by ID.

#### PUT /interventions/[id]
Update an intervention.

#### DELETE /interventions/[id]
Delete an intervention (admin only).

### Assignments

#### GET /assignments
Get all student-mentor assignments (admin only).

#### POST /assignments
Create a new assignment.

**Request Body:**
```json
{
  "studentId": "student-id",
  "mentorId": "mentor-id",
  "notes": "Assignment notes"
}
```

### AI Chatbot

#### POST /chat
Send a message to the AI chatbot (students only).

**Request Body:**
```json
{
  "message": "How can I improve my attendance?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "I notice your attendance is currently 85%. Regular attendance is crucial for academic success...",
    "conversationId": "conv_1234567890_abc123"
  }
}
```

#### GET /chat/history
Get chat history for the authenticated user.

**Query Parameters:**
- `conversationId` (optional): Get specific conversation

### Analytics

#### GET /analytics
Get overall analytics and statistics (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 500,
    "highRiskStudents": 45,
    "totalMentors": 25,
    "activeInterventions": 78,
    "averageAttendance": 82.5,
    "averagePerformance": 75.8,
    "dropoutRate": 0.12
  }
}
```

### Notifications

#### GET /notifications
Get notifications for the authenticated user.

#### POST /notifications/mark-read
Mark a notification as read.

### Cron Jobs

#### GET /cron/send-notifications
Trigger scheduled notification sending (requires cron secret).

**Headers:**
```
Authorization: Bearer <cron-secret>
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Other endpoints: 100 requests per minute
- Chat endpoints: 20 requests per minute

## WebSocket Events

### Connection
Connect to WebSocket for real-time notifications:

```javascript
const socket = io('ws://localhost:3001', {
  auth: { token: 'your-jwt-token' }
})
```

### Events

#### notification
Received when a new notification is available.

```json
{
  "id": "notification-id",
  "type": "info|warning|error|success",
  "title": "Notification Title",
  "message": "Notification message",
  "timestamp": "2024-01-15T10:30:00Z",
  "read": false
}
```

#### mark_notification_read
Emit to mark a notification as read.

```javascript
socket.emit('mark_notification_read', 'notification-id')
```

## Examples

### JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
})

const { data } = await loginResponse.json()
const token = data.token

// Get students
const studentsResponse = await fetch('/api/students', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const students = await studentsResponse.json()
```

### cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get students
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer your-jwt-token"
```

## SDKs

### JavaScript/TypeScript
```bash
npm install @eduanalytics/api-client
```

```javascript
import { EduAnalyticsClient } from '@eduanalytics/api-client'

const client = new EduAnalyticsClient({
  baseUrl: 'https://api.eduanalytics.com',
  apiKey: 'your-api-key'
})

const students = await client.students.list()
```

## Support

For API support and questions:
- Email: api-support@eduanalytics.com
- Documentation: https://docs.eduanalytics.com
- Status Page: https://status.eduanalytics.com
