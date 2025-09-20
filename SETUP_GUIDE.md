# EduAnalytics Dashboard - Database Setup Guide

This guide will help you set up the MySQL database and import your CSV data into the EduAnalytics Dashboard.

## Prerequisites

1. **MySQL Server** installed and running
2. **Node.js** (v18 or higher)
3. **npm** package manager

## Step 1: Install Dependencies

```bash
# Install required packages
npm install

# Install additional dependencies for database
npm install csv-parser mysql2
```

## Step 2: Database Setup

### Option A: Using the Setup Script (Recommended)

```bash
# Run the automated setup script
node scripts/setup-database.js
```

### Option B: Manual Setup

1. **Connect to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Create Database:**
   ```sql
   CREATE DATABASE StudentAnalyticsDB;
   USE StudentAnalyticsDB;
   ```

3. **Run Schema Script:**
   ```bash
   mysql -u root -p StudentAnalyticsDB < scripts/03-create-mysql-schema.sql
   ```

## Step 3: Environment Configuration

Create a `.env.local` file in the project root:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=StudentAnalyticsDB
DB_PORT=3306

# Application Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email Configuration (for notifications)
FROM_EMAIL=noreply@eduanalytics.gov.in
FROM_NAME=EduAnalytics Support
EMAIL_API_KEY=your_gmail_app_password

# JWT Secret (for authentication)
JWT_SECRET=your_jwt_secret_key_here

# Application Environment
NODE_ENV=development
```

## Step 4: Import CSV Data

```bash
# Import your CSV data into the database
npm run db:setup
```

This will:
- Read `final_synthetic_dropout_data_rajasthan.csv`
- Read `student_contact_and_mentor_list.csv`
- Import all student data into MySQL
- Create user accounts for students
- Assign mentors to students

## Step 5: Test Database Connection

```bash
# Test the database connection
npm run db:test
```

Or visit: `http://localhost:3000/api/test-db`

## Step 6: Start the Application

```bash
# Start the development server
npm run dev
```

Visit: `http://localhost:3000`

## Database Schema Overview

### Main Tables

1. **Students** - Main student records with academic and demographic data
2. **Users** - Authentication and user management
3. **Mentors** - Mentor information and assignments
4. **Schools** - School information
5. **AI_Predictions** - ML model predictions and results
6. **Educational_History** - Historical academic records
7. **Academic_Records** - Current academic performance
8. **Attendance** - Attendance tracking
9. **Student_Status_Records** - Dropout status tracking

### Key Features

- **Risk Assessment**: Automatic risk scoring based on multiple factors
- **Mentor Assignment**: Automatic mentor assignment based on CSV data
- **Data Validation**: Comprehensive data validation and error handling
- **Performance Optimization**: Indexed queries for fast data retrieval

## Troubleshooting

### Common Issues

1. **MySQL Connection Failed**
   - Check if MySQL is running: `sudo service mysql start`
   - Verify credentials in `.env.local`
   - Ensure MySQL user has proper permissions

2. **CSV Import Errors**
   - Check if CSV files exist in project root
   - Verify CSV file format matches expected structure
   - Check file permissions

3. **Port Already in Use**
   - Change port in `.env.local`: `DB_PORT=3307`
   - Or stop other MySQL instances

### Data Verification

After import, verify data:

```sql
-- Check total students
SELECT COUNT(*) as total_students FROM Students;

-- Check risk distribution
SELECT RiskLevel, COUNT(*) as count 
FROM Students 
GROUP BY RiskLevel;

-- Check mentor assignments
SELECT m.full_name, COUNT(s.id) as student_count
FROM Mentors m
LEFT JOIN Students s ON m.id = s.mentor_id
GROUP BY m.id, m.full_name;
```

## Next Steps

1. **Authentication**: Implement JWT-based authentication
2. **API Endpoints**: Create REST APIs for data access
3. **Frontend Integration**: Update components to use real data
4. **ML Integration**: Connect Python ML models
5. **Email System**: Set up email notifications

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify database connection with `npm run db:test`
3. Check MySQL error logs
4. Ensure all CSV files are in the correct format

## Data Structure

### Student Data Mapping

| CSV Column | Database Column | Type |
|------------|----------------|------|
| StudentID | StudentID | VARCHAR(50) |
| Gender | Gender | ENUM |
| AdmissionQuota | AdmissionQuota | ENUM |
| AccommodationType | AccommodationType | ENUM |
| IsRural | IsRural | BOOLEAN |
| FamilyAnnualIncome | FamilyAnnualIncome | DECIMAL(12,2) |
| AvgMarks_LatestTerm | AvgMarks_LatestTerm | DECIMAL(5,2) |
| AvgAttendance_LatestTerm | AvgAttendance_LatestTerm | DECIMAL(5,2) |
| IsDropout | IsDropout | BOOLEAN |

### Contact Data Mapping

| CSV Column | Database Column | Type |
|------------|----------------|------|
| Student Name | StudentName | VARCHAR(255) |
| Mother Name | MotherName | VARCHAR(255) |
| Father Name | FatherName | VARCHAR(255) |
| Contact Phone Number | ContactPhoneNumber | VARCHAR(20) |
| Assigned Mentor | mentor_id (via lookup) | INT |

This setup will give you a fully functional database with your student data ready for the EduAnalytics Dashboard!

